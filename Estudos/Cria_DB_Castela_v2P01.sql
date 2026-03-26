-- =============================================================================
-- ContractMaster - Schema MySQL Corrigido
-- Vers?o: 2.0.1
-- Data: 2026-01-13
-- Descri‡?o: Schema completo compat¡vel com MySQL 8.0+
--            Inclui sistema de versionamento de contratos
-- Altera??es v2.0.3:
--   - contract_services ? contract_covers
--   - contract_billing_config ? contract_config_billing
--   - created_by, updated_by, deleted_by ? INT UNSIGNED
--   - foreign key (FK) bug fixed 
--   - all tables with audit fields 
--   - new sys_user fields in contract and partner table
--   - deleted ON... CASCADE
--   - better contract_version control
--   - new table contract_access 
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- PARTE 1: CONTROLE DE VERS?O DO SCHEMA
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schema_version (
    schema_version_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_version (version, description) 
VALUES ('2.0.1', 'ContractMaster schema with contract versioning support - fixed naming');

-- -----------------------------------------------------------------------------
-- PARTE 2: TABELAS BASE (sem dependˆncias)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS gender( 
    gender_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (gender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_type( 
    document_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(50), -- CPF, RG, CNH, Passaporte, Carteirinha, Correspondˆncia, Carnˆ
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (document_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS address_type( 
    address_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (address_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_status( 
    payment_status_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code CHAR(2) NOT NULL,
    kanban TINYINT DEFAULT 0,
    color VARCHAR(100),
    kanban_order INT,
    final_state TINYINT DEFAULT 0,
    initial_state TINYINT DEFAULT 0,
    allow_edition TINYINT DEFAULT 1,
    allow_deletion TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS state( 
    state_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    codigo_ibge VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (state_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS city( 
    city_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    state_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    codigo_ibge VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (city_id),
    INDEX idx_city_state (state_id),
    CONSTRAINT fk_city_state FOREIGN KEY (state_id) REFERENCES state(state_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS currency (
    currency_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    currency_code CHAR(3) NOT NULL,
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(10),
    decimal_places INT NOT NULL DEFAULT 2,
    rounding_method VARCHAR(20) DEFAULT 'HALF_UP',
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (currency_id),
    UNIQUE KEY uk_currency_code (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS status( 
    status_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    status_code VARCHAR(20) NOT NULL,
    status_name VARCHAR(50) NOT NULL,
    description TEXT,
    generate_charge TINYINT DEFAULT 0,
    allows_service TINYINT DEFAULT 0,
    charge_after INT,
    kanban TINYINT DEFAULT 0,
    color VARCHAR(100),
    kanban_order INT,
    final_state TINYINT DEFAULT 0,
    initial_state TINYINT DEFAULT 0,
    allow_edition TINYINT DEFAULT 1,
    allow_deletion TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (status_id),
    UNIQUE KEY uk_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Reference table for status codes used throughout the system';

CREATE TABLE IF NOT EXISTS contract_status( 
    contract_status_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code CHAR(2) NOT NULL,
    generate_charge TINYINT DEFAULT 0,
    allows_service TINYINT DEFAULT 0,
    charge_after INT,
    kanban TINYINT DEFAULT 0,
    color VARCHAR(100),
    kanban_order INT,
    is_final_state TINYINT DEFAULT 0,
    is_initial_state TINYINT DEFAULT 0,
    allow_edition TINYINT DEFAULT 1,
    allow_deletion TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    unit_id INT UNSIGNED,
    PRIMARY KEY (contract_status_id),
    UNIQUE KEY uk_contract_status_name (name),
    UNIQUE KEY uk_contract_status_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS state_machine_transitions( 
    state_machine_transitions_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    contract_status_id_from INT UNSIGNED,
    contract_status_id_to INT UNSIGNED NOT NULL,
    generate_charge TINYINT DEFAULT 0,
    allows_service TINYINT DEFAULT 0,
    charge_after INT,
    kanban TINYINT DEFAULT 0,
    color VARCHAR(100),
    kanban_order INT,
    final_state TINYINT DEFAULT 0,
    initial_state TINYINT DEFAULT 0,
    allow_edition TINYINT DEFAULT 1,
    allow_deletion TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    unit_id INT UNSIGNED,
    PRIMARY KEY (state_machine_transitions_id),
    CONSTRAINT fk_smt_from FOREIGN KEY (contract_status_id_from) REFERENCES contract_status(contract_status_id),
    CONSTRAINT fk_smt_to FOREIGN KEY (contract_status_id_to) REFERENCES contract_status(contract_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS status_reason( 
    status_reason_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    reason VARCHAR(200) NOT NULL,
    description VARCHAR(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    unit_id INT UNSIGNED,
    PRIMARY KEY (status_reason_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
