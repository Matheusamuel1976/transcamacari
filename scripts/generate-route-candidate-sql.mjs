import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['0302-ida-candidate.geojson.json', '0302-volta-candidate.geojson.json'];
const routes = files.map(file => JSON.parse(fs.readFileSync(path.join(root, 'data', 'geography', file), 'utf8')));
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const values = routes.map(route => `(
  ${quote(route.direction)}, ${quote(JSON.stringify(route.geometry))}::jsonb,
  'estimated', 'OSRM driving', now(),
  ${route.routing.distanceMeters}, ${route.routing.maxWaypointToGeometryMeters},
  ${quote(route.limitations.join(' '))}, ${quote(`stt-2026-08:${route.lineCode}:${route.direction}:osrm`)})`).join(',\n');
const waypointValues = routes.flatMap(route => route.waypoints.map((point, index) => `(
  ${quote(route.direction)}, ${index}, ${quote(point.name)}, ${point.lat}, ${point.lon},
  ${quote(index === 0 ? 'origem' : index === route.waypoints.length - 1 ? 'destino' : 'parada')},
  ${quote(`OpenStreetMap/Nominatim ${point.osm}`)},
  ${quote(`Atendimento citado pela STT; coordenada cartográfica do objeto ${point.osm}, sem confirmação de parada exata.`)},
  ${quote(`stt-2026-08:${route.lineCode}:${route.direction}:point:${index}`)})`)).join(',\n');

const output = path.join(root, 'supabase', 'data', 'official_route_candidates_2026.sql');
const content = `-- Candidatos viários; não comprovam o itinerário operacional do ônibus.
-- Requer a migração e a importação da rede oficial de 2026.
begin;

with src as (
  select id from public.transport_sources where slug = 'stt-horarios-conecta-agosto-2026'
), l as (
  select id from public.linhas where codigo = '0302' and situacao_rede = 'vigente'
), waypoints (sentido, ordem, nome, latitude, longitude, tipo,
  geocoding_source, evidencia, chave_fonte) as (
  values
${waypointValues}
)
insert into public.itinerary_locais
  (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source,
   geocoded_at, fonte_id, grau_confirmacao, evidencia, chave_fonte)
select l.id, w.sentido, w.ordem, w.nome, w.latitude, w.longitude, w.tipo,
       w.geocoding_source, now(), src.id, 'estimado_com_evidencias', w.evidencia,
       w.chave_fonte
  from waypoints w cross join src cross join l
on conflict (linha_id, sentido, ordem) do update set
  nome = excluded.nome, latitude = excluded.latitude, longitude = excluded.longitude,
  tipo = excluded.tipo, geocoding_source = excluded.geocoding_source,
  geocoded_at = excluded.geocoded_at, fonte_id = excluded.fonte_id,
  grau_confirmacao = excluded.grau_confirmacao, evidencia = excluded.evidencia,
  chave_fonte = excluded.chave_fonte
where public.itinerary_locais.grau_confirmacao in ('nao_validado', 'estimado_com_evidencias');

with src as (
  select id from public.transport_sources where slug = 'stt-horarios-conecta-agosto-2026'
), l as (
  select id from public.linhas where codigo = '0302' and situacao_rede = 'vigente'
), candidates (sentido, geometry, estado_validacao, metodo_geracao,
  data_geracao, distancia_m, maior_distancia_ponto_m,
  observacoes_validacao, chave_fonte) as (
  values
${values}
)
insert into public.route_geometries
  (linha_id, sentido, geometry, estado_validacao, metodo_geracao, data_geracao,
   fonte_id, distancia_m, maior_distancia_ponto_m, observacoes_validacao, chave_fonte)
select l.id, c.sentido, c.geometry, c.estado_validacao, c.metodo_geracao,
       c.data_geracao, src.id, c.distancia_m, c.maior_distancia_ponto_m,
       c.observacoes_validacao, c.chave_fonte
  from candidates c cross join src cross join l
on conflict (linha_id, sentido) do update set
  geometry = excluded.geometry,
  estado_validacao = excluded.estado_validacao,
  metodo_geracao = excluded.metodo_geracao,
  data_geracao = excluded.data_geracao,
  fonte_id = excluded.fonte_id,
  distancia_m = excluded.distancia_m,
  maior_distancia_ponto_m = excluded.maior_distancia_ponto_m,
  observacoes_validacao = excluded.observacoes_validacao,
  chave_fonte = excluded.chave_fonte
where public.route_geometries.estado_validacao in ('estimated', 'needs_review');

commit;
`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, content, 'utf8');
console.log(`Gerado ${path.relative(root, output)} com ${routes.length} candidatos.`);
