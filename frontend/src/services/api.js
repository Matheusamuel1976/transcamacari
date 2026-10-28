import { supabase } from './supabase';
import { readCompanyInvite, saveCompanyInvite } from './companyInvite';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const api = {
  capabilities: {
    teamManagement: true,
    smtpTest: false,
  },
  // --- Linhas ---
  lines: {
    list: async () => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .eq('escopo_acesso', 'catalogo_publico')
        .eq('publicado', true)
        .eq('situacao_rede', 'vigente')
        .order('codigo');
      if (error) throw error;
      return { data };
    },
    listHistorical: async () => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .eq('escopo_acesso', 'catalogo_publico')
        .eq('publicado', true)
        .eq('situacao_rede', 'historica')
        .order('codigo');
      if (error) throw error;
      return { data };
    },
    getPublic: async (id) => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*, fonte:transport_sources(*)')
        .eq('id', id)
        .eq('escopo_acesso', 'catalogo_publico')
        .eq('publicado', true)
        .eq('visivel', true)
        .single();
      if (error) throw error;
      return { data };
    },
    listPublicAdmin: async () => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .eq('escopo_acesso', 'catalogo_publico')
        .order('codigo');
      if (error) throw error;
      return { data };
    },
    listCompany: async () => {
      const { data, error } = await supabase.from('linhas').select('*').eq('escopo_acesso', 'empresa_privada').order('codigo');
      if (error) throw error;
      return { data };
    },
    assigned: async (profileId) => {
      const { data: assignments, error } = await supabase
        .from('profile_line_assignments')
        .select('linha_id')
        .eq('profile_id', profileId);
      if (error) throw error;
      const ids = (assignments || []).map((item) => item.linha_id);
      if (!ids.length) return { data: [] };
      const result = await supabase.from('linhas').select('*').in('id', ids).eq('escopo_acesso', 'empresa_privada').eq('visivel', true).order('codigo');
      if (result.error) throw result.error;
      return { data: result.data };
    },
    create: async (d) => {
      const { data, error } = await supabase.from('linhas').insert(d).select().single();
      if (error) throw error;
      return { data };
    },
    update: async (id, d) => {
      const { data, error } = await supabase.from('linhas').update(d).eq('id', id).select().single();
      if (error) throw error;
      return { data };
    },
    remove: async (id) => {
      const { error } = await supabase.from('linhas').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    pontos: async (id) => {
      const { data, error } = await supabase
        .from('itinerary_locais')
        .select('*')
        .eq('linha_id', id)
        .order('sentido')
        .order('ordem');
      if (error) throw error;
      return { data };
    },
    addPonto: async (id, d) => {
      const { data, error } = await supabase
        .from('itinerary_locais')
        .insert({ linha_id: id, ...d })
        .select().single();
      if (error) throw error;
      return { data };
    },
    removePonto: async (pid) => {
      const { error } = await supabase.from('itinerary_locais').delete().eq('id', pid);
      if (error) throw error;
      return { success: true };
    },
    route: async (id, sentido = 'ida') => {
      const { data, error } = await supabase
        .from('route_geometries')
        .select('*')
        .eq('linha_id', id)
        .eq('sentido', sentido)
        .single();
      if (error) throw error;
      return { data };
    },
  },

  // --- Horarios ---
  horarios: {
    list: async (linhaId) => {
      const { data, error } = await supabase
        .from('horarios')
        .select('*')
        .eq('linha_id', linhaId)
        .order('categoria')
        .order('ordem');
      if (error) throw error;
      return { data };
    },
    create: async (d) => {
      const { data, error } = await supabase.from('horarios').insert(d).select().single();
      if (error) throw error;
      return { data };
    },
    update: async (id, d) => {
      const { data, error } = await supabase.from('horarios').update(d).eq('id', id).select().single();
      if (error) throw error;
      return { data };
    },
    remove: async (id) => {
      const { error } = await supabase.from('horarios').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  employees: {
    list: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'funcionario').order('name');
      if (error) throw error;
      return { data };
    },
  },

  team: {
    users: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'funcionario').order('name');
      if (error) throw error;
      const assignments = await Promise.all((data || []).map(async (profile) => {
        const result = await supabase.from('profile_line_assignments').select('linha:linhas(id,codigo,nome)').eq('profile_id', profile.id);
        if (result.error) throw result.error;
        return { ...profile, linhas: (result.data || []).map((row) => row.linha).filter(Boolean) };
      }));
      return { data: assignments };
    },
    pending: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'funcionario').eq('status', 'pending').order('created_at');
      if (error) throw error;
      return { data };
    },
    invite: async () => readCompanyInvite(),
    regenerateInvite: async () => {
      const data = unwrap(await supabase.rpc('rotate_company_invite'));
      saveCompanyInvite(data);
      return data;
    },
    approve: async (id, lineIds) => {
      unwrap(await supabase.rpc('approve_employee', { p_profile_id: id, p_line_ids: lineIds }));
      return { success: true };
    },
    reject: async (id) => {
      unwrap(await supabase.rpc('reject_employee', { p_profile_id: id }));
      return { success: true };
    },
    suspend: async (id) => {
      unwrap(await supabase.rpc('suspend_employee', { p_profile_id: id }));
      return { success: true };
    },
    assign: async (id, lineIds) => {
      unwrap(await supabase.rpc('set_employee_assignments', { p_profile_id: id, p_line_ids: lineIds }));
      return { success: true };
    },
    audit: async () => {
      const { data, error } = await supabase.from('profile_access_audit').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return { data };
    },
  },

  onboarding: {
    completeCompany: async (companyName) => unwrap(await supabase.rpc('complete_company_registration', { company_name: companyName })),
    requestMembership: async (companyCode) => unwrap(await supabase.rpc('request_employee_membership', { company_code: companyCode })),
  },

  company: {
    get: async (id) => {
      const { data, error } = await supabase.from('companies').select('id,nome').eq('id', id).single();
      if (error) throw error;
      return { data };
    },
  },

  smtpTest: () => Promise.reject(new Error('O teste SMTP ainda não está configurado.')),

  // --- Contato ---
  contact: async (d) => {
    if (d.website) return { delivery: 'stored', message: 'Solicitação recebida.' };
    const { error } = await supabase.from('contact_messages').insert({ nome: d.nome, email: d.email, assunto: d.assunto, mensagem: d.mensagem });
    if (error) throw error;
    return { delivery: 'stored', message: 'Mensagem registrada para a equipe. O envio por e-mail não está habilitado neste canal.' };
  },

  messages: {
    list: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data };
    },
    remove: async (id) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  // --- Route geometries ---
  routes: {
    forLine: async (id) => {
      const { data, error } = await supabase.from('route_geometries').select('*').eq('linha_id', id).order('sentido');
      if (error) throw error;
      return { data };
    },
    list: async () => {
      const { data, error } = await supabase.from('route_geometries').select('*').order('linha_id');
      if (error) throw error;
      return { data };
    },
    create: async (d) => {
      const { data, error } = await supabase.from('route_geometries').insert(d).select().single();
      if (error) throw error;
      return { data };
    },
    update: async (id, d) => {
      const { data, error } = await supabase.from('route_geometries').update(d).eq('id', id).select().single();
      if (error) throw error;
      return { data };
    },
  },
};

export default api;
