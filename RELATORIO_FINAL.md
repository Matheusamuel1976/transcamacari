# Relatório Final — TransCamaçari (Supabase/Vercel)

## Estado atual do repositório

Branch: `master` (repositório existente em `C:\Users\freeb\Documents\TCC 1 - Jacinto`).
O código foi copiado do GitHub (`https://github.com/Matheusamuel1976/transcamacari`) e modificado in loco. Não foi criado novo projeto Supabase nem novo projeto Vercel.

## 1. Funcionalidades implementadas

| Funcionalidade | Status | Detalhes |
|---|---|---|
| AGENTS.md | ✅ Criado | `AGENTS.md` na raiz com instruções do repositório |
| .gitignore | ✅ Corrigido | Conflito de merge resolvido; `.env` e `.env*` excluídos, `.env.example` preservado |
| Supabase schema + RLS | ✅ Criado | `supabase/migrations/001_initial_schema.sql` — seguro contra schema existente (ALTER TABLE ADD COLUMN IF NOT EXISTS) |
| Seed idempotente (10 linhas PDF) | ✅ Criado | `supabase/migrations/002_seed_real_lines.sql` — S01-S06, O01-O04 |
| Supabase client (frontend) | ✅ Criado | `frontend/src/services/supabase.js` |
| API service (Supabase) | ✅ Reescrito | `frontend/src/services/api.js` — sem endpoints PHP |
| Auth (Supabase Auth) | ✅ Reescrito | `frontend/src/contexts/AuthContext.jsx` — login, logout, register, session |
| Route generation (OSRM+Nominatim) | ✅ Criado | `frontend/src/services/routing.js` — geocodificação + roteamento viário |
| Mapa admin (rotas + pontos) | ✅ Atualizado | `frontend/src/pages/dashboard/MapPage.jsx` — polilinhas roxas, ida/volta |
| Mapa público (ChapterMapa) | ✅ Atualizado | Polilinhas sólidas roxas, sem linhas tracejadas |
| Página pública de linhas | ✅ Criado | `frontend/src/pages/LinesPage.jsx` — listagem, busca, filtro sede/orla |
| Página de detalhe da linha | ✅ Criado | `frontend/src/pages/LineDetailPage.jsx` — mapa + horários por categoria |
| Rotas públicas (App.jsx) | ✅ Atualizado | `/linhas`, `/linhas/:id` |
| Tema roxo/branco | ✅ Aplicado | Removido laranja de todos os CSS/JSX |
| .env.example | ✅ Criado | `frontend/.env.example` — variáveis Supabase sem segredos |
| PHP backend | ⚠️ Preservado | Não removido destrutivamente; ainda presente em `backend/` |

## 2. Principais arquivos criados ou modificados

### Criados
- `AGENTS.md` — instruções para agentes
- `supabase/migrations/001_initial_schema.sql` — schema Supabase com RLS, seguro contra schema existente
- `supabase/migrations/002_seed_real_lines.sql` — seed idempotente das 10 linhas
- `frontend/src/services/supabase.js` — cliente Supabase
- `frontend/src/services/routing.js` — geração de rotas OSRM+Nominatim
- `frontend/src/pages/LinesPage.jsx` — listagem pública de linhas
- `frontend/src/pages/LineDetailPage.jsx` — detalhe público com mapa e horários
- `frontend/.env.example` — variáveis de ambiente (sem segredos)

### Modificados
- `frontend/src/services/api.js` — Supabase substitui PHP
- `frontend/src/contexts/AuthContext.jsx` — Supabase Auth substitui sessões PHP
- `frontend/src/pages/dashboard/MapPage.jsx` — rotas viárias, polilinhas roxas
- `frontend/src/pages/dashboard/LinesManagement.jsx` — horários por categoria
- `frontend/src/App.jsx` — rotas públicas `/linhas`, `/linhas/:id`
- `frontend/src/styles/global.css` — removido laranja, variáveis roxas
- `frontend/src/styles/design-system.css` — removido solar/terracotta
- `frontend/src/styles/editorial.css` — removido laranja
- `frontend/src/styles/hero.css` — removido laranja
- `frontend/src/motion/motion.css` — removido laranja
- `frontend/src/components/Navbar.jsx` — laranja → roxo
- `frontend/src/components/Footer.jsx` — laranja → roxo
- `frontend/src/components/Preloader.jsx` — laranja → roxo
- `frontend/src/components/chapters/ChapterMapa.jsx` — linhas sólidas roxas
- `frontend/src/components/chapters/ChapterDescubra.jsx` — sem dados fictícios
- `frontend/src/services/lines.js` — Supabase + fetch de pontos por linha
- `frontend/.gitignore` (raiz) — conflito de merge resolvido

