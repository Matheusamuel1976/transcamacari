import { api } from './api';
import { leafletRoute, normalizeSchedules, validPoint } from './transport';

export const searchText = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function loadPublicLines() {
  const result = await api.lines.list();
  if (!Array.isArray(result.data)) throw new Error('Não foi possível consultar as linhas.');
  return Promise.all(result.data.filter(line => line.visivel !== false && Number(line.visivel) !== 0).map(async line => {
    const [points, schedules, routes] = await Promise.allSettled([
      api.lines.pontos(line.id), api.horarios.list(line.id), api.routes.forLine(line.id),
    ]);
    const locais = points.status === 'fulfilled' && Array.isArray(points.value.data) ? points.value.data : [];
    const geometrias = routes.status === 'fulfilled' && Array.isArray(routes.value.data) ? routes.value.data : [];
    return {
      ...line, code: String(line.codigo), name: line.nome,
      horarios: normalizeSchedules(schedules.status === 'fulfilled' ? schedules.value.data : []),
      scheduleError: schedules.status === 'rejected' ? 'Não foi possível carregar os horários. Abra os detalhes para tentar novamente.' : '',
      locais,
      points: locais.filter(p => p.sentido === 'ida' && validPoint(p) && p.geocoding_source && p.geocoding_source !== 'estimated').sort((a, b) => a.ordem - b.ordem).map(p => [Number(p.latitude), Number(p.longitude)]),
      routes: geometrias,
      routePoints: leafletRoute(geometrias.find(route => route.sentido === 'ida'), locais.filter(p => p.sentido === 'ida')),
    };
  }));
}
