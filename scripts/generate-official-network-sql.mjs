import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'data', 'official-network-2026.json');
const output = path.join(root, 'supabase', 'data', 'official_network_2026.sql');
const network = JSON.parse(fs.readFileSync(input, 'utf8'));

const sql = value => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const tuples = (rows, columns) => rows.map(row =>
  `  (${columns.map(column => sql(row[column])).join(', ')})`).join(',\n');

const lines = network.lines.map(line => ({
  codigo: line.code,
  nome: line.name,
  bairro: line.area === 'sede' ? 'Sede' : 'Orla',
  origem: line.origin,
  destino: line.destination,
  categoria: line.area,
  modalidade: line.serviceType,
  atendimentos: line.mainServicePoints,
  observacoes: [line.demandOnly ? 'Atendimento por demanda.' : '', ...line.notes].filter(Boolean).join(' '),
}));

const schedules = network.lines.flatMap(line => line.schedules.map((schedule, index) => ({
  codigo: line.code,
  categoria: schedule.dayType,
  partida: schedule.departureFrom,
  horario: schedule.time,
  ordem: index,
  chave: schedule.sourceKey,
})));

const content = `-- Gerado por scripts/generate-official-network-sql.mjs.
-- Requer a migração 20261023135427_prepare_official_network_2026.sql.
-- Idempotente por (company_id, codigo) e horarios.chave_fonte.
begin;

insert into public.transport_sources
  (slug, autoridade, titulo, url, pagina_origem, publicado_em, vigencia_inicio,
   consultado_em, sha256, escopo, confiabilidade)
values
  (${sql(network.source.slug)}, ${sql(network.source.authority)}, ${sql(network.source.title)},
   ${sql(network.source.url)}, ${sql(network.source.landingPage)}, ${sql(network.source.publishedOn)},
   ${sql(network.source.effectiveFrom)}, ${sql(network.source.checkedOn)}, ${sql(network.source.sha256)},
   ${sql(network.source.scope)}, ${sql(network.source.reliability)})
on conflict (slug) do update set
  autoridade = excluded.autoridade, titulo = excluded.titulo, url = excluded.url,
  pagina_origem = excluded.pagina_origem, publicado_em = excluded.publicado_em,
  vigencia_inicio = excluded.vigencia_inicio, consultado_em = excluded.consultado_em,
  sha256 = excluded.sha256, escopo = excluded.escopo,
  confiabilidade = excluded.confiabilidade;

create temp table official_network_lines (
  codigo text primary key, nome text not null, bairro text not null,
  origem text not null, destino text not null, categoria text not null,
  modalidade text not null, atendimentos text, observacoes text
) on commit drop;
insert into official_network_lines
  (codigo, nome, bairro, origem, destino, categoria, modalidade, atendimentos, observacoes)
values
${tuples(lines, ['codigo','nome','bairro','origem','destino','categoria','modalidade','atendimentos','observacoes'])};

do $$
declare
  target_company_id bigint;
  source_id bigint;
begin
  select company_id into target_company_id
    from public.linhas where company_id is not null
    order by publicado desc, id limit 1;
  if target_company_id is null then
    raise exception 'Nenhuma empresa existente pôde ser associada à rede oficial';
  end if;
  select id into source_id from public.transport_sources
    where slug = ${sql(network.source.slug)};

  -- Preserva os registros antigos e todos os vínculos; altera somente a classificação.
  update public.linhas
     set situacao_rede = 'historica', modalidade = 'legado',
         grau_confirmacao = 'nao_validado',
         observacoes = concat_ws(' ', nullif(observacoes, ''),
           'Registro anterior à rede oficial publicada pela STT em agosto de 2026.')
   where codigo in ('S01','S02','S03','S04','S05','S06','O01','O02','O03','O04');

  insert into public.linhas
    (company_id, codigo, nome, bairro, origem, destino, categoria,
     publicado, origem_dados, data_importacao, situacao_rede, modalidade,
     vigencia_inicio, fonte_id, grau_confirmacao, atendimentos_principais, observacoes)
  select target_company_id, n.codigo, n.nome, n.bairro, n.origem, n.destino,
         n.categoria, true, ${sql(network.source.title)}, now(), 'vigente',
         n.modalidade, ${sql(network.source.effectiveFrom)}::date, source_id,
         'confirmado_documentalmente', nullif(n.atendimentos, ''), nullif(n.observacoes, '')
    from official_network_lines n
  on conflict (company_id, codigo) do update set
    nome = excluded.nome, bairro = excluded.bairro, origem = excluded.origem,
    destino = excluded.destino, categoria = excluded.categoria,
    publicado = excluded.publicado, origem_dados = excluded.origem_dados,
    data_importacao = excluded.data_importacao, situacao_rede = excluded.situacao_rede,
    modalidade = excluded.modalidade, vigencia_inicio = excluded.vigencia_inicio,
    vigencia_fim = null, fonte_id = excluded.fonte_id,
    grau_confirmacao = excluded.grau_confirmacao,
    atendimentos_principais = excluded.atendimentos_principais,
    observacoes = excluded.observacoes;
end $$;

create temp table official_network_schedules (
  codigo text not null, categoria text not null, partida_de text not null,
  horario time not null, ordem integer not null, chave_fonte text primary key
) on commit drop;
insert into official_network_schedules
  (codigo, categoria, partida_de, horario, ordem, chave_fonte)
values
${tuples(schedules, ['codigo','categoria','partida','horario','ordem','chave'])};

insert into public.horarios
  (linha_id, horario, dias, categoria, ordem, partida_de, fonte_id, chave_fonte)
select l.id, s.horario,
       case s.categoria when 'domingo_feriado' then 'domingo_feriado' else s.categoria end,
       s.categoria, s.ordem, s.partida_de, src.id, s.chave_fonte
  from official_network_schedules s
  join public.linhas l on l.codigo = s.codigo and l.situacao_rede = 'vigente'
  join public.transport_sources src on src.slug = ${sql(network.source.slug)}
on conflict (chave_fonte) where chave_fonte is not null do update set
  linha_id = excluded.linha_id, horario = excluded.horario, dias = excluded.dias,
  categoria = excluded.categoria, ordem = excluded.ordem,
  partida_de = excluded.partida_de, fonte_id = excluded.fonte_id;

insert into public.import_metadata
  (fonte, linhas_importadas, horarios_importados, rotas_geradas, rotas_erro, observacoes)
select ${sql(network.source.slug)}, ${network.lines.length}, ${schedules.length}, 0, 0,
       'Rede oficial preparada sem geometrias; rotas dependem de pontos operacionais verificáveis.'
where not exists (
  select 1 from public.import_metadata
  where fonte = ${sql(network.source.slug)}
);

commit;
`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, content, 'utf8');
console.log(`Gerado ${path.relative(root, output)}: ${lines.length} linhas e ${schedules.length} horários.`);
