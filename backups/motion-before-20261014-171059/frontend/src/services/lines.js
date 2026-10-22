import { api } from './api';

// Explicitly fictional examples, never official timetables or stop coordinates.
export const demoLines = [
  {
    id: 'demo-1',
    code: 'D01',
    name: 'Exemplo Centro / Jauá',
    bairro: 'Jauá',
    origem: 'Origem ilustrativa',
    destino: 'Destino ilustrativo',
    horarios: ['06:00', '07:00', '08:00'],
    points: [
      [-12.6975, -38.3242],
      [-12.72, -38.28],
      [-12.75, -38.24],
    ],
  },
  {
    id: 'demo-2',
    code: 'D02',
    name: 'Exemplo Centro / Abrantes',
    bairro: 'Vila de Abrantes',
    origem: 'Origem ilustrativa',
    destino: 'Destino ilustrativo',
    horarios: ['06:30', '07:30'],
    points: [
      [-12.6975, -38.3242],
      [-12.71, -38.3],
      [-12.74, -38.29],
    ],
  },
  {
    id: 'demo-3',
    code: 'D03',
    name: 'Exemplo entre bairros',
    bairro: 'Centro',
    origem: 'Origem ilustrativa',
    destino: 'Destino ilustrativo',
    horarios: ['07:00', '08:30'],
    points: [
      [-12.6975, -38.3242],
      [-12.69, -38.32],
      [-12.68, -38.31],
    ],
  },
];
export const searchText = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export async function loadPublicLines() {
  const result = await api.lines.list();
  if (!Array.isArray(result.data))
    throw new Error('Não foi possível consultar as linhas.');
  return result.data
    .filter((line) => Number(line.visivel) === 1)
    .map((line) => ({
      id: line.id,
      code: String(line.codigo),
      name: line.nome,
      bairro: line.bairro,
      origem: line.origem,
      destino: line.destino,
      horarios: line.horarios || [],
      points: (line.pontos || [])
        .map((p) => [Number(p.latitude), Number(p.longitude)])
        .filter(
          (p) =>
            p.every(Number.isFinite) &&
            Math.abs(p[0]) <= 90 &&
            Math.abs(p[1]) <= 180,
        ),
    }));
}
