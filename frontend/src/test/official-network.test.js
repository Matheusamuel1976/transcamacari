import { describe, expect, test } from 'vitest';
import network from '../../../data/official-network-2026.json';

describe('inventário oficial da rede de agosto de 2026', () => {
  test('mantém 46 códigos documentados e sem duplicação', () => {
    const codes = network.lines.map(line => line.code);

    expect(network.source.authority).toBe('STT Camaçari');
    expect(network.source.publishedOn).toBe('2026-08-12');
    expect(network.lines).toHaveLength(46);
    expect(new Set(codes).size).toBe(46);
  });

  test('separa serviços regulares dos circulares de domingo e feriado', () => {
    expect(network.lines.filter(line => line.serviceType === 'regular')).toHaveLength(38);
    expect(network.lines.filter(line => line.serviceType === 'domingo_feriado')).toHaveLength(8);
  });

  test('não transforma erros tipográficos do documento em horários válidos', () => {
    const schedules = network.lines.flatMap(line => line.schedules);

    expect(schedules.length).toBeGreaterThan(1000);
    expect(schedules.every(item => /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))).toBe(true);
    expect(network.ambiguities.some(item => item.rawValue === '114h')).toBe(true);
  });

  test('cada horário informa categoria e local de partida', () => {
    for (const schedule of network.lines.flatMap(line => line.schedules)) {
      expect(['uteis', 'sabado', 'segunda_sabado', 'domingo_feriado', 'todos']).toContain(schedule.dayType);
      expect(schedule.departureFrom).toBeTruthy();
    }
  });
});
