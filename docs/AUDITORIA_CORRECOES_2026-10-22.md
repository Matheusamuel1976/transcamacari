# Auditoria e correções — TransCamaçari, 22/10/2026

## Adendo — isolamento entre catálogo e operação empresarial, 28/10/2026

A causa da mistura no painel era o uso de `api.lines.listAll()` em gestão e mapa. Como a política de leitura também expunha o catálogo publicado a usuários autenticados, a empresa recebia linhas municipais e a interface oferecia ações sobre registros que não pertenciam a ela. O detalhe público também usava uma consulta genérica.

A correção troca consultas genéricas por contratos de contexto, restringe navegação e guards por papel, remove publicação municipal da interface empresarial e mantém funcionários em `assigned(profileId)`. O fluxo de equipe passou a destacar código temporário, validade e cadastro de funcionário sem segredo na URL.

A migração `20261028_isolate_public_company_operations.sql` está preparada e não aplicada. Ela preserva 56 linhas públicas, três privadas, 14 empresas e perfis existentes; força escrita empresarial para escopo privado/não publicado, valida empresa e atribuição nas tabelas filhas, recusa códigos expirados e impede UPDATE direto de `role`, `status` e `company_id`.

Evidência final: 55 testes aprovados, lint e build aprovados. O primeiro E2E publicado revelou que `visivel` é `smallint` no banco real; o filtro foi corrigido de `true` para `1` sem alterar dados. O hotfix passou no E2E de produção com 55 navegações, 46 linhas vigentes, desktop e mobile. `master`, `main` e Vercel foram atualizados; a migração Supabase não foi aplicada.

## Atualização final de produção — 23/10/2026

O estado descrito na auditoria abaixo é histórico. As correções foram integradas sem reescrita de histórico e publicadas em `master` e `main` na revisão `551d236`. O deployment de produção `dpl_CozUiCvCj7f1KFGjMpE4GLWCNUxv` ficou `READY` e `https://transcamacari.vercel.app` foi associado à mesma revisão.

- **A — animações/visibilidade: CORRIGIDO.** E2E e capturas de produção validaram desktop, mobile e movimento reduzido; nenhum conteúdo essencial permaneceu invisível. O texto “em movimento.” usa azul legível.
- **B — horários: CORRIGIDO.** O E2E percorreu as 46 linhas vigentes e todos os detalhes, com horários úteis e sem exceção de página ou erro de console.
- **C — trajetos: PARCIALMENTE CORRIGIDO.** O frontend só apresenta geometrias persistidas e identificadas como estimadas. A pesquisa não fornece sequência operacional suficiente para validar todas as linhas; não foram inventados percursos.
- **D — cadastro: CORRIGIDO no produto e no banco.** As abas Empresa/Funcionário estão em produção. RPCs, RLS, pendência, aprovação, isolamento entre empresas e atribuições foram validados em transações com rollback. Confirmação por e-mail real não foi executada sem uma caixa postal controlada.

Estado final verificado: 42 testes Vitest, lint e build aprovados; E2E aprovado no preview e na produção com 55 navegações; 10 empresas, 4 perfis, 59 linhas e 2.030 horários preservados; 56 linhas públicas e 3 privadas. As migrações `restore_company_employee_access` e `fix_company_access_pgcrypto_schema` constam no histórico remoto. O backup anterior está fora do Git em `C:\Users\freeb\.codex\backups\transcamacari-company-access-20261023\before.json`.

Persistem avisos independentes: `spatial_ref_sys`/PostGIS, proteção contra senhas vazadas desabilitada, políticas permissivas sobrepostas e índices antigos. Eles não foram alterados automaticamente porque exigem avaliação própria ou configuração externa.

## Estado da entrega
**Entrega parcial; não declarar finalização funcional nem publicar ainda.** Correções locais e testes foram implementados. Permanecem bloqueios de validação visual e coordenadas de itinerário. A remediação de RLS/perfis foi autorizada e aplicada em produção em 22/10/2026, conforme adendo abaixo. Nenhum push, deploy ou seed foi executado.

