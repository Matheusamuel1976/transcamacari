import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { HistoricalLinesPage } from '../pages/HistoricalLinesPage';

const apiMock = vi.hoisted(() => ({ lines: { listHistorical: vi.fn() } }));
vi.mock('../services/api', () => ({ api: apiMock }));

let root;
let container;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
});

test('acervo histórico é consultado separadamente e recebe aviso de vigência', async () => {
  apiMock.lines.listHistorical.mockResolvedValue({ data: [{
    id: 8, codigo: 'S01', nome: 'Centro x Glebas & Phocs', bairro: 'Sede',
    origem: 'Centro', destino: 'Phocs', categoria: 'sede', situacao_rede: 'historica',
  }] });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><HistoricalLinesPage /></MemoryRouter>));

  expect(container.textContent).toContain('Acervo histórico');
  expect(container.textContent).toContain('não representa necessariamente a operação atual');
  expect(container.textContent).toContain('S01');
});
