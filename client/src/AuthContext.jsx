import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me').then((d) => setUser(d.user)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const authenticate = async (mode, form) => {
    const d = await api(`/auth/${mode}`, { method: 'POST', body: form });
    setToken(d.token);
    setUser(d.user);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, login: (f) => authenticate('login', f), register: (f) => authenticate('register', f) }}>
      {children}
    </AuthContext.Provider>
  );
}