| Problema | Classificação | Evidência e limite |
|---|---|---|
| A — GSAP/elementos apagados | CORRIGIDO localmente | Corrigidos contraste, disputa de transform e ciclo de animação. Chrome headless validou home completa em movimento normal e mobile com movimento reduzido, sem conteúdo essencial abaixo de 20% de opacidade |
| B — consulta de horários | CORRIGIDO localmente | TypeError reproduzido e eliminado; Chrome percorreu os dez detalhes reais, verificou horários e não registrou exceções/erros de console. Produção permanece na versão anterior |
| C — trajetos | PARCIALMENTE CORRIGIDO / BLOQUEADO nos dados | Rendering passa a usar geometrias persistidas, sem conexão reta de pontos. Cálculo/gravação com validação implementados. Nenhum trajeto atual tem pontos confiáveis; não gerar/persistir substitutos fictícios |
| D — cadastro branco | CORRIGIDO localmente / fluxo real PARCIAL | Entrada direta e login→cadastro renderizam em navegador real, desktop/mobile e StrictMode. Formulário foi alinhado ao cadastro `operator`; criação real não foi executada sem autorização para criar conta em produção |

## Base, stack e regressões
- Checkout inicial desta auditoria: master `8e5b03545313a299d4e02792cd93271c601fe49a`, com alterações/documentos da preparação preservados. Sem nova branch, conforme AGENTS.
- Remoto consultado por `git ls-remote`: main `2964ee4bf68dc244fc44800cb93ff21789985a82`; master `61208ff6eb489b8e52c8211181819c9a38c4f75b`. Master local já possuía um commit não enviado.
- Vercel confirmou projeto existente transcamacari e deployment de produção READY `dpl_Fzhdar5itxrFButTKSo5b7Pdfkft`, associado à main `2964ee4`. READY significa deployment construído, não funcionamento dos fluxos.
- Ativos: React/DOM 18.3.1, Vite 5.4.21, JSX/JavaScript, React Router 6.30.6, GSAP 3.15.0/ScrollTrigger, Lenis 1.3.26, Leaflet 1.9.4, Supabase JS 2.118.0. PostgreSQL remoto 17.11; projeto existente `wiqynihjinlbwhvhjtfk`. PHP/PDO preservado, sem chamadas HTTP PHP nas funções migradas.
- `61208ff` migrou dados/Auth e criou páginas, mas deixou contratos de perfil, funções administrativas e representação pública do mapa incompletos.
- `2964ee4` na main acrescentou horários como objetos em services/lines e ajustou só a primeira leitura em ChapterDescubra. A expansão continuou usando `h.slice(...)`, incompatível com o novo formato. Na master o adaptador deixava horários vazios, ocultando a mesma incompatibilidade.
- Não houve revert, merge, cherry-pick ou reescrita de histórico. Mudanças foram reconstruídas e verificadas na master.

## Diagnóstico técnico

### Horários e causa transversal das telas brancas
Teste de componente reproduziu `TypeError: line.horarios[0]?.slice is not a function` em ChapterDescubra:154 da base, ao receber `{ horario, categoria }`. No fluxo publicado, o acesso inicial foi adaptado, mas a expansão chama `h.slice`, mantendo o defeito. Sem ErrorBoundary, uma exceção de renderização desmonta o aplicativo inteiro; o impacto pode aparecer como falha de outras páginas após a primeira exceção. Essa explicação transversal é comprovada em teste para a desmontagem, mas a sequência exata do cadastro publicado ainda não foi capturada.

Outras fragilidades verificadas: createClient era executado no import e lançava `supabaseUrl is required` antes de montar React quando env faltava; erro reproduzido com teste. Detalhe não reinicializava estado completamente ao trocar ID, não oferecia retry, assumia geometria válida e tinha consulta assíncrona de marcadores sem cancelamento próprio. Consulta pública não distinguia rede indisponível de lista vazia.

### Animações e contraste
As capturas não comprovam por si só um tween travado. A leitura do CSS identificou `.journey__path`, círculos e orb com o mesmo roxo do fundo; tab ativo e link usavam roxo claro de contraste baixo sobre roxo. A hero da master também mantinha texto script na cor do fundo, já corrigido separadamente na main. Esses são defeitos estáticos reais além das hipóteses de GSAP.

A foto recebia simultaneamente escala de entrada e parallax no mesmo elemento, enquanto clearProps apagava transform. Parallax foi deslocado para o contêiner da foto. Entradas de página/painel agora usam fromTo com opacidade final explícita 1 e clearProps; contexto continua revertido no cleanup. StrictMode não foi desativado. Não há CSS global forçando todos os elementos a ficarem visíveis ou removendo animações.

