-- TransCamaçari 2.0 — SEED DEMO (dados explicitamente FICTÍCIOS para desenvolvimento)
-- NÃO são linhas oficiais. Uso: mysql -u root transcamacari < seed_demo.sql
-- Login demo: demo@transcamacari.local / demo12345
USE transcamacari;

INSERT INTO companies (nome) VALUES ('DEMO — Empresa Fictícia (dados de teste)');

SET @demo_company = LAST_INSERT_ID();

INSERT INTO users (company_id, name, email, password_hash, role) VALUES
(@demo_company, 'Usuário Demo', 'demo@transcamacari.local',
'$argon2id$v=19$m=65536,t=4,p=1$bFJOWmo5YWsuekg5LjNzLw$15Ux3v1bToSIm9OT3svIS1j9KwuI1c/7JqlBjEuzgLE',
'admin');

INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, visivel) VALUES
(@demo_company, 'D01', 'DEMO Centro / Jauá', 'Jauá (fictício)', 'Terminal Centro (fictício)', 'Jauá (fictício)', 1),
(@demo_company, 'D02', 'DEMO Centro / Abrantes', 'Vila de Abrantes (fictício)', 'Terminal Centro (fictício)', 'Abrantes (fictício)', 1);

SET @l1 = (SELECT id FROM linhas WHERE company_id = @demo_company AND codigo = 'D01');
SET @l2 = (SELECT id FROM linhas WHERE company_id = @demo_company AND codigo = 'D02');

INSERT INTO horarios (linha_id, horario) VALUES
(@l1, '06:00:00'), (@l1, '07:00:00'), (@l1, '08:00:00'),
(@l2, '06:30:00'), (@l2, '07:30:00'), (@l2, '08:30:00');

-- Coordenadas APROXIMADAS e ilustrativas (não são paradas oficiais)
INSERT INTO pontos (linha_id, ordem, nome, latitude, longitude, tipo) VALUES
(@l1, 0, 'Origem demo — Centro', -12.6975, -38.3242, 'origem'),
(@l1, 1, 'Parada demo 1', -12.7200, -38.2800, 'parada'),
(@l1, 2, 'Destino demo — Jauá', -12.7500, -38.2400, 'destino'),
(@l2, 0, 'Origem demo — Centro', -12.6975, -38.3242, 'origem'),
(@l2, 1, 'Parada demo 1', -12.6600, -38.2800, 'parada'),
(@l2, 2, 'Destino demo — Abrantes', -12.6200, -38.2400, 'destino');
