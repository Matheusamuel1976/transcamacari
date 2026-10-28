# Qualidade e próxima investigação

## Isolamento de catálogo e empresas — 28/10/2026

- O frontend usa contratos separados para catálogo administrativo (`listPublicAdmin`), empresa (`listCompany`), detalhe público (`getPublic`) e atribuições de funcionário (`assigned`). Não há mais `listAll`.
- Navegação e guards separam `admin`, `company_admin` e `funcionario`; empresas não recebem controles de publicação municipal e o mapa empresarial consulta somente linhas privadas.
- O convite empresarial mostra empresa, referência interna, código temporário, validade, cópia, rotação e acesso direto ao cadastro de funcionário. O código não é colocado na URL.
- A migração local `20261028_isolate_public_company_operations.sql` força rotas empresariais a privadas e não publicadas, restringe RLS por papel/empresa/atribuição, expira códigos em 30 dias e limita a edição do perfil ao nome por RPC. **Não aplicada ao Supabase.**
- Verificação: 55 testes Vitest aprovados, lint sem erros/avisos e build aprovado. Após corrigir o contrato real de `visivel` (`smallint`, valor `1`), o E2E de produção passou em 55 navegações, 46 linhas vigentes, desktop e mobile.
- GitHub `master` e `main` e a produção Vercel foram atualizados em 28/10/2026. A migração Supabase continua local e não aplicada; a próxima investigação é revisar/aplicar essa migração em ambiente autorizado e executar a matriz RLS com contas controladas.

## Estado publicado em 23/10/2026

- GitHub `master` e `main`, preview e produção Vercel foram alinhados à revisão `551d236`.
- Supabase recebeu as migrações `restore_company_employee_access` e `fix_company_access_pgcrypto_schema`, após backup e ensaio transacional com rollback.
- Produção preserva 10 empresas, 4 perfis, 59 linhas e 2.030 horários. O catálogo contém 56 linhas públicas (46 vigentes e visíveis) e as 3 linhas manuais permanecem privadas.
- Cadastro de **Empresa** e **Funcionário**, gestão de convites, aprovação, suspensão e atribuições privadas estão publicados. Catálogo municipal e linhas empresariais usam escopos e políticas RLS distintos.
- Validação final: 46 testes Vitest, lint, build e `git diff --check` aprovados. O E2E passou no preview e na produção com 55 navegações, 46 linhas vigentes, todos os detalhes de horários, os dois tipos de cadastro, desktop e mobile.
- A landing page agora apresenta 8 linhas por vez; os detalhes mostram inicialmente até 12 horários por grupo e 5 locais do itinerário, com controles acessíveis para revelar ou recolher o conteúdo completo.
- A lista lateral do mapa apresenta 6 linhas por vez, e códigos longos reservam largura suficiente em desktop e mobile sem invadir o nome da linha.
- A seção da equipe exibe as cinco fotografias fornecidas com a associação nominal confirmada, texto alternativo, carregamento adiado e recorte responsivo.
- Fluxos RPC reais foram exercitados em transações reversíveis: criação empresarial, código com hash, vínculo pendente, rejeição de código inválido, aprovação idempotente, atribuições e rotação do convite. Nenhum usuário, empresa ou convite de teste permaneceu no banco.
- Confirmação por e-mail não foi completada com uma caixa postal real. Não se desabilitou confirmação nem se alteraram tabelas internas de Auth para fabricar esse resultado.
- Geometrias continuam sujeitas à evidência descrita em [pesquisa geográfica](PESQUISA_GEOGRAFICA_2026-10-22.md); ausência de fonte confiável não autoriza apresentar um caminho estimado como oficial.

As seções seguintes preservam baselines e decisões anteriores. Quando houver divergência de estado, este bloco e o adendo mais recente da auditoria são a referência atual.

## Preparação da rede 2026 (23/10/2026)

