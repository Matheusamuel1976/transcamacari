import { expect, test, vi } from 'vitest';
vi.mock('../services/supabase', () => ({ supabase: {} }));
import { generateRouteForLine } from '../services/routing';

test('não gera rotas usando coordenadas provisórias do seed como se fossem locais confirmados', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network must not be used'));
  const result = await generateRouteForLine(8, [{ nome: 'Centro', latitude: -12.7, longitude: -38.3, ordem: 0, sentido: 'ida', geocoding_source: 'estimated' }, { nome: 'Destino', latitude: -12.71, longitude: -38.31, ordem: 1, sentido: 'ida', geocoding_source: 'estimated' }], 'ida');
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.error).toMatch(/coordenadas.*validação/i);
  fetchMock.mockRestore();
});

test('roteamento preserva todos os pontos ordenados e valida a resposta viária', async () => {
  const points = [0, 1, 2].map(index => ({ ordem: index, sentido: 'ida', latitude: -12.7 - index * 0.01, longitude: -38.3 - index * 0.01, geocoding_source: 'manual' }));
  const geometry = { type: 'LineString', coordinates: points.map(point => [point.longitude, point.latitude]) };
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ code: 'Ok', waypoints: points.map(() => ({ distance: 0 })), routes: [{ geometry, distance: 4000, legs: [{}, {}] }] }) });
  const result = await generateRouteForLine(8, [...points].reverse(), 'ida');
  expect(result.error).toBeNull();
  expect(result.geometry).toEqual(geometry);
  expect(fetchMock.mock.lastCall[0]).toContain(points.map(point => `${point.longitude},${point.latitude}`).join(';'));
  expect(fetchMock.mock.lastCall[0]).toContain('radiuses=150;150;150');
  fetchMock.mockRestore();
});
