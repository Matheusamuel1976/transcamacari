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
  // Fetch pontos and horarios for each line
  const linesWithData = await Promise.all(
    lines.map(async (line) => {
      let pontos = [];
      let horarios = [];
      try {
        const pontosRes = await api.lines.pontos(line.id);
        pontos = (pontosRes.data || [])
          .filter((p) => p.sentido === 'ida')
          .sort((a, b) => a.ordem - b.ordem)
          .map((p) => [Number(p.latitude), Number(p.longitude)])
          .filter(
            (p) =>
              p.every(Number.isFinite) &&
              Math.abs(p[0]) <= 90 &&
              Math.abs(p[1]) <= 180,
          );
      } catch {
        pontos = [];
      }
      try {
        const horariosRes = await api.horarios.list(line.id);
        horarios = (horariosRes.data || [])
          .sort((a, b) => {
            const catOrder = { uteis: 0, sabado: 1, domingo_feriado: 2, todos: 3 };
            const ca = catOrder[a.categoria] ?? 99;
            const cb = catOrder[b.categoria] ?? 99;
            if (ca !== cb) return ca - cb;
            return a.ordem - b.ordem || a.horario.localeCompare(b.horario);
          })
          .map((h) => ({
            id: h.id,
            categoria: h.categoria,
            horario: h.horario,
          }));
      } catch {
        horarios = [];
      }
      return {
        id: line.id,
        code: String(line.codigo),
        name: line.nome,
        bairro: line.bairro,
        origem: line.origem,
        destino: line.destino,
        horarios,
        points: pontos,
        categoria: line.categoria,
        publicado: line.publicado,
      };
    }),
  );
  return linesWithData;
}