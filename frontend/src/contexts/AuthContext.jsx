import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabase';
import { saveCompanyInvite } from '../services/companyInvite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!supabase) { setLoading(false); return; }
    // Keep the auth callback synchronous; load profiles in a separate effect.
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        setIdentity(null);
        setLoading(false);
      } else {
        setIdentity(data.session?.user ?? null);
        if (!data.session) setLoading(false);
      }
    }).catch(() => { if (alive) { setIdentity(null); setLoading(false); setProfileError('Não foi possível verificar sua sessão. Tente entrar novamente.'); } });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setIdentity(session?.user ? { ...session.user } : null);
      setLoading(!!session);
      if (_event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      if (!session) setIsRecovery(false);
    });

    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!identity) { setUser(null); return; }
    setLoading(true);
    setProfileError('');
    const loadProfile = async () => {
      let result = await supabase.from('profiles').select('id,name,role,status,company_id').eq('id', identity.id).maybeSingle();
      if (!result.error && result.data?.role === 'operator' && !result.data.company_id) {
        const metadata = identity.user_metadata || {};
        if (metadata.registration_kind === 'company' && metadata.company_name) {
          const onboarding = await supabase.rpc('complete_company_registration', { company_name: metadata.company_name });
          if (!onboarding.error) {
            saveCompanyInvite(onboarding.data);
            result = await supabase.from('profiles').select('id,name,role,status,company_id').eq('id', identity.id).maybeSingle();
          }
          else setProfileError(onboarding.error.message || 'Não foi possível concluir o cadastro da empresa.');
        } else if (metadata.registration_kind === 'employee' && metadata.company_code) {
          const onboarding = await supabase.rpc('request_employee_membership', { company_code: metadata.company_code });
          if (!onboarding.error) result = await supabase.from('profiles').select('id,name,role,status,company_id').eq('id', identity.id).maybeSingle();
          else setProfileError(onboarding.error.message || 'Não foi possível validar o código da empresa.');
        }
      }
      if (!alive) return;
      const { data, error } = result;
      setUser({ ...identity, name: data?.name || identity.user_metadata?.name || '', role: error ? 'operator' : data?.role || 'operator', status: data?.status || 'active', company_id: data?.company_id ?? null });
      if (error) setProfileError('Não foi possível consultar seu perfil. O acesso administrativo permanece bloqueado.');
      else if (!data) setProfileError('Seu acesso administrativo depende de autorização da equipe responsável.');
      setLoading(false);
    };
    loadProfile().catch(() => {
      if (alive) { setUser({ ...identity, role: 'operator' }); setProfileError('Perfil indisponível. Tente entrar novamente.'); setLoading(false); }
    });
    return () => { alive = false; };
  }, [identity]);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIdentity(data.user);
    return { user: data.user };
  }, []);

  const register = useCallback(async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name || userData.email,
          registration_kind: userData.kind,
          company_name: userData.kind === 'company' ? userData.company_name : undefined,
          company_code: userData.kind === 'employee' ? userData.company_code.trim().toUpperCase() : undefined,
        },
      },
    });
    if (error) {
      if (userData.kind === 'employee' && /database|saving new user/i.test(error.message || '')) {
        throw new Error('Não foi possível validar o código da empresa. Confira o código com o responsável.');
      }
      throw error;
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIdentity(null);
  }, []);

  const updateUser = useCallback(async (userData) => {
    if (!identity) throw new Error('Entre novamente para atualizar seu perfil.');
    const profile = await supabase.rpc('update_own_profile_name', { p_name: userData.name });
    if (profile.error) throw profile.error;
    const { data, error } = await supabase.auth.updateUser({
      data: { name: userData.name },
    });
    if (error) throw error;
    setIdentity(data.user);
    return { user: data.user };
  }, [identity]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    const password = newPassword ?? currentPassword;
    if (newPassword && !isRecovery) {
      const result = await supabase.auth.signInWithPassword({ email: identity?.email, password: currentPassword });
      if (result.error) throw result.error;
    }
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setIsRecovery(false);
    return { user: data.user };
  }, [identity, isRecovery]);

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/trocar-senha` });
    if (error) throw error;
    return data;
  }, []);

  const value = {
    user,
    isAuthenticated: !!identity,
    profileError,
    isRecovery,
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

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
