# TransCamaçari Finalização Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a maior parte verificável do TransCamaçari, preservando dados, segurança e arquitetura, com evidência separada para software, geografia e produção.

**Architecture:** Manter React/Vite/JSX, Supabase e Leaflet. Normalizar contratos no serviço compartilhado, manter operações privilegiadas fora do navegador e aceitar geometria somente quando os pontos possuírem fonte e confiança suficientes. Produção permanece sem escrita geográfica, push ou deploy até autorização específica.

**Tech Stack:** React 18, Vite 5, React Router 6, GSAP, Lenis, Leaflet, Supabase JS 2/PostgreSQL/Auth/RLS, Vitest/jsdom, OSRM/OSM.

**Spec:** `docs/AUDITORIA_CORRECOES_2026-10-22.md` e solicitação “MISSÃO FINAL — CONCLUIR INTEGRALMENTE O TRANSCAMAÇARI”.

## Global Constraints

- Não reaplicar a migração `20261022182759_transport_security_hardening`.
- Não escrever geometrias, criar contas, publicar preview, fazer push ou deploy sem autorização específica.
- Não inferir percurso oficial a partir de OSRM, centro de bairro ou aparência visual.
- Preservar React/Vite/JSX, identidade editorial e PHP legado enquanto substitutos administrativos não forem validados.
- Trabalhar na master e preservar alterações locais existentes.

## Review Focus

- Horários como objetos, strings, vazios ou erro de rede não podem desmontar React.
- Troca rápida de linha/sentido não pode exibir ou salvar dados da seleção anterior.
- Auth metadata nunca concede admin; profile/RLS é a autoridade.
- Movimento reduzido e falha de animação deixam conteúdo essencial visível.
- Geometria sem evidência suficiente aparece como indisponível e nunca como trajeto confiável.

---

### Task 1: Baseline e evidências

**Files:** Modify `docs/AUDITORIA_CORRECOES_2026-10-22.md`; create relatório geográfico.

- [ ] Confirmar branches, stack, relatório, PDF, dados públicos e migrações já aplicadas.
- [ ] Executar baseline de testes, build, lint, audit e inspeção de produção.
- [ ] Registrar fontes, data, confiabilidade e lacunas por linha.

### Task 2: Consulta pública e mapa

**Files:** Modify serviços/ páginas públicas e testes existentes somente se uma falha reproduzível for encontrada.

- [ ] Reproduzir horários, navegação direta, vazio, erro e seleção rápida.
- [ ] Corrigir a origem compartilhada de cada falha comprovada e manter ErrorBoundary como recuperação.
- [ ] Validar geometrias persistidas, ordem lon/lat, enquadramento, estados e aviso de estimativa.

### Task 3: Pesquisa e proposta geográfica

**Files:** Create `docs/PESQUISA_ITINERARIOS_2026-10-22.md` e artefatos de proposta local.

- [ ] Pesquisar S01–S06 e O01–O04 em fontes oficiais, PDF, OSM/Nominatim e OSRM.
- [ ] Classificar ponto/trecho como confirmado, estimado com evidências ou não validado.
- [ ] Gerar apenas propostas locais idempotentes e validar distância, snapping, vias e sentidos.
- [ ] Preparar diff SQL/JSON revisável; não aplicar em produção.

### Task 4: Auth e administração

**Files:** Modify contexto/páginas/API e, se necessário, criar migração ou função segura não aplicada.

- [ ] Validar cadastro, confirmação, profile, login/logout, recuperação, troca e sessão expirada sem conta real.
- [ ] Mapear AccessManagement, EmployeesManagement, team e SMTP ao esquema real.
- [ ] Implementar somente operações que tenham fronteira segura; exibir indisponibilidade explícita para infraestrutura ausente.
- [ ] Cobrir autorização operator/admin e impedir autoelevação.

### Task 5: Motion, qualidade e navegador

**Files:** Modify somente alvos com defeito visual reproduzido; atualizar testes e relatório.

- [ ] Executar navegador autorizado em desktop/mobile e registrar console/rede.
- [ ] Corrigir opacidade, cleanup, contraste ou responsividade comprovadamente defeituosos.
- [ ] Reduzir lint sem suprimir regras e corrigir advisories compatíveis sem major forçado.
- [ ] Rodar testes, build, lint, audit, detector visual e diff check.

### Task 6: Integração e entrega

**Files:** Finalize documentação e commits locais separados por comportamento.

- [ ] Comparar master/main e preparar integração revisável sem reescrever histórico.
- [ ] Relatar funcionalidades, dez linhas, banco, testes, arquivos, branches, Vercel e autorizações.
- [ ] Classificar prontidão para preview e produção com evidência atual.
