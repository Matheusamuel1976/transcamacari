import { supabase } from './supabase';

const privilegedFeatureUnavailable = () =>
  Promise.reject(
    new Error(
      'A gestão de acessos exige uma função administrativa segura que ainda não foi publicada.',
    ),
  );

export const api = {
  capabilities: {
    teamManagement: false,
    smtpTest: false,
  },
  // --- Linhas ---
  lines: {
    list: async () => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .eq('publicado', true)
        .order('codigo');
      if (error) throw error;
      return { data };
    },
    get: async (id) => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { data };
    },
    listAll: async () => {
      const { data, error } = await supabase
        .from('linhas')
        .select('*')
        .order('codigo');
      if (error) throw error;
      return { data };
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

  // Perfis existentes são somente leitura no navegador. Criar ou remover uma
  // identidade exige a Admin API em uma função server-side.
  employees: {
    list: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      return { data };
    },
  },

  team: {
    users: privilegedFeatureUnavailable,
    pending: privilegedFeatureUnavailable,
    invite: privilegedFeatureUnavailable,
    regenerateInvite: privilegedFeatureUnavailable,
    createUser: privilegedFeatureUnavailable,
    approve: privilegedFeatureUnavailable,
    remove: privilegedFeatureUnavailable,
    assign: privilegedFeatureUnavailable,
    audit: privilegedFeatureUnavailable,
  },

  smtpTest: privilegedFeatureUnavailable,

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
