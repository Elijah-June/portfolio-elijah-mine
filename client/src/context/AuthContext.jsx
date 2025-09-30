import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
    } catch (e) {
      try {
        await api('/api/auth/refresh', { method: 'POST' });
        const data = await api('/api/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMe(); }, []);

  async function login(email, password) {
    await api('/api/auth/login', { method: 'POST', data: { email, password } });
    await fetchMe();
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  const value = { user, loading, login, logout, isAdmin: user?.role === 'admin' };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
