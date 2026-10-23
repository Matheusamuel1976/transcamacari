import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { gsap } from 'gsap';
import { TransitionProvider } from '../motion/TransitionContext';
import { AnimatedPage } from '../motion/AnimatedPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ChapterDescubra } from '../components/chapters/ChapterDescubra';
import { TransitionOverlay } from '../motion/TransitionOverlay';
import { LoginPage } from '../pages/auth/LoginPage';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ChapterCaminhos } from '../components/chapters/ChapterCaminhos';

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null, isAuthenticated: false, register: vi.fn() }) }));
vi.mock('../services/lines', () => ({
  searchText: value => String(value).toLowerCase(),
  loadPublicLines: async () => [{ id: 8, code: 'S01', name: 'Centro', bairro: 'Centro', horarios: [{ id: 1, horario: '05:00:00', categoria: 'uteis' }], points: [] }],
}));
let root;
let container;
async function mount(ui) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => { root.render(ui); });
}
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  gsap.globalTimeline.clear();
});

test('cadastro renderiza em StrictMode com animações reais', async () => {
  await mount(<React.StrictMode><MemoryRouter initialEntries={['/register']}><TransitionProvider><AnimatedPage><RegisterPage /></AnimatedPage></TransitionProvider></MemoryRouter></React.StrictMode>);
  gsap.globalTimeline.getChildren().forEach(animation => animation.progress(1));
  expect(container.querySelector('form')).not.toBeNull();
  expect(container.querySelector('#email')).not.toBeNull();
  expect(container.querySelector('form').style.opacity).not.toBe('0');
});

test('consulta da landing renderiza e expande horários recebidos como registros Supabase', async () => {
  await mount(<MemoryRouter><ChapterDescubra /></MemoryRouter>);
  expect(container.textContent).toContain('05:00');
  await act(async () => container.querySelector('.line-result__summary').click());
  expect(container.querySelector('.line-result__details').textContent).toContain('05:00');
});

test('navegação login para cadastro conclui e mantém formulário visível', async () => {
  await mount(<React.StrictMode><MemoryRouter initialEntries={['/login']}><TransitionProvider><TransitionOverlay /><Routes><Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} /><Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} /></Routes></TransitionProvider></MemoryRouter></React.StrictMode>);
  const link = container.querySelector('a[href="/register"]');
  expect(link).not.toBeNull();
  await act(async () => link.click());
  for (let index = 0; index < 4; index++) {
    await act(async () => { gsap.globalTimeline.getChildren().forEach(animation => animation.progress(1)); });
  }
  expect(container.querySelector('#company_name')).not.toBeNull();
  expect(container.textContent).toContain('Empresas organizam sua operação privada');
  expect(container.querySelector('.auth-card').style.opacity).not.toBe('0.3');
});

test('movimento reduzido mantém conteúdo visível e não cria tweens de entrada', async () => {
  window.matchMedia.mockReturnValueOnce({ matches: true, addEventListener() {}, removeEventListener() {} }).mockReturnValueOnce({ matches: true, addEventListener() {}, removeEventListener() {} });
  await mount(<ChapterCaminhos />);
  expect(container.querySelector('.journey__panel').textContent).toContain('Todo caminho tem um começo');
  expect(gsap.globalTimeline.getChildren()).toHaveLength(0);
});

test('exceção de renderização produz recuperação visível em vez de tela branca', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  function Broken() { throw new Error('synthetic render failure'); }
  await mount(<ErrorBoundary><Broken /></ErrorBoundary>);
  expect(container.querySelector('[role="alert"]').textContent).toContain('Tentar novamente');
  expect(container.querySelector('a').getAttribute('href')).toBe('/linhas');
  log.mockRestore();
});
