# Sistema de movimento — 14/10/2026

Escopo: refinamento de motion sobre a interface Turismo & Logística existente. Backend, endpoints, dados, CRUD e credenciais não foram modificados nesta etapa. Backup anterior em `../../backups/motion-before-20261014-171059` (fontes e assets; sem dependências e .env).

## Auditoria e referência
Consultada a branch `v6.4.3-vercel` de Imfreefr/EdgeSecurity, commit c9776236321ed5adf1705d2501bf4e575d123f4c. Fontes: src/landing/LandingPage.jsx, RouteTransition.jsx e TypographicIntro.jsx. Princípios aproveitados: máscaras de palavras, enquadramento fotográfico, expo.out, sobreposição temporal e cleanup. Nenhum código ou recurso externo foi executado.

Conflitos encontrados: preloader e hero com relógios separados; links de formulário fora do controlador; fade azul em mobile/auth; offsets duplicados pelo scroll-margin do CSS e Lenis; dimensões antigas ao retornar à landing; disputa entre eventos de scroll e restauração POP; preferência de movimento inicializada como false; entrada de página concorrendo com a hero.

## Arquitetura e ritmo
- Hero: uma timeline GSAP, 1,45 s, sem espera artificial. Fotografia enquadrada, título por palavra, frase por máscara, texto, CTA, navbar e trajeto com sobreposição. Parallax apenas desktop com ponteiro preciso.
- TransitionProvider: controlador existente reaproveitado, com saída/entrada, watchdog, navegação sem overlay para hashes e cancelamento por POP.
- TransitionOverlay: painel cinza-claro direcional com trajeto laranja e marca azul. Saída 420 ms, entrada 480 ms. Sem véu azul. Troca entre formulários atua no card em 160 ms.
- AnimatedPage: entrada dos elementos do formulário em sequência; conteúdo administrativo com 200 ms. A hero possui sua própria entrada.
- ScrollManager + scroll.js: um dono do scroll, Lenis único, coordenada numérica para evitar dupla margem, resize antes de navegar, histórico por chave e tentativas canceláveis ao aguardar seções.
- useChapterMotion: busca por máscara, painéis de mapa por sequência, tecnologias e equipe por grupos, fechamento tipográfico. Cidade e Caminhos conservam seus próprios contextos e animações de trajeto.
- Leaflet: canvas e instância não são animados, recriados ou alterados pelo novo sistema.
- Acessibilidade: preferência lida já na inicialização; timelines revertidas no cleanup; links preservam modificadores; foco em título/formulário; movimento CSS incidental desativado em reduce. A composição continua visível por padrão.

## Validação
Build de produção passou. Navegador real: desktop 1440×900 e mobile 390×844. Hero/reload, landing→login, login↔cadastro, navbar, âncoras na mesma rota e login→âncora, busca por bairro, menu mobile, mapa com tiles carregados, módulos Linhas/Funcionários/mapa administrativo e logout com sessão real. Nenhum registro foi criado ou editado. Usuário realizou o login; chegada autenticada ao dashboard verificada, mas a animação desse login não foi capturada.

O teste de âncora revelou e corrigiu o offset duplicado: mapa desktop termina a aproximadamente 98 px do topo; mobile aproximadamente 86 px. Overlay permanece hidden durante navegação por hash.

## Evidências em movimento
Arquivos locais em `../../.impeccable/motion-review/`: desktop.mp4, mobile.mp4, routes.mp4, auth.mp4, dashboard.mp4, logout.mp4, anchors.mp4 e mobile-scroll.mp4. Capturas sequenciais reais do navegador, codificadas com duração por timestamp; não são animações simuladas nem medição de FPS da aplicação. Os JSONs guardam os tempos originais. Os vídeos administrativos podem conter os dados da conta local e devem permanecer locais.

## Limitações reais
- Movimento reduzido revisado no código; o navegador disponível não expõe emulação de prefers-reduced-motion para uma validação visual independente.
- Não há logomarcas reais nem nomes/fotos dos desenvolvedores nos assets atuais: conteúdo preservado, sem inventar perfis ou símbolos.
- Não foram testados envios SMTP, criação/edição de registros ou novos cadastros, fora do escopo de motion.
- Nenhum push ou deploy realizado.
- Graphify: índice de código atualizado; CSS, fontes, vídeos e este relatório não são cobertos integralmente por extração AST. Conhecimento arquitetural registrado separadamente como memória verificada.

## Arquivos modificados
- `frontend/src/App.jsx`
- `frontend/src/components/Hero.jsx`
- `frontend/src/hooks/useLenis.js`
- `frontend/src/hooks/useReducedMotion.js`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/motion/AnimatedPage.jsx`
- `frontend/src/motion/motion.css`
- `frontend/src/motion/scroll.js`
- `frontend/src/motion/ScrollManager.jsx`
- `frontend/src/motion/TransitionContext.jsx`
- `frontend/src/motion/TransitionOverlay.jsx`
- `frontend/src/motion/useChapterMotion.js`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/components/chapters/ChapterCaminhos.jsx`
- `frontend/src/components/chapters/ChapterCidade.jsx`
- `frontend/src/pages/auth/LoginPage.jsx`
- `frontend/src/pages/auth/RegisterPage.jsx`
