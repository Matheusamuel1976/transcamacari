# Divulgação progressiva de linhas, horários e itinerários

## Intenção

Reduzir a altura excessiva das páginas de consulta sem retirar informações nem dificultar a busca. A interface deve continuar editorial, simples e acessível em desktop e celular.

## Abordagem escolhida

Foi escolhida divulgação progressiva. Paginação acrescentaria navegação desnecessária e rolagem interna criaria uma segunda área de scroll ruim no celular.

## Comportamento

- A consulta da landing mostra inicialmente 8 linhas e acrescenta mais 8 por acionamento.
- O controle informa quantas linhas ainda existem e desaparece quando todas estiverem visíveis.
- Alterar busca ou bairro reinicia a janela visível. Resultados filtrados em até 8 itens aparecem completos; conjuntos maiores continuam expansíveis.
- A linha aberta na landing permanece acessível e continua oferecendo o link para horários e itinerário completos.
- Na página de uma linha, cada grupo de horários mostra inicialmente até 12 partidas. “Ver todos os horários” expande apenas aquele grupo e “Mostrar menos” o recolhe.
- O itinerário mostra inicialmente 5 locais por sentido. “Ver itinerário completo” expande a sequência e “Mostrar menos” a recolhe.
- Trocar categoria de horário ou sentido reinicia a respectiva prévia, evitando manter conteúdo antigo aberto.
- Controles usam botões reais, `aria-expanded`, `aria-controls`, foco visível e texto com quantidade restante.
- Com JavaScript e dados disponíveis, todo conteúdo continua alcançável. Estados vazios, erros e carregamento permanecem inalterados.

## Identidade visual

Preservar tipografia, azul institucional, linhas editoriais e densidade atual. Os novos controles serão discretos, alinhados ao conteúdo e sem caixas com rolagem interna, modais ou novos padrões visuais.

## Validação

- Testes de componente verificam limite inicial, expansão, recolhimento e reinício após filtro/categoria/sentido.
- E2E confirma landing compacta, acesso às 46 linhas, detalhes e comportamento mobile.
- Executar detector Impeccable uma vez após os ajustes, além de testes, lint, build e inspeção visual desktop/mobile.

