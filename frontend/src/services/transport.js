export const DAY_LABELS = { uteis: 'Dias úteis', sabado: 'Sábados', domingo_feriado: 'Domingos e feriados', todos: 'Todos os dias' };

export function formatTime(value) {
  const time = typeof value === 'string' ? value : value?.horario;
  return typeof time === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time.slice(0, 5) : '';
}

export function normalizeSchedules(values) {
  if (!Array.isArray(values)) return [];
  const categories = Object.keys(DAY_LABELS);
  const seen = new Set();
  return values.filter(value => value && formatTime(value)).map(value => ({
    ...value,
    horario: formatTime(value),
    categoria: value.categoria || (value.dias === 'domingo' ? 'domingo_feriado' : value.dias) || 'todos',
  })).sort((a, b) => categories.indexOf(a.categoria) - categories.indexOf(b.categoria) || a.horario.localeCompare(b.horario)).filter(value => {
    const key = `${value.categoria}:${value.horario}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function validPoint(point) {
  return point?.latitude != null && point?.longitude != null && point.latitude !== '' && point.longitude !== '' &&
    Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)) &&
    Math.abs(Number(point.latitude)) <= 90 && Math.abs(Number(point.longitude)) <= 180;
}

export function leafletRoute(route, points) {
  if (points && (points.length < 2 || points.some(point => !validPoint(point) || !point.geocoding_source || point.geocoding_source === 'estimated'))) return [];
  const geometry = route?.geometry;
  if (route?.erro || route?.estado_validacao === 'needs_review' || geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) return [];
  if (!geometry.coordinates.every(c => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && Number.isFinite(c[0]) && Number.isFinite(c[1]) && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90)) return [];
  return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

export const ROUTE_NOTICE = 'Trajeto estimado — percurso sujeito a validação.';
