# TransCamaçari 2.0 — Caminhos que conectam

Aplicação existente reconstruída dentro desta pasta: React 18/Vite + PHP 8.3 MVC, MySQL/PDO, GSAP/ScrollTrigger, Lenis, React Bits Magnet e Leaflet/OpenStreetMap.

## Executar localmente

Frontend: `cd frontend`, `npm install`, `npm run dev` (porta 3000). `npm run build` gera a distribuição.

Backend: `cd backend`, `composer install`, copiar `.env.example` para `.env` e configurar banco/SMTP. Executar `php -S 127.0.0.1:8000 -t public`. O Vite encaminha `/api` à porta 8000.

O banco não é criado automaticamente. Avalie `backend/database/schema.sql` e faça backup antes de provisionar um ambiente; `seed_demo.sql` contém apenas dados fictícios.

## Interface

Hero com fotografia documental de Camaçari (arquivo, 2007), tipografia editorial, máscara de entrada, linha animada, parallax e CTA Magnet. Seções com composições distintas, consulta por bairro/linha/destino, detalhes inline, mapa sincronizado com a seleção e contato no footer. Redução de movimento respeitada e conteúdo legível independente dos reveals.

Linhas de exemplo têm IDs `demo-*`, horários e pontos fictícios claramente sinalizados. API vazia produz estado vazio. Falha de conexão produz demonstração identificada. Traços são conexões entre pontos, sem cálculo viário nem rastreamento em tempo real. Fotos/autor/licença em `frontend/public/assets/images/SOURCES.md` e no footer.

## Gerenciamento e API

Rotas existentes `/login`, `/register` e `/dashboard/{linhas,funcionarios,mapa,configuracoes}` preservadas. Sessão revalidada em `/auth/me`, mutações com CSRF, logout real, CRUD por empresa e editor de pontos. Novo `PUT /auth/profile` persiste o nome do usuário sem mudança de schema.

APIs de linhas, horários, pontos, funcionários, autenticação, contato e health mantidas. PHPMailer instalado. Contato diferencia mensagem registrada de e-mail enviado; SMTP precisa de configuração e teste real. `SMTP_ENCRYPTION` aceita `tls` (padrão) ou `ssl`.

## Evidências e limites

Consulte `docs/AUDITORIA.md` e `docs/VALIDACAO.md`. Build e sintaxe PHP aprovados; health, CSRF, acesso anônimo, contato inválido e proxy verificados. Sem banco conectado: login com credenciais, CRUD persistente e SMTP ainda não validados de ponta a ponta. Nomes/perfis da equipe aguardam dados confirmados.

Graphify local em `graphify-out/`; índice estrutural parcial complementado por extração semântica dos documentos/fontes de imagens, quando registrada. Dependências e dist excluídos por `.graphifyignore`. Não usar o grafo como prova de execução funcional.

Nenhum push ou deploy foi realizado. A aprovação visual continua pertencendo ao usuário.
