import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('iic.user') : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore corrupt storage
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (role) => {
    const demoUser = await api.post('/auth/demo-login', { role });
    window.localStorage.setItem('iic.userId', demoUser._id);
    window.localStorage.setItem('iic.user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('iic.userId');
    window.localStorage.removeItem('iic.user');
    setUser(null);
    router.push('/login');
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
