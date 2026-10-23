# Pesquisa geográfica das linhas — 22/10/2026

## Resultado executivo

As dez linhas cadastradas foram comparadas com o documento local que originou o seed, publicações oficiais da STT e topônimos do OpenStreetMap/Nominatim. **Nenhum dos códigos S01–S06/O01–O04 aparece na carta operacional oficial vigente da STT**, atualizada em 12/08/2026. A rede atual usa códigos 01xx, 02xx, 03xx e 04xx.

O PDF local `C:\Users\freeb\Downloads\Documento sem título.pdf` contém nomes, sequências de bairros e horários, mas não informa autor, órgão emissor, data, URL, ruas, paradas ou coordenadas. Ele comprova a origem do conteúdo importado, não a oficialidade nem a posição geográfica dos pontos.

Consequência: as 20 geometrias existentes foram preservadas e nenhuma geometria nova foi gerada ou persistida. Todos os 130 locais continuam identificados como coordenadas estimadas. O frontend não apresenta esses pontos ou percursos como confiáveis e informa: **“Trajeto estimado — percurso sujeito a validação.”**

## Fontes primárias

- [Página oficial de itinerários da STT](https://stt.camacari.ba.gov.br/itinerarios/), atualização declarada em 12/08/2026.
- [Horários e principais atendimentos — agosto de 2026](https://stt.camacari.ba.gov.br/wp-content/uploads/2026/08/HORARIOS-AGOSTO-26.pdf), documento oficial de 13 páginas.
- [Carta do Conecta Camaçari publicada em 02/06/2026](https://stt.camacari.ba.gov.br/transporte-publico-stt-implementa-novos-horarios-do-conecta-camacari/).
- [Ajustes de linhas da orla, 28/04/2026](https://stt.camacari.ba.gov.br/stt-cria-nova-linha-do-conecta-camacari-e-ajusta-itinerarios-de-onibus-da-orla-e-zona-rural/).
- [Trajetos da sede, 15/12/2025](https://stt.camacari.ba.gov.br/conecta-camacari-tem-novos-horarios-e-trajetos-de-linhas-dos-onibus-na-sede/).
- [Operação Praia, 17/12/2025](https://stt.camacari.ba.gov.br/operacao-praia-stt-reforca-transporte-na-orla-com-criacao-de-novas-linhas/), usada somente quando a natureza sazonal é indicada.

OpenStreetMap/Nominatim foi usado apenas para confirmar a existência de topônimos. Um centro de bairro, relação administrativa ou ponto mapeado não prova que uma linha de ônibus passe ali.

## Critérios

- **Confirmado:** trecho ou percurso documentado diretamente por fonte oficial identificável.
- **Estimado com evidências:** corredor viário proposto a partir de atendimentos ou vias oficiais, ainda sem itinerário integral.
- **Não validado:** sequência sem fonte suficiente, com conflitos ou composta por serviços oficiais distintos.

## Resultado por linha

| Linha local | Evidência encontrada | Classificação da geometria integral |
|---|---|---|
| S01 — Centro x Glebas & Phocs | A 0210 atual confirma Praça dos 46–Phocs–Gleba E, com sentidos que não são simples reversões. Nenhuma fonte reúne Glebas A/B/C/E e Phocs na ordem local. | **Não validada**; corredor parcial com evidências. |
| S02 — Ponto Certo x Lama Preta via Gravatá/Bomba | 0203 atende Lama Preta/Camaçari de Dentro; C104 documentou Bomba/Gravatá; Ponto Certo aparece em outro eixo. Não há uma linha oficial unindo os três. | **Não validada**. |
| S03 — Limoeiro/Jardim Limoeiro x Inocoop | 0104/0104.1 confirmam Jardim Limoeiro–Centro e Ficam; 0105 confirma Centro–Inocoop. “Ficam” é ambíguo e a sequência completa não foi publicada. | **Não validada**; dois corredores parciais com evidências. |
| S04 — Verdes Horizontes x Parque Verde | 0106 confirma Verdes Horizontes–Centro; 0106.1 alcança Parque Verde I. O cadastro não distingue Parque Verde I/II e inclui bairros não documentados nessa linha. | **Não validada**; trecho parcial estimável. |
| S05 — Mangueiral x Triângulo via Burissatuba/Vera Cruz | E009 documentou Mangueiral/Gravatá; 0203.1 atende Burissatuba por outro percurso. Nome, destino salvo e sequência local divergem; a grafia oficial é Burissatuba. | **Não validada**. |
| S06 — Circular Polo Industrial | 0102 atende Boulevard; 0103 usa BA-535/Via Parafuso; 0120 liga TISO à BYD via Av. Jorge Amado/Cetrel. Nenhuma fonte confirma a sequência circular local nem acesso interno ao polo. | **Não validada**. |
| O01 — Camaçari x Abrantes/Busca Vida | A operação atual separa 0403, 0403.2 e 0404. O registro local funde serviços e inclui Via Parafuso, ausente na 0403. | **Não validada**; deve ser decomposta. |
| O02 — Camaçari x Arembepe via Aldeia Hippie | 0401 confirma Centro–Boulevard–Cascalheira–Jauá–Areias–BA-099/Arembepe. Nenhuma fonte STT consultada inclui Aldeia Hippie como terminal. | **Estimável até Arembepe**; trecho da Aldeia e linha integral não validados. |
| O03 — Camaçari x Barra do Jacuípe/Guarajuba | P004 de 2025 publicou TISO–Centro–Av. Jorge Amado–Cetrel–Caminho do Mar–BA-099–Jacuípe–Guarajuba e retorno, mas era sazonal e não passava por Arembepe. | **Estimado com evidências sazonais**, não confirmado como O03 atual. |
| O04 — Camaçari x Monte Gordo/Itacimirim/Barra do Pojuca | A STT separa 0301 direto e 0301.1 via Monte Gordo. Cita entradas de Guarajuba/Itacimirim e atendimento assimétrico a Guarajuba num sentido. | **Estimado com evidências**, mas exige variantes e sentidos separados. |

## Integridade dos dados e próximos passos

- Linhas pesquisadas: **10**.
- Sentidos cadastrados examinados: **20**.
- Pontos exatos confirmados como paradas dessas linhas locais: **0**.
- Geometrias existentes preservadas: **20**.
- Geometrias novas calculadas: **0**.
- Geometrias novas persistidas: **0**.
- Linhas integrais classificadas como confirmadas: **0/10**.

Uma próxima atualização de dados deve escolher explicitamente entre preservar um registro histórico datado ou migrar para as linhas oficiais atuais. Para migrar, cada registro precisa receber código/versão operacional, variante, sentido, lista de vias/pontos respaldada e fonte. Só então OSRM pode gerar uma proposta viária, com conferência de snapping e distância, antes de qualquer escrita autorizada no Supabase.
