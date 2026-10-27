import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { ChapterTecnologia } from '../components/chapters/ChapterTecnologia';
import { LinesPage } from '../pages/LinesPage';

const apiMock = vi.hoisted(() => ({ lines: { list: vi.fn() } }));
vi.mock('../services/api', () => ({ api: apiMock }));

let root;
let container;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  root = null;
  container = null;
});

test('catálogo associa nomes acessíveis aos controles de busca e categoria', async () => {
  apiMock.lines.list.mockResolvedValue({ data: [] });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><LinesPage /></MemoryRouter>));

  expect(container.querySelector('#lines-search')?.getAttribute('aria-label')).toBe('Buscar linhas');
  expect(container.querySelector('label[for="lines-category"]')?.textContent).toBe('Categoria');
  expect(container.querySelector('#lines-category')).not.toBeNull();
});

test('seção de tecnologia descreve a arquitetura ativa e rotas persistidas', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<ChapterTecnologia />));

  expect(container.textContent).toContain('Supabase JS 2');
  expect(container.textContent).toContain('PostgreSQL + RLS');
  expect(container.textContent).toContain('geometrias persistidas');
  expect(container.textContent).not.toContain('PHP 8.3 MVC');
  expect(container.textContent).not.toContain('linhas tracejadas');
});
