import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import fixtures from './fixtures/public-transport.json';
import { LineDetailPage } from '../pages/LineDetailPage';

const apiMock = vi.hoisted(() => ({ lines: { getPublic: vi.fn(), pontos: vi.fn() }, horarios: { list: vi.fn() }, routes: { forLine: vi.fn() } }));
vi.mock('../services/api', () => ({ api: apiMock }));
let root, container;
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); });
async function mount(id) {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<React.StrictMode><MemoryRouter initialEntries={[`/linhas/${id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/linhas/:id" element={<LineDetailPage />} /></Routes></MemoryRouter></React.StrictMode>));
}

test.each(fixtures)('$line.codigo: horários e itinerários reais renderizam sem tela branca', async fixture => {
  apiMock.lines.getPublic.mockResolvedValue({ data: fixture.line });
  apiMock.lines.pontos.mockResolvedValue({ data: fixture.points });
  apiMock.horarios.list.mockResolvedValue({ data: fixture.schedules });
  apiMock.routes.forLine.mockResolvedValue({ data: [] });
  await mount(fixture.line.id);
  expect(container.querySelector('h1').textContent).toBe(fixture.line.nome);
  expect(container.querySelector('.line-detail-time')).not.toBeNull();
  const idaCount = fixture.points.filter(p => p.sentido === 'ida').length;
  expect(container.querySelectorAll('ol li').length).toBe(Math.min(idaCount, 5));
  if (idaCount > 5) {
    await act(async () => container.querySelector('.line-detail-itinerary-toggle').click());
    expect(container.querySelectorAll('ol li').length).toBe(idaCount);
  }
  for (const tab of container.querySelectorAll('.line-detail-tab')) await act(async () => tab.click());
  expect(container.querySelector('.line-detail-times')).not.toBeNull();
});

test('falha de consulta mostra erro e permite recuperação sem recarregar o aplicativo', async () => {
  apiMock.lines.getPublic.mockRejectedValueOnce(new Error('Falha de rede')).mockRejectedValueOnce(new Error('Falha de rede'));
  apiMock.horarios.list.mockResolvedValue({ data: [] }); apiMock.routes.forLine.mockResolvedValue({ data: [] }); apiMock.lines.pontos.mockResolvedValue({ data: [] });
  await mount(8);
  expect(container.textContent).toContain('Falha de rede');
  apiMock.lines.getPublic.mockResolvedValue({ data: fixtures[0].line });
  await act(async () => container.querySelector('button').click());
  expect(container.querySelector('h1')).not.toBeNull();
});

test('horários oficiais distinguem o local de partida e categorias documentadas', async () => {
  apiMock.lines.getPublic.mockResolvedValue({ data: { ...fixtures[0].line, situacao_rede: 'vigente' } });
  apiMock.lines.pontos.mockResolvedValue({ data: [] });
  apiMock.routes.forLine.mockResolvedValue({ data: [] });
  apiMock.horarios.list.mockResolvedValue({ data: [
    { id: 91, horario: '05:00:00', categoria: 'segunda_sabado', partida_de: 'TISO' },
    { id: 92, horario: '05:00:00', categoria: 'segunda_sabado', partida_de: 'Arembepe' },
  ] });

  await mount(fixtures[0].line.id);
  const combinedTab = [...container.querySelectorAll('.line-detail-tab')]
    .find(button => button.textContent.includes('Segunda a sábado'));
  expect(combinedTab).toBeTruthy();
  await act(async () => combinedTab.click());
  expect(container.textContent).toContain('Saída: Arembepe');
  expect(container.textContent).toContain('Saída: TISO');
});