### Cadastro, sessão e autorização
Cadastro isolado e login→cadastro renderizaram com StrictMode e GSAP real em jsdom, antes das mudanças de cadastro. Portanto não se afirma que o defeito relatado era exclusivamente Auth ou GSAP.

Problemas adicionais comprovados: quatro usuários Auth e apenas um profile; ausência de trigger de criação de profile; RLS autenticada de profiles lança `42P17: infinite recursion detected in policy for relation "profiles"`. AuthContext antigo mantinha apenas objeto Auth, mas guards procuravam papéis de domínio nele. Cadastro enviava role em metadata editável e mostrava promessa de aprovação/vínculo empresarial que não era implementada. `updatePassword` aceitava um argumento, mas dois chamadores passavam senha atual e nova, fazendo a função usar a senha atual como nova.

Auth agora mantém identidade separada do profile, consulta o papel protegido e bloqueia administração se o profile falha/não existe. Callback Auth permanece síncrono; consulta é feita em effect separado. Novos cadastros não solicitam admin, mensagens respeitam session nula/confirmar e-mail; nenhuma conta real foi criada nesta auditoria. Nome é persistido no profile; troca de senha reautentica quando aplicável e usa senha nova. Recuperação ganhou ação na página de login e callback para /trocar-senha; a tela aguarda a sessão e reconhece PASSWORD_RECOVERY.

## Dados, geografia e rotas

Leitura real com chave pública/anônima confirmou todas as dez linhas, horários, locais e geometrias. Script reproduzível, somente leitura: `node scripts/audit-public.mjs` em frontend. Ele sobrescreve apenas o fixture local, sem imprimir chaves ou consultar usuários.

| Linha | ID | Horários retornados | Locais ida+volta | Geometrias existentes | Maior distância ponto→percurso (m) |
|---|---:|---:|---:|---:|---:|
| O01 | 14 | 92 | 12 | 2 | 489 |
| O02 | 15 | 118 | 10 | 2 | 167 |
| O03 | 16 | 96 | 10 | 2 | 167 |
| O04 | 17 | 88 | 12 | 2 | 167 |
| S01 | 8 | 94 | 20 | 2 | 190 |
| S02 | 9 | 88 | 14 | 2 | 207 |
| S03 | 10 | 86 | 14 | 2 | 259 |
| S04 | 11 | 88 | 14 | 2 | 259 |
| S05 | 12 | 84 | 14 | 2 | 42 |
| S06 | 13 | 58 | 10 | 2 | 489 |

Total: 892 registros de horário, 130 locais e 20 geometrias preexistentes. Há 794 combinações distintas linha/categoria/horário; UI normaliza duplicatas sem apagar dados. Não se confirma que o seed duplicado corresponde fielmente ao PDF; não foi reimportado nem corrigido.

Todos os locais têm `geocoding_source = estimated`. Coordenadas seguem padrões aritméticos provisórios do seed; não equivalem a geocodificação real. O02 e O03 têm GeoJSON idêntico para ida e também para volta, apesar dos destinos distintos. Geometrias têm 486–1.443 vértices e método osrm: há caminhos viários calculados, mas a quantidade de vértices não valida o itinerário.

Validação independente PostGIS mediu distância dos pontos ao LineString, com os máximos acima. Consulta única ao Nominatim/OpenStreetMap por Guarajuba retornou bairro em `-12.6503580,-38.0707556` e parada próxima, enquanto O03 usa `-12.7300000,-38.2400000`. A diferença evidencia localização incompatível, mas não autoriza substituir pelo centro do bairro ou por qualquer parada encontrada: falta provar qual acesso/terminal o ônibus atende.

Resultado desta execução:
- Linhas analisadas: **10**; sentidos examinados: **20**.
- Geometrias novas geradas: **0**; novas persistidas: **0**; existentes preservadas: **20**.
- Linhas/sentidos sem geometria confiável: **todas as dez, ida e volta**, por coordenadas provisórias não validadas.
- Não foram sobrescritos pontos ou geometrias de produção. Falta uma fonte verificável dos locais/pontos de passagem antes de gerar substitutos.

