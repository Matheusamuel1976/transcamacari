# TransCamaçari

Consulta de linhas, horários e itinerários de ônibus de Camaçari/BA. React 18/Vite/JSX, GSAP, Lenis, Leaflet e Supabase. Backend PHP legado preservado.

Atualização de 2026: [rede, fontes e geografia](docs/REDE_OFICIAL_2026.md) e [plano seguro de publicação](docs/PLANO_PUBLICACAO_REDE_2026.md).

## Executar
Em frontend/: npm ci quando necessário; configurar frontend/.env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do projeto existente, depois npm run dev (porta 3000). Nunca usar service_role/chave secreta no frontend. Preservar .env existente e não imprimir valores.

npm run build gera frontend/dist/. npm run lint executa ESLint; npm test executa os testes de regressão em jsdom. Typecheck não configurado. Veja [onboarding](docs/onboarding.md) e [qualidade](docs/quality.md).

O proxy /api para PHP na porta 8000 permanece no Vite; services/api.js já usa Supabase. PHP não é necessário às operações migradas. Para investigar legado: Composer e php -S 127.0.0.1:8000 -t public em backend/, usando banco local separado.

## Documentação
- [Auditoria e correções de 22/10/2026](docs/AUDITORIA_CORRECOES_2026-10-22.md)
- [Pesquisa geográfica das dez linhas](docs/PESQUISA_GEOGRAFICA_2026-10-22.md)
- [Produto e aceite](PRODUCT.md)
- [Instruções para agentes](AGENTS.md)
- [Arquitetura](docs/architecture.md)
- [Migração Supabase](docs/MIGRACAO_SUPABASE.md)
- [Ferramentas e relatório de preparação](docs/setup.md)
- [Qualidade e próxima investigação](docs/quality.md)
- [Motion, registro histórico](docs/MOTION.md)

AUDITORIA.md, VALIDACAO.md e DEPLOY.md em docs/, além de [RELATORIO_FINAL.md](docs/historico/RELATORIO_FINAL.md), são registros anteriores: confrontar com o checkout atual. Nenhum push ou deploy integra estas correções locais.
