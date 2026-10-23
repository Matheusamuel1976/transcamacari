/**
 * Gerador de rotas geometricas - Salva resultados em JSON para insercao via SQL Editor
 *
 * O OSRM conseguiu calcular todas as rotas. A insercao no Supabase falhou porque
 * a politica RLS de route_geometries so permite INSERT para usuarios autenticados
 * com role admin. Como nao temos a chave service_role nem credenciais de admin para
 * autenticacao via API, salvamos os resultados aqui para insercao manual via SQL Editor.
 *
 * Execucao: node generate_routes_save_json.js
 */

const OSRM_BASE = 'https://router.project-osrm.org';

const SEGMENT_DELAY_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function routeSegment(lat1, lng1, lat2, lng2) {
  const url = `${OSRM_BASE}/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;
  const route = data.routes[0];
  return {
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
  };
}

async function generateRouteForLocais(locais) {
  if (!locais || locais.length < 2) {
    return { error: 'Locais insuficientes para gerar rota', partialSegments: [] };
  }

  const sorted = [...locais].sort((a, b) => a.ordem - b.ordem);
  const segments = [];
  const allCoords = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];

    await sleep(SEGMENT_DELAY_MS);

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
      allCoords.push(...segment.geometry.coordinates.slice(1));
    }
  }

  return {
    geometry: { type: 'LineString', coordinates: allCoords },
    segments,
    error: null,
  };
}

async function main() {
  console.log('=== Geracao de rotas geometricas (salvando em JSON) ===\n');

  const SUPABASE_URL = 'https://wiqynihjinlbwhvhjtfk.supabase.co';
  const ANON_KEY = 'sb_publishable_UoeiWAQrC7D7wpF93HThbg_k9GEJfrl';

  async function supabaseGet(path) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status}`);
    return res.json();
  }

  // Buscar todas as linhas
  let lines;
  try {
    lines = await supabaseGet('linhas?select=id,codigo,nome,categoria&order=codigo');
  } catch (err) {
    console.error('Erro ao buscar linhas:', err.message);
    return;
  }

  console.log(`Linhas encontradas: ${lines.length}\n`);

  const todasGeometrias = [];
  let rotasGeradas = 0;
  let rotasErro = 0;

  for (const linha of lines) {
    console.log(`\nProcessando ${linha.codigo} - ${linha.nome} (id: ${linha.id})`);

    let locais;
    try {
      locais = await supabaseGet(
        `itinerary_locais?select=sentido,ordem,nome,latitude,longitude,tipo&linha_id=eq.${linha.id}&order=sentido,ordem`
      );
    } catch (err) {
      console.error(`  Erro ao buscar pontos: ${err.message}`);
      rotasErro++;
      continue;
    }

    for (const sentido of ['ida', 'volta']) {
      const locaisSentido = locais.filter((l) => l.sentido === sentido);

      if (locaisSentido.length < 2) {
        console.log(`  ${sentido}: pontos insuficientes (${locaisSentido.length}), pulando`);
        rotasErro++;
        continue;
      }

      console.log(`  ${sentido}: ${locaisSentido.length} pontos, gerando rota...`);

      let result;
      try {
        result = await generateRouteForLocais(locaisSentido);
      } catch (err) {
        console.log(`  ${sentido}: ERRO - ${err.message}`);
        rotasErro++;
        continue;
      }

      if (result.error) {
        console.log(`  ${sentido}: ERRO - ${result.error}`);
        rotasErro++;
        continue;
      }

      console.log(`  ${sentido}: SUCESSO - ${result.geometry.coordinates.length} coordenadas`);

      todasGeometrias.push({
        linha_id: linha.id,
        codigo: linha.codigo,
        nome: linha.nome,
        sentido,
        geometry: result.geometry,
        estado_validacao: 'estimated',
        metodo_geracao: 'osrm',
        data_geracao: new Date().toISOString(),
        erro: null,
        segmentos: result.segments.length,
        coordenadas: result.geometry.coordinates.length,
      });

      rotasGeradas++;
      await sleep(500);
    }
  }

  // Salvar em JSON
  const fs = require('fs');
  const output = {
    gerado_em: new Date().toISOString(),
    total_gerado: rotasGeradas,
    total_erro: rotasErro,
    geometrias: todasGeometrias,
  };
  fs.writeFileSync('rotas_geradas.json', JSON.stringify(output, null, 2));
  console.log(`\nSalvo em rotas_geradas.json`);

  // Gerar SQL INSERT para SQL Editor
  let sql = `-- Inserir geometrias de rotas no Supabase\n`;
  sql += `-- Execute no SQL Editor do Supabase (https://wiqynihjinlbwhvhjtfk.supabase.co)\n`;
  sql += '-- APOS executar, remover a politica temporaria se aplicada\n\n';

  sql += `DELETE FROM route_geometries;\n\n`;

  for (const g of todasGeometrias) {
    const coordsJson = JSON.stringify(g.geometry.coordinates);
    sql += `INSERT INTO route_geometries (linha_id, sentido, geometry, estado_validacao, metodo_geracao, data_geracao, erro)\n`;
    sql += `VALUES (\n`;
    sql += `  ${g.linha_id},\n`;
    sql += `  '${g.sentido}',\n`;
    sql += `  '${JSON.stringify(g.geometry)}'::jsonb,\n`;
    sql += `  '${g.estado_validacao}',\n`;
    sql += `  '${g.metodo_geracao}',\n`;
    sql += `  '${g.data_geracao}'::timestamptz,\n`;
    sql += `  NULL\n`;
    sql += `) ON CONFLICT (linha_id, sentido) DO UPDATE SET\n`;
    sql += `  geometry = EXCLUDED.geometry,\n`;
    sql += `  estado_validacao = EXCLUDED.estado_validacao,\n`;
    sql += `  metodo_geracao = EXCLUDED.metodo_geracao,\n`;
    sql += `  data_geracao = EXCLUDED.data_geracao,\n`;
    sql += `  erro = EXCLUDED.erro;\n\n`;
  }

  fs.writeFileSync('inserir_rotas.sql', sql);
  console.log(`Salvo em inserir_rotas.sql`);

  console.log('\n=== RESUMO ===');
  console.log(`Rotas geradas com sucesso: ${rotasGeradas}`);
  console.log(`Rotas com erro: ${rotasErro}`);

  if (rotasErro > 0) {
    console.log('\nLinhas com erro:');
    todasGeometrias.filter((g) => g.erro).forEach((g) => console.log(`  ${g.codigo} ${g.sentido}: ${g.erro}`));
  }

  console.log('\n=== PROXIMOS PASSOS ===');
  console.log('1. Abra o SQL Editor do Supabase: https://wiqynihjinlbwhvhjtfk.supabase.co');
  console.log('2. Cole e execute o conteúdo de inserir_rotas.sql');
  console.log('3. As geometrias serao inseridas na tabela route_geometries');
  console.log('4. O frontend ja consome essa tabela via api.lines.route(id, sentido)');
}

main().catch(console.error);