Implementação pronta: OSRM recebe todos os pontos do sentido em ordem numa única requisição; limite de snapping 150m, verificação de waypoints/legs/GeoJSON/distância plausível, timeout e erro explícito. Sem concatenação de linhas retas ou fallback inventado. Geração automática grava apenas estimated; classificação oficial não é automática. Editor oferece ação explícita “Gerar e salvar trajeto estimado”, bloqueia durante carregamento/troca de linha e informa a razão de recusar pontos provisórios. Persistência usa o Supabase/RLS existente, sem service_role.

Mapas públicos/detalhes carregam geometrias persistidas e convertem longitude/latitude corretamente. Exibem apenas percursos com entradas não provisórias; quando faltam, mostram razão e preservam horários/lista textual. Aviso de percurso: **“Trajeto estimado — percurso sujeito a validação.”** O enquadramento usa limites da geometria disponível. O mapa atual pode ficar sem percurso: isso é bloqueio explícito por qualidade dos dados, não conclusão da tarefa geográfica.

## Segurança do Supabase
Auditoria somente leitura de colunas, constraints, índices, políticas, triggers e advisors. FK linha→horários/locais/geometrias presentes; unicidade por linha/sentido e linha/sentido/ordem presente. Não desativada nenhuma RLS.

Achados confirmados:
- Tabelas legadas users, employees, pontos, contact_messages e outras sem RLS, com privilégios anon de SELECT/INSERT/UPDATE. Privilégios e flags lidos dos catálogos; nenhuma escrita de exploração executada e nenhum dado pessoal extraído.
- SELECT de profiles permitido anon; contagem pública retornou 1. SELECT autenticado falha por recursão.
- Novos usuários não têm provisionamento de profile no banco atual. Admin permanece atribuição explícita, não derivada de metadata.
- Advisors: search_path mutável em trigger de linhas, PostGIS no public e RPCs security definer expostas; proteção de senhas vazadas desabilitada; índices duplicados e políticas/perfis de consulta com oportunidades de melhoria. São pendências, não alterações aplicadas.

