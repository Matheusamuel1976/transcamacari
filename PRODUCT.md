# TransCamaçari
<!-- impeccable:product-schema 1 -->

## Platform
Web, React/Vite, português do Brasil.

## Users
Moradores e visitantes de Camaçari que consultam transporte; empresas e operadores que gerenciam informações. Papéis efetivos e isolamento devem ser validados no Supabase, sem inferi-los da interface.

## Product Purpose
Consultar linhas, bairros, destinos, horários por categoria de dia e itinerários em mapa; preservar recursos de gestão existentes.

## Capabilities and Constraints
Preservar React 18/JSX, Vite, GSAP, Lenis, Leaflet e Supabase. PHP legado permanece. Não recriar a aplicação ou trocar framework/ORM. Migrações e seed de dez linhas existem em supabase/migrations/; existência de SQL não prova aplicação/correção remota. Fonte indicada anteriormente: PDF de três páginas, não reextraído nesta preparação.

## Brand Commitments
TransCamaçari, “Caminhos que conectam — Camaçari em movimento”. Diretriz vigente: roxo (#1A237E, #12175C, #4E59AC) e branco. CSS e registros antigos podem conter escolhas anteriores; esta preparação não autoriza redesign. Não inventar equipe, fotos documentais ou dados oficiais.

## Evidence on Hand
Fontes ativas na raiz: frontend/, backend/ e supabase/. backups/ é histórico. Arquitetura em docs/architecture.md; resultados atuais em docs/setup.md e docs/quality.md. Relatórios anteriores são evidências datadas.

## Accessibility & Inclusion
Teclado, foco visível, contraste, responsividade e prefers-reduced-motion. Conteúdo e formulários utilizáveis mesmo quando animações falham.

## Critérios de aceite
Consulta trata carregamento, lista vazia e erro sem tela branca; horários mantêm categorias/formato; mapas distinguem pontos, geometria viária e estimativas; cadastro trata validação/confirmação de e-mail; acesso e escrita respeitam autorização no banco. Cada correção exige reprodução e verificação do fluxo/regressão pertinente. Critérios definidos, ainda não validados nesta preparação.
