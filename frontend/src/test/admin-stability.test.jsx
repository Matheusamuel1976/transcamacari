import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { AccessManagement } from '../pages/dashboard/AccessManagement';
import { AccountSettings } from '../pages/dashboard/AccountSettings';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin', email: 'admin@example.invalid' },
    updateUser: vi.fn(),
    updatePassword: vi.fn(),
  }),
}));

let root;
let container;

async function mount(component) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(component));
}

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

test('gestão de equipe exibe convite e aprovações sem exceção', async () => {
  await mount(<AccessManagement />);
  expect(container.textContent).toContain('Código da empresa');
  expect(container.textContent).toContain('Aguardando aprovação');
});

test('teste SMTP fica indisponível sem contrato seguro publicado', async () => {
  await mount(<AccountSettings />);
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent.includes('Teste de e-mail indisponível'),
  );
  expect(button).toBeDefined();
  expect(button.disabled).toBe(true);
});