- Inventário normalizado: 46 códigos e 1.130 horários, com testes de unicidade, validade e classificação.
- Frontend preparado para separar rede vigente e acervo histórico e agrupar horários por local de partida.
- Dois candidatos OSRM da linha 0302 são validados como estimados; 45 linhas permanecem sem geometria por falta de sequência operacional suficiente.
- Migração e imports são artefatos locais. A validação em banco isolado e o E2E com a nova base dependem de autorização para usar um ambiente de ensaio ou aplicar a migração existente.
- `npm audit` registra quatro dependências afetadas (uma alta e três moderadas): Vite/esbuild no ambiente de desenvolvimento e React Router. As correções oferecidas exigem Vite 8 e React Router 7; nenhuma atualização major foi aplicada sem análise de migração.

## Estado verificado após a finalização local

| Comando | Resultado atual |
|---|---|
| `npm test` | 37/37 aprovados |
| `npm run test:e2e` | Produção atual aprovada: dez linhas, cadastro direto e login→cadastro, desktop e mobile; a rede nova aguarda banco isolado e preview autorizados |
| `npm run build` | Aprovado, Vite 5.4.21 |
| `npm run lint` | Aprovado: zero erros e zero avisos |
| `npm audit` | 4 achados: 3 moderados e 1 alto; correções disponíveis somente por majors de Vite/Router |
| `node scripts/audit-public.mjs` | 10 linhas, 892 horários, 130 locais e 20 geometrias; somente leitura |
| `git diff --check` | Aprovado; avisos locais LF/CRLF não são erros de whitespace |

O E2E usa Playwright Core e o Chrome instalado, sem baixar navegador ou publicar a aplicação. Capturas e relatório ficam em `frontend/test-results/`, ignorado pelo Git. Cadastro/Auth com mutação real e administração privilegiada permanecem pendentes de ambiente ou autorização específicos. A pesquisa oficial bloqueou novas geometrias porque os códigos locais não correspondem diretamente à rede vigente; ver [pesquisa geográfica](PESQUISA_GEOGRAFICA_2026-10-22.md).

> Segurança em produção: migração `20261022182759_transport_security_hardening` aplicada após autorização explícita, revisão e backup privado. RLS validada com operador/admin e leitura pública preservada. Ver adendo na auditoria; cadastro real, navegação visual e coordenadas confiáveis continuam pendentes.

> Atualização após o pedido de correções: existe agora `npm test` (Vitest/jsdom). O baseline abaixo pertence à preparação anterior. Resultados e pendências atuais em [auditoria e correções](AUDITORIA_CORRECOES_2026-10-22.md); não usar o baseline como evidência de aprovação da versão corrigida.

## Checks de 22/10/2026
Em `frontend/`:

| Comando | Resultado | Alcance |
|---|---|---|
| npm ls --depth=0 | exit 0 | Dependências instaladas, sem reinstalação |
| npm run build | exit 0, Vite 5.4.21, 1.570 módulos | Compilação; não valida banco/Auth/navegação |
| npm run lint antes | exit 1 | ESLint instalado, configuração ausente |
| npm run lint depois | exit 1: 55 erros, 6 avisos | Configuração agora executa sobre fontes, exclui dist/node_modules |
| npm test / typecheck | Não executados | Scripts inexistentes; não são testes aprovados |
| npm run dev -- --host 127.0.0.1 --port 3100 --strictPort | Servidor iniciou | Não comprova renderização |
| Smoke isolado da configuração ESLint | Aprovado | JSX válido aceito; hook condicional rejeitado por react-hooks/rules-of-hooks |
| git diff --check | exit 0 | Sem erros de whitespace; avisos de conversão LF/CRLF do Git |
| git diff --exit-code -- frontend/src backend supabase frontend/package.json frontend/package-lock.json | exit 0 | Nenhuma alteração nessas fontes/configurações de produto |

