import { supabase } from './supabase';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';
const REQUEST_DELAY_MS = 1100; // Respect Nominatim rate limit (~1 req/sec)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodePlace(placeName, context = 'Camaçari, Bahia, Brasil') {
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
  /**
   * locais: array of { nome, latitude, longitude, ordem, tipo }
   * sentido: 'ida' | 'volta'
   * Returns: { geometry, segments, error }
   */
  if (!locais || locais.length < 2) {
    return { error: 'Locais insuficientes para gerar rota' };
  }

  const sorted = [...locais].sort((a, b) => a.ordem - b.ordem);
  const segments = [];
  const allCoords = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];

    await sleep(REQUEST_DELAY_MS);

    let segment;
    try {
      segment = await routeSegment(a.latitude, a.longitude, b.latitude, b.longitude);
    } catch (err) {
      return {
        error: `Falha no roteamento entre ${a.nome} e ${b.nome}: ${err.message}`,
        partialSegments: segments,
      };
    }

    if (!segment) {
      return {
        error: `Sem rota viária entre ${a.nome} e ${b.nome}`,
        partialSegments: segments,
      };
    }

    segments.push({
      from: a.nome,
      to: b.nome,
      distance: segment.distance,
      duration: segment.duration,
      geometry: segment.geometry,
    });

    if (i === 0) {
      allCoords.push(...segment.geometry.coordinates);
    } else {
      // Avoid duplicating the join point
      allCoords.push(...segment.geometry.coordinates.slice(1));
    }
  }

  return {
    geometry: {
      type: 'LineString',
      coordinates: allCoords,
    },
    segments,
    error: null,
  };
}

export async function saveRouteGeometry(linhaId, sentido, geometry, estado = 'estimated') {
  const { data, error } = await supabase
    .from('route_geometries')
    .upsert(
      {
        linha_id: linhaId,
        sentido,
        geometry,
        estado_validacao: estado,
        metodo_geracao: 'osrm+nominatim',
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