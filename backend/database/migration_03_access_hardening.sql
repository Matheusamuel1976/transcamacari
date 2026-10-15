-- TransCamaçari 2.0 — Migração 03: senha inicial, expiração e auditoria (MySQL)
-- Aditiva e segura. Aplica: mysql -u root transcamacari < migration_03_access_hardening.sql
USE transcamacari;

ALTER TABLE users
  ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE company_invites
  ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS access_audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NULL,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  target_id BIGINT UNSIGNED NULL,
  meta VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  INDEX idx_audit_company_created (company_id, created_at)
) ENGINE=InnoDB;
