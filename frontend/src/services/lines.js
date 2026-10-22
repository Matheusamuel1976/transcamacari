import { api } from './api';

export const searchText = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export async function loadPublicLines() {
  const result = await api.lines.list();
  if (!Array.isArray(result.data))
    throw new Error('Não foi possível consultar as linhas.');
  const lines = result.data.filter((line) => line.visivel !== false);
  // Fetch pontos for each line
  const linesWithPontos = await Promise.all(
    lines.map(async (line) => {
      try {
        const pontosRes = await api.lines.pontos(line.id);
        const pontos = (pontosRes.data || [])
          .filter((p) => p.sentido === 'ida')
          .sort((a, b) => a.ordem - b.ordem)
          .map((p) => [Number(p.latitude), Number(p.longitude)])
          .filter(
            (p) =>
              p.every(Number.isFinite) &&
              Math.abs(p[0]) <= 90 &&
              Math.abs(p[1]) <= 180,
          );
        return {
          id: line.id,
          code: String(line.codigo),
          name: line.nome,
          bairro: line.bairro,
          origem: line.origem,
          destino: line.destino,
          horarios: [],
          points: pontos,
          categoria: line.categoria,
          publicado: line.publicado,
        };
      } catch {
        return {
          id: line.id,
          code: String(line.codigo),
          name: line.nome,
          bairro: line.bairro,
          origem: line.origem,
          destino: line.destino,
          horarios: [],
          points: [],
          categoria: line.categoria,
          publicado: line.publicado,
        };
      }
    }),
  );
  return linesWithPontos;
}