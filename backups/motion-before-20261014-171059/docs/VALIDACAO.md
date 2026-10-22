# Validação da reconstrução visual

## Verificado
- Build Vite de produção concluído.
- Sintaxe dos 12 arquivos PHP de aplicação aprovada; PHPMailer carregado via Composer.
- HTTP local: `/health` 200; mutação sem CSRF 419; funcionários anônimo 401; contato inválido com CSRF 422; logout com CSRF 200; proxy Vite→PHP health 200 e sessão anônima 401.
- `/linhas` responde 500: banco não conectado. A interface identifica exemplos fictícios e não anuncia dados oficiais.
- Navegador desktop 1440×900 e mobile 390×844: fotografias locais carregadas, oito seções visíveis, sem overflow horizontal do documento.
- Busca sem acentos: “jaua” encontra Jauá. Detalhes inline e horários fictícios visíveis, “Ver no mapa” seleciona o mesmo exemplo. Filtro vazio no mapa remove seleção e informa nenhum resultado; enquadramento disponível.
- Tabs de narrativa respondem a ArrowRight. Menu mobile abre, navega e fecha. `/dashboard` sem sessão redireciona ao login.
- Contato está dentro do footer, com honeypot controlado, validação nativa e resposta do backend preservada.

## Limites
Não há conexão de banco configurada e confirmada. Login com credenciais, CRUD persistente, mudança de perfil e SMTP não foram testados de ponta a ponta. Não foi criado banco, seed ou conta. O schema permaneceu intacto.

Redução de movimento tratada em fonte/CSS e no componente Magnet; a ferramenta de browser não oferece emulação dessa preferência. GPS depende da permissão/disponibilidade do navegador; resultado da verificação é registrado após retorno, sem afirmar posição real.

Capturas em `../../.impeccable/review/`: hero-desktop.jpg, hero-mobile.jpg, desktop.jpg, mobile.jpg, login-mobile.jpg. Não são aprovação visual do usuário. O roteiro Impeccable de mock raster não foi fechado; a implementação priorizou a hero funcional solicitada, e a revisão avalia o artefato real.
