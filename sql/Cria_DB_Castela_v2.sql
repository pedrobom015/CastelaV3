-- =============================================================================
-- ContractMaster - Schema MySQL Corrigido
-- Versão: 2.0.1
-- Data: 2026-01-13
-- Descrição: Schema completo compatível com MySQL 8.0+
--            Inclui sistema de versionamento de contratos
-- Altera‡?es v2.0.3:
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
-- PARTE 1: CONTROLE DE VERSÃO DO SCHEMA
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
-- PARTE 2: TABELAS BASE (sem dependências)
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
    name VARCHAR(50), -- CPF, RG, CNH, Passaporte, Carteirinha, Correspondência, Carnê
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

-- -----------------------------------------------------------------------------
-- PARTE 3: TABELAS DE SISTEMA
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sys_group( 
    sys_group_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name TEXT NOT NULL,
    uuid VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_program( 
    sys_program_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name TEXT NOT NULL,
    controller TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    actions TEXT,
    PRIMARY KEY (sys_program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_group_program( 
    sys_group_program_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_group_id INT UNSIGNED NOT NULL,
    sys_program_id INT UNSIGNED NOT NULL,
    actions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_group_program_id),
    INDEX idx_sys_group_program_group (sys_group_id),
    INDEX idx_sys_group_program_program (sys_program_id),
    CONSTRAINT fk_sys_group_program_group FOREIGN KEY (sys_group_id) REFERENCES sys_group(sys_group_id),
    CONSTRAINT fk_sys_group_program_program FOREIGN KEY (sys_program_id) REFERENCES sys_program(sys_program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_preference( 
    sys_preference_id VARCHAR(200) NOT NULL,
    preference TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_preference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subsidiary( 
    subsidiary_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (subsidiary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_unit( 
    sys_unit_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    subsidiary_id INT UNSIGNED NOT NULL,
    status_id INT UNSIGNED,
    name TEXT NOT NULL,
    connection_name TEXT,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_unit_id),
    UNIQUE KEY uk_sys_unit_code (code),
    INDEX idx_sys_unit_subsidiary (subsidiary_id),
    INDEX idx_sys_unit_status (status_id),
    CONSTRAINT fk_sys_unit_subsidiary FOREIGN KEY (subsidiary_id) REFERENCES subsidiary(subsidiary_id),
    CONSTRAINT fk_sys_unit_genstat FOREIGN KEY (status_id) REFERENCES status(status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_user( 
    sys_user_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL,
    login VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    frontpage_id INT UNSIGNED,
    sys_unit_id INT UNSIGNED,
    active TINYINT DEFAULT 1,
    accepted_term_policy_at TIMESTAMP NULL,
    accepted_term_policy TINYINT,
    two_factor_enabled TINYINT DEFAULT 0,
    two_factor_type VARCHAR(100),
    two_factor_secret VARCHAR(255),
    is_admin TINYINT DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_user_id),
    UNIQUE KEY uk_sys_user_name (name),
    UNIQUE KEY uk_sys_user_email (email),
    INDEX idx_user_id (sys_user_id),
    INDEX idx_user_email (email),
    INDEX idx_user_username (name),
    INDEX idx_sys_user_login (login),
    INDEX idx_sys_user_unit (sys_unit_id),
    CONSTRAINT fk_sys_user_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_sys_user_frontpg FOREIGN KEY (frontpage_id) REFERENCES sys_program(sys_program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_user_group( 
    sys_user_group_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    sys_group_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_user_group_id),
    INDEX idx_sys_user_group_user (sys_user_id),
    INDEX idx_sys_user_group_group (sys_group_id),
    CONSTRAINT fk_sys_user_group_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_sys_user_group_group FOREIGN KEY (sys_group_id) REFERENCES sys_group(sys_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_user_program( 
    sys_user_program_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    sys_program_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_user_program_id),
    INDEX idx_sys_user_program_user (sys_user_id),
    INDEX idx_sys_user_program_program (sys_program_id),
    CONSTRAINT fk_sys_user_program_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_sys_user_program_progrm FOREIGN KEY (sys_program_id) REFERENCES sys_program(sys_program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_user_unit( 
    sys_user_unit_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (sys_user_unit_id),
    INDEX idx_sys_user_unit_user (sys_user_id),
    INDEX idx_sys_user_unit_unit (sys_unit_id),
    CONSTRAINT fk_sys_user_unit_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_sys_user_unit_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- garantir que titular, dependentes e representantes legais tenham acesso aos contratos do mesmo titular 
CREATE TABLE IF NOT EXISTS contract_access (
    contract_access_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    access_level ENUM('OWNER', 'DEPENDENT', 'LEGAL_REPRESENTATIVE') DEFAULT 'OWNER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_contract_user (contract_id, sys_user_id),
    FOREIGN KEY (contract_id) REFERENCES contract(contract_id),
    FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- PARTE 4: ENDEREÇOS E DOCUMENTOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS address( 
    address_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    address_type_id INT UNSIGNED NOT NULL,
    is_main TINYINT DEFAULT 1,
    zip_code VARCHAR(50) NOT NULL,
    address VARCHAR(200) NOT NULL,
    address_number VARCHAR(100),
    address_line1 VARCHAR(250),
    address_line2 VARCHAR(250),
    city VARCHAR(200) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(50),
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (address_id),
    INDEX idx_address_sys_user (sys_user_id),
    INDEX idx_address_type (address_type_id),
    CONSTRAINT fk_address_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_address_addtype FOREIGN KEY (address_type_id) REFERENCES address_type(address_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entity_address (
    entity_address_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('client', 'partner') NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    address_id INT UNSIGNED NOT NULL,
    is_primary TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_entity_address_entity (entity_type, entity_id),
    INDEX idx_entity_address_address (address_id),
    CONSTRAINT fk_entity_address_address FOREIGN KEY (address_id) REFERENCES address(address_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document( 
    document_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    document_type_id INT UNSIGNED NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (document_id),
    INDEX idx_document_sys_user (sys_user_id),
    INDEX idx_document_type (document_type_id),
    CONSTRAINT fk_document_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_document_doctype FOREIGN KEY (document_type_id) REFERENCES document_type(document_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entity_document (
    entity_document_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('client', 'partner') NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    document_id INT UNSIGNED NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_entity_document_entity (entity_type, entity_id),
    INDEX idx_entity_document_doc (document_id),
    CONSTRAINT fk_entity_document_doc FOREIGN KEY (document_id) REFERENCES document(document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 5: EMPRESA E PARCEIROS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company (
    company_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_company_id INT UNSIGNED,
    company_name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(150) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    address_id INT UNSIGNED,
    country VARCHAR(50),
    phone VARCHAR(30),
    email VARCHAR(100),
    website VARCHAR(100),
    logo_url VARCHAR(255),
    fiscal_year_start DATE,
    default_currency CHAR(3) NOT NULL DEFAULT 'BRL',
    is_consolidated TINYINT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_company_name (company_name),
    INDEX idx_company_tax_id (tax_id),
    INDEX idx_company_parent (parent_company_id),
    INDEX idx_company_is_active (is_active),
    CONSTRAINT fk_company_parent FOREIGN KEY (parent_company_id) REFERENCES company(company_id),
    CONSTRAINT fk_company_address FOREIGN KEY (address_id) REFERENCES address(address_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_company_access (
    user_company_access_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    can_view TINYINT DEFAULT 1,
    can_edit TINYINT DEFAULT 0,
    can_approve TINYINT DEFAULT 0,
    can_admin TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (user_company_access_id),
    UNIQUE KEY uk_user_company (sys_user_id, company_id),
    INDEX idx_user_access_company (company_id),
    CONSTRAINT fk_user_access_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_user_access_company FOREIGN KEY (company_id) REFERENCES company(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_type (
    partner_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_system TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_partner_type_company (company_id, type_name),
    INDEX idx_partner_type_company (company_id),
    CONSTRAINT fk_partner_type_company FOREIGN KEY (company_id) REFERENCES company(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_type (
    account_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    nature ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE') NOT NULL,
    description TEXT,
    is_system TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_account_type_company (company_id, type_name),
    INDEX idx_account_type_company (company_id),
    INDEX idx_account_type_unit (sys_unit_id),
    INDEX idx_account_type_user (sys_user_id),
    CONSTRAINT fk_account_type_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_account_type_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_account_type_company FOREIGN KEY (company_id) REFERENCES company(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS region (
    region_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    sys_unit_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_region_unit (sys_unit_id),
    CONSTRAINT fk_region_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specialty( 
    specialty_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(250) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (specialty_id),
    UNIQUE KEY uk_specialty_name (name),
    INDEX idx_specialty_unit (sys_unit_id),
    INDEX idx_specialty_user (sys_user_id),
    CONSTRAINT fk_specialty_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_specialty_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner (
    partner_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    owner_id INT UNSIGNED NOT NULL,
    partner_code VARCHAR(30) NOT NULL,
    partner_name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(150),
    login VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    tax_id VARCHAR(30),
    partner_type_id INT UNSIGNED NOT NULL,
    is_customer TINYINT DEFAULT 0,
    is_vendor TINYINT DEFAULT 0,
    is_collector TINYINT DEFAULT 0,
    is_employee TINYINT DEFAULT 0,
    is_accredited TINYINT DEFAULT 0,
    specialty_id INT UNSIGNED,
    advantages TEXT,
    observation TEXT,
    credit_limit DECIMAL(19, 4),
    payment_terms INT,
    billing_address_id INT UNSIGNED,
    shipping_address_id INT UNSIGNED,
    document1_id INT UNSIGNED,
    document2_id INT UNSIGNED,
    phone VARCHAR(30),
    website VARCHAR(100),
    primary_partner_person VARCHAR(100),
    notes TEXT,
    receivable_account_id INT UNSIGNED,
    payable_account_id INT UNSIGNED,
    currency CHAR(3) DEFAULT 'BRL',
    tax_code_id INT UNSIGNED,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_partner_code (company_id, partner_code),
    UNIQUE KEY idx_partner_tax_id_company (company_id, tax_id),
    INDEX idx_partner_company (company_id),
    INDEX idx_partner_unit (sys_unit_id),
    INDEX idx_partner_user (sys_user_id),
    INDEX idx_partner_type (partner_type_id),
    INDEX idx_partner_name (partner_name),
    INDEX idx_partner_specialty (specialty_id),
    CONSTRAINT fk_partner_company FOREIGN KEY (company_id) REFERENCES company(company_id),
    CONSTRAINT fk_partner_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_partner_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_partner_owner FOREIGN KEY (owner_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_partner_type FOREIGN KEY (partner_type_id) REFERENCES partner_type(partner_type_id),
    CONSTRAINT fk_partner_specialty FOREIGN KEY (specialty_id) REFERENCES specialty(specialty_id),
    CONSTRAINT fk_partner_billing_addr FOREIGN KEY (billing_address_id) REFERENCES address(address_id),
    CONSTRAINT fk_partner_shipping_addr FOREIGN KEY (shipping_address_id) REFERENCES address(address_id),
    CONSTRAINT fk_partner_doc1 FOREIGN KEY (document1_id) REFERENCES document(document_id),
    CONSTRAINT fk_partner_doc2 FOREIGN KEY (document2_id) REFERENCES document(document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE partner 
    ADD COLUMN is_customer_flag TINYINT GENERATED ALWAYS AS (IF(is_customer = 1, 1, NULL)) VIRTUAL,
    ADD INDEX idx_partner_customer (company_id, is_customer_flag);

ALTER TABLE partner 
    ADD COLUMN is_vendor_flag TINYINT GENERATED ALWAYS AS (IF(is_vendor = 1, 1, NULL)) VIRTUAL,
    ADD INDEX idx_partner_vendor (company_id, is_vendor_flag);

CREATE TABLE IF NOT EXISTS partner_bank_account (
    partner_bank_account_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partner_id INT UNSIGNED NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    routing_number VARCHAR(50),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    bank_address TEXT,
    account_holder VARCHAR(100),
    account_type VARCHAR(30),
    is_default TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_partner_bank_partner (partner_id),
    CONSTRAINT fk_partner_bank_partner FOREIGN KEY (partner_id) REFERENCES partner(partner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 6: CLASSES E GRUPOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS category( 
    category_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount_contracts INT,
    is_periodic TINYINT DEFAULT 1 NOT NULL,
    purchase_value DECIMAL(19,4) NOT NULL,
    number_of_parcels INT NOT NULL,
    generated_parcels INT NOT NULL,
    month_value DECIMAL(19,4) NOT NULL,
    depend_value DECIMAL(19,4),
    number_of_month_valid INT,
    is_renewable TINYINT DEFAULT 0,
    is_renewable_used TINYINT DEFAULT 0,
    total_value DECIMAL(19,4),
    message1 VARCHAR(30),
    message2 VARCHAR(30),   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (category_id),
    UNIQUE KEY uk_class_name (name),
    INDEX idx_class_unit (sys_unit_id),
    INDEX idx_class_user (sys_user_id),
    CONSTRAINT fk_class_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_class_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS group_batch( 
    group_batch_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    class_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    group_code VARCHAR(5) NOT NULL,
    begin_code VARCHAR(9) NOT NULL,
    final_code VARCHAR(9) NOT NULL,
    is_periodic TINYINT NOT NULL,
    amount_process INT NOT NULL,
    min_proc INT UNSIGNED NOT NULL,
    max_proc INT UNSIGNED NOT NULL,
    compare_admission TINYINT DEFAULT 0 NOT NULL,
    amount_redeem INT NOT NULL,
    by_service TINYINT DEFAULT 1 NOT NULL,
    death_count INT DEFAULT 0,
    current_death_count INT DEFAULT 0,
    death_threshold INT DEFAULT 10 NOT NULL,
    last_billing_number VARCHAR(3) NOT NULL,
    next_billing_number VARCHAR(3) NOT NULL,
    last_issue_date DATE,
    last_death_charge_date TIMESTAMP NULL,
    pending_process INT,
    number_contracts INT,
    number_lifes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (group_batch_id),
    UNIQUE KEY uk_group_batch_name (name),
    INDEX idx_group_batch_unit (sys_unit_id),
    INDEX idx_group_batch_user (sys_user_id),
    INDEX idx_group_batch_class (class_id),
    CONSTRAINT fk_group_batch_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_group_batch_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_group_batch_class FOREIGN KEY (class_id) REFERENCES category(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 7: CONTRATOS E VERSIONAMENTO
-- Estrutura de versionamento:
-- - contract: Dados permanentes do contrato (identidade)
-- - contract_version: Versões do contrato (dados que mudam)
-- - Tabelas dependentes referenciam contract_version_id
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contract( 
    contract_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    owner_id INT UNSIGNED NOT NULL,
    partner_id INT UNSIGNED,
    indicated_by INT UNSIGNED,
    contract_name VARCHAR(100) NOT NULL,
    login VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    contract_number VARCHAR(20) NOT NULL,
    original_contract_number VARCHAR(100),
    current_status VARCHAR(50) DEFAULT 'active' COMMENT 'Status: active, canceled, redeemed, transferred',
    status_id INT UNSIGNED,
    seller_id INT UNSIGNED,
    total_value DECIMAL(10,2),
    installment_value DECIMAL(10,2),
    obs TEXT,
    services_amount INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (contract_id),
    UNIQUE KEY uk_contract_number (contract_number),
    INDEX idx_contract_unit (sys_unit_id),
    INDEX idx_contract_user (sys_user_id),
    INDEX idx_contract_owner (owner_id),
    INDEX idx_contract_partner (partner_id),
    INDEX idx_contract_status (current_status),
    INDEX idx_contract_seller (seller_id),
    INDEX idx_contract_seller_date (seller_id, created_at),
    INDEX idx_contract_indicated (indicated_by),
    CONSTRAINT fk_contract_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_contract_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_owner FOREIGN KEY (owner_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_partner FOREIGN KEY (partner_id) REFERENCES partner(partner_id),
    CONSTRAINT fk_contract_indicated FOREIGN KEY (indicated_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_status FOREIGN KEY (status_id) REFERENCES contract_status(contract_status_id),
    CONSTRAINT fk_contract_seller FOREIGN KEY (seller_id) REFERENCES partner(partner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Tabela principal de contratos - identidade e titular';

CREATE TABLE IF NOT EXISTS contract_version (
    contract_version_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id INT UNSIGNED NOT NULL COMMENT 'Contrato pai',
    group_batch_id INT UNSIGNED NOT NULL COMMENT 'Grupo/Lote desta versão',
    version_number INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Número sequencial da versão',
    valid_from DATE NOT NULL COMMENT 'Data de início da validade',
    valid_to DATE NULL COMMENT 'Data de término (NULL = versão atual)',
    is_current TINYINT DEFAULT 1 COMMENT 'Indica se é a versão ativa',
    class_id INT UNSIGNED,
    collector_id INT UNSIGNED,
    region_id INT UNSIGNED,
    change_reason VARCHAR(255) COMMENT 'Motivo da alteração',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_contract_version_contract (contract_id),
    INDEX idx_contract_version_group (group_batch_id),
    INDEX idx_contract_version_current (is_current),
    INDEX idx_contract_version_class (class_id),
    INDEX idx_contract_version_collector (collector_id),
    INDEX idx_contract_region (region_id),
    INDEX idx_contract_version_valid (valid_from, valid_to),
    UNIQUE KEY uk_contract_version (contract_id, version_number),
    CONSTRAINT fk_contract_version_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ,
    CONSTRAINT fk_contract_version_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id),
    CONSTRAINT fk_contract_version_class FOREIGN KEY (class_id) REFERENCES category(category_id),
    CONSTRAINT fk_contract_version_collector FOREIGN KEY (collector_id) REFERENCES partner(partner_id),
    CONSTRAINT fk_contract_version_region FOREIGN KEY (region_id) REFERENCES region(region_id),
    CONSTRAINT fk_contract_version_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_version_updated_by FOREIGN KEY (updated_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_version_deleted_by FOREIGN KEY (deleted_by) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Versões do contrato - histórico de alterações';

ALTER TABLE contract 
    ADD COLUMN current_version_id INT UNSIGNED AFTER contract_id,
    ADD CONSTRAINT fk_contract_current_version FOREIGN KEY (current_version_id) REFERENCES contract_version(contract_version_id);

-- Tabela de coberturas do contrato (renomeada de contract_services)
CREATE TABLE IF NOT EXISTS contract_covers (
    contract_covers_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_version_id INT UNSIGNED NOT NULL COMMENT 'FK para contract_version',
    group_batch_id INT UNSIGNED NOT NULL,
    class_id INT UNSIGNED NOT NULL,
    status_id INT UNSIGNED NOT NULL,
    contract_type VARCHAR(50) NOT NULL COMMENT 'Tipo do contrato',
    industry VARCHAR(50) DEFAULT 'FUNERAL' COMMENT 'Indústria/Segmento',
    start_date DATETIME NOT NULL COMMENT 'Data de início',
    end_date DATETIME NULL COMMENT 'Data de término',
    admission DATETIME NOT NULL COMMENT 'Data de admissão',
    final_grace DATETIME NULL COMMENT 'Carência final',
    grace_period_days VARCHAR(50) COMMENT 'Dias de carência',
    renew_at DATETIME NULL COMMENT 'Data de renovação',
    services_amount INT COMMENT 'Quantidade de serviços',
    service_option1 VARCHAR(100),
    service_option2 VARCHAR(100),
    alives INT COMMENT 'Vivos',
    deceaseds INT COMMENT 'Falecidos',
    dependents INT COMMENT 'Dependentes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_contract_covers_version (contract_version_id),
    INDEX idx_contract_covers_type (contract_type),
    INDEX idx_contract_covers_start (start_date),
    INDEX idx_contract_covers_group (group_batch_id),
    CONSTRAINT fk_contract_covers_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_contract_covers_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id),
    CONSTRAINT fk_contract_covers_class FOREIGN KEY (class_id) REFERENCES category(category_id),
    CONSTRAINT fk_contract_covers_status FOREIGN KEY (status_id) REFERENCES status(status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Coberturas do contrato - detalhes do ciclo de vida';

-- Tabela de configuração de cobrança (renomeada de contract_billing_config)
CREATE TABLE IF NOT EXISTS contract_config_billing (
    contract_config_billing_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_version_id INT UNSIGNED NOT NULL COMMENT 'FK para contract_version',
    seller_id INT UNSIGNED COMMENT 'Vendedor',
    collector_id INT UNSIGNED COMMENT 'Cobrador',
    region_id INT UNSIGNED COMMENT 'Região',
    billing_frequency INT DEFAULT 1 NOT NULL COMMENT '1=Mensal, 3=Trimestral, 6=Semestral, 12=Anual',
    month_initial_billing CHAR(2) NOT NULL COMMENT 'Mês inicial (01-12)',
    year_initial_billing CHAR(4) NOT NULL COMMENT 'Ano inicial (YYYY)',
    opt_payday INT COMMENT 'Dia de vencimento preferencial',
    first_charge INT COMMENT 'Primeira cobrança',
    last_charge INT COMMENT 'Última cobrança',
    charges_amount INT COMMENT 'Total de cobranças',
    charges_paid INT COMMENT 'Cobranças pagas',
    late_fee_percentage DECIMAL(8,5) COMMENT 'Percentual de multa',
    is_partial_payments_allowed TINYINT DEFAULT 0 COMMENT 'Permite pagamento parcial',
    default_plan_installments VARCHAR(50) COMMENT 'Parcelas padrão do plano',
    default_plan_frequency VARCHAR(20) DEFAULT 'MONTHLY' COMMENT 'Frequência do plano',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_contract_config_billing_version (contract_version_id),
    INDEX idx_contract_config_billing_seller (seller_id),
    INDEX idx_contract_config_billing_collector (collector_id),
    INDEX idx_contract_config_billing_region (region_id),
    CONSTRAINT fk_contract_config_billing_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_contract_config_billing_seller FOREIGN KEY (seller_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_config_billing_collector FOREIGN KEY (collector_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_config_billing_region FOREIGN KEY (region_id) REFERENCES region(region_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Configuração de cobrança e comercial';

CREATE TABLE IF NOT EXISTS contract_events (
    contract_events_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_version_id INT UNSIGNED,
    event_type VARCHAR(50) NOT NULL COMMENT 'CRIACAO, ADITIVO, CANCELAMENTO, ATENDIMENTO',
    event_date TIMESTAMP NOT NULL,
    payload JSON COMMENT 'Dados adicionais do evento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_contract_events_version (contract_version_id),
    INDEX idx_contract_events_type (event_type),
    INDEX idx_contract_events_date (event_date),
    CONSTRAINT fk_contract_events_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_contract_events_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Histórico de eventos do contrato';

CREATE TABLE IF NOT EXISTS contract_status_history( 
    contract_status_history_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    state_machine_transition_id INT UNSIGNED NOT NULL,
    status_reason_id INT UNSIGNED NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    contract_number VARCHAR(20) NOT NULL,
    detail_status VARCHAR(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (contract_status_history_id),
    INDEX idx_contract_status_history_version (contract_version_id),
    INDEX idx_contract_status_history_transition (state_machine_transition_id),
    INDEX idx_contract_status_history_reason (status_reason_id),
    CONSTRAINT fk_contract_status_history_transition FOREIGN KEY (state_machine_transition_id) REFERENCES state_machine_transitions(state_machine_transitions_id),
    CONSTRAINT fk_contract_status_history_statreason FOREIGN KEY (status_reason_id) REFERENCES status_reason(status_reason_id),
    CONSTRAINT fk_contract_status_history_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contract_active( 
    contract_active_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    contract_number VARCHAR(20) NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (contract_active_id),
    UNIQUE KEY uk_contract_active_number (contract_number),
    INDEX idx_contract_active_unit (sys_unit_id),
    INDEX idx_contract_active_user (sys_user_id),
    INDEX idx_contract_active_version (contract_version_id),
    CONSTRAINT fk_contract_active_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_contract_active_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_number_unique_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 8: BENEFICIÁRIOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS beneficiary (
    beneficiary_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_version_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary TINYINT DEFAULT 0,
    birth_at DATE,
    gender_id INT UNSIGNED,
    document_id INT UNSIGNED,
    grace_at DATE,
    is_alive TINYINT DEFAULT 1,
    is_forbidden TINYINT DEFAULT 0,
    service_funeral_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_beneficiary_version (contract_version_id),
    INDEX idx_beneficiary_unit (sys_unit_id),
    INDEX idx_beneficiary_gender (gender_id),
    INDEX idx_beneficiary_document (document_id),
    CONSTRAINT fk_beneficiary_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_beneficiary_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_beneficiary_gender FOREIGN KEY (gender_id) REFERENCES gender(gender_id),
    CONSTRAINT fk_beneficiary_document FOREIGN KEY (document_id) REFERENCES document(document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 9: VENDAS E FATURAMENTO
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_batches (
    batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status ENUM('OPEN','CLOSED','CANCELLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

CREATE TABLE IF NOT EXISTS contract_pool (
    contract_pool_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    batch_id INT UNSIGNED,
    reserved_contract_number VARCHAR(20) NOT NULL,
    status ENUM('AVAILABLE','ASSIGNED','USED','CANCELLED') DEFAULT 'AVAILABLE',
    assigned_partner_id INT UNSIGNED NULL,
    assigned_at TIMESTAMP NULL,
    used_contract_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (batch_id) REFERENCES sales_batches(batch_id),
    FOREIGN KEY (assigned_partner_id) REFERENCES partner(partner_id),
    FOREIGN KEY (used_contract_id) REFERENCES contract(contract_id)
);

CREATE TABLE IF NOT EXISTS sales_distribution (
    distribution_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    batch_id INT UNSIGNED,
    partner_id INT UNSIGNED, -- vendedor
    quantity INT,
    delivered_at TIMESTAMP,
    returned_at TIMESTAMP NULL,
    status ENUM('DELIVERED','PARTIAL_RETURN','RETURNED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (batch_id) REFERENCES sales_batches(batch_id),
    FOREIGN KEY (partner_id) REFERENCES partner(partner_id)
);

CREATE TABLE IF NOT EXISTS sales_commission (
    commission_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    contract_id INT UNSIGNED NOT NULL,
    partner_id INT UNSIGNED NOT NULL, -- quem recebe
    percentage DECIMAL(5,2),
    amount DECIMAL(19,4),
    status ENUM('PENDING','APPROVED','PAID') DEFAULT 'PENDING',
    due_date DATE,
    paid_transaction_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (contract_id) REFERENCES contract(contract_id),
    FOREIGN KEY (partner_id) REFERENCES partner(partner_id),
    FOREIGN KEY (paid_transaction_id) REFERENCES transaction(transaction_id)
);

CREATE TABLE IF NOT EXISTS contract_validation (
    validation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id INT UNSIGNED NOT NULL,
    validated_by INT UNSIGNED,
    validated_at TIMESTAMP,
    status ENUM('PENDING','APPROVED','REJECTED'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (contract_id) REFERENCES contract(contract_id),
    FOREIGN KEY (validated_by) REFERENCES sys_user(sys_user_id)
);

-- -----------------------------------------------------------------------------
-- PARTE 10: SERVIÇOS E ATENDIMENTOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_type( 
    service_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    route VARCHAR(200),
    industry VARCHAR(50) DEFAULT 'FUNERAL',
    is_billable TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (service_type_id),
    UNIQUE KEY uk_service_type_name (name),
    INDEX idx_service_type_unit (sys_unit_id),
    INDEX idx_service_type_user (sys_user_id),
    CONSTRAINT fk_service_type_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_service_type_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS performed_service( 
    performed_service_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED,
    contract_version_id INT UNSIGNED NOT NULL,
    beneficiary_id INT UNSIGNED,
    service_type_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (performed_service_id),
    INDEX idx_performed_service_unit (sys_unit_id),
    INDEX idx_performed_service_version (contract_version_id),
    INDEX idx_performed_service_beneficiary (beneficiary_id),
    INDEX idx_performed_service_type (service_type_id),
    CONSTRAINT fk_performed_service_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_performed_service_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_performed_service_benefic FOREIGN KEY (beneficiary_id) REFERENCES beneficiary(beneficiary_id),
    CONSTRAINT fk_performed_service_servtype FOREIGN KEY (service_type_id) REFERENCES service_type(service_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_funeral ( 
    service_funeral_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL COMMENT 'Unit where service was performed',
    sys_user_id INT UNSIGNED NOT NULL COMMENT 'User who recorded the service',
    performed_service_id INT UNSIGNED NOT NULL COMMENT 'Link to general service tracking',
    declarant_id INT UNSIGNED,
    deceased_id INT UNSIGNED,
    office_users_id INT UNSIGNED NOT NULL,
    process_number VARCHAR(25) NOT NULL,
    occurr_at DATE NOT NULL,
    category VARCHAR(25) DEFAULT 'PL' NOT NULL,
    kinship VARCHAR(25) NOT NULL,
    death_at DATE,
    death_time CHAR(5),
    death_address_id INT UNSIGNED,
    payment_at DATE,
    burial_date DATE,
    burial_time CHAR(5),
    cemetery VARCHAR(200),
    paid_amount DECIMAL(19,4),
    paid_in_date DATE,
    group_batch_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (service_funeral_id),
    INDEX idx_service_funeral_version (contract_version_id),
    INDEX idx_service_funeral_unit (sys_unit_id),
    INDEX idx_service_funeral_user (sys_user_id),
    INDEX idx_service_funeral_performed (performed_service_id),
    INDEX idx_service_funeral_deceased (deceased_id),
    INDEX idx_service_funeral_declarant (declarant_id),
    INDEX idx_service_funeral_office (office_users_id),
    INDEX idx_service_funeral_group (group_batch_id),
    CONSTRAINT fk_service_funeral_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_service_funeral_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_service_funeral_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_service_funeral_perfservic FOREIGN KEY (performed_service_id) REFERENCES performed_service(performed_service_id),
    CONSTRAINT fk_service_funeral_declarant FOREIGN KEY (declarant_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_service_funeral_deceased FOREIGN KEY (deceased_id) REFERENCES beneficiary(beneficiary_id),
    CONSTRAINT fk_service_funeral_officer FOREIGN KEY (office_users_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_service_funeral_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
 COMMENT='Funeral services provided to contract beneficiaries';

ALTER TABLE beneficiary 
    ADD CONSTRAINT fk_beneficiary_funservice FOREIGN KEY (service_funeral_id) REFERENCES service_funeral(service_funeral_id);

CREATE TABLE IF NOT EXISTS death_event (
    death_event_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    group_batch_id INT UNSIGNED NOT NULL,
    beneficiary_id INT UNSIGNED NOT NULL,
    service_funeral_id INT UNSIGNED NOT NULL,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_for_billing TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (death_event_id),
    INDEX idx_death_event_group (group_batch_id),
    INDEX idx_death_event_beneficiary (beneficiary_id),
    INDEX idx_death_event_service (service_funeral_id),
    INDEX idx_death_event_group_processed (group_batch_id, processed_for_billing),
    CONSTRAINT fk_death_event_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id),
    CONSTRAINT fk_death_event_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiary(beneficiary_id),
    CONSTRAINT fk_death_event_service FOREIGN KEY (service_funeral_id) REFERENCES service_funeral(service_funeral_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS membership_card( 
    membership_card_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    performed_service_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED,
    sys_user_id INT UNSIGNED,
    contract_version_id INT UNSIGNED,
    beneficiary_id INT UNSIGNED,
    card_cod VARCHAR(100) COMMENT 'Código impresso no cartão',
    vencimento VARCHAR(100) COMMENT 'Válido até...',
    observacao TEXT,
    importado_at TIMESTAMP NULL COMMENT 'Data que foi importado',
    exportado_at TIMESTAMP NULL COMMENT 'Data que exportou para impressão',
    retorno_at TIMESTAMP NULL COMMENT 'Data do recebimento do cartão impresso',
    entregue_at TIMESTAMP NULL COMMENT 'Data da entrega ao beneficiário',
    valor DECIMAL(19,4) COMMENT 'Valor (quando cobrado)',
    pago_at TIMESTAMP NULL COMMENT 'Data do pagamento',
    numop VARCHAR(10) COMMENT 'Número do caixa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (membership_card_id),
    INDEX idx_membership_card_performed (performed_service_id),
    INDEX idx_membership_card_unit (sys_unit_id),
    INDEX idx_membership_card_user (sys_user_id),
    INDEX idx_membership_card_version (contract_version_id),
    INDEX idx_membership_card_beneficiary (beneficiary_id),
    CONSTRAINT fk_membership_card_service FOREIGN KEY (performed_service_id) REFERENCES performed_service(performed_service_id),
    CONSTRAINT fk_membership_card_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_membership_card_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_membership_card_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_membership_card_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiary(beneficiary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipament_rental( 
    equipament_rental_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    performed_service_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED,
    sys_user_id INT UNSIGNED,
    contract_version_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (equipament_rental_id),
    INDEX idx_equipament_rental_performed (performed_service_id),
    CONSTRAINT fk_equipament_rental_perfservic FOREIGN KEY (performed_service_id) REFERENCES performed_service(performed_service_id),
    CONSTRAINT fk_equipament_rental_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_equipament_rental_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_equipament_rental_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 11: ADENDOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS addendum( 
    addendum_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    status_id INT UNSIGNED,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (addendum_id),
    UNIQUE KEY uk_addendum_name (name),
    INDEX idx_addendum_unit (sys_unit_id),
    INDEX idx_addendum_status (status_id),
    CONSTRAINT fk_addendum_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_addendum_gstat FOREIGN KEY (status_id) REFERENCES status(status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS age_addendum( 
    age_addendum_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    addendum_id INT UNSIGNED NOT NULL,
    class_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(250),
    min_age INT,
    max_age INT,
    additional_value DECIMAL(19,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (age_addendum_id),
    UNIQUE KEY uk_age_addendum_name (name),
    INDEX idx_age_addendum_unit (sys_unit_id),
    INDEX idx_age_addendum_user (sys_user_id),
    INDEX idx_age_addendum_addendum (addendum_id),
    INDEX idx_age_addendum_class (class_id),
    CONSTRAINT fk_age_addendum_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_age_addendum_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_age_addendum_addendum FOREIGN KEY (addendum_id) REFERENCES addendum(addendum_id),
    CONSTRAINT fk_age_addendum_class FOREIGN KEY (class_id) REFERENCES category(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contract_addendum( 
    contract_addendum_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED,
    contract_version_id INT UNSIGNED NOT NULL,
    addendum_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (contract_addendum_id),
    INDEX idx_contract_addendum_unit (sys_unit_id),
    INDEX idx_contract_addendum_version (contract_version_id),
    INDEX idx_contract_addendum_addendum (addendum_id),
    CONSTRAINT fk_contract_addendum_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_contract_addendum_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_contract_addendum_addendum FOREIGN KEY (addendum_id) REFERENCES addendum(addendum_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 12: COBRANÇAS E PAGAMENTOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contract_charge (
    contract_charge_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_version_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    payment_status_id INT UNSIGNED NOT NULL,
    charge_code VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    payment_date DATE,
    paid_amount DECIMAL(19,4),
    due_month CHAR(2),
    due_year CHAR(4),
    convenio VARCHAR(20),
    payd_month CHAR(2),
    payd_year CHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_contract_charge_version (contract_version_id),
    INDEX idx_contract_charge_unit (sys_unit_id),
    INDEX idx_contract_charge_status (payment_status_id),
    INDEX idx_contract_charge_due (due_date),
    CONSTRAINT fk_contract_charge_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id) ON UPDATE CASCADE,
    CONSTRAINT fk_contract_charge_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_contract_charge_payment FOREIGN KEY (payment_status_id) REFERENCES payment_status(payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS charge( 
    charge_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    group_batch_id INT UNSIGNED NOT NULL,
    charge_number VARCHAR(7) NOT NULL,
    pending_cases_number INT,
    issue_date TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    month_ref VARCHAR(100),
    amount DECIMAL(19,4),
    message VARCHAR(100),
    message1 VARCHAR(100),
    message2 VARCHAR(100),
    amount_issued INT,
    amount_paid INT,
    canceled INT,
    release_date TIMESTAMP NULL,
    printing_date TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (charge_id),
    INDEX idx_charge_unit (sys_unit_id),
    INDEX idx_charge_user (sys_user_id),
    INDEX idx_charge_group (group_batch_id),
    CONSTRAINT fk_charge_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_charge_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_charge_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prorated_service(
    prorated_service_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    charge_id INT UNSIGNED NOT NULL,
    service_funeral_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (prorated_service_id),
    INDEX idx_prorated_service_charge (charge_id),
    INDEX idx_prorated_service_funeral (service_funeral_id),
    CONSTRAINT fk_prorated_service_id_charge FOREIGN KEY (charge_id) REFERENCES charge(charge_id),
    CONSTRAINT fk_prorated_service_id_servfuner FOREIGN KEY (service_funeral_id) REFERENCES service_funeral(service_funeral_id),
    CONSTRAINT fk_prorated_service_id_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_prorated_service_id_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_slip( 
    bank_slip_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    contract_charge_id INT UNSIGNED NOT NULL,
    seq VARCHAR(7) NOT NULL,
    nnumber VARCHAR(50) NOT NULL,
    charge_code VARCHAR(100) NOT NULL,
    status VARCHAR(100),
    send_at TIMESTAMP NULL,
    send_batch CHAR(7),
    response_at TIMESTAMP NULL,
    response_batch CHAR(7),
    response VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (bank_slip_id),
    INDEX idx_bank_slip_unit (sys_unit_id),
    INDEX idx_bank_slip_user (sys_user_id),
    INDEX idx_bank_slip_charge (contract_charge_id),
    CONSTRAINT fk_bank_slip_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_bank_slip_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_bank_slip_charge FOREIGN KEY (contract_charge_id) REFERENCES contract_charge(contract_charge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ordpgrc( 
    ordpgrc_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    sys_user_name VARCHAR(50),
    order_number VARCHAR(20) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(19,4) NOT NULL,
    number_receipt INT UNSIGNED,
    closing_date TIMESTAMP NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (ordpgrc_id),
    INDEX idx_ordpgrc_unit (sys_unit_id),
    INDEX idx_ordpgrc_user (sys_user_id),
    CONSTRAINT fk_ordpgrc_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_ordpgrc_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_receipt( 
    payment_receipt_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    subsidiary_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    status CHAR(2),
    billing_number VARCHAR(100),
    val_payment DECIMAL(19,4),
    val_aux DECIMAL(19,4),
    due_date DATE,
    cashier_number CHAR(8),
    method_pay VARCHAR(100),
    obs_pay VARCHAR(200),
    ordpgrc_id INT UNSIGNED NOT NULL,
    payment_status_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_receipt_id),
    INDEX idx_payment_receipt_subsidiary (subsidiary_id),
    INDEX idx_payment_receipt_unit (sys_unit_id),
    INDEX idx_payment_receipt_user (sys_user_id),
    INDEX idx_payment_receipt_version (contract_version_id),
    INDEX idx_payment_receipt_ordpgrc (ordpgrc_id),
    INDEX idx_payment_receipt_status (payment_status_id),
    CONSTRAINT fk_payment_receipt_subsidiary FOREIGN KEY (subsidiary_id) REFERENCES subsidiary(subsidiary_id),
    CONSTRAINT fk_payment_receipt_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_payment_receipt_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_payment_receipt_contract FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_payment_receipt_ordpgrc FOREIGN KEY (ordpgrc_id) REFERENCES ordpgrc(ordpgrc_id),
    CONSTRAINT fk_payment_receipt_paystat FOREIGN KEY (payment_status_id) REFERENCES payment_status(payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS batch_chk( 
    batch_chk_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    subsidiary_id INT UNSIGNED NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(10) NOT NULL,
    detail VARCHAR(100) NOT NULL,
    expenses DECIMAL(19,4) NOT NULL,
    discharge_date DATE NOT NULL,
    commiss_bill DECIMAL(5,2) NOT NULL,
    qtd_other DECIMAL(5,2) NOT NULL,
    vl_other DECIMAL(19,4) NOT NULL,
    qtd_bill DECIMAL(5,2) NOT NULL,
    vl_bill DECIMAL(19,4) NOT NULL,
    payment_value DECIMAL(19,4) NOT NULL,
    nrcctopay VARCHAR(7) NOT NULL,
    cashier_number VARCHAR(7) NOT NULL,
    ordpgrc_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (batch_chk_id),
    INDEX idx_batch_chk_subsidiary (subsidiary_id),
    INDEX idx_batch_chk_unit (sys_unit_id),
    INDEX idx_batch_chk_user (sys_user_id),
    INDEX idx_batch_chk_ordpgrc (ordpgrc_id),
    CONSTRAINT fk_batch_chk_subsidiary FOREIGN KEY (subsidiary_id) REFERENCES subsidiary(subsidiary_id),
    CONSTRAINT fk_batch_chk_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_batch_chk_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_batch_chk_ordpgrc FOREIGN KEY (ordpgrc_id) REFERENCES ordpgrc(ordpgrc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS batch_detail( 
    batch_detail_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    batch_chk_id INT UNSIGNED NOT NULL,
    contract_charge_id INT UNSIGNED NOT NULL,
    seq_number VARCHAR(5) NOT NULL,
    billing_number VARCHAR(100),
    amount_received DECIMAL(19,4) NOT NULL,
    process_status CHAR(1) NOT NULL,
    payment_status_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (batch_detail_id),
    INDEX idx_batch_detail_batch (batch_chk_id),
    INDEX idx_batch_detail_charge (contract_charge_id),
    INDEX idx_batch_detail_status (payment_status_id),
    CONSTRAINT fk_batch_detail_batch FOREIGN KEY (batch_chk_id) REFERENCES batch_chk(batch_chk_id),
    CONSTRAINT fk_batch_detail_contcharge FOREIGN KEY (contract_charge_id) REFERENCES contract_charge(contract_charge_id),
    CONSTRAINT fk_batch_detail_paymstat FOREIGN KEY (payment_status_id) REFERENCES payment_status(payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_cycle (
    billing_cycle_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    group_batch_id INT UNSIGNED NOT NULL,
    death_event_count INT NOT NULL,
    charge_date TIMESTAMP NOT NULL,
    amount_per_contract DECIMAL(19,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (billing_cycle_id),
    INDEX idx_billing_cycle_group (group_batch_id),
    CONSTRAINT fk_billing_cycle_group FOREIGN KEY (group_batch_id) REFERENCES group_batch(group_batch_id),
    CONSTRAINT fk_billing_cycle_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_billing_cycle_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contract_billing (
    contract_billing_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    cycle_id INT UNSIGNED NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    charge_id INT UNSIGNED,
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (contract_billing_id),
    INDEX idx_contract_billing_cycle (cycle_id),
    INDEX idx_contract_billing_version (contract_version_id),
    INDEX idx_contract_billing_charge (charge_id),
    CONSTRAINT fk_contract_billing_cycle FOREIGN KEY (cycle_id) REFERENCES billing_cycle(billing_cycle_id),
    CONSTRAINT fk_contract_billing_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_contract_billing_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_contract_billing_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_contract_billing_charge FOREIGN KEY (charge_id) REFERENCES contract_charge(contract_charge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_plan (
    payment_plan_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(19,4) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_plan_id),
    INDEX idx_payment_plan_version (contract_version_id),
    CONSTRAINT fk_payment_plan_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_payment_plan_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_payment_plan_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_plan_installment (
    payment_plan_installment_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    plan_id INT UNSIGNED NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_amount DECIMAL(19,4) DEFAULT 0,
    paid_date DATE,
    charge_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_plan_installment_id),
    INDEX idx_installment_plan (plan_id),
    INDEX idx_installment_charge (charge_id),
    CONSTRAINT fk_installment_plan FOREIGN KEY (plan_id) REFERENCES payment_plan(payment_plan_id),
    CONSTRAINT fk_installment_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_installment_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_installment_charge FOREIGN KEY (charge_id) REFERENCES contract_charge(contract_charge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_transaction (
    payment_transaction_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    contract_version_id INT UNSIGNED NOT NULL,
    charge_id INT UNSIGNED,
    installment_id INT UNSIGNED,
    amount DECIMAL(19,4) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_transaction_id),
    INDEX idx_transaction_version (contract_version_id),
    INDEX idx_transaction_charge (charge_id),
    INDEX idx_transaction_installment (installment_id),
    CONSTRAINT fk_transaction_version FOREIGN KEY (contract_version_id) REFERENCES contract_version(contract_version_id),
    CONSTRAINT fk_transaction_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_transaction_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_transaction_charge FOREIGN KEY (charge_id) REFERENCES contract_charge(contract_charge_id),
    CONSTRAINT fk_transaction_installment FOREIGN KEY (installment_id) REFERENCES payment_plan_installment(payment_plan_installment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 13: REGRAS DE COBRANÇA E ENCAMINHAMENTOS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_rule (
    billing_rule_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    description TEXT,
    condition_expression TEXT,
    charge_expression TEXT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (billing_rule_id),
    INDEX idx_billing_rule_unit (sys_unit_id),
    CONSTRAINT fk_billing_rule_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_billing_rule_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_rule_application (
    billing_rule_application_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    rule_id INT UNSIGNED NOT NULL,
    entity_type VARCHAR(50) NOT NULL COMMENT 'CONTRACT, GROUP, SERVICE',
    entity_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (billing_rule_application_id),
    INDEX idx_billing_rule_app_rule (rule_id),
    INDEX idx_billing_rule_app_entity (entity_type, entity_id),
    CONSTRAINT fk_billing_rule_app_rule FOREIGN KEY (rule_id) REFERENCES billing_rule(billing_rule_id),
    CONSTRAINT fk_billing_rule_app_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_billing_rule_app_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medical_foward( 
    medical_foward_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    partner_id INT UNSIGNED NOT NULL,
    performed_service_id INT UNSIGNED NOT NULL,
    observation TEXT,
    val_payment DECIMAL(19,4),
    val_aux DECIMAL(19,4),
    due_date DATE,
    cashier_number CHAR(8),
    method_pay VARCHAR(100),
    obs_pay VARCHAR(200),
    ordpgrc_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (medical_foward_id),
    INDEX idx_medical_foward_unit (sys_unit_id),
    INDEX idx_medical_foward_user (sys_user_id),
    INDEX idx_medical_foward_partner (partner_id),
    INDEX idx_medical_foward_service (performed_service_id),
    CONSTRAINT fk_medical_foward_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_medical_foward_users FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_medical_foward_accredit FOREIGN KEY (partner_id) REFERENCES partner(partner_id),
    CONSTRAINT fk_medical_foward_perfservic FOREIGN KEY (performed_service_id) REFERENCES performed_service(performed_service_id),
    CONSTRAINT fk_medical_foward_ordpgrc FOREIGN KEY (ordpgrc_id) REFERENCES ordpgrc(ordpgrc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 14: CONTABILIDADE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS account (
    account_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    account_type_id INT UNSIGNED NOT NULL,
    parent_account_id INT UNSIGNED,
    account_code VARCHAR(30) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_bank_account TINYINT DEFAULT 0,
    is_control_account TINYINT DEFAULT 0,
    is_tax_relevant TINYINT DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    opening_balance DECIMAL(19, 4) DEFAULT 0,
    current_balance DECIMAL(19, 4) DEFAULT 0,
    level INT NOT NULL,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_account_company_code (company_id, account_code),
    INDEX idx_account_company (company_id),
    INDEX idx_account_parent (parent_account_id),
    INDEX idx_account_type (account_type_id),
    CONSTRAINT fk_account_company FOREIGN KEY (company_id) REFERENCES company(company_id) ,
    CONSTRAINT fk_account_type FOREIGN KEY (account_type_id) REFERENCES account_type(account_type_id),
    CONSTRAINT fk_account_parent FOREIGN KEY (parent_account_id) REFERENCES account(account_id) ON DELETE RESTRICT,
    CONSTRAINT chk_account_level CHECK (level >= 1)  -- ,
--    CONSTRAINT chk_no_self_parent CHECK (parent_account_id != id OR parent_account_id IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PARTE 15: PROTOCOLOS E CARTEIRINHAS (Canalde entregas)
-- -----------------------------------------------------------------------------
-- canal de entrega: físico, email, whatsapp, SMS, etc. Pode ser usado para definir regras de envio, templates de mensagens, etc.
-- criar dashboar com Entregas físicas, e-mails enviados, whatsapps enviados, SMS enviados, etc, com filtros por contrato, cliente, período, etc.
-- estudar o uso do livro de ocorrências do contrato para registrar as tentativas de entrega, ocorrências, etc.
CREATE TABLE communication_channel (
    channel_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    channel_name VARCHAR(50) NOT NULL,
    is_physical TINYINT(1) DEFAULT 0,
    is_electronic TINYINT(1) DEFAULT 1,
    active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS doc_to_send (
    doc_to_send_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sys_unit_id INT UNSIGNED NOT NULL,
    contract_id INT UNSIGNED,
    partner_id INT UNSIGNED, -- destinatário
    channel_id INT UNSIGNED NOT NULL,
    document_type_id INT UNSIGNED,
    status ENUM(
        'GENERATED',
        'QUEUED',   -- para controle eletronico (fila do robo)
        'SENDING',  -- envio em andamento
        'SENT',  -- enviado (para canal eletrônico) ou entregue para transportadora (para canal físico)
        'ASSIGNED', --  
        'READ',  -- para Whatsapp e Telegram 
        'PRINTED', 
        'IN_DISTRIBUTION',
        'DELIVERED',  -- entregue 
        'FAILED',
        'RETURNED',
        'CANCELLED'
    ) DEFAULT 'GENERATED',
    destination VARCHAR(255), -- endereço de entrega ou email/whatsapp,telefone para SMS, etc
    is_automated TINYINT DEFAULT 0,  -- controle do robo
--  automation_rule VARCHAR(100),    -- para controle de qual regra de automação gerou o documento, se for o caso 
    generated_at TIMESTAMP,
    printed_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    returned_at TIMESTAMP,
    current_batch_id INT UNSIGNED NULL,
    delivery_attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_doc_to_send_contract (contract_id),
    INDEX idx_doc_to_send_partner (partner_id),
    INDEX idx_doc_to_send_document_type (document_type_id),
    INDEX idx_doc_to_send_generated (generated_at),
    INDEX idx_doc_to_send_printed (printed_at),
    FOREIGN KEY (contract_id) REFERENCES contract(contract_id),
    FOREIGN KEY (partner_id) REFERENCES partner(partner_id),
    FOREIGN KEY (channel_id) REFERENCES communication_channel(channel_id),
    FOREIGN KEY (document_type_id) REFERENCES document_type(document_type_id)
);
CREATE TABLE IF NOT EXISTS document_batch (
    doc_batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sys_unit_id INT UNSIGNED NOT NULL,
    partner_id INT UNSIGNED, -- entregador
    batch_type ENUM('DELIVERY','RETURN'),
    status ENUM('OPEN','CLOSED'),
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_document_batch_partner (partner_id),  
    FOREIGN KEY (partner_id) REFERENCES partner(partner_id)
);
CREATE TABLE IF NOT EXISTS document_batch_item (
    doc_batch_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doc_batch_id INT UNSIGNED,
    document_id INT UNSIGNED,
    status ENUM('PENDING','DELIVERED','RETURNED'),
    notes varchar(100),
    origin_batch_id INT UNSIGNED NULL,
    last_event_id INT UNSIGNED NULL,
    attempt_number INT,
    delivery_status ENUM('SUCCESS','FAILED','PENDING'),
    return_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    UNIQUE KEY uk_doc_batch_document (doc_batch_id, document_id),
    FOREIGN KEY (doc_batch_id) REFERENCES document_batch(doc_batch_id),
    FOREIGN KEY (document_id) REFERENCES doc_to_send(doc_to_send_id)
);
CREATE TABLE IF NOT EXISTS document_event (
    doc_event_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_id INT UNSIGNED,
    event_type ENUM(
        'GENERATED',
        'SCHEDULED',
        'QUEUED',
        'SENT',
        'DELIVERED',
        'READ',
        'FAILED',
        'PRINTED',
        'ASSIGNED',
        'SENT',
        'DELIVERED',
        'RETURNED'
    ),
    event_date TIMESTAMP,
    performed_by INT UNSIGNED,
    partner_id INT UNSIGNED,
    notes VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    FOREIGN KEY (document_id) REFERENCES doc_to_send(doc_to_send_id),
    FOREIGN KEY (performed_by) REFERENCES sys_user(sys_user_id),
    FOREIGN KEY (partner_id) REFERENCES partner(partner_id)
);
CREATE INDEX idx_doc_status_batch ON doc_to_send (status, current_batch_id);

CREATE TABLE message_template (
    template_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100),
    channel_id INT,
    subject VARCHAR(200),
    message_text TEXT,
    active TINYINT(1) DEFAULT 1
);
-- Exemplo de template para cobrança:
-- Olá {{first_name}},
--
-- Sua parcela do contrato {{contract_number}}
-- vence em {{due_date}}.
-- 
-- Valor: {{amount}}
-- 
-- Obrigado.
-- 

-- -----------------------------------------------------------------------------
-- PARTE 16: UTILITÁRIOS E LOGS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cep_cache( 
    cep_cache_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    cep VARCHAR(8),
    street VARCHAR(500),
    city VARCHAR(500),
    neigborhood VARCHAR(500),
    ibge_code VARCHAR(20),
    uf CHAR(2),
    city_id INT UNSIGNED,
    state_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (cep_cache_id),
    INDEX idx_cep_cache_cep (cep),
    INDEX idx_cep_cache_city (city_id),
    INDEX idx_cep_cache_state (state_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS api_error( 
    api_error_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    api_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    severity TEXT,
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    error_details TEXT,
    stack_trace TEXT,
    http_method VARCHAR(10),
    endpoint VARCHAR(255) NOT NULL,
    full_url TEXT NOT NULL,
    request_headers TEXT,
    request_body TEXT,
    query_parameters TEXT,
    http_status INT,
    response_body TEXT,
    response_time_ms INT,
    class_name VARCHAR(255),
    method_name VARCHAR(255),
    line_number INT,
    file_name VARCHAR(255),
    sys_user_id INT UNSIGNED,
    user_ip VARCHAR(45),
    user_agent TEXT,
    environment VARCHAR(50),
    name_server VARCHAR(255),
    is_resolved TINYINT DEFAULT 0,
    resolved_at TIMESTAMP NULL,
    resolved_by INT UNSIGNED,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (api_error_id),
    INDEX idx_api_error_user (sys_user_id),
    INDEX idx_api_error_timestamp (api_timestamp),
    INDEX idx_api_error_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log( 
    audit_log_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_user_id INT UNSIGNED,
    audit_action VARCHAR(50) NOT NULL,
    name_table VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    process_name VARCHAR(100),
    process_parameters TEXT,
    process_outcome VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (audit_log_id),
    INDEX idx_audit_log_user (sys_user_id),
    INDEX idx_audit_log_record (record_id),
    INDEX idx_audit_log_table (name_table),
    INDEX idx_audit_log_action (audit_action),
    INDEX idx_audit_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- PARTE 16: DADOS INICIAIS
-- =============================================================================

INSERT INTO status (status_code, status_name, description) VALUES
('ACTIVE', 'Active', 'Active record'),
('INACTIVE', 'Inactive', 'Inactive record'),
('DRAFT', 'Draft', 'Initial draft state'),
('PENDING', 'Pending', 'Awaiting action'),
('APPROVED', 'Approved', 'Approved for processing'),
('COMPLETED', 'Completed', 'Process completed'),
('CANCELED', 'Canceled', 'Process cancelado')
ON DUPLICATE KEY UPDATE status_name = VALUES(status_name);

INSERT INTO document_type (document_type_id, description) VALUES 
(1, 'CPF'),
(2, 'RG'),
(3, 'CNH')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO gender (gender_id, name) VALUES 
(1, 'Masculino'),
(2, 'Feminino')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO subsidiary (subsidiary_id, name, code, status) VALUES 
(1, 'Matriz', 'BPL', '1'),
(2, 'Poços', 'POC', '1')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO sys_group (sys_group_id, name, uuid) VALUES 
(1, 'Admin', NULL),
(2, 'Standard', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO communication_channel (channel_id, channel_name, is_physical, is_electronic, active) VALUES 
(1, 'Correio', 1, 0, 1),
(2, 'Entregador', 1, 0, 1),
(3, 'Email', 0, 1, 1),
(4, 'Telefone', 0, 1, 1),
(5, 'WhatsApp', 0, 1, 1),
(6, 'Telegram', 0, 1, 1),
(7, 'SMS', 0, 1, 1)
ON DUPLICATE KEY UPDATE channel_name = VALUES(channel_name);

-- =============================================================================
-- PARTE 17: PROCEDURES E FUNCTIONS
-- =============================================================================

DELIMITER //

CREATE PROCEDURE create_contract_version(
    IN p_contract_id INT UNSIGNED,
    IN p_group_batch_id INT UNSIGNED,
    IN p_valid_from DATE,
    IN p_change_reason VARCHAR(255),
    IN p_created_by INT UNSIGNED,
    OUT p_new_version_id INT UNSIGNED
)
BEGIN
    DECLARE v_current_version_id INT UNSIGNED;
    DECLARE v_new_version_number INT UNSIGNED;
    
    SELECT id, version_number INTO v_current_version_id, v_new_version_number
    FROM contract_version
    WHERE contract_id = p_contract_id AND is_current = 1
    ORDER BY version_number DESC
    LIMIT 1;
    
    SET v_new_version_number = COALESCE(v_new_version_number, 0) + 1;
    
    IF v_current_version_id IS NOT NULL THEN
        UPDATE contract_version 
        SET is_current = 0, 
            valid_to = DATE_SUB(p_valid_from, INTERVAL 1 DAY),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_current_version_id;
    END IF;
    
    INSERT INTO contract_version (
        contract_id, group_batch_id, version_number,
        valid_from, valid_to, is_current, change_reason, created_by
    ) VALUES (
        p_contract_id, p_group_batch_id, v_new_version_number,
        p_valid_from, NULL, 1, p_change_reason, p_created_by
    );
    
    SET p_new_version_id = LAST_INSERT_ID();
    
    UPDATE contract 
    SET current_version_id = p_new_version_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_contract_id;
END //

CREATE FUNCTION get_current_contract_version(p_contract_id INT UNSIGNED)
RETURNS INT UNSIGNED
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_version_id INT UNSIGNED;
    
    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id 
      AND is_current = 1
    LIMIT 1;
    
    RETURN v_version_id;
END //

CREATE FUNCTION get_contract_version_at_date(
    p_contract_id INT UNSIGNED,
    p_date DATE
)
RETURNS INT UNSIGNED
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_version_id INT UNSIGNED;
    
    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id 
      AND valid_from <= p_date
      AND (valid_to IS NULL OR valid_to >= p_date)
    ORDER BY version_number DESC
    LIMIT 1;
    
    RETURN v_version_id;
END //

CREATE PROCEDURE create_group_charge(
    IN p_group_batch_id INT UNSIGNED,
    IN p_death_count INT
)
BEGIN
    DECLARE v_amount_per_contract DECIMAL(19,4);
    DECLARE v_contract_count INT;
    DECLARE v_charge_id INT UNSIGNED;
    DECLARE v_cycle_id INT UNSIGNED;
    
    SELECT COUNT(*) INTO v_contract_count
    FROM contract c
    INNER JOIN contract_version cv ON cv.contract_id = c.id AND cv.is_current = 1
    WHERE cv.group_batch_id = p_group_batch_id
    AND c.current_status = 'active';
    
    IF v_contract_count > 0 THEN
        SET v_amount_per_contract = p_death_count / v_contract_count;
        
        INSERT INTO billing_cycle (
            sys_unit_id, sys_user_id, group_batch_id, 
            death_event_count, charge_date, amount_per_contract, status
        ) VALUES (
            1, 1, p_group_batch_id, 
            p_death_count, CURRENT_TIMESTAMP, v_amount_per_contract, 'PENDING'
        );
        
        SET v_cycle_id = LAST_INSERT_ID();
        
        UPDATE group_batch 
        SET current_death_count = 0,
            last_death_charge_date = CURRENT_TIMESTAMP
        WHERE id = p_group_batch_id;
        
        UPDATE death_event 
        SET processed_for_billing = 1
        WHERE group_batch_id = p_group_batch_id 
        AND processed_for_billing = 0;
    END IF;
END //

CREATE PROCEDURE update_charge_status(
    IN p_charge_id INT UNSIGNED
)
BEGIN
    DECLARE v_total_amount DECIMAL(19,4);
    DECLARE v_paid_amount DECIMAL(19,4);
    DECLARE v_new_status VARCHAR(20);
    DECLARE v_paid_status_id INT UNSIGNED;
    DECLARE v_partial_status_id INT UNSIGNED;
    
    SELECT amount INTO v_total_amount
    FROM contract_charge
    WHERE id = p_charge_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payment_transaction
    WHERE charge_id = p_charge_id;
    
    IF v_paid_amount >= v_total_amount THEN
        SET v_new_status = 'PAID';
    ELSEIF v_paid_amount > 0 THEN
        SET v_new_status = 'PARTIAL';
    ELSE
        SET v_new_status = 'PENDING';
    END IF;
    
    SELECT id INTO v_paid_status_id FROM payment_status WHERE name = 'Paid' LIMIT 1;
    SELECT id INTO v_partial_status_id FROM payment_status WHERE name = 'Partial' LIMIT 1;
    
    UPDATE contract_charge
    SET 
        paid_amount = v_paid_amount,
        payment_status_id = CASE 
            WHEN v_new_status = 'PAID' THEN COALESCE(v_paid_status_id, payment_status_id)
            WHEN v_new_status = 'PARTIAL' THEN COALESCE(v_partial_status_id, payment_status_id)
            ELSE payment_status_id
        END
    WHERE id = p_charge_id;
END //

DELIMITER ;


-- =============================================================================
-- FINALIZAÇÃO
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- Atualização da versão do schema
UPDATE schema_version 
SET applied_at = CURRENT_TIMESTAMP 
WHERE version = '2.0.3';


