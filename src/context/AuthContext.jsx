'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
        // Update stored user with latest data from server
        window.sessionStorage.setItem('iic.user', JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        // Token expired or invalid — clear storage, force login
        window.sessionStorage.removeItem('iic.token');
        window.sessionStorage.removeItem('iic.user');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * login(identifier, password)
   * identifier can be a userId (e.g. "ORG-1001") or an email address.
   * On success: stores token + user in localStorage, sets user state.
   * Returns the authenticated user object.
   */
  const login = useCallback(async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password });
    window.sessionStorage.setItem('iic.token', data.token);
    window.sessionStorage.setItem('iic.user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem('iic.token');
    window.sessionStorage.removeItem('iic.user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
