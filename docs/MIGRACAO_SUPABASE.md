# Migração Supabase — TransCamaçari

## Estado atual

As migrações estão criadas no repositório (`supabase/migrations/`) mas **não foram aplicadas** ao Supabase existente. A aplicação delas requer execução via SQL Editor pelo usuário, com autorização.

## Arquitetura final

O frontend (React 18 + Vite) comunica-se diretamente com o Supabase (PostgreSQL + Auth) através do cliente `@supabase/supabase-js`. O backend PHP foi mantido no repositório mas não é mais chamado pelo frontend para funcionalidades migradas.

**Camadas:**
1. Frontend (Vite, porta 3000) → Supabase client → Supabase PostgreSQL
2. Supabase Auth → autenticação administrativa (login, logout, sessão, reset de senha)
3. RLS (Row Level Security) → controle de acesso no banco

## Estrutura do banco de dados

Tabelas criadas pela migração `001_initial_schema.sql`:

| Tabela | Finalidade |
|---|---|
| `companies` | Empresas (compatível com schema anterior) |
| `profiles` | Usuários vinculados ao Supabase Auth (substitui `users` para auth) |
| `linhas` | Linhas de ônibus (codigo, nome, bairro, origem, destino, categoria, visivel, publicado, origem_dados, data_importacao) |
| `horarios` | Horários estruturados por categoria (uteis, sabado, domingo_feriado, todos) com ordem |
| `itinerary_locais` | Pontos do itinerário com coordenadas, sentido (ida/volta), ordem, geocoding_source |
| `route_geometries` | Geometrias GeoJSON geradas pelo OSRM, estado de validação, método de geração |
| `import_metadata` | Registro de execuções de importação/seed |

Segurança:
- RLS habilitado em todas as tabelas.
- Anônimos (autenticados e não) leem apenas `publicado = TRUE` e dados associados.
- Apenas `role = 'admin'` pode gravar (criar, editar, publicar, despublicar).
- Usuário comum não pode alterar seu próprio `role` (protegido por RLS).

## Como executar as migrações SQL

1. Acesse o SQL Editor do projeto Supabase existente (`https://wiqynihjinlbwhvhjtfk.supabase.co`).
2. Execute `supabase/migrations/001_initial_schema.sql`.
3. Execute `supabase/migrations/002_seed_real_lines.sql`.

As migrações são idempotentes e seguras contra schema existente:
- Usam `CREATE TABLE IF NOT EXISTS`.
- Usam `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para colunas novas em tabelas que já possam existir (schema legado PHP).
- O seed usa `DELETE ... WHERE` + `INSERT` para evitar duplicação.

## Como importar os dados do PDF

Os dados já estão na migração `002_seed_real_lines.sql`, extraídos de `C:\Users\freeb\Downloads\Documento sem título.pdf` (3 páginas). As 10 linhas:

- **Sede:** S01, S02, S03, S04, S05, S06
- **Orla:** O01, O02, O03, O04

Horários estruturados por categoria exatamente como aparecem no PDF. Coordenadas dos pontos são estimativas — requerem geocodificação real.

## Como configurar as variáveis de ambiente

Crie `frontend/.env` (não commitar; já está no `.gitignore`) baseado em `frontend/.env.example`:

```
VITE_SUPABASE_URL=https://wiqynihjinlbwhvhjtfk.supabase.co
VITE_SUPABASE_ANON_KEY=<chave pública do projeto Supabase>
```

No Vercel, defina as mesmas variáveis nas Environment Variables do projeto existente. Nunca exponha a `service_role` key no frontend.

## Como executar o projeto localmente

```sh
cd frontend
npm install
cp .env.example .env   # editar com valores reais do Supabase
npm run dev            # porta 3000
```

O Vite mantém o proxy `/api` para `http://localhost:8000` em `vite.config.js`, mas o frontend não o usa para funcionalidades migradas (conecta diretamente ao Supabase).

## Como realizar o deploy na Vercel

`frontend/vercel.json` já está configurado para Vite. No painel da Vercel (projeto existente):
1. Build Command: `npm install && npm run build`
2. Output Directory: `dist`
3. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas Environment Variables.
4. Não fazer deploy sem autorização explícita.

## Como configurar Supabase Auth e RLS

1. No Supabase Dashboard → Authentication → Settings, confirme a configuração de email confirmation.
2. As políticas RLS estão na migração 001.
3. Primeiro administrador: criar usuário via Supabase Auth, obter seu `id` (UUID), inserir na tabela `profiles` com `role = 'admin'`. Não fazer via alteração insegura de perfil.

## Como gerar e regenerar rotas geográficas

Use `frontend/src/services/routing.js`:

- `geocodePlace(nome, contexto)` — geocodifica via Nominatim (~1.1s entre chamadas por rate limit).
- `routeSegment(lat1, lng1, lat2, lng2)` — rota viária via OSRM.
- `generateRouteForLine(linhaId, locais, sentido)` — gera rota completa para ida ou volta.
- `saveRouteGeometry(linhaId, sentido, geometry, estado)` — salva no Supabase.
- `updateRouteValidation(geometryId, estado, erro)` — atualiza estado de validação.

Fluxo administrativo (MapPage):
1. Carregar pontos da linha.
2. Gerar rota (ida e volta separadamente).
3. Salvar geometria (estado `estimated`).
4. Revisar e definir estado (`needs_review` → `reviewed`).
5. Nunca classificar como `official` sem fonte confiável.

O mapa consome `route_geometries` e renderiza polilinhas roxas. Se não houver geometria, não usa linha reta como fallback silencioso.

## Etapas pendentes (requerem ação do usuário)

1. Criar `frontend/.env` com chaves reais.
2. Aplicar migrações SQL no Supabase existente.
3. Configurar o primeiro administrador.
4. Gerar rotas geográficas para as 10 linhas (ida e volta).
5. Revisar e validar geometrias no painel admin.
6. Configurar variáveis de ambiente no Vercel.
7. Validar RLS com usuários anônimos e autenticados.