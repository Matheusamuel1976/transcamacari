import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { expect, test, vi } from 'vitest';
import { MapPage } from '../pages/dashboard/MapPage';
const api = vi.hoisted(() => ({ lines: { listAll: vi.fn(async () => ({ data: [{ id: 1, codigo: 'A' }, { id: 2, codigo: 'B' }] })), pontos: vi.fn(), route: vi.fn(async () => ({ data: null })) } }));
vi.mock('../services/api', () => ({ api }));
vi.mock('leaflet', () => {
  const chain = () => ({ addTo() { return this; }, bindTooltip() { return this; }, clearLayers() {}, openTooltip() { return this; } });
  return { default: { map: () => ({ on() {}, remove() {}, invalidateSize() {}, fitBounds() {} }), tileLayer: chain, layerGroup: chain, circleMarker: chain, polyline: chain, latLngBounds: () => ({}), control: { scale: chain } } };
});
test('trocar a linha bloqueia geração até carregar pontos correspondentes', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  api.lines.pontos.mockResolvedValueOnce({ data: [] });
  await act(async () => root.render(<MapPage />));
  const select = container.querySelector('#ed-line');
  await act(async () => Simulate.change(select, { target: { value: '1' } }));
  const generate = Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('Gerar e salvar'));
  expect(generate.disabled).toBe(false);
  let resolve;
  api.lines.pontos.mockReturnValueOnce(new Promise(done => { resolve = done; }));
  await act(async () => Simulate.change(select, { target: { value: '2' } }));
  expect(generate.disabled).toBe(true);
  await act(async () => resolve({ data: [] }));
  expect(generate.disabled).toBe(false);
  await act(async () => root.unmount()); container.remove();
});
