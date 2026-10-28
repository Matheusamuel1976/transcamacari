# Arquitetura — 22/10/2026

## Separação operacional — 28/10/2026

O catálogo municipal e a operação empresarial continuam na tabela `linhas`, separados por `escopo_acesso`, `company_id` e RLS. Visitantes leem somente `catalogo_publico` publicado e visível; `admin` administra esse catálogo; `company_admin` administra `empresa_privada` da própria empresa; `funcionario` ativo lê somente linhas privadas visíveis presentes em `profile_line_assignments`.

O frontend representa esses limites com `listPublicAdmin`, `listCompany`, `getPublic` e `assigned`. Horários, itinerários e geometrias herdam o acesso da linha. A migração preparada em `20261028_isolate_public_company_operations.sql` também torna códigos empresariais rotacionáveis válidos por 30 dias e substitui UPDATE direto de perfil por `update_own_profile_name`.

Auditoria somente leitura do projeto existente encontrou 56 linhas públicas, três privadas, 14 empresas e nenhum vínculo em `profile_line_assignments`. A migração desta etapa permanece local; esses totais não foram alterados.

## Atualização de rede 2026

A transição preparada em 23/10/2026 adiciona rastreabilidade documental sem substituir o modelo existente. `transport_sources` centraliza a fonte; `linhas.situacao_rede` separa `vigente`, `historica`, `temporaria` e `nao_verificada`; horários passam a registrar local de partida e chave idempotente. Pontos podem representar evidência textual sem coordenada, enquanto o frontend continua exigindo coordenadas válidas para mapa e roteamento. Consulte [rede oficial](REDE_OFICIAL_2026.md) e [plano de publicação](PLANO_PUBLICACAO_REDE_2026.md).

> Este inventário antecede as correções funcionais. `transport.js` agora normaliza horários/valida geometrias; a landing consulta horários e geometrias persistidas, recusa coordenadas provisórias e não desenha conexões retas. Auth consulta profiles para autorização, com bloqueio seguro em caso de erro. Estado e restrições em [auditoria](AUDITORIA_CORRECOES_2026-10-22.md).

Base: master, commit `8e5b03545313a299d4e02792cd93271c601fe49a`. Checkout começou limpo em main (`2964ee4`); troca para master conforme orientação. Branches têm diferenças funcionais: não portar mudanças nesta preparação.

## Frontend
`src/main.jsx` inicializa React/roteamento/motion. `src/App.jsx` compõe páginas e guards. `components/` contém Hero, Navbar, capítulos e Magnet; `pages/` contém consulta, detalhes, autenticação e dashboard; `layouts/` organiza painel. `motion/`, `animations/` e `hooks/` coordenam GSAP/ScrollTrigger, Lenis e movimento reduzido. CSS em `styles/` e blocos locais de componentes.

## Dados e identidade
`services/supabase.js` cria cliente com variáveis Vite e sessão persistente. `AuthContext.jsx` usa Supabase Auth (getSession, onAuthStateChange, login, cadastro e atualização). `services/api.js` consulta tabelas diretamente; `services/lines.js` adapta para capítulos públicos. Guards ainda consultam propriedades herdadas de papéis: o contrato entre Auth, profiles e guards precisa de investigação própria.

### Cadastro empresarial preparado em 23/10/2026

A migração `20261023_restore_company_employee_access.sql` prepara dois fluxos de cadastro sobre o Supabase Auth: `company_admin`, que administra somente a própria empresa, e `funcionario`, que aguarda aprovação e consulta somente linhas atribuídas. O papel global `admin` permanece separado. Papéis e estados vêm de `profiles`, nunca de metadados editáveis do Auth.

`linhas.escopo_acesso` separa definitivamente `catalogo_publico` de `empresa_privada`. A landing page exige catálogo público; rotas criadas por empresas são forçadas por trigger ao escopo privado e não podem ser promovidas pela empresa. Atribuições novas usam UUID em `profile_line_assignments`; tabelas PHP numéricas permanecem preservadas e sem conversão automática.

Códigos empresariais são armazenados somente como hash e retornados ao responsável quando gerados ou rotacionados. Aprovação, suspensão e atribuição são RPCs autenticadas com validação de papel, empresa e linha. Esta migração está preparada localmente e não deve ser aplicada em produção sem autorização específica e backup.

Migração 001 contém companies, profiles, linhas, horarios, itinerary_locais, route_geometries e import_metadata, com políticas RLS; 002 contém seed de dez linhas. Código também referencia contact_messages: não assumir schema completo. Banco remoto não consultado nem alterado. `MIGRACAO_SUPABASE.md` contém instruções anteriores; alegações de segurança e idempotência exigem revisão antes de executar SQL.

## Mapas
Leaflet/OpenStreetMap. `services/routing.js` oferece Nominatim e OSRM com GeoJSON (longitude/latitude); Leaflet recebe latitude/longitude. Painel administrativo consulta geometrias persistidas. Na master, `ChapterMapa.jsx` conecta `line.points` diretamente via L.polyline. Serviço de routing disponível não significa uso em todo mapa. `services/lines.js` fornece horarios vazio ao fluxo público desta branch. Observações para a próxima investigação, sem correções.

## Infraestrutura e fronteiras
Vercel configurada em frontend/vercel.json. Vite porta 3000, proxy /api → localhost:8000 removendo prefixo. PHP MVC/PDO e schemas legados em backend/ permanecem. Nenhuma dependência de produto ou migração adicionada pela preparação.

RLS é a fronteira de acesso; guards não substituem políticas. Metadados editáveis pelo usuário não devem conceder papéis. Não registrar credenciais/dados pessoais. Geocodificação e routing dependem de serviços externos. Build não comprova Auth, banco ou mapas funcionais.
