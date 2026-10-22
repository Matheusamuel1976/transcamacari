-- TransCamaçari 2.0 — Schema relacional (MySQL/MariaDB, utf8mb4)
-- Sem dados reais de transporte: apenas estrutura + seed DEMO explicitamente fictício.

CREATE DATABASE IF NOT EXISTS transcamacari CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transcamacari;

CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','operator') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_users_company (company_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  cargo VARCHAR(120) NOT NULL,
  email VARCHAR(190) NULL,
  telefone VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_emp_company (company_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS linhas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  bairro VARCHAR(120) NOT NULL,
  origem VARCHAR(150) NOT NULL,
  destino VARCHAR(150) NOT NULL,
  visivel TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_linhas_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uq_linhas_company_codigo (company_id, codigo),
  INDEX idx_linhas_bairro (bairro),
  FULLTEXT KEY ft_linhas (nome, bairro, origem, destino)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS horarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  linha_id BIGINT UNSIGNED NOT NULL,
  horario TIME NOT NULL,
  dias ENUM('uteis','sabado','domingo','todos') NOT NULL DEFAULT 'todos',
  CONSTRAINT fk_hor_linha FOREIGN KEY (linha_id) REFERENCES linhas(id) ON DELETE CASCADE,
  INDEX idx_hor_linha (linha_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pontos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  linha_id BIGINT UNSIGNED NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  nome VARCHAR(150) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  tipo ENUM('origem','parada','destino') NOT NULL DEFAULT 'parada',
  CONSTRAINT fk_pto_linha FOREIGN KEY (linha_id) REFERENCES linhas(id) ON DELETE CASCADE,
  INDEX idx_pto_linha_ordem (linha_id, ordem),
  CONSTRAINT chk_coords CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  assunto VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  ip VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chave VARCHAR(100) NOT NULL,
  janela_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tentativas INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_ratelimit_chave (chave)
) ENGINE=InnoDB;
