# TransCamaçari — direção e escopo da revisão

Modo: Persuade na landing; Operate no gerenciamento. Pedido original: reconstrução dentro da pasta existente, prioridade Ray Corral, conteúdo visível, GSAP/ScrollTrigger/React Bits reais, fotografia documental contextualizada, mapas/autenticação/CRUD/contato preservados, sem push/deploy.

Direção aplicada: atlas editorial cívico; marfim #f1efe7, tinta #222720, verde #27372b, vermelho #b33b28 e linha dourada #d6bc62. Space Grotesk/DM Sans existentes, Bodoni Moda local em ênfases editoriais. Sem fotografias das referências nem fotografias documentais geradas.

Primeira viewport: título territorial CAMAÇARI, “em movimento.” em itálico, texto curto à esquerda, fotografia urbana de arquivo à direita, CTA circular para consulta e acesso explícito ao mapa. Navbar clara fixa com acesso ao gerenciamento. No mobile, foto e ações se reorganizam verticalmente.

Interação assinatura: a linha conecta texto e fotografia na entrada; máscara revela a fotografia; imagem e frase respondem ao scroll. React Bits Magnet no CTA, com deslocamento limitado e redução de movimento. Cidade tem parallax fotográfico; Caminhos desenha a linha pelo scroll e permite escolher etapas por tabs acessíveis. Conteúdo textual não recebe opacity:0 nos reveals.

Ritmo: hero tipográfica/fotográfica → território com foto de Arembepe → capítulo verde com diagrama e tabs → consulta em lista editorial → mapa com controles → informação em vermelho → projeto → contato e assinatura no footer. Não repetir grades de cards.

Funcionalidade: busca sem acentos, filtro de bairro, detalhes inline, seleção de linha comunicada ao mapa, geolocalização sob solicitação, controle de enquadramento, vazio e erro, rótulos de demonstração, sessão revalidada no servidor e CSRF no logout. Perfil tem endpoint persistente sem mudança de esquema. CRUD e isolamento por empresa preservados.

Estado do processo: implementação direta, conforme prioridade do brief de mostrar hero funcional antes da expansão. Não houve aprovação de mock raster nem aprovação visual do usuário. O script Impeccable permaneceu em comps por seu padrão; isso não é evidência de aprovação, e a revisão deve declarar essa limitação. Nenhuma preferência de workflow foi salva sem resposta.

Limitações de QA: banco indisponível; API /linhas responde 500 com mensagem de conexão. PHP/Composer e PHPMailer instalados, sessão/CSRF/validação testados sem escrita em banco. Não houve login autenticado, CRUD persistente ou envio SMTP. Capturas do painel autenticado não devem ser fabricadas. prefers-reduced-motion verificado em código; emulação não disponível na ferramenta de navegador.
