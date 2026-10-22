# TransCamaçari — AGENTS.md

## Repo & branches
- Remote: `https://github.com/Matheusamuel1976/transcamacari`
- `master` (1 commit: `9637da5 feat: migração completa para Supabase/Vercel com tema roxo/branco`) — working branch. Despite the commit message, code is still PHP/MySQL + React with petroleum/orange theme.
- `main` (6 commits) — older PHP/MySQL version, more commits, petroleum+orange theme.
- Work on `master`. Do not create new branches unless needed.

## Stack (verified from source)
- Frontend: React 18 + Vite + Leaflet 1.9.4, `.jsx` (NOT TypeScript), port 3000
- Backend: PHP 8.3 MVC + MySQL/PDO (also `schema-pg.sql`/`seed-pg.sql` PostgreSQL variants), port 8000
- Vite dev proxy: `/api` → `http://localhost:8000` (vite.config.js:8)
- No `supabase-js` installed. No `.env` file (only `frontend/.env.production.example` with `VITE_API_URL`)
- No tests configured. Lint: `eslint . --ext js,jsx` (frontend/package.json:10)

## Commands
```
cd frontend && npm install      # install deps
cd frontend && npm run dev      # dev server (port 3000, proxies /api to 8000)
cd frontend && npm run build    # production build → dist/
cd frontend && npm run lint     # eslint
cd backend && composer install  # PHP deps
cd backend && php -S 127.0.0.1:8000 -t public  # PHP dev server
```

## Database schema (schema-pg.sql / schema.sql)
Tables: `companies`, `users`, `employees`, `linhas`, `horarios`, `pontos`, `contact_messages`, `rate_limits`
- `linhas`: codigo, nome, bairro, origem, destino, visivel (0/1)
- `horarios`: linha_id, horario (TIME), dias ('uteis'|'sabado'|'domingo'|'todos')
- `pontos`: linha_id, ordem, nome, latitude, longitude, tipo ('origem'|'parada'|'destino')
- No Supabase schema, no RLS, no route geometry table yet.

## Data source (PDF)
- `C:\Users\freeb\Downloads\Documento sem título.pdf` — 3 pages, 10 bus lines (S01-S06 sede, O01-O04 orla)
- Confirmed: line codes, names, itineraries, and schedules match the task prompt exactly
- Schedule categories: Segunda a Sexta (uteis), Sábados, Domingos e Feriados
- Data extracted to `/tmp/opencode/pdf_page_{1,2,3}.txt`

## Theme (needs change)
- `frontend/src/styles/global.css`: `--color-petroleum: #1a237e` (matches target purple `#1A237E`), `--color-solar/--color-terracotta: #ff6d00` (orange — MUST be removed)
- `frontend/src/styles/design-system.css`: uses petroleum + solar + terracotta throughout
- Target: purple (`#1A237E`, `#12175C`, `#4E59AC`) + white (`#FFFFFF`), no orange

## Map (needs change)
- `frontend/src/pages/dashboard/MapPage.jsx`: draws straight dashed orange polylines between pontos — must be replaced with real route geometries from OSRM/routing, purple solid lines
- Public map: does not exist yet; LandingPage has ChapterMapa but no real line data

## Auth (needs change)
- `frontend/src/contexts/AuthContext.jsx`: PHP session-based (`/api/auth/login`, `/api/auth/me`, cookies)
- Must migrate to Supabase Auth; remove PHP session/cookie dependency

## API (needs change)
- `frontend/src/services/api.js`: all calls to PHP endpoints (`/api/linhas`, `/api/auth/*`, `/api/funcionarios`, `/api/contato`, CSRF tokens)
- Must replace with Supabase client calls

## What does NOT exist yet
- Supabase client (`@supabase/supabase-js`) — not installed
- Supabase schema migrations with RLS
- Idempotent seed for the 10 real lines
- Route geometry table / OSRM integration
- Purple/white theme (orange still present)
- Public line listing page with schedules
- `.env` with Supabase keys
- AGENTS.md (this file)

## Key constraints from task
- Do NOT create a new Supabase project or Vercel project — use existing
- Do NOT expose `service_role` key in frontend
- Do NOT deploy to production
- Do NOT delete legacy PHP backend until Supabase replacement is validated
- Preserve existing working functionality; migrate incrementally