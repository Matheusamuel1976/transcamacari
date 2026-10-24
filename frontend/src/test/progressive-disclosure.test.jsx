import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { ChapterDescubra } from '../components/chapters/ChapterDescubra';
import { LineDetailPage } from '../pages/LineDetailPage';

const publicLines = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  code: `L${String(index + 1).padStart(2, '0')}`,
  name: `Linha ${index + 1}`,
  bairro: index % 2 ? 'Orla' : 'Sede',
  origem: 'Origem',
  destino: 'Destino',
  horarios: [{ id: index + 1, horario: '05:00:00', categoria: 'uteis' }],
}));

const apiMock = vi.hoisted(() => ({
  lines: { get: vi.fn(), pontos: vi.fn() },
  horarios: { list: vi.fn() },
  routes: { forLine: vi.fn() },
}));

vi.mock('../services/lines', () => ({
  searchText: value => String(value || '').toLowerCase(),
  loadPublicLines: async () => publicLines,
}));
vi.mock('../services/api', () => ({ api: apiMock }));

let root;
let container;

async function mount(ui) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(ui));
}

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  vi.clearAllMocks();
});

test('a landing mostra oito linhas e revela o restante sob demanda', async () => {
  await mount(<MemoryRouter><ChapterDescubra /></MemoryRouter>);

  expect(container.querySelectorAll('.line-result')).toHaveLength(8);
  const more = container.querySelector('.line-finder__more');
  expect(more?.textContent).toContain('Ver mais 2 linhas');

  await act(async () => more.click());
  expect(container.querySelectorAll('.line-result')).toHaveLength(10);
  expect(container.querySelector('.line-finder__more')).toBeNull();
});

test('alterar a busca recolhe novamente uma lista extensa', async () => {
  await mount(<MemoryRouter><ChapterDescubra /></MemoryRouter>);
  await act(async () => container.querySelector('.line-finder__more').click());

  const search = container.querySelector('input[type="search"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(search, 'Linha');
    search.dispatchEvent(new Event('input', { bubbles: true }));
  });

  expect(container.querySelectorAll('.line-result')).toHaveLength(8);
  expect(container.querySelector('.line-finder__more')).not.toBeNull();
});

test('detalhe mostra prévias de horários e itinerário e permite expandi-las', async () => {
  apiMock.lines.get.mockResolvedValue({ data: {
    id: 1, codigo: 'L01', nome: 'Linha compacta', categoria: 'sede',
    origem: 'Origem', destino: 'Destino', bairro: 'Centro', situacao_rede: 'vigente',
  } });
  apiMock.horarios.list.mockResolvedValue({ data: Array.from({ length: 15 }, (_, index) => ({
    id: index + 1, horario: `${String(5 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}:00`, categoria: 'uteis', partida_de: 'Terminal',
  })) });
  apiMock.lines.pontos.mockResolvedValue({ data: Array.from({ length: 7 }, (_, index) => ({
    id: index + 1, nome: `Local ${index + 1}`, sentido: 'ida', ordem: index + 1,
    latitude: -12.7 + index / 1000, longitude: -38.3, geocoding_source: 'estimated',
  })) });
  apiMock.routes.forLine.mockResolvedValue({ data: [] });

  await mount(<MemoryRouter initialEntries={['/linhas/1']}><Routes><Route path="/linhas/:id" element={<LineDetailPage />} /></Routes></MemoryRouter>);

  expect(container.querySelectorAll('.line-detail-time')).toHaveLength(12);
  expect(container.querySelectorAll('.line-detail-itinerary li')).toHaveLength(5);

  await act(async () => container.querySelector('.line-detail-times-toggle').click());
  await act(async () => container.querySelector('.line-detail-itinerary-toggle').click());
  expect(container.querySelectorAll('.line-detail-time')).toHaveLength(15);
  expect(container.querySelectorAll('.line-detail-itinerary li')).toHaveLength(7);
});

