// Read-only audit: no Auth writes, privileged keys, or mutations.
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';

const env = loadEnv('development', process.cwd(), 'VITE_');
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const result = await client.from('linhas').select('id,codigo,nome,bairro,origem,destino,categoria').eq('publicado', true).order('codigo');
if (result.error) throw new Error(result.error.message);
const fixtures = [];
for (const line of result.data) {
  const schedules = await client.from('horarios').select('id,horario,categoria,ordem').eq('linha_id', line.id).order('horario');
  const points = await client.from('itinerary_locais').select('id,ordem,nome,latitude,longitude,sentido,geocoding_source').eq('linha_id', line.id).order('ordem');
  const routes = await client.from('route_geometries').select('sentido,estado_validacao,geometry').eq('linha_id', line.id);
  if (schedules.error || points.error || routes.error) throw new Error(`${line.codigo}: public read failed`);
  fixtures.push({ line, schedules: schedules.data, points: points.data, routeSummary: routes.data.map(route => ({ sentido: route.sentido, estado: route.estado_validacao, vertices: route.geometry?.coordinates?.length })) });
  console.log(JSON.stringify({ code: line.codigo, schedules: schedules.data.length, points: points.data.length, routes: routes.data.length }));
}
await mkdir('src/test/fixtures', { recursive: true });
await writeFile('src/test/fixtures/public-transport.json', JSON.stringify(fixtures, null, 2) + '\n');
console.log(`Public read audit: ${fixtures.length} published lines. No writes performed.`);
