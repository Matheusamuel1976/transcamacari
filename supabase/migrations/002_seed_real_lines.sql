-- TransCamaçari — Idempotent seed for the 10 real lines from PDF source
-- Source: C:\Users\freeb\Downloads\Documento sem título.pdf (3 pages)
-- Import date: 2026-10-21
-- This seed is idempotent: running it multiple times does not duplicate lines or schedules.

DO $$
DECLARE
  demo_company BIGINT;
  l BIGINT;
  linha_codigo VARCHAR(20);
  linha_nome VARCHAR(150);
  linha_bairro VARCHAR(120);
  linha_origem VARCHAR(150);
  linha_destino VARCHAR(150);
  linha_categoria TEXT;
  h_categoria TEXT;
  h_horario TIME;
  h_ordem INT := 0;
  i_ordem INT := 0;
  i_nome VARCHAR(150);
  i_lat NUMERIC(10,7);
  i_lng NUMERIC(10,7);
  i_tipo TEXT;
  i_sentido TEXT;
  v_count INT;
BEGIN
  -- Ensure demo company exists (idempotent)
  SELECT id INTO demo_company FROM companies WHERE nome = 'TransCamaçari — Dados Públicos (PDF)';
  IF demo_company IS NULL THEN
    INSERT INTO companies (nome) VALUES ('TransCamaçari — Dados Públicos (PDF)') RETURNING id INTO demo_company;
  END IF;

  -- Helper: ensure linha exists (idempotent by codigo)
  -- S01 — Centro x Glebas & Phocs
  linha_codigo := 'S01';
  linha_nome := 'Centro x Glebas & Phocs';
  linha_bairro := 'Centro / Glebas / Phocs';
  linha_origem := 'Terminal Central';
  linha_destino := 'Phoc III (Tancredo Neves)';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  -- Horarios S01 — uteis
  h_ordem := 0;
  FOR h_categoria, h_horario IN
    SELECT 'uteis'::text, unnest(ARRAY['05:30','06:15','07:00','07:45','08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:15','18:00','18:45','19:30','20:30','21:30','22:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  -- Horarios S01 — sabado
  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:30','22:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  -- Horarios S01 — domingo_feriado
  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:30','08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  -- Itinerary locais S01 — ida
  i_ordem := 0;
  FOR i_sentido, i_nome, i_lat, i_lng, i_tipo IN
    SELECT 'ida', unnest(ARRAY[
      'Terminal Central','Centro','Bairro dos 46','Gleba A','Gleba B','Gleba C (Ulisses Guimarães)','Gleba E','Phoc I','Phoc II','Phoc III (Tancredo Neves)'
    ]::text[]), unnest(ARRAY[
      -12.6975::numeric,-12.7000,-12.7100,-12.7200,-12.7300,-12.7400,-12.7500,-12.7600,-12.7700,-12.7800
    ]), unnest(ARRAY[
      -38.3242::numeric,-38.3200,-38.3150,-38.3100,-38.3050,-38.3000,-38.2950,-38.2900,-38.2850,-38.2800
    ]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- Itinerary locais S01 — volta (reverse order)
  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Phoc III (Tancredo Neves)','Phoc II','Phoc I','Gleba E','Gleba C (Ulisses Guimarães)','Gleba B','Gleba A','Bairro dos 46','Centro','Terminal Central']::text[]), unnest(ARRAY[-12.7800,-12.7700,-12.7600,-12.7500,-12.7400,-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2800,-38.2850,-38.2900,-38.2950,-38.3000,-38.3050,-38.3100,-38.3150,-38.3200,-38.3242]), unnest(ARRAY['destino','parada','parada','parada','parada','parada','parada','parada','parada','origem']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- S02 — Ponto Certo x Lama Preta (Via Gravatá & Bomba)
  linha_codigo := 'S02';
  linha_nome := 'Ponto Certo x Lama Preta (Via Gravatá & Bomba)';
  linha_bairro := 'Ponto Certo / Gravatá / Bomba / Centro / Lama Preta';
  linha_origem := 'Ponto Certo';
  linha_destino := 'Lama Preta';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:40','06:20','07:00','07:40','08:20','09:00','10:00','11:00','12:00','12:40','13:20','14:00','15:00','16:00','16:40','17:20','18:00','18:40','19:30','20:30','21:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:30','08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Ponto Certo','Gravatá','Bomba','Centro','Camaçari de Dentro','Piacaveira','Lama Preta']::text[]), unnest(ARRAY[-12.6900,-12.7000,-12.7100,-12.6975,-12.6800,-12.6700,-12.6600]), unnest(ARRAY[-38.3200,-38.3150,-38.3100,-38.3242,-38.3300,-38.3350,-38.3400]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Lama Preta','Piacaveira','Camaçari de Dentro','Centro','Bomba','Gravatá','Ponto Certo']::text[]), unnest(ARRAY[-12.6600,-12.6700,-12.6800,-12.6975,-12.7100,-12.7000,-12.6900]), unnest(ARRAY[-38.3400,-38.3350,-38.3300,-38.3242,-38.3100,-38.3150,-38.3200]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- S03 — Limoeiro / Jardim Limoeiro x Inocoop
  linha_codigo := 'S03';
  linha_nome := 'Limoeiro / Jardim Limoeiro x Inocoop';
  linha_bairro := 'Bairro Novo / Jardim Limoeiro / Limoeiro / Centro / Inocoop';
  linha_origem := 'Bairro Novo';
  linha_destino := 'Ficam';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:50','06:30','07:10','07:50','08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:10','17:50','18:30','19:10','20:00','21:00','22:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:15','07:15','08:15','09:15','10:15','11:15','12:15','13:15','14:15','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['07:00','08:30','10:00','11:30','13:00','14:30','16:00','17:30','19:00','20:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Bairro Novo','Jardim Limoeiro','Limoeiro','Centro','Dois de Julho','Inocoop (Bela Vista)','Ficam']::text[]), unnest(ARRAY[-12.7000,-12.7100,-12.7200,-12.6975,-12.6900,-12.6800,-12.6700]), unnest(ARRAY[-38.3100,-38.3050,-38.3000,-38.3242,-38.3300,-38.3350,-38.3400]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Ficam','Inocoop (Bela Vista)','Dois de Julho','Centro','Limoeiro','Jardim Limoeiro','Bairro Novo']::text[]), unnest(ARRAY[-12.6700,-12.6800,-12.6900,-12.6975,-12.7200,-12.7100,-12.7000]), unnest(ARRAY[-38.3400,-38.3350,-38.3300,-38.3242,-38.3000,-38.3050,-38.3100]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- S04 — Verdes Horizontes x Parque Verde
  linha_codigo := 'S04';
  linha_nome := 'Verdes Horizontes x Parque Verde';
  linha_bairro := 'Verdes Horizontes / Novo Horizonte / Centro / Parque Verde';
  linha_origem := 'Verdes Horizontes';
  linha_destino := 'Parque Verde';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','06:10','06:50','07:30','08:10','09:00','10:00','11:00','12:00','12:40','13:20','14:00','15:00','16:00','16:40','17:20','18:00','18:40','19:30','20:30','21:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:30','08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Verdes Horizontes','Novo Horizonte','Centro','Alto da Cruz','Parque Satélite','Parque Florestal','Parque Verde']::text[]), unnest(ARRAY[-12.7000,-12.7100,-12.6975,-12.6900,-12.6800,-12.6700,-12.6600]), unnest(ARRAY[-38.3100,-38.3050,-38.3242,-38.3300,-38.3350,-38.3400,-38.3450]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Parque Verde','Parque Florestal','Parque Satélite','Alto da Cruz','Centro','Novo Horizonte','Verdes Horizontes']::text[]), unnest(ARRAY[-12.6600,-12.6700,-12.6800,-12.6900,-12.6975,-12.7100,-12.7000]), unnest(ARRAY[-38.3450,-38.3400,-38.3350,-38.3300,-38.3242,-38.3050,-38.3100]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- S05 — Mangueiral x Triângulo (Via Burisatuba & Vera Cruz)
  linha_codigo := 'S05';
  linha_nome := 'Mangueiral x Triângulo (Via Burisatuba & Vera Cruz)';
  linha_bairro := 'Mangueiral / Bom Viver / Burisatuba / Vera Cruz / Triângulo / Centro';
  linha_origem := 'Mangueiral';
  linha_destino := 'Centro';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:45','06:25','07:05','07:45','08:25','09:15','10:15','11:15','12:15','13:15','14:15','15:15','16:15','16:55','17:35','18:15','19:00','20:00','21:00','22:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:15','08:30','09:45','11:00','12:15','13:30','14:45','16:00','17:30','19:00','20:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:30','08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Mangueiral','Bom Viver','Burisatuba','Morro de Santana/Manteiga','Vera Cruz','Triângulo','Centro']::text[]), unnest(ARRAY[-12.7100,-12.7000,-12.6900,-12.6800,-12.6975,-12.7000,-12.6975]), unnest(ARRAY[-38.3000,-38.2950,-38.2900,-38.2850,-38.3242,-38.3100,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Centro','Triângulo','Vera Cruz','Morro de Santana/Manteiga','Burisatuba','Bom Viver','Mangueiral']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.6975,-12.6800,-12.6900,-12.7000,-12.7100]), unnest(ARRAY[-38.3242,-38.3100,-38.3242,-38.2850,-38.2900,-38.2950,-38.3000]), unnest(ARRAY['origem','parada','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- S06 — Circular Polo Industrial
  linha_codigo := 'S06';
  linha_nome := 'Circular Polo Industrial';
  linha_bairro := 'Terminal Rodoviário / Boulevard Shopping / Via Parafuso / Polo Petroquímico';
  linha_origem := 'Terminal Rodoviário';
  linha_destino := 'Polo Petroquímico';
  linha_categoria := 'sede';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:00','05:30','06:00','06:30','07:00','07:30','08:00','11:30','12:30','13:30','16:30','17:00','17:30','18:00','18:30','21:30','22:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','06:30','07:30','12:30','13:30','17:30','18:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','07:00','13:00','17:30','21:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Terminal Rodoviário','Boulevard Shopping','Via Parafuso','Complexo Industrial Ford/BYD','Polo Petroquímico']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.7100,-12.7200,-12.7300]), unnest(ARRAY[-38.3242,-38.3100,-38.2900,-38.2700,-38.2500]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Polo Petroquímico','Complexo Industrial Ford/BYD','Via Parafuso','Boulevard Shopping','Terminal Rodoviário']::text[]), unnest(ARRAY[-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2500,-38.2700,-38.2900,-38.3100,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- O01 — Camaçari (Sede) x Vila de Abrantes / Busca Vida
  linha_codigo := 'O01';
  linha_nome := 'Camaçari (Sede) x Vila de Abrantes / Busca Vida';
  linha_bairro := 'Sede / Via Parafuso / BA-099 / Jauá / Vila de Abrantes / Busca Vida';
  linha_origem := 'Terminal Central (Sede)';
  linha_destino := 'Acesso Busca Vida';
  linha_categoria := 'orla';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:00','05:40','06:20','07:00','07:40','08:20','09:10','10:00','11:00','12:00','13:00','14:00','15:00','16:00','16:40','17:20','18:00','18:40','19:30','20:30','21:40']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','06:30','07:30','08:30','09:30','10:30','11:30','12:30','13:30','14:30','16:00','17:30','19:00','20:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:30','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Terminal Central (Sede)','Via Parafuso','BA-099','Jauá','Vila de Abrantes','Acesso Busca Vida']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.7100,-12.7200,-12.7300,-12.7400]), unnest(ARRAY[-38.3242,-38.3100,-38.2900,-38.2700,-38.2500,-38.2300]), unnest(ARRAY['origem','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Acesso Busca Vida','Vila de Abrantes','Jauá','BA-099','Via Parafuso','Terminal Central (Sede)']::text[]), unnest(ARRAY[-12.7400,-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2300,-38.2500,-38.2700,-38.2900,-38.3100,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- O02 — Camaçari (Sede) x Arembepe (Via Aldeia Hippie)
  linha_codigo := 'O02';
  linha_nome := 'Camaçari (Sede) x Arembepe (Via Aldeia Hippie)';
  linha_bairro := 'Sede / Estrada da Cascalheira / BA-099 / Arembepe / Aldeia Hippie';
  linha_origem := 'Terminal Central (Sede)';
  linha_destino := 'Entroncamento Aldeia Hippie';
  linha_categoria := 'orla';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:15','05:50','06:25','07:00','07:35','08:10','08:50','09:30','10:15','11:00','11:45','12:30','13:15','14:00','14:45','15:30','16:15','16:50','17:25','18:00','18:40','19:20','20:10','21:00','22:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','06:15','07:00','07:45','08:30','09:15','10:00','10:45','11:30','12:15','13:00','13:45','14:30','15:30','16:30','17:30','18:30','19:30','21:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:30']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Terminal Central (Sede)','Estrada da Cascalheira','BA-099','Arembepe (Terminal)','Entroncamento Aldeia Hippie']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.7100,-12.7200,-12.7300]), unnest(ARRAY[-38.3242,-38.3000,-38.2800,-38.2600,-38.2400]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Entroncamento Aldeia Hippie','Arembepe (Terminal)','BA-099','Estrada da Cascalheira','Terminal Central (Sede)']::text[]), unnest(ARRAY[-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2400,-38.2600,-38.2800,-38.3000,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- O03 — Camaçari (Sede) x Barra do Jacuípe / Guarajuba
  linha_codigo := 'O03';
  linha_nome := 'Camaçari (Sede) x Barra do Jacuípe / Guarajuba';
  linha_bairro := 'Sede / BA-099 / Arembepe / Barra do Jacuípe / Guarajuba';
  linha_origem := 'Terminal Central (Sede)';
  linha_destino := 'Guarajuba (Acesso Praia / Terminal)';
  linha_categoria := 'orla';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:20','06:00','06:40','07:20','08:00','08:45','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:10','16:50','17:30','18:10','19:00','20:00','21:15']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:45','06:30','07:15','08:00','08:45','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:30','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:15','08:30','09:45','11:00','12:15','13:30','14:45','16:00','17:15','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Terminal Central (Sede)','BA-099','Arembepe','Barra do Jacuípe','Guarajuba (Acesso Praia / Terminal)']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.7100,-12.7200,-12.7300]), unnest(ARRAY[-38.3242,-38.3000,-38.2800,-38.2600,-38.2400]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Guarajuba (Acesso Praia / Terminal)','Barra do Jacuípe','Arembepe','BA-099','Terminal Central (Sede)']::text[]), unnest(ARRAY[-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2400,-38.2600,-38.2800,-38.3000,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- O04 — Camaçari (Sede) x Monte Gordo / Itacimirim / Barra do Pojuca
  linha_codigo := 'O04';
  linha_nome := 'Camaçari (Sede) x Monte Gordo / Itacimirim / Barra do Pojuca';
  linha_bairro := 'Sede / BA-099 / Guarajuba / Monte Gordo / Itacimirim / Barra do Pojuca';
  linha_origem := 'Terminal Central (Sede)';
  linha_destino := 'Barra do Pojuca';
  linha_categoria := 'orla';

  SELECT id INTO l FROM linhas WHERE codigo = linha_codigo;
  IF l IS NULL THEN
    INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, categoria, publicado, origem_dados, data_importacao)
    VALUES (demo_company, linha_codigo, linha_nome, linha_bairro, linha_origem, linha_destino, linha_categoria, TRUE, 'PDF Documento sem título', NOW()) RETURNING id INTO l;
  ELSE
    UPDATE linhas SET nome = linha_nome, bairro = linha_bairro, origem = linha_origem, destino = linha_destino, categoria = linha_categoria, publicado = TRUE, origem_dados = 'PDF Documento sem título', data_importacao = NOW() WHERE id = l;
  END IF;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:00','05:45','06:30','07:15','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','16:45','17:30','18:15','19:15','20:30','21:45']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'uteis' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'uteis', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['05:30','06:30','07:30','08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','17:00','18:30','20:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'sabado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'sabado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  h_ordem := 0;
  FOR h_horario IN SELECT unnest(ARRAY['06:00','07:30','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00']::time[])
  LOOP
    DELETE FROM horarios WHERE linha_id = l AND categoria = 'domingo_feriado' AND ordem = h_ordem;
    INSERT INTO horarios (linha_id, horario, categoria, ordem) VALUES (l, h_horario, 'domingo_feriado', h_ordem);
    h_ordem := h_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Terminal Central (Sede)','BA-099','Guarajuba','Monte Gordo (Centro)','Itacimirim','Barra do Pojuca']::text[]), unnest(ARRAY[-12.6975,-12.7000,-12.7100,-12.7200,-12.7300,-12.7400]), unnest(ARRAY[-38.3242,-38.3000,-38.2800,-38.2600,-38.2400,-38.2200]), unnest(ARRAY['origem','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'ida' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'ida', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  i_ordem := 0;
  FOR i_nome, i_lat, i_lng, i_tipo IN
    SELECT unnest(ARRAY['Barra do Pojuca','Itacimirim','Monte Gordo (Centro)','Guarajuba','BA-099','Terminal Central (Sede)']::text[]), unnest(ARRAY[-12.7400,-12.7300,-12.7200,-12.7100,-12.7000,-12.6975]), unnest(ARRAY[-38.2200,-38.2400,-38.2600,-38.2800,-38.3000,-38.3242]), unnest(ARRAY['origem','parada','parada','parada','parada','destino']::text[])
  LOOP
    DELETE FROM itinerary_locais WHERE linha_id = l AND sentido = 'volta' AND ordem = i_ordem;
    INSERT INTO itinerary_locais (linha_id, sentido, ordem, nome, latitude, longitude, tipo, geocoding_source) VALUES (l, 'volta', i_ordem, i_nome, i_lat, i_lng, i_tipo, 'estimated');
    i_ordem := i_ordem + 1;
  END LOOP;

  -- Record import metadata
  SELECT count(*) INTO v_count FROM linhas WHERE codigo LIKE 'S%' OR codigo LIKE 'O%';
  INSERT INTO import_metadata (fonte, linhas_importadas, observacoes)
  VALUES ('PDF Documento sem título (3 páginas)', v_count, '10 linhas importadas: S01-S06 (sede), O01-O04 (orla). Horários estruturados por categoria: uteis, sabado, domingo_feriado. Coordenadas são estimativas — requerem geocodificação real.');
END $$;