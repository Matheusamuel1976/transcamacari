import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { LandingPage } from '../pages/LandingPage';
import { ChapterPlanos } from '../components/chapters/ChapterPlanos';

vi.mock('../motion/useChapterMotion', () => ({ useChapterMotion: () => {} }));
vi.mock('../components/Hero', () => ({ Hero: () => <div>Hero</div> }));
vi.mock('../components/chapters/ChapterCidade', () => ({ ChapterCidade: () => null }));
vi.mock('../components/chapters/ChapterCaminhos', () => ({ ChapterCaminhos: () => null }));
vi.mock('../components/chapters/ChapterDescubra', () => ({ ChapterDescubra: () => null }));
vi.mock('../components/chapters/ChapterMapa', () => ({ ChapterMapa: () => null }));
vi.mock('../components/chapters/ChapterTecnologia', () => ({ ChapterTecnologia: () => <div>Informação clara</div> }));
vi.mock('../components/chapters/ChapterEquipe', () => ({ ChapterEquipe: () => <div>Equipe</div> }));
vi.mock('../components/Footer', () => ({ Footer: () => <footer>Rodapé</footer> }));

let root;
let container;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  root = null;
  container = null;
});

test('landing insere os planos empresariais antes da equipe', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><LandingPage /></MemoryRouter>));

  expect(container.querySelector('#planos')).not.toBeNull();
  expect(container.textContent).toContain('Rastreamento Básico');
  expect(container.textContent.indexOf('Rastreamento Básico')).toBeLessThan(
    container.textContent.indexOf('Equipe'),
  );
});

test('planos alternam de mensal para anual com dois meses grátis', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><ChapterPlanos /></MemoryRouter>));

  expect(container.textContent).toContain('R$ 60–100');
  expect(container.textContent).toContain('R$ 120–200+');
  const annual = container.querySelector('button[aria-pressed="false"]');
  expect(annual).not.toBeNull();
  expect(annual.textContent).toContain('Anual');

  await act(async () => annual.click());

  expect(container.textContent).toContain('R$ 600–1.000');
  expect(container.textContent).toContain('R$ 1.200–2.000+');
  expect(container.textContent).toContain('2 meses grátis');
  expect(annual.getAttribute('aria-pressed')).toBe('true');
});

test('planos levam ao cadastro empresarial e não divulgam aplicativo inexistente', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><ChapterPlanos /></MemoryRouter>));

  const links = Array.from(container.querySelectorAll('a'));
  expect(links).toHaveLength(2);
  expect(links.every(link => link.getAttribute('href') === '/register?tipo=empresa')).toBe(true);
  expect(container.textContent.toLowerCase()).not.toContain('mobi bahia');
  expect(container.textContent).not.toContain('Google Play');
  expect(container.textContent).not.toContain('App Store');
});
