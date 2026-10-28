import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { RegisterPage } from '../pages/auth/RegisterPage';

const register = vi.fn(async () => ({ session: null }));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ register, user: null, isAuthenticated: false }),
}));

let root;
let container;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  vi.clearAllMocks();
});

async function mount(entry = '/register') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<MemoryRouter initialEntries={[entry]}><RegisterPage /></MemoryRouter>));
}

async function change(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('cadastro oferece fluxos distintos para empresa e funcionário', async () => {
  await mount();
  expect(container.textContent).toContain('Empresa');
  expect(container.textContent).toContain('Funcionário');
  expect(container.querySelector('[name="company_name"]')).not.toBeNull();

  const employeeTab = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Funcionário');
  await act(async () => employeeTab.click());
  expect(container.querySelector('[name="company_code"]')).not.toBeNull();
});

test('link empresarial abre o cadastro no modo funcionário sem transportar o código', async () => {
  await mount('/register?tipo=funcionario');
  expect(container.querySelector('[name="company_code"]')).not.toBeNull();
  expect(container.querySelector('[name="company_name"]')).toBeNull();
});

test('cadastro envia apenas o tipo e os dados de onboarding escolhidos', async () => {
  await mount();
  const values = {
    name: 'Responsável Teste',
    company_name: 'Empresa Teste',
    email: 'responsavel@example.invalid',
    password: 'senha-segura',
  };
  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector(`[name="${name}"]`);
    await change(input, value);
  }
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(register).toHaveBeenCalledWith(expect.objectContaining({ kind: 'company', company_name: 'Empresa Teste' }));
});
