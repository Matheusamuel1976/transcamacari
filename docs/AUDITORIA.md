# Auditoria — TransCamaçari 2.0

Base ativa: frontend React 18/Vite 5, React Router 6, GSAP/ScrollTrigger, Lenis, Leaflet, Lucide; backend PHP 8.3 MVC com PDO/MySQL e PHPMailer previsto no Composer. Não há framework SSR/hidratação. `transporte7_old` é legado estático preservado. Não há testes existentes na estrutura de código inventariada; o comando lint não tem configuração ESLint.

Rotas: `/`, `/login`, `/register`, `/dashboard`, `/dashboard/linhas`, `/dashboard/funcionarios`, `/dashboard/mapa`, `/dashboard/configuracoes`. API: autenticação, CSRF, linhas/horários/pontos, funcionários, contato e health. Isolamento de mutações por company_id no backend; não foi alterado o esquema.

Falhas verificadas por leitura e navegador:
- `gsap.from(autoAlpha:0)` com render imediato e cleanup sem restauração, agravado pelo StrictMode.
- `<style jsx>` não faz escopo no Vite e produz aviso React; classes compartilhadas se sobrescrevem.
- Lenis não cancela RAF e não respeita redução de movimento.
- Navbar dependia de ScrollTrigger para contraste, inclusive com movimento reduzido.
- Sessão frontend confiava em sessionStorage; logout não enviava token CSRF.
- Leaflet LayerGroup não fornece getBounds; filtros não redesenhavam trajetos.
- “Ver no mapa” apontava para hash sem consumidor e substituía a seção inteira por modal.
- API vazia mantinha dados de demonstração como se a consulta tivesse falhado.
- Contato ignorava mensagem do backend e anunciava envio SMTP mesmo quando só registrado.
- Painel exibia zero para contadores sem consulta; configurações eram somente locais.
- Placeholders de equipe e links `#`; favicon inexistente; foto urbana antiga sem crédito no código anterior.
- PDO com prepares nativos reutiliza :q várias vezes nas buscas, incompatível com MySQL.

Ambiente: PHP disponível; backend sem vendor/autoload.php, sem .env e sem banco provisionado confirmado. Persistência, login com credenciais e SMTP exigem validação em ambiente configurado. Não criar banco, seed ou conta sem autorização específica para alterar dados.

Direção: atlas editorial cívico. Fotografia documental de arquivo, marfim, tinta escura e vermelho de sinalização. Primeira viewport com Camaçari como título territorial, imagem urbana, tipografia editorial e acessos reais a linhas/mapa. Movimento em máscara, linha e parallax, sem esconder texto.

Referências observadas: Ray Corral, abertura tipográfica com figura central e transição para fotografia dominante; Rejouice, conteúdo e estrutura consultados. Casa di Solare permaneceu na abertura no navegador; Active Theory falhou na resolução DNS. Não alegar inspeção integral dessas experiências. React Bits Magnet baixado ao vivo do registro oficial.

Graphify instalado localmente em `.tools/graphify`; corpus detectado: 49 arquivos / ~108.826 palavras. Índice code-only é parcial: não contém semântica documental/fotográfica nem símbolos SQL (parser ausente). Não transmite corpus a APIs externas.
