# Rede oficial de transporte de Camaçari - referência 2026

Atualizado em 23/10/2026. Este documento diferencia fatos publicados, inferências cartográficas e lacunas. A preparação é local: nenhum registro desta pesquisa foi gravado no Supabase de produção.

## Fonte vigente adotada

A fonte primária é a página [Itinerários da STT](https://stt.camacari.ba.gov.br/itinerarios/), que declara atualização em 12/08/2026 e aponta para o PDF institucional [Horários Transporte Público - Conecta Camaçari - Agosto 2026](https://stt.camacari.ba.gov.br/wp-content/uploads/2026/08/HORARIOS-AGOSTO-26.pdf). O arquivo consultado tem 13 páginas, cabeçalho da Superintendência de Trânsito e Transporte Público de Camaçari, SHA-256 `5c23f1081b9a23240d37b76f2a85ba9a2d4dd2aacd8b59fad0cd46a0a07e9a2d` e abrange sede, orla e serviços de domingo/feriado. Ele não se apresenta como inventário do transporte especial rural.

A notícia oficial [STT cria nova linha e ajusta itinerários](https://stt.camacari.ba.gov.br/stt-cria-nova-linha-do-conecta-camacari-e-ajusta-itinerarios-de-onibus-da-orla-e-zona-rural/), de 28/04/2026, confirma as alterações 0301/0302 que foram consolidadas no PDF de agosto.

A notícia [Transporte público gratuito no segundo turno](https://stt.camacari.ba.gov.br/transporte-publico-gratuito-e-garantido-para-segundo-turno-das-eleicoes-na-sede-orla-e-zona-rural/), de 22/10/2026, anuncia 0103.3, 0110, 0201 e um atendimento sem código para a operação eleitoral de 25/10. Ela remete à mesma lista de itinerários e descreve operação especial; esses registros foram catalogados em `temporaryNotImported`, sem promovê-los à rede regular.

O PDF local anterior, `C:\Users\freeb\Downloads\Documento sem título.pdf`, contém S01-S06 e O01-O04, mas não identifica órgão emissor, URL, data de publicação ou vigência. Ele é preservado como origem histórica, não como prova da rede atual.

## Resultado do inventário

- 46 códigos únicos documentados: 38 serviços regulares e 8 circulares próprios de domingos/feriados.
- 1.130 registros de horário preparados, todos com tipo de dia, local de partida e chave idempotente.
- 46 serviços possuem horários e uma lista de principais atendimentos; essas listas não equivalem a uma relação de paradas exatas.
- O valor impossível `114h` da linha 0301 aos sábados foi excluído e registrado como ambiguidade. Duas repetições literais também foram deduplicadas sem inferir horários substitutos.

| Código | Nome oficial no documento | Área | Modalidade | Horários | Categorias |
|---|---|---|---|---:|---|
| 0101 | TIR x Bairro Novo/Parque das Palmeiras | sede | regular | 27 | sabado, uteis |
| 0101.1 | TIR x Bairro Novo/Parque das Palmeiras/POLOPLAST | sede | regular | 16 | sabado, uteis |
| 0102 | TIR x Verde Ville/Boulevard | sede | regular | 48 | sabado, uteis |
| 0103 | Parafuso x TIR | sede | regular | 72 | sabado, uteis |
| 0103.1 | Parafuso x TIR via Angico | sede | regular | 22 | sabado, uteis |
| 0103.2 | Parafuso x TIR via Santa Rita | sede | regular | 5 | uteis |
| 0104 | TISO (Terminal da Feira) x Jd. Limoeiro/Assembleia | sede | regular | 50 | sabado, uteis |
| 0104.1 | Jd. Limoeiro x Gravatá via Radial B/Policlínica | sede | regular | 13 | uteis |
| 0105 | TIR x Massaranduba | sede | regular | 13 | uteis |
| 0105.1 | TIR x Massaranduba (Via Conviver) | sede | regular | 12 | uteis |
| 0106 | Sitio Verde/Verdes Horizontes x TIR | sede | regular | 28 | uteis |
| 0106.1 | TIR x Sitio Verde/Verdes Horizontes/Massaranduba | sede | regular | 22 | sabado |
| 0107 | TISO (Term. Feira) x Parque das Mangabas | sede | regular | 44 | sabado, uteis |
| 0120 | TISO (Term. Feira) x BYD | sede | regular | 20 | segunda_sabado |
| 0203 | Algarobas/Lama Preta x Novo Horizonte/TIR | sede | regular | 62 | sabado, uteis |
| 0203.1 | Algarobas/Burissatuba x TIR | sede | regular | 46 | sabado, uteis |
| 0204 | TIR x UNEB | sede | regular | 44 | sabado, uteis |
| 0205 | TIR x Gravatá/Bomba | sede | regular | 45 | sabado, uteis |
| 0210 | Parque Verde II/Gleba E/Phoc x Jd. Limoeiro via IFBA | sede | regular | 62 | sabado, uteis |
| 0211 | Parque Verde II/Gleba E/Gleba C x Jd. Limoeiro via Micos | sede | regular | 64 | sabado, uteis |
| 0301 | Camaçari x Barra do Pojuca DIRETO | orla | regular | 50 | domingo_feriado, sabado, uteis |
| 0301.1 | Camaçari x Barra do Pojuca via Monte Gordo | orla | regular | 13 | sabado, uteis |
| 0301.2 | Camaçari x Tiririca via Barra do Pojuca | orla | regular | 2 | segunda_sabado |
| 0302 | Camaçari x Monte Gordo/Itaipu | orla | regular | 32 | domingo_feriado, segunda_sabado |
| 0302.1 | Camaçari x Monte Gordo/Guarajuba R1 via Itaipu/R. Ouro | orla | regular | 4 | uteis |
| 0302.2 | Camaçari x Guarajuba/Monte Gordo R2 via R. Ouro/Itaipu | orla | regular | 4 | uteis |
| 0401 | Camaçari x Arembepe | orla | regular | 52 | domingo_feriado, sabado, uteis |
| 0401.1 | Camaçari x Arembepe via Coqueiros | orla | regular | 43 | domingo_feriado, sabado, uteis |
| 0401.2 | Canto dos Pássaros x Camaçari via Arembepe | orla | regular | 21 | domingo_feriado, segunda_sabado |
| 0401.3 | Camaçari x Arembepe via CETREL | orla | regular | 8 | uteis |
| 0403 | Camaçari x Jauá/Vila de Abrantes | orla | regular | 71 | domingo_feriado, segunda_sabado |
| 0403.1 | Camaçari x Jauá | orla | regular | 8 | uteis |
| 0403.2 | Vila de Abrantes x Rodoviária via Outlet/Catu/Shopping Busca Vida/Jauá | orla | regular | 4 | domingo_feriado, todos |
| 0404 | Camaçari x Catu de Abrantes/Solar da Costa | orla | regular | 6 | segunda_sabado |
| 0405 | Camaçari x Cordoaria | orla | regular | 4 | segunda_sabado |
| 0405.1 | Camaçari x Cajazeiras/Alphaville via Cidade Arbo | orla | regular | 6 | segunda_sabado |
| 0405.2 | Camaçari x Abrantes/Cordoaria via Alphaville/Cidade Arbo | orla | regular | 2 | segunda_sabado |
| 0410 | Camaçari x Açu do Capivara/Mesqueira via Cetrel/Arembepe | orla | regular | 6 | uteis |
| C100 | Term. Feira x Jd. Limoeiro/Est. 25/Bairro Novo Circular | sede | domingo_feriado | 11 | domingo_feriado |
| C101 | Term. Feira x Algarobas/São Vicente/St. Antônio Circular. | sede | domingo_feriado | 11 | domingo_feriado |
| C102 | Term. Feira x Burissatuba/Camaçari de Dentro Circular. | sede | domingo_feriado | 10 | domingo_feriado |
| C103 | Term. Feira x Sitio Verde/Verdes Horizontes/Massaranduba Circular. | sede | domingo_feriado | 10 | domingo_feriado |
| C104 | Term. Feira x Gravatá/Bomba Circular. | sede | domingo_feriado | 5 | domingo_feriado |
| C105 | Term. Feira x Parque Verde II/Phoc/Gleba E/Gleba C Circular. | sede | domingo_feriado | 11 | domingo_feriado |
| C106 | Term. Feira x Parafuso Circular. | sede | domingo_feriado | 12 | domingo_feriado |
| C107 | Term. Feira x Verde Ville/Mangabas. | sede | domingo_feriado | 9 | domingo_feriado |

## Comparação com o cadastro anterior

Nenhuma equivalência abaixo será aplicada automaticamente. Destinos parecidos não comprovam continuidade operacional.

| Registro anterior | Evidência na rede STT 2026 | Classificação |
|---|---|---|
| S01 Centro x Glebas & Phocs | 0210, 0211 e C105 atendem partes de Glebas/Phocs | correspondência incerta; possível redistribuição |
| S02 Ponto Certo x Lama Preta | 0203 atende Lama Preta e 0205/C104 atendem Gravatá/Bomba | possível desmembramento; sem equivalência documental |
| S03 Limoeiro x Inocoop | 0104/0105/0210/0211 cobrem trechos distintos | serviço histórico sem correspondência única |
| S04 Verdes Horizontes x Parque Verde | 0102, 0106, C103 e C107 cobrem partes distintas | possível redistribuição; correspondência incerta |
| S05 Mangueiral x Triângulo | 0205/C104 citam Mangueiral, Gravatá e Bomba | correspondência parcial, não comprovada |
| S06 Circular Polo Industrial | 0120 atende BYD/Cetrel, sem provar continuidade do circular | sem correspondência documental suficiente |
| O01 Sede x Abrantes/Busca Vida | 0403, 0403.2 e 0404 atendem Jauá/Abrantes/Busca Vida | provável rede desmembrada; não é a mesma linha comprovada |
| O02 Sede x Arembepe | 0401 e variantes atendem Arembepe | linha equivalente com variantes, mas sem vínculo formal com O02 |
| O03 Sede x Barra do Jacuípe/Guarajuba | 0301 e variantes atendem o corredor | possível substituição; código e operação mudaram |
| O04 Sede x Monte Gordo/Itacimirim/Barra do Pojuca | 0301/0302 e variantes repartem o corredor | provável desmembramento; não transferir horários/geometria |

## Geografia e roteamento

A documentação oficial informa atendimentos principais, e não coordenadas de paradas. Consultas ao OpenStreetMap/Nominatim em 23/10/2026 localizaram objetos cartográficos para Feira de Camaçari, HGC, Via Atlântica, BA-099, Barra do Jacuípe, Estrada Velha de Monte Gordo, Rua do Ouro e Rua Itaipu. O nome Corujão não retornou correspondência inequívoca.

Somente a linha 0302 recebeu candidatos viários locais, porque a sequência documental e os objetos cartográficos permitiram uma hipótese auditável:

| Sentido | Distância OSRM | Vértices | Maior distância waypoint-geometria | Estado |
|---|---:|---:|---:|---|
| ida | 52.846,7 m | 1.119 | 46,7 m | estimado com evidências |
| volta | 54.107,2 m | 1.164 | 46,7 m | estimado com evidências |

Os arquivos `data/geography/0302-ida-candidate.geojson.json` e `data/geography/0302-volta-candidate.geojson.json` registram waypoints, objetos OSM, métricas e limitações. `supabase/data/official_route_candidates_2026.sql` prepara 16 pontos e duas geometrias, sem sobrescrever uma rota `reviewed` ou `official`. A interface deve exibir: **Trajeto estimado — percurso sujeito a validação.**

As demais 45 linhas estão bloqueadas para geometria: a fonte fornece localidades atendidas, mas não uma ordem de ruas/paradas suficiente para afirmar o percurso. Criar uma polyline ou aceitar a sugestão mais curta do OSRM produziria aparência convincente sem evidência operacional.

## Critérios de confiança

- **Confirmado documentalmente:** código, nome, principais atendimentos e horários presentes no PDF da STT.
- **Estimado com evidências:** coordenada de objeto OSM coerente com um atendimento publicado ou geometria OSRM que passa por esses objetos; não confirma parada nem operação do ônibus.
- **Não validado:** dado legado, local ambíguo ou percurso sem sequência documental suficiente.

## Artefatos reproduzíveis

- `data/official-network-2026.json`: inventário normalizado, fonte, checksum, ambiguidades e 1.130 horários.
- `scripts/generate-official-network-sql.mjs`: gera importação SQL idempotente.
- `supabase/data/official_network_2026.sql`: resultado revisável, sem execução automática.
- `scripts/generate-route-candidate-sql.mjs`: gera persistência segura dos dois candidatos 0302.
- `supabase/data/official_route_candidates_2026.sql`: resultado revisável, sem execução automática.
- `scripts/render-route-review.py`: produz uma revisão esquemática local dos dois sentidos e dos pontos de evidência; não substitui a inspeção sobre mapa viário.
