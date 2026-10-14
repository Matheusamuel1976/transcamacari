-- TransCamaçari 2.0 — Migração 02: acesso do funcionário (MySQL/MariaDB)
-- Aditiva e segura: roda sobre o schema.sql sem perder dados.
-- Aplica: mysql -u root transcamacari < migration_02_employee_access.sql
USE transcamacari;

ALTER TABLE users
  MODIFY role ENUM('admin','operator','funcionario') NOT NULL DEFAULT 'admin';

ALTER TABLE users
  ADD COLUMN status ENUM('active','pending') NOT NULL DEFAULT 'active' AFTER role,
  ADD COLUMN employee_id BIGINT UNSIGNED NULL AFTER company_id,
  ADD CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS company_invites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL UNIQUE,
  code VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS line_assignments (
  user_id BIGINT UNSIGNED NOT NULL,
  linha_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, linha_id),
  CONSTRAINT fk_asg_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_asg_linha FOREIGN KEY (linha_id) REFERENCES linhas (id) ON DELETE CASCADE,
  INDEX idx_asg_linha (linha_id)
) ENGINE=InnoDB;
