import { expect, test, vi } from 'vitest';

const rpc = vi.fn(async () => ({ data: [], error: null }));
const query = { data: [], error: null };
for (const method of ['select', 'eq', 'in', 'order', 'limit']) query[method] = vi.fn(() => query);
query.then = (resolve) => Promise.resolve({ data: [], error: null }).then(resolve);
const from = vi.fn(() => query);
vi.mock('../services/supabase', () => ({ supabase: { rpc, from } }));

test('serviço de equipe usa RPCs autenticadas publicadas', async () => {
  const { api } = await import('../services/api');
  expect(api.capabilities.teamManagement).toBe(true);
  await api.team.approve('profile-id', [10, 11]);
  expect(rpc).toHaveBeenCalledWith('approve_employee', { p_profile_id: 'profile-id', p_line_ids: [10, 11] });
});

test('consulta pública exige escopo municipal', async () => {
  const { api } = await import('../services/api');
  await api.lines.list();
  expect(from).toHaveBeenCalledWith('linhas');
});