Referências de remediação: [RLS ausente](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public), [search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [funções security definer](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [senhas comprometidas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Proposta revisável: [SQL de segurança](sql/proposed-security-hardening.sql), **aplicado após autorização; ver adendo**. Corrige políticas de profiles, restringe updates próprios a name, provisiona profiles operator e fecha exposição das tabelas legadas. Também permite contato sem retorno público de registros; api.contact agora envia apenas colunas existentes e retorna mensagem honesta de armazenamento, sem prometer SMTP. Aplicação requer autorização específica, backup de definições/privilégios e validação em ambiente seguro; pode afetar acessos antigos. Não cobre automaticamente todos os avisos PostGIS/Auth e não constitui auditoria de segurança exaustiva.

## Arquivos e justificativas
- `components/chapters/ChapterDescubra.jsx`, `services/lines.js`, novo `services/transport.js`: contrato único de horários, categorias, deduplicação visual, ausência/erro; carregamento de geometria real.
- `pages/LineDetailPage.jsx`, `pages/LinesPage.jsx`: retry, cancelamento lógico, ID válido, dados ausentes, consulta por sentido, itinerário textual e geometria validada.
- Novo `components/ErrorBoundary.jsx`, `main.jsx`, `App.jsx`, `services/supabase.js`: recuperação de erros de render/importação de configuração sem tela branca; guard administrativo baseado no profile.
- `contexts/AuthContext.jsx`, `pages/auth/{LoginPage,RegisterPage}.jsx`, `pages/ChangePasswordPage.jsx`: sessão/profile, cadastro sem privilégios, recuperação e senha nova correta.
- `components/Hero.jsx`, `components/chapters/ChapterCaminhos.jsx`, `motion/AnimatedPage.jsx`, `styles/{hero,editorial}.css`: contraste e ciclo de animações, mantendo tipografia, identidade e estrutura.
- `services/routing.js`, `pages/dashboard/MapPage.jsx`, `components/chapters/ChapterMapa.jsx`: roteamento/persistência explícitos, validação, ausência tratada, prevenção da corrida de seleção.
- `services/api.js`: geometrias por linha e contato sem leitura pública de mensagens.
- `package.json`/lockfile, `vitest.config.js`, `src/test/`, `scripts/audit-public.mjs`: suíte de regressão e coleta pública reproduzível. Vitest/jsdom são dependências de desenvolvimento. Aplicação continua com Vite 5; Vite 8 é dependência interna do executor Vitest, não migração da aplicação.
- `AGENTS.md`, `README.md`, `docs/{quality,setup,architecture}.md`: roteamento para o estado atual; documentos da preparação preservados como baseline.
- `docs/sql/proposed-security-hardening.sql`: cópia histórica da proposta aplicada; migração canônica registrada em supabase/migrations/.

## Testes, revisão e limites
Resultados da etapa intermediária, preservados como histórico; o estado final está no adendo abaixo:

| Verificação | Resultado |
|---|---|
| npm test | **25 aprovados**, sete arquivos, Vitest 4.1.11/jsdom |
| npm run build | **Aprovado**, Vite 5.4.21, 1.573 módulos |
| npm run lint | **Reprovado**, 45 erros e 3 avisos; baseline 55 erros e 6 avisos. Sem desativação de regras |
| git diff --check | **Aprovado**, somente avisos de conversão LF/CRLF |
| Leitura pública real Supabase | **Aprovada**, dez linhas/892 horários/130 locais/20 geometrias; nenhuma escrita |
| RLS como authenticated | **Aprovado após migração**, operador vê um perfil e administrador quatro, sem 42P17 |
| Detector mecânico de UI | Sem achados nos cinco alvos verificados; não substitui inspeção visual |
| npm audit | Seis pacotes sinalizados: cinco moderados e um alto. Sem críticos na seleção final; dois moderados em dependências de produção (React Router) |

Casos cobrem registros Supabase no resumo/expansão, dez páginas de detalhe com dados reais capturados, categorias, retry, cadastro direto/navegação, StrictMode/GSAP real, movimento reduzido, ErrorBoundary, configuração ausente, login/logout/cadastro/recuperação simulados, senha nova e bloqueio de geração enquanto muda linha. Roteamento positivo usa resposta sintética e verifica ordem de todos os pontos; não conta como geometria real gerada. Nenhum teste cria conta ou escreve no banco remoto.

O erro sintético do teste ErrorBoundary aparece no stderr do jsdom intencionalmente; a recuperação foi validada e o teste passou. O runner também emite avisos de integração do plugin React antigo com seu Vite interno e flags futuras do Router; não foram confundidos com erros de produto. Após o último teste, não houve nova alteração funcional.

Dependências: Vite e React Router da aplicação foram preservados. Versões iniciais de Vitest foram avaliadas e substituídas para remover os alertas críticos do runner; seleção final 4.1.11, sem servidor/UI de teste exposto. A versão 5 foi recusada pelo npm por conflito de peer com Vite 5; não se usou force/legacy-peer-deps nem se migrou o bundler para satisfazê-la. Permanecem advisories moderados do mocker e alertas preexistentes de Vite/esbuild/Router. Correção por major precisa de revisão própria; não executar npm audit fix --force indiscriminadamente.

Revisão independente somente leitura encontrou uma condição de corrida no editor: pontos da linha anterior poderiam ser gravados na nova seleção. Corrigida com limpeza imediata, identificação da linha carregada, bloqueio durante consulta/geração e teste correspondente. Não houve segunda revisão integral nem alegação de ausência de todos os defeitos.

Nesta etapa intermediária, o navegador CUA bloqueou localhost por permissão salva, inclusive após o usuário informar que iria liberar. A liberação efetiva não foi observada e nenhum contorno foi tentado. A validação local posterior com Playwright e Chrome está registrada no adendo; criação de conta, login administrativo e recuperação por e-mail com mutações reais continuam não executados.

Pendências adicionais de migração: AccessManagement ainda depende de api.team ausente; EmployeesManagement usa campos antigos contra profiles; SMTP administrativo depende de api.smtpTest ausente. Não afirmar painel completamente funcional. Substituir essas operações exige contrato administrativo seguro (não usar service_role no frontend); não mascarar criando APIs fictícias nem reativar PHP.

## Publicação e próximos passos
1. Liberar o endereço local no navegador e completar reprodução/validação visual desktop/mobile, incluindo a tela branca de cadastro relatada.
2. Remediação de segurança aplicada após autorização, revisão e backup; testes de RLS com claims de operador/admin concluídos em transações somente leitura. Criação real de conta permanece pendente de ambiente seguro.
3. Obter pontos de passagem reais e suas fontes; validar ida/volta das dez linhas. Gerar, revisar e persistir apenas geometrias geograficamente plausíveis. Não promover dados atuais como oficiais.
4. Resolver contratos administrativos pendentes e dívida de lint/dependências conforme risco, sem migrações de stack automáticas.
5. Revisar o diff e integrar a master corrigida à branch efetivamente publicada (main), com autorização. Não fazer merge automático: há diferenças funcionais entre branches.
6. Somente após aprovação explícita, push e preview/publicação no projeto Vercel existente; testar preview e depois produção. Nenhuma publicação foi autorizada nesta execução.

Critério de conclusão do usuário ainda **não foi atingido**: geometrias confiáveis/persistência e testes reais de navegação/Auth permanecem pendentes. RLS/perfis foram corrigidos no escopo autorizado. A versão de produção continua sem estas correções locais.

## Adendo — pesquisa oficial, navegador real e qualidade, 22/10/2026

A pesquisa geográfica foi ampliada para as dez linhas e está registrada em [PESQUISA_GEOGRAFICA_2026-10-22.md](PESQUISA_GEOGRAFICA_2026-10-22.md). A fonte oficial mais recente é o PDF da STT de agosto de 2026. Nenhum código S01–S06/O01–O04 consta da carta vigente; há correspondências parciais com 0101–0211 e 0301–0404, mas também fusões, omissões e variantes direcionais. Por isso, zero geometrias foram geradas e zero foram persistidas. As vinte existentes e os dados reais foram preservados.

O navegador do Codex permaneceu indisponível, mas foi usada alternativa autorizada e local: Playwright Core com o Chrome já instalado, sem publicação. O script `npm run test:e2e` percorre home em movimento normal, as dez linhas e seus horários, estado geográfico, cadastro direto, transição login→cadastro, login e versões mobile com movimento reduzido. Resultado: **aprovado**, sem exceções de página nem erros de console. Evidências locais ignoradas pelo Git estão em `frontend/test-results/`.

O warning real `fetchPriority` do React 18 foi capturado pelo teste e a propriedade incompatível foi removida; a imagem principal continua sendo carregada normalmente por estar no conteúdo inicial. A inspeção visual das capturas mostrou o design editorial preservado em desktop e mobile, com cadastro legível e sem tela branca.

O lint foi reduzido de **45 erros e 3 avisos para zero erros e zero avisos**, sem desativar regras. Foram adicionadas validações de props, dependências corretas de hooks e tratamento explícito de exceções. O fluxo de criação de linha também passou a usar o ID efetivamente retornado antes de gravar horários, eliminando uma falha administrativa independente.

Vitest foi atualizado de 4.1.11 para 4.1.12 e removeu os advisories do runner. `npm audit` passou de seis para quatro achados: três moderados e um alto, todos ligados a Vite 5/esbuild ou React Router 6. As correções oferecidas exigem Vite 8 e React Router 7; não houve atualização major sem análise de migração. A aplicação não usa SSR do Router e seus destinos de navegação são internos, reduzindo parte da exposição, mas os avisos permanecem registrados.

O painel não chama mais contratos inexistentes de forma síncrona. Gestão de convites/usuários e teste SMTP exibem indisponibilidade explícita; perfis são somente leitura. Não foi criada API fictícia nem CRUD direto de identidades. Finalizar essas operações exige Edge Function autenticada, migração de atribuições para UUID e configuração externa de e-mail, todas sujeitas a autorização específica antes de produção.

Resultados atualizados desta etapa: **28 testes Vitest aprovados**, build e lint aprovados, E2E público aprovado, auditoria pública repetida com 10 linhas/892 horários/130 locais/20 geometrias, `git diff --check` aprovado. Cadastro real, login administrativo real, recuperação por e-mail real e gravação geográfica continuam não executados para evitar mutações não autorizadas.

Organização do checkout: 70 arquivos de `backups/` e 535 de `.impeccable/` foram retirados da versão atual e as pastas adicionadas ao `.gitignore`. A cópia externa está em `C:\Users\freeb\.codex\backups\transcamacari-repository-cleanup-20261022`, com 605 arquivos e manifesto SHA-256 `4A6AA9FEA1A53345FDEFC757CDF0B4E9E77C1B10866BBDA4BBAADFEB06C821E6`. `RELATORIO_FINAL.md` foi movido para `docs/historico/` e o README aponta para o novo local. A remoção reduz ruído na revisão atual; os arquivos continuam no histórico Git.

A correção de autoria solicitada anteriormente não foi executada. A instrução mais recente deste trabalho e o `AGENTS.md` proíbem reescrita de histórico e force push, revogando a exceção anterior. Nenhum hash ou autor foi alterado.

## Adendo — segurança aplicada com autorização, 22/10/2026

Autorização recebida: “Autorizar aplicação após revisão e backup”. Revisão independente somente leitura não encontrou bloqueadores. Aplicada uma única vez a migração `20261022182759_transport_security_hardening`, registrada no histórico do projeto existente e em `supabase/migrations/`. Não executar novamente a cópia histórica em docs/sql/.

Backup privado anterior às alterações: `C:\Users\freeb\.codex\backups\transcamacari-security-20261022\before.json`, fora do Git. Contém definições, políticas, privilégios, triggers e papéis anteriores; não é dump completo dos dados. SHA-256: `00B9770826D07199F4189AF0E64500D47FB96B3B23F468B987A85157022350BC`.

Correções aplicadas: políticas de profiles sem recursão; consulta própria ou administrativa; UPDATE limitado a name, impedindo alteração de role; provisionamento por trigger e preenchimento dos três perfis faltantes como operator; e-mail ampliado para 254 caracteres sem truncar valores. Sete tabelas legadas tiveram RLS habilitada e privilégios anon/authenticated revogados. Contato aceita somente as quatro colunas públicas com validação, sem SELECT público; linhas públicas exigem publicado e visivel.

Validação após aplicação:
- Quatro contas existentes e quatro perfis, nenhum faltante: um admin preservado e três operator. Nenhuma conta Auth criada.
- Totais preservados: 13 linhas, 900 horários e 20 geometrias; nenhum registro de transporte substituído.
- Transações somente leitura com claims de contas existentes: operador vê apenas um perfil e is_admin=false; administrador vê quatro e is_admin=true. Sem erro 42P17.
- Privilégios: UPDATE(role)=false, UPDATE(name)=true, TRUNCATE=false, SELECT anônimo de profiles=false; acesso às sete tabelas legadas revogado para ambos os papéis.
- Consulta anon preserva dez linhas, 892 horários e 20 geometrias. Auditoria via cliente público repetida após migração confirma as dez linhas e seus dados relacionados.
- Advisor de RLS desabilitada caiu de nove tabelas para uma, spatial_ref_sys do PostGIS. Tabelas legadas sem políticas aparecem como INFO, coerente com bloqueio intencional. Permanecem avisos de PostGIS, search_path do trigger antigo e proteção contra senhas vazadas. transport_is_admin aparece como SECURITY DEFINER autenticado: uso intencional, retorno booleano baseado em auth.uid(), execução anônima revogada e search_path fixo.

Não houve cadastro real, envio de contato, teste visual, push ou deploy nesta etapa. O frontend publicado permanece anterior às correções locais; a segurança do banco já está ativa. Testar criação real de conta e clientes antigos continua necessário antes de declarar o produto integralmente validado.
# Adendo de 23/10/2026 - rede oficial preparada localmente

A página de itinerários da STT e o PDF institucional de agosto de 2026 substituem, como referência documental atual, a premissa de dez linhas S01-S06/O01-O04. Foram preparados 46 códigos, 1.130 horários, separação vigente/histórica, rastreabilidade de fontes e dois candidatos viários estimados para a 0302. Consulte [REDE_OFICIAL_2026.md](REDE_OFICIAL_2026.md).

O Supabase de produção foi consultado somente para auditoria: 13 linhas totais (dez publicadas, três demonstração/manual), 900 horários, 130 locais e 20 geometrias. A única migração registrada continua sendo `20261022182759_transport_security_hardening`. A migração e os imports novos não foram aplicados.

Os advisors atuais também registram alertas preexistentes: tabelas legadas com RLS e sem políticas intencionais, `spatial_ref_sys`/PostGIS no schema público, grants de funções da extensão, índices/políticas com oportunidades de desempenho e proteção de senhas vazadas desabilitada. Nenhum desses itens foi alterado remotamente nesta tarefa.