O smoke de lint foi executado fora do repositório, com entradas sintéticas via lintText e dependências locais. Não constitui teste de comportamento da aplicação. O servidor criado na porta 3100 foi encerrado e a porta deixou de responder.

Débito revelado pelos presets recomendados: prop-types ausentes, blocos vazios, variáveis não usadas, `fetchpriority` em Hero e dependências de hooks. Não houve `--fix`, supressão de regras ou alteração funcional. O total é baseline desta configuração; não equivale a 55 novos defeitos introduzidos. Priorizar itens ligados à reprodução da próxima tarefa.

## Procedimento de conclusão
1. Confirmar branch, estado local e fluxo afetado, incluindo chamadores e contratos.
2. Registrar sintoma reproduzível, resultado esperado e critérios de aceite.
3. Consultar documentação da versão instalada; reproduzir erros com dados sintéticos e ambiente local/teste. Não gravar em produção.
4. Implementar apenas após o próximo pedido, com regressão mínima significativa para a causa identificada.
5. Executar lint, build e verificações do fluxo; comparar com baseline. Não declarar verde quando houver falhas, nem alterar regras para escondê-las.
6. Revisar diff, segurança, erros, teclado e movimento reduzido. Revisão independente proporcional ao risco quando autorizada/disponível; registrar quando não realizada.
7. Atualizar documentação e registrar limitações. Não fazer push/deploy.

## Handoff: quatro problemas, sem correções nesta etapa

| Sintoma informado | Entradas para investigação | Evidência exigida |
|---|---|---|
| GSAP incorreto | Hero, motion/TransitionContext, AnimatedPage, ScrollManager, useLenis/useReducedMotion | Reload, navegação/POP, cleanup, StrictMode e movimento reduzido |
| Tela branca em horários | LinesPage, LineDetailPage, ChapterDescubra, services/lines e api.horarios | Console/stack, formato real dos dados, categorias, vazio/erro/carregamento |
| Segmentos retos | ChapterMapa, dashboard/MapPage, services/routing, route_geometries | GeoJSON válido, ordem longitude/latitude, ida/volta, geometria viária e ausência tratada |
| Tela branca no cadastro | App, RegisterPage, AuthContext, services/supabase e transições | Entrada direta e por link, configuração ausente, erro de rede/validação e confirmação de e-mail em ambiente de teste |

Observações estáticas não são causas confirmadas. Em master, loadPublicLines fornece horários vazios e mapa público liga pontos diretamente. Há diferenças na main; não copiar correções sem revisão. Não criar usuários ou enviar formulários reais para testar preparação.

## Harness e evidências
Adaptação nativa inspirada em Harness2 estabelecida, sem instalar/executar o framework oficial. Invocação reutilizável: ler o Prompt 15 em [revisão fixa do toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit/blob/790a895304e0c08b70a5b215c9d334f1c86b816c/docs/prompts/15-harness-improvement.md), limitar a um caso descartável, baseline/candidato comparáveis e checks definidos antes da mudança. Preservar permissões/modelo/autenticação. Não iniciar benchmarks, proxies ou custos.

Smoke observado nesta sessão: instrução master aplicada após checar branch real; contexto recuperado das fontes em vez de confiar no AGENTS antigo; ausência de config de lint detectada e configuração mínima passou a executar; produção e código funcional preservados. Não houve experimento controlado com agente em contexto limpo, nem comparação científica baseline/candidato: ficam não executados. Não alegar ganho de desempenho ou confiabilidade com esses resultados.

Skill de verificação do Superpowers aplicada: distinguir build aprovado, lint reprovado, teste inexistente e integração registrada de consulta funcional. Autodescoberta em nova sessão ainda precisa ser observada.

Navegador: inventário CUA respondeu; acesso a localhost foi negado pelo controle de autorização. Sem tentativa alternativa; console, rede e validação visual permanecem pendentes. Assim, não se afirma ausência de regressão em execução: a evidência é build aprovado e nenhuma alteração nas fontes funcionais.
# Restauração de empresas e funcionários — 23/10/2026

