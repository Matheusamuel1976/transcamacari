# Qualidade e próxima investigação

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
