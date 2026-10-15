import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { api, API_BASE } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/auth/me')
      .then((data) => {
        if (alive) setUser(data.user);
      })
      .catch(() => {
        sessionStorage.removeItem('transcamacari_user');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    setUser(data.user);
    api.resetCsrf();
    sessionStorage.setItem('transcamacari_user', JSON.stringify(data.user));
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar');
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {});
    setUser(null);
    api.resetCsrf();
    sessionStorage.removeItem('transcamacari_user');
  }, []);

  const updateUser = useCallback(async (userData) => {
    const data = await api.put('/auth/profile', userData);
    setUser(data.user);
    sessionStorage.setItem('transcamacari_user', JSON.stringify(data.user));
  }, []);

  const updatePassword = useCallback(async (current, password) => {
    const data = await api.put('/auth/password', { current, password });
    setUser(data.user);
    sessionStorage.setItem('transcamacari_user', JSON.stringify(data.user));
    return data;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
