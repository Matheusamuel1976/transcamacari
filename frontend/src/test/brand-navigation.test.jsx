import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

let root;
let container;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  root = null;
  container = null;
});

test('menu e rodapé oferecem atalho para os planos', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><Navbar /><Footer /></MemoryRouter>));

  expect(container.querySelectorAll('a[href="/#planos"]')).toHaveLength(2);
});

test('marca usa acentos laranja e favicon invalida o cache anterior', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><Navbar /></MemoryRouter>));

  expect(getComputedStyle(container.querySelector('.navbar__brand > svg')).color).toBe('rgb(255, 109, 0)');
  expect(getComputedStyle(container.querySelector('.navbar__dot')).color).toBe('rgb(255, 109, 0)');
  expect(readFileSync(join(cwd(), 'index.html'), 'utf8')).toContain('favicon.svg?v=orange-2026');
});

test('cta encontre sua linha usa texto branco sobre o círculo azul', () => {
  const css = readFileSync(join(cwd(), 'src/styles/hero.css'), 'utf8');
  const rule = css.match(/\.hero__find\s*\{[^}]+\}/)?.[0] || '';
  expect(rule).toMatch(/color:\s*#(?:fff|ffffff|f5f5f5)/i);
  expect(rule).toMatch(/background:\s*#1a237e/i);
});
