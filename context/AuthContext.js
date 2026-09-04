import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = window.localStorage.getItem('iic.user');
    const storedToken = window.localStorage.getItem('iic.token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore corrupt storage
        window.localStorage.removeItem('iic.user');
        window.localStorage.removeItem('iic.token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * login(identifier, password)
   * identifier can be a userId (e.g. "ORG-1001") or an email address.
   * On success: stores token + user in localStorage, sets user state.
   * Returns the authenticated user object.
   */
  const login = useCallback(async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password });
    window.localStorage.setItem('iic.token', data.token);
    window.localStorage.setItem('iic.user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('iic.token');
    window.localStorage.removeItem('iic.user');
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
