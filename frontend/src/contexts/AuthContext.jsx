import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // Check for existing session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    return { user: data.user };
  }, []);

  const register = useCallback(async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name || userData.email,
          role: userData.role || 'operator',
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  const updateUser = useCallback(async (userData) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { name: userData.name },
    });
    if (error) throw error;
    setUser(data.user);
    return { user: data.user };
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { user: data.user };
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
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
    resetPassword,
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