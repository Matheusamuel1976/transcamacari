# Divulgação Progressiva de Linhas e Horários — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir a altura das consultas públicas mantendo todas as linhas, horários e locais acessíveis sob demanda.

**Architecture:** Estado local controla janelas progressivas independentes para lista, grupos de horários e itinerário. Filtros, categoria e sentido reiniciam a janela correspondente; nenhum dado ou contrato Supabase muda.

**Tech Stack:** React 18, JSX, React Router 6, Vitest/jsdom, CSS existente.

**Spec:** `docs/superpowers/specs/2026-10-23-divulgacao-progressiva-linhas-horarios-design.md`

## Global Constraints

- Preservar a identidade editorial, busca, filtros e links existentes.
- Mostrar 8 linhas, 12 horários por grupo e 5 locais antes da expansão.
- Usar botões reais, `aria-expanded`, `aria-controls` e foco visível.
- Não adicionar paginação, modal ou rolagem interna.

## Review Focus

- Resultado filtrado maior que 8 deve continuar expansível.
- Alteração de busca ou bairro deve recolher a lista para 8.
- Categoria e sentido devem recolher sua própria prévia.
- Grupos menores que o limite não devem mostrar controle redundante.
- Expansão não deve perder a linha, categoria ou sentido selecionado.

---

### Task 1: Lista progressiva da landing

**Files:**
- Modify: `frontend/src/components/chapters/ChapterDescubra.jsx`
- Test: `frontend/src/test/progressive-disclosure.test.jsx`

**Interfaces:**
- Produces: lista visível derivada de `filtered.slice(0, visibleCount)` e controle de incremento em 8.

- [ ] Escrever teste que exige 8 resultados iniciais, expansão e reinício após busca.
- [ ] Rodar o teste e confirmar falha pelo comportamento ainda ausente.
- [ ] Implementar estado `visibleCount`, reinício por busca/bairro e botão acessível com quantidade restante.
- [ ] Rodar teste e confirmar aprovação.

### Task 2: Horários e itinerário progressivos

**Files:**
- Modify: `frontend/src/pages/LineDetailPage.jsx`
- Test: `frontend/src/test/progressive-disclosure.test.jsx`

**Interfaces:**
- Produces: limite de 12 por grupo de partida e 5 locais por sentido, com expansão independente.

- [ ] Escrever testes para prévia, expansão/recolhimento e ausência de botão em grupos curtos.
- [ ] Rodar os testes e confirmar falha pelo conteúdo integral atual.
- [ ] Implementar estados por grupo e itinerário; reiniciar em categoria/sentido.
- [ ] Rodar teste e confirmar aprovação.

### Task 3: Acabamento, E2E e publicação

**Files:**
- Modify: `frontend/scripts/e2e-public.mjs`
- Modify: `docs/quality.md`

**Interfaces:**
- Consumes: seletores e textos dos controles das Tasks 1 e 2.

- [ ] Atualizar E2E para verificar altura reduzida, expansão completa e mobile.
- [ ] Executar detector Impeccable uma vez nos dois componentes alterados.
- [ ] Executar `npm test`, lint, build, E2E local/preview, `git diff --check` e inspeção visual desktop/mobile.
- [ ] Registrar evidências, publicar `master`, validar preview e avançar `main` para a mesma revisão.

