import { afterEach, expect, test, vi } from 'vitest';
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
test('configuração ausente não derruba importação antes da montagem React', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', '');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  vi.resetModules();
  const client = await import('../services/supabase');
  expect(client.supabase).toBeNull();
  expect(client.configurationError).toContain('Supabase');
});
