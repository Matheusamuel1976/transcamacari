import { expect, test } from 'vitest';
import { formatTime, leafletRoute, normalizeSchedules, validPoint } from '../services/transport';

test('horários aceitam registros e valores ausentes sem exceção e normalizam duplicatas', () => {
  expect(formatTime(null)).toBe('');
  expect(formatTime({ horario: '05:10:00' })).toBe('05:10');
  expect(normalizeSchedules([{ horario: '06:00:00', dias: 'domingo' }, { horario: null }, { horario: '06:00:00', categoria: 'domingo_feriado' }])).toHaveLength(1);
});
test('preserva partidas simultâneas de locais diferentes', () => {
  const result = normalizeSchedules([
    { id: 1, horario: '05:00:00', categoria: 'uteis', partida_de: 'TISO' },
    { id: 2, horario: '05:00:00', categoria: 'uteis', partida_de: 'Arembepe' },
  ]);

  expect(result).toHaveLength(2);
  expect(result.map(item => item.partida_de)).toEqual(['Arembepe', 'TISO']);
});
test('geometria converte longitude/latitude e rejeita dados inválidos ou em revisão', () => {
  const route = { geometry: { type: 'LineString', coordinates: [[-38.3, -12.7], [-38.31, -12.71]] } };
  expect(leafletRoute(route)[0]).toEqual([-12.7, -38.3]);
  expect(leafletRoute({ ...route, estado_validacao: 'needs_review' })).toEqual([]);
  expect(leafletRoute({ geometry: { type: 'LineString', coordinates: [[null, 4], [1, 2]] } })).toEqual([]);
  expect(validPoint({ latitude: null, longitude: '' })).toBe(false);
});
