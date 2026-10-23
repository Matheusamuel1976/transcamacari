import { supabase } from './supabase';

import { leafletRoute, validPoint } from './transport';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';
const REQUEST_DELAY_MS = 1100; // Respect Nominatim rate limit (~1 req/sec)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodePlace(placeName, context = 'Camaçari, Bahia, Brasil') {
  await sleep(REQUEST_DELAY_MS);
  const query = `${placeName}, ${context}`;
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const results = await res.json();

  if (!results || results.length === 0) {
    return null;
  }

  // Filter results to stay within Bahia/Camaçari region when possible
  const local = results.find(
    (r) =>
      (r.display_name || '').toLowerCase().includes('camaçari') ||
      (r.display_name || '').toLowerCase().includes('bahia')
  );

  const result = local || results[0];
  return {
    nome: placeName,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    display_name: result.display_name,
    source: 'nominatim',
  };
}

async function routeSegment(lat1, lng1, lat2, lng2) {
  const url = `${OSRM_BASE}/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    return null;
  }

  const route = data.routes[0];
  return {
    geometry: route.geometry, // GeoJSON LineString
    distance: route.distance, // meters
    duration: route.duration, // seconds
  };
}

export async function generateRouteForLine(linhaId, locais, sentido) {
  if (!linhaId || !['ida', 'volta'].includes(sentido)) return { error: 'Linha ou sentido inválido.' };
  const sorted = (Array.isArray(locais) ? locais : []).filter(point => point.sentido === sentido).sort((a, b) => a.ordem - b.ordem);
  if (sorted.length < 2) return { error: 'Locais insuficientes para este sentido.' };
  if (sorted.some(point => !validPoint(point) || !point.geocoding_source || point.geocoding_source === 'estimated')) {
    return { error: 'As coordenadas dos pontos precisam de validação antes de gerar um trajeto confiável.' };
  }
  const coordinates = sorted.map(point => `${Number(point.longitude)},${Number(point.latitude)}`).join(';');
  const radiuses = sorted.map(() => 150).join(';');
  try {
    await sleep(REQUEST_DELAY_MS);
    const response = await fetch(`${OSRM_BASE}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&radiuses=${radiuses}&steps=false`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
    const data = await response.json();
    const route = data.routes?.[0];
    if (data.code !== 'Ok' || !leafletRoute({ geometry: route?.geometry }).length) throw new Error('Nenhuma geometria viária válida retornada.');
    if (data.waypoints?.length !== sorted.length || route.legs?.length !== sorted.length - 1 || data.waypoints.some(point => !Number.isFinite(point.distance) || point.distance > 150)) throw new Error('O trajeto não passa próximo de todos os pontos intermediários.');
    const directDistance = sorted.slice(1).reduce((total, point, index) => total + distanceMeters(sorted[index], point), 0);
    if (!Number.isFinite(route.distance) || route.distance < directDistance * 0.8 || route.distance > Math.max(directDistance * 5, 10000)) throw new Error('Distância do trajeto implausível; revise os pontos e o percurso.');
    return { geometry: route.geometry, segments: route.legs, distance: route.distance, waypoints: data.waypoints, error: null };
  } catch (error) {
    return { error: error.message };
  }
}

function distanceMeters(a, b) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(Number(b.latitude) - Number(a.latitude));
  const dLng = rad(Number(b.longitude) - Number(a.longitude));
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(Number(a.latitude))) * Math.cos(rad(Number(b.latitude))) * Math.sin(dLng / 2) ** 2;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export async function saveRouteGeometry(linhaId, sentido, geometry, estado = 'estimated') {
  if (!leafletRoute({ geometry }).length) throw new Error('Geometria inválida; nada foi salvo.');
  if (estado !== 'estimated') throw new Error('Geração automática salva apenas trajetos estimados. A revisão é uma ação separada.');
  const points = await supabase.from('itinerary_locais').select('latitude,longitude,geocoding_source').eq('linha_id', linhaId).eq('sentido', sentido);
  if (points.error) throw points.error;
  if (!points.data?.length || points.data.some(point => !validPoint(point) || !point.geocoding_source || point.geocoding_source === 'estimated')) throw new Error('Coordenadas sem validação; nada foi salvo.');
  const { data, error } = await supabase
    .from('route_geometries')
    .upsert(
      {
        linha_id: linhaId,
        sentido,
        geometry,
        estado_validacao: estado,
        metodo_geracao: 'osrm',
        data_geracao: new Date().toISOString(),
      },
      { onConflict: 'linha_id,sentido' }
    )
    .select()
    .single();

  if (error) throw error;
  return { data };
}

export async function getRouteGeometry(linhaId, sentido = 'ida') {
  const { data, error } = await supabase
    .from('route_geometries')
    .select('*')
    .eq('linha_id', linhaId)
    .eq('sentido', sentido)
    .single();

  if (error) throw error;
  return { data };
}

export async function listRouteGeometries() {
  const { data, error } = await supabase.from('route_geometries').select('*, linhas(codigo, nome)').order('linha_id');
  if (error) throw error;
  return { data };
}

export async function updateRouteValidation(geometryId, estado, erro = null) {
  const { data, error } = await supabase
    .from('route_geometries')
    .update({ estado_validacao: estado, erro })
    .eq('id', geometryId)
    .select()
    .single();

  if (error) throw error;
  return { data };
}

export { sleep, geocodePlace, routeSegment };
