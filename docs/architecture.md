# Arquitetura — 22/10/2026

> Este inventário antecede as correções funcionais. `transport.js` agora normaliza horários/valida geometrias; a landing consulta horários e geometrias persistidas, recusa coordenadas provisórias e não desenha conexões retas. Auth consulta profiles para autorização, com bloqueio seguro em caso de erro. Estado e restrições em [auditoria](AUDITORIA_CORRECOES_2026-10-22.md).

Base: master, commit `8e5b03545313a299d4e02792cd93271c601fe49a`. Checkout começou limpo em main (`2964ee4`); troca para master conforme orientação. Branches têm diferenças funcionais: não portar mudanças nesta preparação.

## Frontend
`src/main.jsx` inicializa React/roteamento/motion. `src/App.jsx` compõe páginas e guards. `components/` contém Hero, Navbar, capítulos e Magnet; `pages/` contém consulta, detalhes, autenticação e dashboard; `layouts/` organiza painel. `motion/`, `animations/` e `hooks/` coordenam GSAP/ScrollTrigger, Lenis e movimento reduzido. CSS em `styles/` e blocos locais de componentes.

## Dados e identidade
`services/supabase.js` cria cliente com variáveis Vite e sessão persistente. `AuthContext.jsx` usa Supabase Auth (getSession, onAuthStateChange, login, cadastro e atualização). `services/api.js` consulta tabelas diretamente; `services/lines.js` adapta para capítulos públicos. Guards ainda consultam propriedades herdadas de papéis: o contrato entre Auth, profiles e guards precisa de investigação própria.

Migração 001 contém companies, profiles, linhas, horarios, itinerary_locais, route_geometries e import_metadata, com políticas RLS; 002 contém seed de dez linhas. Código também referencia contact_messages: não assumir schema completo. Banco remoto não consultado nem alterado. `MIGRACAO_SUPABASE.md` contém instruções anteriores; alegações de segurança e idempotência exigem revisão antes de executar SQL.

## Mapas
Leaflet/OpenStreetMap. `services/routing.js` oferece Nominatim e OSRM com GeoJSON (longitude/latitude); Leaflet recebe latitude/longitude. Painel administrativo consulta geometrias persistidas. Na master, `ChapterMapa.jsx` conecta `line.points` diretamente via L.polyline. Serviço de routing disponível não significa uso em todo mapa. `services/lines.js` fornece horarios vazio ao fluxo público desta branch. Observações para a próxima investigação, sem correções.

## Infraestrutura e fronteiras
Vercel configurada em frontend/vercel.json. Vite porta 3000, proxy /api → localhost:8000 removendo prefixo. PHP MVC/PDO e schemas legados em backend/ permanecem. Nenhuma dependência de produto ou migração adicionada pela preparação.

RLS é a fronteira de acesso; guards não substituem políticas. Metadados editáveis pelo usuário não devem conceder papéis. Não registrar credenciais/dados pessoais. Geocodificação e routing dependem de serviços externos. Build não comprova Auth, banco ou mapas funcionais.
