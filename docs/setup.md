# Preparação Codex + Vibe Coding Toolkit — 22/10/2026

> Registro da etapa de preparação. Posteriormente o usuário autorizou correções funcionais. Estado atual em [auditoria e correções](AUDITORIA_CORRECOES_2026-10-22.md), incluindo dependências de teste e verificações novas. Afirmações abaixo de fontes preservadas descrevem apenas a etapa anterior.

## Escopo e revisão
Preparação executada sem corrigir GSAP, horários, mapas ou cadastro. Toolkit consultado em cópia fora da aplicação, revisão única [`790a895304e0c08b70a5b215c9d334f1c86b816c`](https://github.com/soumatheusgomes/vibe-coding-toolkit/tree/790a895304e0c08b70a5b215c9d334f1c86b816c), sem executar seus instaladores genéricos. Fluxo Prompt 12 adaptado às restrições do usuário: inventário → decisões → configuração local/reuso → validação → handoff.

Lidos os dois READMEs, AGENTS, Prompt 12, instalação, guia Codex, catálogo e template AGENTS. Guias adicionais relevantes: Superpowers, Ponytail, Caveman, RTK, Context7, Vercel skills, memória/hooks/Graphify e capacidades 17–23. Manifesto documental usado como mapa, sem copiar padrões Next/Drizzle.

## Ambiente observado
- Codex desktop no Windows/PowerShell; CLI `0.163.0-alpha.11`. Essa versão é do CLI, não comprova versão do aplicativo desktop. A versão do app não foi determinada.
- Node 24.15.0, npm 12.0.2; dependências locais já instaladas. React/React DOM 18.3.1, React Router 6.30.6, Vite 5.4.21, Supabase JS 2.118.0, GSAP 3.15.0, Lenis 1.3.26, Leaflet 1.9.4, ESLint 8.57.1. PHP/Composer disponíveis, versões não verificadas.
- Git inicialmente limpo em main `2964ee4`; master selecionada conforme instrução, base `8e5b03545313a299d4e02792cd93271c601fe49a`, um commit local à frente de origin/master. Nenhum fetch, merge, commit, push ou nova branch.
- Configuração global inspecionada por nomes de seções/campos permitidos, sem imprimir credenciais; configuração local inexistia. Sessão com sandbox e aprovações preservadas. Modelo/autenticação da sessão não alterados; não foi inferida identidade de modelo ou credencial a partir do CLI.
- AGENTS antigo estava carregado via mensagem do usuário e foi lido do disco. Continha fatos superados (ausência de Supabase, por exemplo). Novo arquivo objetivo aponta para fontes verificadas; autocarregamento da versão nova em outra sessão não foi testado.

## Componentes: decisão e evidência

| Componente | Ação/escopo | Estado e verificação |
|---|---|---|
| AGENTS e documentação | Atualização local, baseada no código | Instruções lidas; links/contexto e diff revisados |
| Superpowers | Instalação global expressamente autorizada, mecanismo Codex | `superpowers@openai-curated-remote` 6.4.2 instalado; using-superpowers, brainstorming e verification-before-completion lidos do cache oficial; verificação aplicada nesta sessão. Descoberta automática em sessão nova pendente |
| Context7 | Configuração apenas em .codex/config.toml, expressamente autorizada | codex mcp list reconheceu enabled; initialize, tools/list, resolve-library-id e query-docs responderam via cliente JSON-RPC temporário, sem chave; servidor 4.4.3. React 18 useEffect/cleanup/StrictMode retornou documentação. Tools ainda não injetadas no inventário desta conversa; não confundir smoke de protocolo com descoberta nativa |
| Ponytail | Reuso da skill global existente | SKILL.md lido; evitar instalar outra cópia. Há sobreposição com plugin engineering-suite-ponytail; não removidos componentes globais usados por outros projetos |
| Caveman | Avaliado nas fontes oficiais e guia | Não instalado: concisão já é fornecida pelas instruções de comunicação; proxy/model routing desnecessários |
| RTK | Reuso manual do binário | 0.51.0; rtk git status executado. A ferramenta informa ausência de hook. Nenhum hook global adicionado |
| React/Vercel skills | Reuso do plugin já disponível | react-best-practices lida para avaliar compatibilidade; orientações TSX, Next, shadcn não autorizam migrar JSX/CSS. Demais skills Vercel reconhecidas por metadados, não executadas |
| Supabase/PostgreSQL skills | Reuso do plugin existente | supabase lida para avaliar regras; supabase-postgres-best-practices reconhecida por metadados, não executada; nenhum SQL/banco remoto testado |
| Browser | Reuso CUA/browser existente | getState respondeu; abertura local negada por autorização. Sem instalação duplicada de agent-browser/DevTools; console/rede/performance não testados |
| Revisão de código | Reuso Git/diff e ferramenta PR existente | Diff local revisado pelo agente principal; ferramenta de checks PR descoberta, sem PR alvo/teste. Não instalar plugin adicional para preparação documental |
| ESLint/Biome | Configuração ESLint local com plugins existentes | Baseline ausente → execução com 55 erros e 6 avisos. Sem Biome duplicado, correções de produto ou supressões |
| Testes | Procedimento e critérios registrados | Sem suíte/script existente; não adicionar framework sem caso funcional. Build/lint e smoke de ferramentas separados de testes de produto |
| Graphify | Avaliado, não instalado | CLI não encontrada no PATH; diretório de grafo não presente no inventário da raiz. Documentos antigos mencionam índice, mas não provam atualidade/disponibilidade. rg e mapa arquitetural suficientes nesta etapa |
| Orquestração | Ferramentas nativas disponíveis, sem despacho | Tarefa executada diretamente; sem alteração de modelo/provedor ou orquestrador adicional |
| Obsidian/memória Claude | Não selecionados | Documentação versionada e AGENTS cumprem persistência; sem vault/exportação ou cliente Claude ativo |
| Hooks | Não adicionados | Sem necessidade demonstrada; não instalar hooks de commit/push nem ampliar permissões |
| Artifact skills/skill creation | Reuso da disponibilidade do ambiente | Sem tarefa de documentos binários/skill nova; não instalar coleção redundante |
| next-dev-loop/next-bundle-optimizer | Inaplicáveis | Projeto Vite, sem Next/Turbopack; não migrar framework |
| gh-fix-ci | Não instalado | Nenhuma falha de PR/Actions alvo; GitHub já disponível |
| differential-review | Procedimento de revisão delimitada documentado | Sem diff funcional de segurança nesta preparação; não instalar coleção adicional para preencher catálogo |
| shadcn | Inaplicável | UI existente React/CSS; não adotar design system sem pedido |
| Sentry MCP | Não selecionado | Sem organização/projeto autorizado; não criar conta, SDK, custo ou autenticação |
| Harness2 | Adaptação nativa documentada | Procedimento Prompt 15 reutilizável em quality.md; smoke limitado, sem execução do framework/benchmark ou experimento controlado |
| aia-harness/plugins Claude | Inaplicáveis nesta sessão | Cliente Codex; não copiar configurações de outro cliente |

## MCPs e integrações efetivamente testados
- GitHub: leitura pública da revisão fixa do toolkit retornou conteúdo. Nenhuma mutação externa.
- Vercel: busca de documentação sobre variáveis Vite retornou conteúdo. Não comprova acesso ao projeto/deployment existente.
- Context7: protocolo e consulta real React 18, sem código privado. Script temporário fora da aplicação, executado com acesso de rede autorizado após bloqueio DNS no sandbox.
- CUA: inventário de navegador funcionou; navegação local bloqueada. Não declarar inspeção de console realizada.
- codex_app: CLI listou transporte disabled, mas ferramentas de app estão expostas nesta sessão; superfícies diferem. Não alterar configuração global para reconciliar sem necessidade. node_repl listado enabled, sem teste específico. Supabase e code-review expostos, sem consulta nesta etapa.

## Skills carregadas e reconhecimento
Lidas: OpenAI Docs, plugin-management, Ponytail, react-best-practices, supabase, computer-use, e as três skills Superpowers citadas. A leitura avalia/carrega instruções, não prova execução integral de todo workflow. Teste real seguro: verification-before-completion aplicado aos checks desta preparação e relatório explícito das falhas. Não afirmar que o Brainstorming foi executado integralmente antes da instalação.

Duplicidades detectadas por metadados: impeccable em duas distribuições; Ponytail local/plugin com finalidades sobrepostas. Mantidas as instalações existentes, sem nova cópia ou remoção global. Não se presume fusão de skills de mesmo nome.

## Documentação e memória
AGENTS é índice persistente do Codex. PRODUCT é escopo, README entrada, architecture estrutura, onboarding execução, quality verificações, setup proveniência. docs/design.md mapeado para PRODUCT (diretriz atual), CSS existente e docs/MOTION.md (histórico); não criado documento concorrente. CLAUDE.md não criado: cliente não utilizado. MIGRACAO_SUPABASE, AUDITORIA, VALIDACAO, DEPLOY e RELATORIO_FINAL preservados como registros datados. Revalidar após mudar branch, dependências, schema, fontes ou ferramentas; não confiar em alegações históricas sem execução.

## Alterações, recuperação e autorizações
Arquivos alterados: AGENTS.md, PRODUCT.md e README.md. Criados: docs/architecture.md, docs/onboarding.md, docs/quality.md, docs/setup.md, frontend/.eslintrc.cjs e .codex/config.toml. Código funcional, SQL, package.json e lockfile preservados. Build gerou apenas artefatos ignorados; relatório JSON temporário do lint foi resumido e removido.

Exceção global expressamente autorizada: instalação Superpowers pelo Codex. Backup privado da configuração anterior em ~/.codex/config.before-superpowers-20261022.toml; não versionado. Não restaurar arquivo inteiro cegamente se houver novas mudanças; remover somente integração criada se solicitado. Context7 pode ser desfeito removendo sua seção local. Documentos originais permanecem recuperáveis no commit base. Não executar rollback sem pedido.

Sem custos, novos provedores, proxies, mudança de permissões, migrações, push ou deploy. Nenhuma autorização adicional necessária ao que foi concluído. Navegação local depende de autorização do navegador; ações em produção continuam proibidas. Próxima sessão deve confirmar autodescoberta do Superpowers e Context7.

## Resultado e limites
Validação final: git diff --check e comparação das fontes funcionais contra HEAD retornaram exit 0. Smoke isolado do ESLint aceitou JSX válido e rejeitou hook condicional. Servidor local encerrado, porta 3100 sem listener acessível. A execução inicial de um smoke via node -e falhou por quoting PowerShell; foi substituída por arquivo temporário fora do projeto e executada com sucesso.

Preparado para o próximo prompt de investigação, com ressalvas em quality.md: build aprovado, lint com débito explícito, sem suíte automatizada, sem validação visual ou banco/Auth. Não foi alegada correção dos quatro problemas nem ausência de regressão funcional. Riscos residuais: instruções históricas desatualizadas, contratos de papéis/schema a confirmar e dependências externas. A aplicação e o backend legado foram preservados.
