import { beforeEach, expect, test, vi } from 'vitest';

const calls = vi.hoisted(() => []);

const makeQuery = () => {
  const query = {
    data: [],
    error: null,
    select: vi.fn(() => query),
    eq: vi.fn((column, value) => {
      calls.push(['eq', column, value]);
      return query;
    }),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    single: vi.fn(async () => ({ data: {}, error: null })),
    maybeSingle: vi.fn(async () => ({ data: {}, error: null })),
    then: (resolve) => Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return query;
};

const from = vi.hoisted(() => vi.fn((table) => {
  calls.push(['from', table]);
  return makeQuery();
}));

vi.mock('../services/supabase', () => ({
  supabase: { from, rpc: vi.fn() },
}));

beforeEach(() => {
  calls.length = 0;
  from.mockClear();
});

test('administração pública consulta somente o catálogo municipal', async () => {
  const { api } = await import('../services/api');
  await api.lines.listPublicAdmin();

  expect(calls).toContainEqual(['eq', 'escopo_acesso', 'catalogo_publico']);
  expect(calls).not.toContainEqual(['eq', 'escopo_acesso', 'empresa_privada']);
});

test('administração empresarial consulta somente linhas privadas', async () => {
  const { api } = await import('../services/api');
  await api.lines.listCompany();

  expect(calls).toContainEqual(['eq', 'escopo_acesso', 'empresa_privada']);
  expect(calls).not.toContainEqual(['eq', 'escopo_acesso', 'catalogo_publico']);
});

test('detalhe público exige linha publicada e pertencente ao catálogo', async () => {
  const { api } = await import('../services/api');
  await api.lines.getPublic(42);

  expect(calls).toContainEqual(['eq', 'id', 42]);
  expect(calls).toContainEqual(['eq', 'escopo_acesso', 'catalogo_publico']);
  expect(calls).toContainEqual(['eq', 'publicado', true]);
  expect(calls).toContainEqual(['eq', 'visivel', 1]);
});

test('serviço não oferece mais consulta global de linhas', async () => {
  const { api } = await import('../services/api');
  expect(api.lines.listAll).toBeUndefined();
});
