# Plano de publicação da rede oficial 2026

Estado em 23/10/2026: **aguardando revisão e autorização**. Nenhum SQL, push, preview ou deploy desta preparação foi executado.

## 1. Backup e ensaio

1. Registrar os hashes remotos de `master` e `main` e interromper se houver mudança externa.
2. Exportar esquema, políticas, grants e as tabelas `linhas`, `horarios`, `itinerary_locais`, `route_geometries`, `transport_sources` (se existente) e `import_metadata`.
3. Guardar contagens, chaves e checksum do backup fora do repositório.
4. Aplicar, em ambiente isolado compatível com produção, `20261023135427_prepare_official_network_2026.sql`.
5. Aplicar `official_network_2026.sql` duas vezes. A segunda execução deve manter 46 linhas oficiais, 1.130 horários oficiais e as mesmas chaves.
6. Aplicar `official_route_candidates_2026.sql` duas vezes. A segunda execução deve manter dois sentidos e 16 pontos da 0302, sem duplicação.
7. Rodar os advisors de segurança e desempenho e comparar com a linha de base anterior.

## 2. Supabase de produção

Esta etapa requer autorização específica porque modifica dados de produção.

1. Criar o backup final e conferir sua restauração.
2. Aplicar somente a migração nova; não reaplicar `transport_security_hardening`.
3. Validar colunas, constraints, RLS, grants e acesso público antes de importar dados.
4. Aplicar a importação oficial em transação. Conferir 46 linhas vigentes, dez linhas históricas preservadas e 1.130 horários oficiais.
5. Aplicar os candidatos da 0302 somente após inspeção cartográfica. Eles permanecem `estimated`.
6. Testar anon: leitura de linhas publicadas/fontes e bloqueio de escrita. Testar operator/admin separadamente.

## 3. Integração e preview

Esta etapa requer autorização específica para push e preview.

1. Revisar o diff local e criar commits separados para dados/migração, frontend e documentação.
2. Executar `npm test`, `npm run lint`, `npm run build`, `npm audit` e `git diff --check`.
3. Fazer push comum da `master`, sem reescrita de histórico.
4. Confirmar que o preview Vercel usa exatamente o SHA publicado.
5. Rodar E2E no preview: home, 46 linhas, categorias/local de partida, acervo histórico, mapa 0302 ida/volta, estados sem geometria, cadastro/login e painel.
6. Inspecionar console e rede em desktop e mobile. Nenhuma linha sem geometria deve receber segmento reto.

## 4. Produção e pós-publicação

Após aprovação do preview, promover exatamente o SHA validado para `main`. Confirmar o `githubCommitSha` da produção, repetir o E2E e conferir as contagens públicas por consulta somente leitura.

A função administrativa continuará indisponível até uma Edge Function autenticada ser implementada, revisada e autorizada para deploy.

## 5. Reversão

- **Código:** promover o deployment Vercel anterior e reverter o commit por um novo commit; não usar force push.
- **Dados antes do commit:** usar o `rollback` da transação.
- **Dados após commit:** marcar as 46 linhas importadas como não publicadas e restaurar a classificação anterior a partir do backup. Não apagar linhas/horários durante a investigação.
- **Esquema:** manter as colunas aditivas durante a reversão funcional; removê-las apenas depois de confirmar ausência de referências.
- **Geometrias:** restaurar `route_geometries` e `itinerary_locais` do backup ou remover apenas as chaves `stt-2026-08:0302:*`, mediante autorização explícita.
