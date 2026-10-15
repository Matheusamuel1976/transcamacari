# Deploy — Vercel (frontend) + Supabase (Postgres) + backend PHP

Arquitetura: a Vercel **não executa PHP** e o Supabase **é Postgres, não
MySQL**. Por isso o deploy usa três peças:

| Peça | Onde | Por quê |
|---|---|---|
| Frontend estático (`vite build`) | Vercel | `vercel.json` + `VITE_API_URL` |
| Backend PHP 8.3 | Host PHP (Railway, Render, hospedagem c/ `pdo_pgsql`) | Sessões + PDO |
| Banco Postgres | Supabase | `schema-pg.sql` + `seed-pg.sql` |

O backend fala MySQL **e** Postgres (`DB_DRIVER`); o SQL usa `string_agg`/
`ILIKE` automaticamente no modo `pgsql`. O ambiente local continua MySQL.

## 1. Supabase (banco)

1. Crie o projeto em https://supabase.com/dashboard (gratuito).
2. Abra **SQL Editor → New query**, cole `backend/database/schema-pg.sql`
   e execute. Depois cole `backend/database/seed-pg.sql` (dados demo
   fictícios; pule se for começar do zero).
3. Em **Project Settings → Database**, anote: Host (pooler, ex.
   `aws-0-sa-east-1.pooler.supabase.com`), porta `6543`, usuário
   `postgres.<ref>`, senha do banco. **Não use a anon key no backend** —
   o PHP conecta via Postgres direto, não via API REST.

## 2. Backend PHP

Requisitos do host: PHP ≥ 8.3 com extensões `pdo_pgsql`, `mbstring`,
`openssl`. Envie a pasta `backend/` (sem `vendor/`; rode
`composer install --no-dev` no deploy ou envie com vendor).

Variáveis de ambiente no host:

```bash
APP_ENV=production
APP_URL=https://<seu-backend>
FRONTEND_URL=https://<seu-app>.vercel.app
DB_DRIVER=pgsql
DB_HOST=aws-0-<regiao>.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.<ref>
DB_PASS=<senha do banco>
SESSION_NAME=TCSESSID
SESSION_SECURE=true
SESSION_SAMESITE=None
```

Teste: `https://<seu-backend>/health` → `{"status":"ok",...}`.
Login demo: `demo@transcamacari.local` / `demo12345` (troque após subir).

## 3. Frontend na Vercel

1. Importe o repositório em https://vercel.com/new (root:
   `TransCamacari/frontend`; o `vercel.json` já define build `vite`
   e fallback SPA).
2. Em **Settings → Environment Variables**, defina:
   `VITE_API_URL=https://<seu-backend>` (sem `/api` no final, sem barra).
3. Deploy. O app chama o backend absoluto; em desenvolvimento local,
   sem a variável, continua usando `/api` via proxy do Vite.

## 4. Checklist pós-deploy

- [ ] `/health` do backend responde 200.
- [ ] Login demo funciona e `/dashboard` abre com estatísticas reais.
- [ ] Criar/excluir linha e funcionário (sem resíduo).
- [ ] Mapa carrega tiles e pontos do Supabase.
- [ ] Contato registra (SMTP só com credenciais reais).
- [ ] Sem erros no console; sem overlay preso; mobile OK.

## 5. Matriz de papéis

| Papel | Ver linhas | CRUD linhas/pontos/funcionários | Equipe e aprovações | Auditoria e SMTP | Mensagens |
|---|---|---|---|---|---|
| admin | todas | sim | sim | sim | ver + excluir |
| operator | todas | sim | não (403) | não (403) | ver |
| funcionario | só designadas | não (403) | não (403) | não (403) | não |
| anônimo | só visíveis | não | não | não | só enviar contato |

Funcionário com senha inicial deve trocá-la em `/trocar-senha` antes de
navegar. Convites de empresa valem 30 dias.

## 6. Credenciais SMTP (onde obter)

Gmail (recomendado): ative a verificação em 2 etapas na Conta Google,
depois myaccount.google.com → Segurança → **Senhas de app** → gere uma
para "TransCamaçari" (16 letras). Variáveis:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=<senha de app, sem espaços>
SMTP_FROM=seu@gmail.com
SMTP_TO=email-que-recebe@exemplo.com
SMTP_ENCRYPTION=tls
```

Outlook: `smtp.office365.com:587` com a senha normal. Valide pelo botão
**Enviar e-mail de teste** na Conta do painel; o contato passa a entregar
de verdade em vez de só registrar.

## 7. Backup do banco

Local (XAMPP): `C:\xampp\mysql\bin\mysqldump.exe -u root
--default-character-set=utf8mb4 transcamacari > backup.sql`.
Supabase: Database → Backups (plano gratuito tem retenção limitada) ou
`pg_dump` com a connection string. Guarde um dump antes de qualquer
migração.

## Limites conhecidos

- Sessões PHP são por servidor: no Railway/Render use 1 réplica (ou
  sticky sessions) para não derrubar login.
- SMTP continua pendente de credenciais reais (`SMTP_*`).
- Fotos da equipe aguardam dados confirmados.
