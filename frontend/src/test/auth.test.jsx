import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const sdk = vi.hoisted(() => ({
  auth: { getSession: vi.fn(async () => ({ data: { session: null } })), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } })), signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(async () => ({ error: null })), resetPasswordForEmail: vi.fn(async () => ({ data: {} })), updateUser: vi.fn(async () => ({ data: { user: { id: 'test' } } })) },
  from: vi.fn(),
}));
vi.mock('../services/supabase', () => ({ supabase: sdk }));
let auth, root, container;
function Probe() { auth = useAuth(); return <p>{auth.loading ? 'loading' : auth.user?.role || 'signed out'}</p>; }
async function mount() { container = document.createElement('div'); document.body.append(container); root = createRoot(container); await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>)); }
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); });
test('login usa papel do profile, ignora metadata admin, e logout encerra a sessão', async () => {
  sdk.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'synthetic', user_metadata: { role: 'admin' } } } });
  sdk.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'operator', name: 'Teste' } }) }) }) });
  await mount();
  await act(async () => auth.login('test@example.invalid', 'synthetic-test-password'));
  expect(auth.user.role).toBe('operator');
  await act(async () => auth.logout());
  expect(auth.isAuthenticated).toBe(false);
});
test('cadastro não solicita papel privilegiado e recuperação define o destino correto', async () => {
  sdk.auth.signUp.mockResolvedValue({ data: { user: { id: 'synthetic' }, session: null } });
  await mount();
  const result = await auth.register({ name: 'Teste', email: 'test@example.invalid', password: 'synthetic', role: 'admin' });
  expect(result.session).toBeNull();
  expect(sdk.auth.signUp.mock.lastCall[0].options.data).not.toHaveProperty('role');
  await auth.resetPassword('test@example.invalid');
  expect(sdk.auth.resetPasswordForEmail.mock.lastCall[1].redirectTo).toMatch(/\/trocar-senha$/);
});

test('troca de senha usa a senha nova, com reautenticação da senha atual', async () => {
  sdk.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'synthetic', email: 'test@example.invalid' } } });
  sdk.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'operator' } }) }) }) });
  await mount();
  await act(async () => auth.login('test@example.invalid', 'old-synthetic-password'));
  await act(async () => auth.updatePassword('old-synthetic-password', 'new-synthetic-password'));
  expect(sdk.auth.updateUser.mock.lastCall[0]).toEqual({ password: 'new-synthetic-password' });
});
