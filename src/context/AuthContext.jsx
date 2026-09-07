'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const router = useRouter();

  // Restore session: validate stored token against the API on every mount.
  // sessionStorage is per-tab — a new tab is always unauthenticated.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = window.sessionStorage.getItem('iic.token');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Verify token is still valid server-side
    api.get('/auth/me')
      .then((freshUser) => {
        window.sessionStorage.setItem('iic.user', JSON.stringify(freshUser));
        setUser(freshUser);
        // Restore mustChangePassword flag if stored
        const stored = window.sessionStorage.getItem('iic.mustChangePassword');
        setMustChangePassword(stored === 'true');
      })
      .catch(() => {
        // Token expired or invalid — clear storage, force login
        window.sessionStorage.removeItem('iic.token');
        window.sessionStorage.removeItem('iic.user');
        window.sessionStorage.removeItem('iic.mustChangePassword');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * login(identifier, password)
   * identifier can be a userId (e.g. "ORG-1001") or an email address.
   * On success: stores token + user in sessionStorage, sets user state.
   * Returns { user, mustChangePassword }.
   */
  const login = useCallback(async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password });
    window.sessionStorage.setItem('iic.token', data.token);
    window.sessionStorage.setItem('iic.user', JSON.stringify(data.user));
    window.sessionStorage.setItem('iic.mustChangePassword', String(!!data.mustChangePassword));
    setUser(data.user);
    setMustChangePassword(!!data.mustChangePassword);
    return { user: data.user, mustChangePassword: !!data.mustChangePassword };
  }, []);

  /**
   * changePassword(currentPassword, newPassword)
   * Calls POST /auth/change-password, updates the token and clears the flag.
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const data = await api.post('/auth/change-password', { currentPassword, newPassword });
    // Refresh token so the JWT no longer carries mustChangePassword=true
    window.sessionStorage.setItem('iic.token', data.token);
    window.sessionStorage.setItem('iic.user', JSON.stringify(data.user));
    window.sessionStorage.setItem('iic.mustChangePassword', 'false');
    setUser(data.user);
    setMustChangePassword(false);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem('iic.token');
    window.sessionStorage.removeItem('iic.user');
    window.sessionStorage.removeItem('iic.mustChangePassword');
    setUser(null);
    setMustChangePassword(false);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword, isAuthenticated, mustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