## 3. Segurança verificada

- **Nenhum segredo exposto:** varredura em `*.{js,jsx,sql,md,json,env*}` não encontrou chaves `service_role`, `sk_live`, `sk_test`, `sbp_` ou valores reais de `VITE_SUPABASE_ANON_KEY` no código-fonte.
- **RLS:** todas as tabelas têm RLS habilitado. Anônimos leem apenas `publicado = TRUE`. Apenas `role = 'admin'` pode gravar. Usuário comum não pode alterar seu próprio `role`.
- **Auth:** Supabase Auth (`signInWithPassword`, `signOut`, `onAuthStateChange`). Sem sessões PHP, sem cookies de backend antigo.
- **service_role:** não é referenciado no frontend; apenas avisos em comentários da biblioteca `@supabase/auth-js` (node_modules).

## 4. Migrações e importações planejadas

- **Migração 001:** Cria tabelas `companies`, `profiles`, `linhas`, `horarios`, `itinerary_locais`, `route_geometries`, `import_metadata` com RLS, FKs, índices e constraints. Usa `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para não quebrar se o schema PHP legado já existir no Supabase.
- **Migração 002:** Importa 10 linhas do PDF com horários estruturados por categoria. Idempotente.

**Não foram aplicadas ao Supabase** (requerem execução via SQL Editor pelo usuário, com autorização).

## 5. Dados importados (planejados, não executados no Supabase)

- **10 linhas:** S01-S06 (sede), O01-O04 (orla)
- **Horários:** todos os horários do PDF preservados por categoria (uteis, sabado, domingo_feriado)
- **Pontos de itinerário:** 2 sentidos por linha, coordenadas estimadas (requerem geocodificação real)

## 6. Estado da geração de rotas

- Serviço implementado em `frontend/src/services/routing.js` (OSRM + Nominatim).
- **Rotas não geradas** no banco: requerem execução administrativa (chamadas externas a OSRM/Nominatim com rate limit).
- O mapa consome `route_geometries` do Supabase e renderiza polilinhas roxas sólidas.
- Se não houver geometria salva, o mapa exibe apenas os pontos (sem linha reta silenciosa como fallback).

## 7. Resultado de testes executados

| Comando | Resultado |
|---|---|
| `npm run build` | ✅ Sucesso — 1570 módulos, sem erros, sem warnings |
| `npm run lint` | ❌ Não executável — não há `.eslintrc` no projeto (pré-existente) |
| Testes automatizados | ❌ Nenhum teste configurado no projeto |

## 8. Configurações externas que ainda faltam (ação do usuário necessária)

1. **Criar `frontend/.env`** com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (do projeto Supabase existente: `https://wiqynihjinlbwhvhjtfk.supabase.co`). Nunca commitar.
2. **Aplicar migrações SQL** no Supabase existente via SQL Editor: `001_initial_schema.sql` e `002_seed_real_lines.sql`.
3. **Configurar primeiro administrador:** criar usuário via Supabase Auth, inserir perfil em `profiles` com `role = 'admin'` (não fazer via alteração insegura de perfil).
4. **Gerar rotas geográficas:** executar `generateRouteForLine()` para cada uma das 10 linhas (ida e volta) via painel admin ou script separado.
5. **Configurar Vercel:** definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do projeto Vercel existente. Não fazer deploy sem autorização.

## 9. Próxima ação necessária

O usuário precisa:
1. Criar `frontend/.env` com as chaves do Supabase.
2. Aplicar as migrações no Supabase (SQL Editor).
3. Configurar o primeiro administrador.
4. Gerar as rotas para as 10 linhas.
5. Configurar o Vercel e (opcionalmente) fazer deploy.

## Limitações registradas

- Coordenadas dos pontos de itinerário são estimativas (não geocodificadas oficialmente).
- Geometrias de rota ainda não foram geradas no Supabase (requerem execução do serviço OSRM).
- Nenhum teste automatizado configurado no projeto.
- Lint não configurado (falta `.eslintrc`).
- O backend PHP permanece no repositório; não foi removido destrutivamente.