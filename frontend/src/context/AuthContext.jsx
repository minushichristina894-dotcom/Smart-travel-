import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef(0);

  const logout = useCallback(() => {
    sessionRef.current += 1;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Restore session on app load — ignore stale getMe if user logs in again
  useEffect(() => {
    let cancelled = false;
    const bootSession = sessionRef.current;

    const restore = async () => {
      const token = localStorage.getItem('token');
      const saved = localStorage.getItem('user');

      if (!token || !saved) {
        setLoading(false);
        return;
      }

      try {
        setUser(JSON.parse(saved));
      } catch {
        logout();
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.getMe();
        if (cancelled || bootSession !== sessionRef.current) return;
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        if (cancelled || bootSession !== sessionRef.current) return;
        logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => { cancelled = true; };
  }, [logout]);

  const login = async (username, password) => {
    sessionRef.current += 1;
    const activeSession = sessionRef.current;

    const { data } = await authAPI.login({
      username: username.trim(),
      password,
    });

    if (activeSession !== sessionRef.current) {
      throw new Error('Login interrupted. Please try again.');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    sessionRef.current += 1;

    const { data } = await authAPI.register({
      ...formData,
      username: formData.username?.trim(),
    });

    return data;
  };

  const updateUser = (u) => {
    const updated = { ...user, ...u };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
      isCustomer: user?.role === 'customer',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