- Migração Supabase preparada, ainda não aplicada: separação entre catálogo municipal e operação privada, papéis empresariais, códigos com hash, aprovações e atribuições UUID.
- Frontend preparado com cadastros Empresa/Funcionário, estados pendente/suspenso e gestão de equipe por RPC.
- `MyLinesPage` consulta somente atribuições privadas e desenha apenas geometrias persistidas.
- Validação local: 42 testes Vitest aprovados, lint sem erros e build aprovado. E2E real dos novos fluxos depende de banco com a migração e contas de teste autorizadas.
- Aviso conhecido: `public.spatial_ref_sys` é reportada pelo Supabase sem RLS. Por ser tabela da extensão PostGIS, não foi alterada nesta migração funcional.
- Backup anterior preparado em `C:\Users\freeb\.codex\backups\transcamacari-company-access-20261023\before.json`, SHA-256 `AA63D98C538F84A8BBDB3B50912DF7F31E845D119300548A6991AECCF2888CC9`.
# Revisão Impeccable de UI/UX — 27/10/2026

- Corrigido o recuo das páginas `/linhas`, `/linhas/historico` e detalhes sob a navegação fixa.
- Busca e filtro do catálogo agora têm nomes e associações acessíveis; controles do mapa, Leaflet e links principais atendem ao alvo mínimo de 44 px.
- Contraste do rodapé e dos links de autenticação foi elevado; textos auxiliares pequenos foram ampliados.
- A preferência de movimento reduzido deixou de cancelar indiscriminadamente toda transição; os componentes animados mantêm alternativas específicas.
- A seção de tecnologia agora documenta Supabase JS 2, PostgreSQL/RLS e Supabase Auth, além de descrever corretamente as geometrias persistidas.
- O mapa não exibe mais “0 locais” como informação útil: usa um estado de atualização quando o itinerário detalhado não está disponível.
- Fotografias da equipe mantêm carregamento tardio e agora reservam dimensões para evitar deslocamento de layout.
- Verificação local: 48 testes aprovados, lint sem erros/avisos, build aprovado e `git diff --check` aprovado. O navegador do Codex negou acesso ao `127.0.0.1:3100` por permissão salva; a confirmação visual local ficou bloqueada sem tentativa de contorno.
- Preview Vercel protegido validado pelo link temporário oficial: E2E público aprovado em 55 navegações, cobrindo 46 linhas, detalhes/horários, cadastro, login, mapa e responsividade; relatório sem erros de console. O harness também aceita o token OIDC efêmero da Vercel sem persistir credenciais.
- O detector Impeccable manteve três apontamentos já avaliados: faixa lateral intencional da identidade visual, transição de `max-height` em estilo inativo e tipografia editorial deliberada. Nenhum deles representa falha funcional.

# Planos empresariais e marca — 28/10/2026

- A landing ganhou uma seção editorial de planos empresariais, com faixas mensais e anuais, indicação de dois meses grátis e CTAs para o cadastro de empresa.
- Menu desktop/mobile e rodapé passaram a oferecer o atalho “Planos”. O símbolo e o ponto da marca usam `#FF6D00`; o CTA circular “Encontre sua linha” usa texto branco e o favicon recebeu versionamento de cache.
- Nenhuma divulgação de aplicativo, checkout, integração financeira ou alteração de dados foi adicionada.
- Cobertura automatizada adicionada para conteúdo, alternância de cobrança, acessibilidade, navegação, marca, contraste e ausência de divulgação de aplicativo. O E2E também verifica a seção em desktop/mobile e ausência de overflow horizontal.
- Detector Impeccable executado uma vez após as alterações visuais: zero apontamentos.
- Verificação local: 61 testes Vitest aprovados, lint sem erros/avisos, build aprovado, `git diff --check` aprovado e E2E público aprovado em 56 navegações com 46 linhas, desktop e mobile.
