-- =========================================================================
-- Financial Management System Database Schema - MySQL Version: 8.0+
-- =========================================================================
-- With multi-company support, hierarchical accounts, transaction management, and ERP integration.
-- Date: 26/02/2025, Revised 26,27/04, 06,12,20,21,22/05, 23/05/2025
-- =========================================================================

SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

-- =========================================================================
-- GENERAL SETUP
-- =========================================================================

SET default_storage_engine = InnoDB;

-- Criar um BD para o estoque, não sei se usaremos o mesmo para plano, financeiro e estoque 
--    CREATE DATABASE IF NOT EXISTS financial_system 
--    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--    USE financial_system;

-- Criar um usuario com os privilegios de adm 
--    CREATE USER 'presserv_finan' IDENTIFIED BY 'Pr3ss3rv@Finan';
--    GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON financial_system.* TO 'presserv_finan';
--    FLUSH PRIVILEGES;

-- =========================================================================
-- SUPPORT TABLES (must be created first - referenced by FK in other tables)
-- =========================================================================

-- Status table (referenced by sys_unit via status_id)
CREATE TABLE IF NOT EXISTS status (
    status_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    status_code VARCHAR(20) NOT NULL,
    status_name VARCHAR(100) NOT NULL,
    status_description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (status_id),
    UNIQUE KEY uk_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Generic status lookup table';

-- Subsidiaries
CREATE TABLE IF NOT EXISTS subsidiary (
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

-- Currency table (referenced by account, contact, etc. via currency_code)
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

-- System programs (referenced by sys_user via frontpage_id)
CREATE TABLE IF NOT EXISTS sys_program (
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

-- System preferences
CREATE TABLE IF NOT EXISTS sys_preference (
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

-- System groups
CREATE TABLE IF NOT EXISTS sys_group (
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

-- System units (referenced by most tables via sys_unit_id)
CREATE TABLE IF NOT EXISTS sys_unit (
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

-- System users (referenced by most tables via sys_user_id)
CREATE TABLE IF NOT EXISTS sys_user (
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

-- Company table (referenced by purchase_requisition, request_for_quotation, purchase_order,
--   goods_receipt, supplier_return, customer, sales_order, shipment, customer_return,
--   warehouse_transfer, inventory_adjustment)
CREATE TABLE IF NOT EXISTS company (
    company_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(30),
    address VARCHAR(512),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (company_id),
    INDEX idx_company_name (company_name),
    INDEX idx_company_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Companies / legal entities';

-- Access control: group-program mapping
CREATE TABLE IF NOT EXISTS sys_group_program (
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

-- Access control: user-group mapping
CREATE TABLE IF NOT EXISTS sys_user_group (
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

-- Access control: user-program mapping
CREATE TABLE IF NOT EXISTS sys_user_program (
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

-- Access control: user-unit mapping
CREATE TABLE IF NOT EXISTS sys_user_unit (
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

-- =========================================================================
-- CHART OF ACCOUNTS
-- =========================================================================
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

CREATE TABLE IF NOT EXISTS account (
    account_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
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
    PRIMARY KEY (account_id),
    UNIQUE KEY uk_account_company_code (company_id, account_code),
    INDEX idx_account_unit (sys_unit_id),
    INDEX idx_account_user (sys_user_id),
    INDEX idx_account_company (company_id),
    INDEX idx_account_parent (parent_account_id),
    INDEX idx_account_type (account_type_id),
    INDEX idx_account_code (company_id, account_code),
    CONSTRAINT fk_account_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_account_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_account_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_account_type FOREIGN KEY (account_type_id) REFERENCES account_type(account_type_id),
    CONSTRAINT fk_account_parent FOREIGN KEY (parent_account_id) REFERENCES account(account_id) ON DELETE RESTRICT,
    CONSTRAINT fk_account_currency FOREIGN KEY (currency) REFERENCES currency(currency_code),
    CONSTRAINT chk_account_level CHECK (level >= 1) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE INDEX idx_account_company ON account (company_id);
-- CREATE INDEX idx_account_parent ON account (parent_account_id);
-- CREATE INDEX idx_account_type ON account (account_type_id);
-- CREATE INDEX idx_account_code ON account (company_id, account_code);

CREATE TABLE IF NOT EXISTS bank_account (
    bank_account_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    bank_name VARCHAR(100)  NOT NULL,
    account_number VARCHAR(50),
    routing_number VARCHAR(50),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    bank_address TEXT,
    account_holder VARCHAR(100),
    account_type ENUM('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'OTHER'),
    last_reconciled_date DATE,
    default_for_payments TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (bank_account_id),
    INDEX idx_bank_account_unit (sys_unit_id),
    INDEX idx_bank_account_user (sys_user_id),
    INDEX idx_bank_account_account (account_id),
    CONSTRAINT fk_bank_account_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_bank_account_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_bank_account_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bank_account ON bank_account (account_id);

-- =========================================================================
-- FISCAL PERIODS
-- =========================================================================
CREATE TABLE IF NOT EXISTS fiscal_year (
    fiscal_year_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    year_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (fiscal_year_id),
    UNIQUE KEY uk_fiscal_year_company (company_id, year_name),
    INDEX idx_fiscal_year_unit (sys_unit_id),
    INDEX idx_fiscal_year_user (sys_user_id),
    CONSTRAINT fk_fiscal_year_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_fiscal_year_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_fiscal_year_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_fiscal_year_dates CHECK (start_date < end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fiscal_year_company ON fiscal_year (company_id);
CREATE INDEX idx_fiscal_year_dates ON fiscal_year (start_date, end_date);

CREATE TABLE IF NOT EXISTS fiscal_period (
    fiscal_period_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    fiscal_year_id INT UNSIGNED NOT NULL,
    period_name VARCHAR(50) NOT NULL,
    period_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_adjustment TINYINT DEFAULT 0,
    is_closed TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (fiscal_period_id),
    UNIQUE KEY uk_fiscal_period_year (fiscal_year_id, period_number),
    INDEX idx_fiscal_period_unit (sys_unit_id),
    INDEX idx_fiscal_period_user (sys_user_id),
    INDEX idx_fiscal_period_year (fiscal_year_id),
    CONSTRAINT fk_fiscal_period_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_fiscal_period_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_fiscal_period_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_year(fiscal_year_id) ON DELETE CASCADE,
    CONSTRAINT chk_fiscal_period_dates CHECK (start_date <= end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fiscal_period_dates ON fiscal_period (start_date, end_date);

-- =========================================================================
-- COST CENTERS, DEPARTMENTS, PROJECTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS cost_center (
    cost_center_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    parent_cost_center_id INT UNSIGNED,
    cost_center_code VARCHAR(30) NOT NULL,
    cost_center_name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_name VARCHAR(100),
    budget DECIMAL(19, 4),
    level INT NOT NULL,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (cost_center_id),
    UNIQUE KEY uk_cost_center_company_code (company_id, cost_center_code),
    INDEX idx_cost_center_unit (sys_unit_id),
    INDEX idx_cost_center_user (sys_user_id),
    INDEX idx_cost_center_company (company_id),
    INDEX idx_cost_center_parent (parent_cost_center_id),
    CONSTRAINT fk_cost_center_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_cost_center_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_cost_center_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_cost_center_parent FOREIGN KEY (parent_cost_center_id) REFERENCES cost_center(cost_center_id) ON DELETE RESTRICT,
    CONSTRAINT chk_cost_center_level CHECK (level >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS department (
    department_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    parent_department_id INT UNSIGNED,
    department_code VARCHAR(30) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_name VARCHAR(100),
    cost_center_id INT UNSIGNED,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (department_id),
    UNIQUE KEY uk_department_company_code (company_id, department_code),
    INDEX idx_department_unit (sys_unit_id),
    INDEX idx_department_user (sys_user_id),
    INDEX idx_department_company (company_id),
    INDEX idx_department_parent (parent_department_id),
    INDEX idx_department_cost_center (cost_center_id),
    CONSTRAINT fk_department_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_department_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_department_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES department(department_id) ON DELETE RESTRICT,
    CONSTRAINT fk_department_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_center(cost_center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS project (
    project_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    project_code VARCHAR(30) NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_name VARCHAR(100),
    cost_center_id INT UNSIGNED,
    department_id INT UNSIGNED,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(19, 4),
    status ENUM('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED') NOT NULL,
    completion_percentage DECIMAL(5, 2) DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (project_id),
    UNIQUE KEY uk_project_company_code (company_id, project_code),
    INDEX idx_project_unit (sys_unit_id),
    INDEX idx_project_user (sys_user_id),
    INDEX idx_project_company (company_id),
    INDEX idx_project_cost_center (cost_center_id),
    INDEX idx_project_department (department_id),
    CONSTRAINT fk_project_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_project_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_project_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_project_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_center(cost_center_id),
    CONSTRAINT fk_project_department FOREIGN KEY (department_id) REFERENCES department(department_id),
    CONSTRAINT chk_project_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- ACCOUNTING CODES AND CATEGORIES
-- =========================================================================
CREATE TABLE IF NOT EXISTS accounting_code (
    accounting_code_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    account_type_id INT UNSIGNED,
    is_system TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (accounting_code_id) ,
    UNIQUE KEY uk_accounting_code_company (company_id, code),
    CONSTRAINT fk_accounting_code_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_accounting_code_type FOREIGN KEY (account_type_id) REFERENCES account_type(account_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_accounting_code_company ON accounting_code (company_id);
CREATE INDEX idx_accounting_code_type ON accounting_code (account_type_id);

CREATE TABLE IF NOT EXISTS tax_code (
    tax_code_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rate DECIMAL(8, 4) NOT NULL,
    is_recoverable TINYINT DEFAULT 1,
    liability_account_id INT UNSIGNED,
    receivable_account_id INT UNSIGNED,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (tax_code_id) ,
    UNIQUE KEY uk_tax_code_company (company_id, code),
    CONSTRAINT fk_tax_code_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_tax_code_liability_account FOREIGN KEY (liability_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_tax_code_receivable_account FOREIGN KEY (receivable_account_id) REFERENCES account(account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tax_code_company ON tax_code (company_id);

-- =========================================================================
-- CONTACTS (VENDORS AND CUSTOMERS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS contact_type (
    contact_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
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
    PRIMARY KEY (contact_type_id) ,
    UNIQUE KEY uk_contact_type_company (company_id, type_name),
    CONSTRAINT fk_contact_type_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_contact_type_company ON contact_type (company_id);

CREATE TABLE IF NOT EXISTS contact (
    contact_id INT UNSIGNED AUTO_INCREMENT NOT NULL ,
    company_id INT UNSIGNED NOT NULL,
    contact_code VARCHAR(30) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(150),
    tax_id VARCHAR(30),
    contact_type_id INT UNSIGNED NOT NULL,
    is_customer TINYINT DEFAULT 0,
    is_vendor TINYINT DEFAULT 0,
    is_employee TINYINT DEFAULT 0,
    credit_limit DECIMAL(19, 4),
    payment_terms INT,
    billing_address TEXT,
    shipping_address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    website VARCHAR(100),
    primary_contact_person VARCHAR(100),
    notes TEXT,
    receivable_account_id INT UNSIGNED ,
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
    PRIMARY KEY (contact_id) ,
    UNIQUE KEY uk_contact_company_code (company_id, contact_code),
    CONSTRAINT fk_contact_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_contact_type FOREIGN KEY (contact_type_id) REFERENCES contact_type(contact_type_id),
    CONSTRAINT fk_contact_receivable_account FOREIGN KEY (receivable_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_contact_payable_account FOREIGN KEY (payable_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_contact_currency FOREIGN KEY (currency) REFERENCES currency(currency_code),
    CONSTRAINT fk_contact_tax_code FOREIGN KEY (tax_code_id) REFERENCES tax_code(tax_code_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_contact_company ON contact (company_id);
CREATE INDEX idx_contact_type ON contact (contact_type_id);
CREATE INDEX idx_contact_name ON contact (contact_name);

-- Partial indexes in MySQL require generated columns or separate tables
-- CREATE INDEX idx_contact_customer ON contact (company_id) WHERE is_customer = 1;
-- CREATE INDEX idx_contact_vendor ON contact (company_id) WHERE is_vendor = 1;

CREATE TABLE IF NOT EXISTS contact_bank_account (
    contact_bank_id INT UNSIGNED AUTO_INCREMENT NOT NULL ,
    contact_id INT UNSIGNED NOT NULL,
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
    PRIMARY KEY (contact_bank_id) ,
    CONSTRAINT fk_contact_bank_contact FOREIGN KEY (contact_id) REFERENCES contact(contact_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_contact_bank_contact ON contact_bank_account (contact_id);

-- =========================================================================
-- JOURNALS AND TRANSACTIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS journal_type (
    journal_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    type_code VARCHAR(10) NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    auto_numbering TINYINT DEFAULT 1,
    number_prefix VARCHAR(10),
    is_system TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (journal_type_id) ,
    UNIQUE KEY uk_journal_type_company (company_id, type_code),
    CONSTRAINT fk_journal_type_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_type_company ON journal_type (company_id);

CREATE TABLE IF NOT EXISTS journal (
    journal_id INT UNSIGNED AUTO_INCREMENT NOT NULL ,
    company_id INT UNSIGNED NOT NULL,
    journal_type_id INT UNSIGNED NOT NULL,
    journal_number VARCHAR(30) NOT NULL,
    reference_number VARCHAR(50),
    journal_date DATE NOT NULL,
    fiscal_period_id INT UNSIGNED NOT NULL,
    description TEXT,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    exchange_rate DECIMAL(19, 6) DEFAULT 1,
    total_amount DECIMAL(19, 4) NOT NULL,
    is_recurring TINYINT DEFAULT 0,
    recurrence_pattern VARCHAR(50),
    next_recurrence_date DATE,
    status VARCHAR(20) NOT NULL,
    is_intercompany TINYINT DEFAULT 0,
    related_company_id INT UNSIGNED,
    posted_date TIMESTAMP NULL,
    posted_by INT UNSIGNED,
    notes TEXT,
    approved_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (journal_id) ,
    UNIQUE KEY uk_journal_company_number (company_id, journal_number),
    CONSTRAINT fk_journal_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_journal_type FOREIGN KEY (journal_type_id) REFERENCES journal_type(journal_type_id),
    CONSTRAINT fk_journal_fiscal_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_period(fiscal_period_id),
    CONSTRAINT fk_journal_currency FOREIGN KEY (currency) REFERENCES currency(currency_code),
    CONSTRAINT fk_journal_related_company FOREIGN KEY (related_company_id) REFERENCES company(company_id),
    CONSTRAINT fk_journal_posted_by FOREIGN KEY (posted_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_journal_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_journal_approved_by FOREIGN KEY (approved_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT chk_journal_exchange_rate CHECK (exchange_rate > 0),
    CONSTRAINT chk_journal_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REJECTED', 'VOIDED')),
    CONSTRAINT chk_journal_intercompany CHECK (is_intercompany = 0 OR related_company_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_company ON journal (company_id);
CREATE INDEX idx_journal_type ON journal (journal_type_id);
CREATE INDEX idx_journal_date ON journal (journal_date);
CREATE INDEX idx_journal_fiscal_period ON journal (fiscal_period_id);
CREATE INDEX idx_journal_status ON journal (status);
CREATE INDEX idx_journal_created_by ON journal (created_by);

CREATE TABLE IF NOT EXISTS journal_line (
    journal_line_id INT UNSIGNED AUTO_INCREMENT NOT NULL ,
    journal_id INT UNSIGNED NOT NULL,
    line_number INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    description TEXT,
    debit_amount DECIMAL(19, 4) DEFAULT 0,
    credit_amount DECIMAL(19, 4) DEFAULT 0,
    cost_center_id INT UNSIGNED,
    department_id INT UNSIGNED,
    project_id INT UNSIGNED,
    contact_id INT UNSIGNED,
    tax_code_id INT UNSIGNED,
    tax_amount DECIMAL(19, 4) DEFAULT 0,
    reference TEXT,
    reconciled TINYINT DEFAULT 0,
    reconciliation_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (journal_line_id) ,
    UNIQUE KEY uk_journal_line (journal_id, line_number),
    CONSTRAINT fk_journal_line_journal FOREIGN KEY (journal_id) REFERENCES journal(journal_id) ON DELETE CASCADE,
    CONSTRAINT fk_journal_line_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_journal_line_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_center(cost_center_id),
    CONSTRAINT fk_journal_line_department FOREIGN KEY (department_id) REFERENCES department(department_id),
    CONSTRAINT fk_journal_line_project FOREIGN KEY (project_id) REFERENCES project(project_id),
    CONSTRAINT fk_journal_line_contact FOREIGN KEY (contact_id) REFERENCES contact(contact_id),
    CONSTRAINT fk_journal_line_tax_code FOREIGN KEY (tax_code_id) REFERENCES tax_code(tax_code_id),
    CONSTRAINT chk_journal_line_amounts CHECK ((debit_amount > 0 OR credit_amount > 0) AND NOT (debit_amount > 0 AND credit_amount > 0)),
    CONSTRAINT chk_journal_line_debit CHECK (debit_amount >= 0),
    CONSTRAINT chk_journal_line_credit CHECK (credit_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_line_journal ON journal_line (journal_id);
CREATE INDEX idx_journal_line_account ON journal_line (account_id);
CREATE INDEX idx_journal_line_cost_center ON journal_line (cost_center_id);
CREATE INDEX idx_journal_line_department ON journal_line (department_id);
CREATE INDEX idx_journal_line_project ON journal_line (project_id);
CREATE INDEX idx_journal_line_contact ON journal_line (contact_id);
CREATE INDEX idx_journal_line_reconciled ON journal_line (reconciled);

CREATE TABLE IF NOT EXISTS journal_attachment (
    attachment_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    journal_id INT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    description TEXT,
    uploaded_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (attachment_id) ,
    CONSTRAINT fk_journal_attachment_journal FOREIGN KEY (journal_id) REFERENCES journal(journal_id) ON DELETE CASCADE,
    CONSTRAINT fk_journal_attachment_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_attachment_journal ON journal_attachment (journal_id);

-- =========================================================================
-- TRANSACTIONS (PAYMENTS, RECEIPTS, TRANSFERS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS payment_method (
    payment_method_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    method_code VARCHAR(20) NOT NULL,
    method_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_electronic TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (payment_method_id) ,
    UNIQUE KEY uk_payment_method_company (company_id, method_code),
    CONSTRAINT fk_payment_method_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payment_method_company ON payment_method (company_id);

CREATE TABLE IF NOT EXISTS transaction_type (
    transaction_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    type_code VARCHAR(20) NOT NULL,
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
    PRIMARY KEY (transaction_type_id) ,
    UNIQUE KEY uk_transaction_type_company (company_id, type_code),
    CONSTRAINT fk_transaction_type_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transaction (
    transaction_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    transaction_type_id INT UNSIGNED NOT NULL,
    transaction_number VARCHAR(30) NOT NULL,
    transaction_date DATE NOT NULL,
    from_account_id INT UNSIGNED,
    from_contact_id INT UNSIGNED,
    to_account_id INT UNSIGNED,
    to_contact_id INT UNSIGNED,
    payment_method_id INT UNSIGNED,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    exchange_rate DECIMAL(19, 6) DEFAULT 1,
    amount DECIMAL(19, 4) NOT NULL,
    reference_number VARCHAR(50),
    description TEXT,
    memo TEXT,
    filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    journal_id INT  UNSIGNED,
    is_reconciled_from TINYINT DEFAULT 0,
    reconciliation_date_from TIMESTAMP NULL,
    is_reconciled_to TINYINT DEFAULT 0,
    reconciliation_date_to TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (transaction_id) ,
    UNIQUE KEY uk_transaction_company_number (company_id, transaction_number),
    CONSTRAINT fk_transaction_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_type FOREIGN KEY (transaction_type_id) REFERENCES transaction_type(transaction_type_id),
    CONSTRAINT fk_transaction_from_account FOREIGN KEY (from_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_transaction_from_contact FOREIGN KEY (from_contact_id) REFERENCES contact(contact_id),
    CONSTRAINT fk_transaction_to_account FOREIGN KEY (to_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_transaction_to_contact FOREIGN KEY (to_contact_id) REFERENCES contact(contact_id),
    CONSTRAINT fk_transaction_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_method(payment_method_id),
    CONSTRAINT fk_transaction_currency FOREIGN KEY (currency) REFERENCES currency(currency_code),
    CONSTRAINT fk_transaction_journal FOREIGN KEY (journal_id) REFERENCES journal(journal_id),
    CONSTRAINT fk_transaction_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT chk_transaction_amount CHECK (amount > 0),
    CONSTRAINT chk_transaction_exchange_rate CHECK (exchange_rate > 0),
    CONSTRAINT chk_transaction_status CHECK (status IN ('DRAFT', 'PENDING', 'COMPLETED', 'VOIDED', 'FAILED')),
    CONSTRAINT chk_transaction_parties CHECK (
        (from_account_id IS NOT NULL AND to_account_id IS NOT NULL) OR
        (from_account_id IS NOT NULL AND to_contact_id IS NOT NULL) OR
        (from_contact_id IS NOT NULL AND to_account_id IS NOT NULL)
    ),
    CONSTRAINT chk_transaction_accounts CHECK (from_account_id != to_account_id OR from_account_id IS NULL OR to_account_id IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_transaction_company ON transaction (company_id);
CREATE INDEX idx_transaction_from_account ON transaction (from_account_id);
CREATE INDEX idx_transaction_to_account ON transaction (to_account_id);
CREATE INDEX idx_transaction_date ON transaction (transaction_date);
CREATE INDEX idx_transaction_status ON transaction (status);
CREATE INDEX idx_transaction_journal ON transaction (journal_id);
CREATE INDEX idx_transaction_type ON transaction (transaction_type_id);

CREATE TABLE IF NOT EXISTS transaction_allocation (
    allocation_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    transaction_id INT UNSIGNED NOT NULL,
    invoice_id INT UNSIGNED, -- TODO: Add FOREIGN KEY constraint if an 'invoice' table exists in the schema.
    original_amount DECIMAL(19, 4) NOT NULL,
    allocated_amount DECIMAL(19, 4) NOT NULL,
    discount_amount DECIMAL(19, 4) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (allocation_id) ,
    CONSTRAINT fk_transaction_allocation_transaction FOREIGN KEY (transaction_id) REFERENCES transaction(transaction_id) ON DELETE CASCADE,
    CONSTRAINT chk_transaction_allocation_amount CHECK (allocated_amount > 0 AND allocated_amount <= original_amount),
    CONSTRAINT chk_transaction_allocation_discount CHECK (discount_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_transaction_allocation_transaction ON transaction_allocation (transaction_id);
CREATE INDEX idx_transaction_allocation_invoice ON transaction_allocation (invoice_id);

-- =========================================================================
-- RECONCILIATION
-- =========================================================================
CREATE TABLE IF NOT EXISTS bank_reconciliation (
    reconciliation_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    statement_date DATE NOT NULL,
    statement_balance DECIMAL(19, 4) NOT NULL,
    starting_balance DECIMAL(19, 4) NOT NULL,
    ending_balance DECIMAL(19, 4) NOT NULL,
    is_reconciled TINYINT DEFAULT 0,
    reconciled_date TIMESTAMP NULL,
    reconciled_by INT UNSIGNED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (reconciliation_id) ,
    UNIQUE KEY uk_bank_reconciliation (company_id, account_id, statement_date),
    CONSTRAINT fk_bank_reconciliation_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_bank_reconciliation_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_bank_reconciliation_reconciled_by FOREIGN KEY (reconciled_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_bank_reconciliation_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bank_reconciliation_company ON bank_reconciliation (company_id);
CREATE INDEX idx_bank_reconciliation_account ON bank_reconciliation (account_id);
CREATE INDEX idx_bank_reconciliation_date ON bank_reconciliation (statement_date);

CREATE TABLE IF NOT EXISTS reconciliation_item (
    item_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    reconciliation_id INT UNSIGNED NOT NULL,
    journal_line_id INT UNSIGNED,
    transaction_id INT UNSIGNED,
    transaction_date DATE NOT NULL,
    description TEXT,
    amount DECIMAL(19, 4) NOT NULL,
    is_matched TINYINT DEFAULT 0,
    matched_date TIMESTAMP NULL,
    matched_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (item_id) ,
    CONSTRAINT fk_reconciliation_item_reconciliation FOREIGN KEY (reconciliation_id) REFERENCES bank_reconciliation(reconciliation_id) ON DELETE CASCADE,
    CONSTRAINT fk_reconciliation_item_journal_line FOREIGN KEY (journal_line_id) REFERENCES journal_line(journal_line_id),
    CONSTRAINT fk_reconciliation_item_transaction FOREIGN KEY (transaction_id) REFERENCES transaction(transaction_id),
    CONSTRAINT fk_reconciliation_item_matched_by FOREIGN KEY (matched_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT chk_reconciliation_item_source CHECK (
        (journal_line_id IS NOT NULL AND transaction_id IS NULL) OR
        (journal_line_id IS NULL AND transaction_id IS NOT NULL) 
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reconciliation_item_reconciliation ON reconciliation_item (reconciliation_id);
CREATE INDEX idx_reconciliation_item_journal_line ON reconciliation_item (journal_line_id);
CREATE INDEX idx_reconciliation_item_transaction ON reconciliation_item (transaction_id);
CREATE INDEX idx_reconciliation_item_date ON reconciliation_item (transaction_date);

-- =========================================================================
-- BUDGETS
-- =========================================================================
CREATE TABLE IF NOT EXISTS budget (
    budget_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    fiscal_year_id INT UNSIGNED NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    approval_date TIMESTAMP NULL,
    approved_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (budget_id) ,
    UNIQUE KEY uk_budget_company (company_id, budget_name, fiscal_year_id),
    CONSTRAINT fk_budget_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_fiscal_year FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_year(fiscal_year_id),
    CONSTRAINT fk_budget_approved_by FOREIGN KEY (approved_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_budget_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT chk_budget_status CHECK (status IN ('DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'ARCHIVED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_budget_company ON budget (company_id);
CREATE INDEX idx_budget_fiscal_year ON budget (fiscal_year_id);

CREATE TABLE IF NOT EXISTS budget_item (
    budget_item_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    budget_id INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    cost_center_id INT UNSIGNED,
    department_id INT UNSIGNED,
    project_id INT UNSIGNED,
    description TEXT,
    annual_amount DECIMAL(19, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (budget_item_id) ,
    CONSTRAINT fk_budget_item_budget FOREIGN KEY (budget_id) REFERENCES budget(budget_id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_item_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_budget_item_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_center(cost_center_id),
    CONSTRAINT fk_budget_item_department FOREIGN KEY (department_id) REFERENCES department(department_id),
    CONSTRAINT fk_budget_item_project FOREIGN KEY (project_id) REFERENCES project(project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_budget_item_budget ON budget_item (budget_id);
CREATE INDEX idx_budget_item_account ON budget_item (account_id);
CREATE INDEX idx_budget_item_cost_center ON budget_item (cost_center_id);
CREATE INDEX idx_budget_item_department ON budget_item (department_id);
CREATE INDEX idx_budget_item_project ON budget_item (project_id);

CREATE TABLE IF NOT EXISTS budget_period (
    budget_period_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    budget_item_id INT UNSIGNED NOT NULL,
    fiscal_period_id INT UNSIGNED NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (budget_period_id) ,
    UNIQUE KEY uk_budget_period (budget_item_id, fiscal_period_id),
    CONSTRAINT fk_budget_period_budget_item FOREIGN KEY (budget_item_id) REFERENCES budget_item(budget_item_id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_period_fiscal_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_period(fiscal_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_budget_period_budget_item ON budget_period (budget_item_id);
CREATE INDEX idx_budget_period_fiscal_period ON budget_period (fiscal_period_id);

-- =========================================================================
-- REPORTING
-- =========================================================================
CREATE TABLE IF NOT EXISTS report_definition (
    report_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    report_code VARCHAR(30) NOT NULL,
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    description TEXT,
    report_query TEXT,
    parameters JSON,
    is_system TINYINT DEFAULT 0,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (report_id) ,
    UNIQUE KEY uk_report_definition_company (company_id, report_code),
    CONSTRAINT fk_report_definition_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_definition_created_by FOREIGN KEY (created_by) REFERENCES sys_user(sys_user_id),
    CONSTRAINT chk_report_definition_type CHECK (report_type IN (
        'BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW', 'TRIAL_BALANCE', 
        'ACCOUNT_DETAIL', 'BUDGET_COMPARISON', 'AGING_REPORT', 'CUSTOM'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_report_definition_company ON report_definition (company_id);
CREATE INDEX idx_report_definition_type ON report_definition (report_type);

-- =========================================================================
-- ACCOUNT BALANCES
-- =========================================================================
CREATE TABLE IF NOT EXISTS account_daily_balance (
    daily_balance_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    balance_date DATE NOT NULL,
    opening_balance DECIMAL(19, 4) NOT NULL,
    debit_total DECIMAL(19, 4) NOT NULL DEFAULT 0,
    credit_total DECIMAL(19, 4) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(19, 4) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (daily_balance_id) ,
    UNIQUE KEY uk_account_daily_balance (company_id, account_id, balance_date),
    CONSTRAINT fk_account_daily_balance_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_account_daily_balance_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_account_daily_balance_currency FOREIGN KEY (currency) REFERENCES currency(currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_account_daily_balance_company ON account_daily_balance (company_id);
CREATE INDEX idx_account_daily_balance_account ON account_daily_balance (account_id);
CREATE INDEX idx_account_daily_balance_date ON account_daily_balance (balance_date);
CREATE INDEX idx_account_balance_comp_account_date ON account_daily_balance(company_id, account_id, balance_date);

CREATE TABLE IF NOT EXISTS account_period_balance (
    period_balance_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    account_id INT UNSIGNED NOT NULL,
    fiscal_period_id INT UNSIGNED NOT NULL,
    opening_balance DECIMAL(19, 4) NOT NULL,
    debit_total DECIMAL(19, 4) NOT NULL DEFAULT 0,
    credit_total DECIMAL(19, 4) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(19, 4) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    is_adjusted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (period_balance_id) ,
    UNIQUE KEY uk_account_period_balance (company_id, account_id, fiscal_period_id),
    CONSTRAINT fk_account_period_balance_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_account_period_balance_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_account_period_balance_fiscal_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_period(fiscal_period_id),
    CONSTRAINT fk_account_period_balance_currency FOREIGN KEY (currency) REFERENCES currency(currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_account_period_balance_company ON account_period_balance (company_id);
CREATE INDEX idx_account_period_balance_account ON account_period_balance (account_id);
CREATE INDEX idx_account_period_balance_fiscal_period ON account_period_balance (fiscal_period_id);

-- =========================================================================
-- FINANCIAL RATIOS
-- =========================================================================
CREATE TABLE IF NOT EXISTS financial_ratio (
    ratio_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    ratio_code VARCHAR(30) NOT NULL,
    ratio_name VARCHAR(100) NOT NULL,
    description TEXT,
    formula TEXT NOT NULL,
    target_value DECIMAL(10, 4),
    display_order INT,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (ratio_id) ,
    UNIQUE KEY uk_financial_ratio_company (company_id, ratio_code),
    CONSTRAINT fk_financial_ratio_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_financial_ratio_company ON financial_ratio (company_id);

CREATE TABLE IF NOT EXISTS financial_ratio_value (
    value_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    ratio_id INT UNSIGNED NOT NULL,
    fiscal_period_id INT UNSIGNED NOT NULL,
    ratio_value DECIMAL(19, 4) NOT NULL,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (value_id) ,
    UNIQUE KEY uk_financial_ratio_value (ratio_id, fiscal_period_id),
    CONSTRAINT fk_financial_ratio_value_ratio FOREIGN KEY (ratio_id) REFERENCES financial_ratio(ratio_id) ON DELETE CASCADE,
    CONSTRAINT fk_financial_ratio_value_fiscal_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_period(fiscal_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_financial_ratio_value_ratio ON financial_ratio_value (ratio_id);
CREATE INDEX idx_financial_ratio_value_fiscal_period ON financial_ratio_value (fiscal_period_id);

-- =========================================================================
-- INTEGRATION TABLES (FOR ERP)
-- =========================================================================
CREATE TABLE IF NOT EXISTS integration_setting (
    integration_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED NOT NULL,
    integration_name VARCHAR(100) NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    api_url VARCHAR(255),
    api_key VARCHAR(255),
    api_username VARCHAR(100),
    api_password VARCHAR(255),
    oauth_token TEXT,
    token_expires_at TIMESTAMP NULL,
    last_sync_time TIMESTAMP NULL,
    sync_frequency VARCHAR(20) NOT NULL,
    configuration_json JSON,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (integration_id) ,
    UNIQUE KEY uk_integration_setting_company (company_id, integration_name),
    CONSTRAINT fk_integration_setting_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_integration_setting_type CHECK (integration_type IN (
        'ERP', 'E_COMMERCE', 'BANKING', 'PAYMENT_GATEWAY', 'TAX', 'PAYROLL', 'OTHER'
    )),
    CONSTRAINT chk_integration_setting_frequency CHECK (sync_frequency IN (
        'REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_integration_setting_company ON integration_setting (company_id);
CREATE INDEX idx_integration_setting_type ON integration_setting (integration_type);

CREATE TABLE IF NOT EXISTS integration_mapping (
    mapping_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    integration_id INT UNSIGNED NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    local_entity_id VARCHAR(100) NOT NULL,
    remote_entity_id VARCHAR(100) NOT NULL,
    mapping_direction VARCHAR(20) NOT NULL,
    additional_data JSON,
    last_sync_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (mapping_id) ,
    UNIQUE KEY uk_integration_mapping (integration_id, entity_type, local_entity_id),
    CONSTRAINT fk_integration_mapping_integration FOREIGN KEY (integration_id) REFERENCES integration_setting(integration_id) ON DELETE CASCADE,
    CONSTRAINT chk_integration_mapping_entity_type CHECK (entity_type IN (
        'ACCOUNT', 'CONTACT', 'PRODUCT', 'INVOICE', 'PAYMENT', 'TAX_CODE', 'COST_CENTER', 'OTHER'
    )),
    CONSTRAINT chk_integration_mapping_direction CHECK (mapping_direction IN (
        'INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_integration_mapping_integration ON integration_mapping (integration_id);
CREATE INDEX idx_integration_mapping_entity_type ON integration_mapping (entity_type);
CREATE INDEX idx_integration_mapping_local_entity ON integration_mapping (local_entity_id);
CREATE INDEX idx_integration_mapping_remote_entity ON integration_mapping (remote_entity_id);

CREATE TABLE IF NOT EXISTS integration_sync_log (
    log_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    integration_id INT UNSIGNED NOT NULL,
    sync_start_time TIMESTAMP NOT NULL,
    sync_end_time TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL,
    records_processed INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    error_message TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (log_id) ,
    CONSTRAINT fk_integration_sync_log_integration FOREIGN KEY (integration_id) REFERENCES integration_setting(integration_id) ON DELETE CASCADE,
    CONSTRAINT chk_integration_sync_log_status CHECK (status IN (
        'RUNNING', 'COMPLETED', 'FAILED', 'WARNING'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_integration_sync_log_integration ON integration_sync_log (integration_id);
CREATE INDEX idx_integration_sync_log_status ON integration_sync_log (status);
CREATE INDEX idx_integration_sync_log_time ON integration_sync_log (sync_start_time);

-- =========================================================================
-- SYSTEM SETTINGS
-- =========================================================================
CREATE TABLE IF NOT EXISTS sys_setting (
    setting_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(20) NOT NULL,
    description TEXT,
    is_system TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (setting_id) ,
    UNIQUE KEY uk_sys_setting (company_id, setting_key),
    CONSTRAINT fk_sys_setting_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_sys_setting_data_type CHECK (data_type IN (
        'STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sys_setting_company ON sys_setting (company_id);
CREATE INDEX idx_sys_setting_key ON sys_setting (setting_key);

CREATE TABLE IF NOT EXISTS sys_audit_log (
    audit_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED,
    sys_user_id INT UNSIGNED,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(50),
    user_agent TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (audit_id) ,
    CONSTRAINT fk_sys_audit_log_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_sys_audit_log_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sys_audit_log_company ON sys_audit_log (company_id);
CREATE INDEX idx_sys_audit_log_user ON sys_audit_log (sys_user_id);
CREATE INDEX idx_sys_audit_log_action_time ON sys_audit_log (action_time);
CREATE INDEX idx_sys_audit_log_entity ON sys_audit_log (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS validation_rule (
    rule_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    company_id INT UNSIGNED,
    rule_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    condition_sql TEXT NOT NULL,
    error_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (rule_id) ,
    CONSTRAINT fk_validation_rule_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_validation_rule_severity CHECK (severity IN ('WARNING', 'ERROR'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- VIEWS FOR COMMON REPORTING NEEDS (MySQL 8.0+ compatible)
-- =========================================================================
-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;
-- =========================================================================
-- TRIAL BALANCE VIEW
-- =========================================================================
CREATE VIEW view_trial_balance AS
SELECT 
    c.company_id,
    c.company_name,
    fp.fiscal_year_id,
    fy.year_name,
    fp.fiscal_period_id,
    fp.period_name,
    a.account_id,
    a.account_code,
    a.account_name,
    at.account_type_id,
    at.type_name AS account_type,
    at.nature,
    apb.opening_balance,
    apb.debit_total,
    apb.credit_total,
    apb.closing_balance,
    CASE 
        WHEN at.nature = 'ASSET' THEN apb.debit_total - apb.credit_total
        WHEN at.nature = 'LIABILITY' THEN apb.credit_total - apb.debit_total
        WHEN at.nature = 'EQUITY' THEN apb.credit_total - apb.debit_total
        WHEN at.nature = 'REVENUE' THEN apb.credit_total - apb.debit_total
        WHEN at.nature = 'EXPENSE' THEN apb.debit_total - apb.credit_total
        ELSE 0
    END AS net_balance
FROM 
    account_period_balance apb
JOIN 
    account a ON apb.account_id = a.account_id
JOIN 
    account_type at ON a.account_type_id = at.account_type_id
JOIN 
    company c ON apb.company_id = c.company_id
JOIN 
    fiscal_period fp ON apb.fiscal_period_id = fp.fiscal_period_id
JOIN 
    fiscal_year fy ON fp.fiscal_year_id = fy.fiscal_year_id
WHERE 
    a.active = 1
ORDER BY 
    c.company_id, fp.fiscal_period_id, a.account_code;

-- =========================================================================
-- GENERAL LEDGER VIEW
-- =========================================================================
CREATE VIEW view_general_ledger AS
SELECT 
    c.company_id,
    c.company_name,
    j.journal_id,
    j.journal_number,
    j.journal_date,
    jt.type_name AS journal_type,
    j.description AS journal_description,
    j.reference_number,
    j.status,
    jl.journal_line_id,
    jl.line_number,
    a.account_id,
    a.account_code,
    a.account_name,
    at.nature AS account_nature,
    jl.description AS line_description,
    jl.debit_amount,
    jl.credit_amount,
    cc.cost_center_id,
    cc.cost_center_code,
    cc.cost_center_name,
    d.department_id,
    d.department_code,
    d.department_name,
    p.project_id,
    p.project_code,
    p.project_name,
    con.contact_id,
    con.contact_name,
    u.name AS created_by,
    j.created_at,
    fp.fiscal_period_id,
    fp.period_name,
    fy.fiscal_year_id,
    fy.year_name
FROM 
    journal j
JOIN 
    company c ON j.company_id = c.company_id
JOIN 
    journal_type jt ON j.journal_type_id = jt.journal_type_id
JOIN 
    journal_line jl ON j.journal_id = jl.journal_id
JOIN 
    account a ON jl.account_id = a.account_id
JOIN 
    account_type at ON a.account_type_id = at.account_type_id
JOIN 
    sys_user u ON j.created_by = u.sys_user_id
LEFT JOIN 
    cost_center cc ON jl.cost_center_id = cc.cost_center_id
LEFT JOIN 
    department d ON jl.department_id = d.department_id
LEFT JOIN 
    project p ON jl.project_id = p.project_id
LEFT JOIN 
    contact con ON jl.contact_id = con.contact_id
LEFT JOIN
    fiscal_period fp ON j.fiscal_period_id = fp.fiscal_period_id
LEFT JOIN
    fiscal_year fy ON fp.fiscal_year_id = fy.fiscal_year_id
WHERE 
    j.status = 'POSTED'
ORDER BY
    j.journal_date DESC, j.journal_id, jl.line_number;

-- =========================================================================
-- INCOME STATEMENT VIEW
-- =========================================================================
CREATE VIEW view_income_statement AS
WITH period_amount AS (
    SELECT 
        apb.company_id,
        fp.fiscal_year_id,
        apb.fiscal_period_id,
        a.account_id,
        a.account_code,
        a.account_name,
        at.account_type_id,
        at.type_name AS account_type,
        at.nature,
        CASE 
            WHEN at.nature = 'REVENUE' THEN apb.credit_total - apb.debit_total
            WHEN at.nature = 'EXPENSE' THEN apb.debit_total - apb.credit_total
            ELSE 0
        END AS net_amount
    FROM 
        account_period_balance apb
    JOIN 
        account a ON apb.account_id = a.account_id
    JOIN 
        account_type at ON a.account_type_id = at.account_type_id
    JOIN 
        fiscal_period fp ON apb.fiscal_period_id = fp.fiscal_period_id
    WHERE 
        at.nature IN ('REVENUE', 'EXPENSE')
        AND a.active = 1
)
SELECT 
    pa.company_id,
    c.company_name,
    pa.fiscal_year_id,
    fy.year_name,
    pa.fiscal_period_id,
    fp.period_name,
    fp.start_date AS period_start_date,
    fp.end_date AS period_end_date,
    pa.account_id,
    pa.account_code,
    pa.account_name,
    pa.account_type_id,
    pa.account_type,
    pa.nature,
    pa.net_amount,
    SUM(pa.net_amount) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, pa.nature
        ORDER BY pa.account_code
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total,
    SUM(pa.net_amount) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, pa.nature
    ) AS nature_total,
    SUM(CASE WHEN pa.nature = 'REVENUE' THEN pa.net_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_revenue,
    SUM(CASE WHEN pa.nature = 'EXPENSE' THEN pa.net_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_expense,
    SUM(CASE WHEN pa.nature = 'REVENUE' THEN pa.net_amount ELSE -pa.net_amount END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS net_income
FROM 
    period_amount pa
JOIN 
    company c ON pa.company_id = c.company_id
JOIN 
    fiscal_year fy ON pa.fiscal_year_id = fy.fiscal_year_id
JOIN 
    fiscal_period fp ON pa.fiscal_period_id = fp.fiscal_period_id
ORDER BY 
    pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, 
    CASE WHEN pa.nature = 'REVENUE' THEN 1 ELSE 2 END, 
    pa.account_code;

-- =========================================================================
-- BALANCE SHEET VIEW
-- =========================================================================
CREATE VIEW view_balance_sheet AS
WITH period_amounts AS (
    SELECT 
        apb.company_id,
        fp.fiscal_year_id,
        apb.fiscal_period_id,
        a.account_id,
        a.account_code,
        a.account_name,
        at.account_type_id,
        at.type_name AS account_type,
        at.nature,
        CASE 
            WHEN at.nature = 'ASSET' THEN apb.debit_total - apb.credit_total
            WHEN at.nature IN ('LIABILITY', 'EQUITY') THEN apb.credit_total - apb.debit_total
            ELSE 0
        END AS balance_amount
    FROM 
        account_period_balance apb
    JOIN 
        account a ON apb.account_id = a.account_id
    JOIN 
        account_type at ON a.account_type_id = at.account_type_id
    JOIN 
        fiscal_period fp ON apb.fiscal_period_id = fp.fiscal_period_id
    WHERE 
        at.nature IN ('ASSET', 'LIABILITY', 'EQUITY')
        AND a.active = 1
)
SELECT 
    pa.company_id,
    c.company_name,
    pa.fiscal_year_id,
    fy.year_name,
    pa.fiscal_period_id,
    fp.period_name,
    fp.end_date AS period_end_date,
    pa.account_id,
    pa.account_code,
    pa.account_name,
    pa.account_type_id,
    pa.account_type,
    pa.nature,
    pa.balance_amount,
    SUM(pa.balance_amount) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, pa.nature
        ORDER BY pa.account_code
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total,
    SUM(pa.balance_amount) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, pa.nature
    ) AS nature_total,
    SUM(CASE WHEN pa.nature = 'ASSET' THEN pa.balance_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_assets,
    SUM(CASE WHEN pa.nature = 'LIABILITY' THEN pa.balance_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_liabilities,
    SUM(CASE WHEN pa.nature = 'EQUITY' THEN pa.balance_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_equity,
    SUM(CASE WHEN pa.nature IN ('LIABILITY', 'EQUITY') THEN pa.balance_amount ELSE 0 END) OVER (
        PARTITION BY pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id
    ) AS total_liabilities_equity
FROM 
    period_amounts pa
JOIN 
    company c ON pa.company_id = c.company_id
JOIN 
    fiscal_year fy ON pa.fiscal_year_id = fy.fiscal_year_id
JOIN 
    fiscal_period fp ON pa.fiscal_period_id = fp.fiscal_period_id
ORDER BY 
    pa.company_id, pa.fiscal_year_id, pa.fiscal_period_id, 
    CASE 
        WHEN pa.nature = 'ASSET' THEN 1
        WHEN pa.nature = 'LIABILITY' THEN 2
        ELSE 3
    END,
    pa.account_code;

-- =========================================================================
-- CASH FLOW VIEW
-- =========================================================================
CREATE VIEW view_cash_flow AS
SELECT 
    c.company_id,
    c.company_name,
    j.journal_date,
    fy.fiscal_year_id,
    fy.year_name,
    fp.fiscal_period_id,
    fp.period_name,
    a.account_id,
    a.account_code,
    a.account_name,
    SUM(jl.debit_amount) AS cash_inflow,
    SUM(jl.credit_amount) AS cash_outflow,
    SUM(jl.debit_amount - jl.credit_amount) AS net_cash_flow,
    COUNT(DISTINCT j.journal_id) AS transaction_count
FROM 
    journal_line jl
JOIN 
    journal j ON jl.journal_id = j.journal_id
JOIN 
    account a ON jl.account_id = a.account_id
JOIN 
    company c ON j.company_id = c.company_id
JOIN 
    fiscal_period fp ON j.fiscal_period_id = fp.fiscal_period_id
JOIN 
    fiscal_year fy ON fp.fiscal_year_id = fy.fiscal_year_id
WHERE 
    a.is_bank_account = 1
    AND j.status = 'POSTED'
GROUP BY 
    c.company_id, c.company_name, j.journal_date, 
    fy.fiscal_year_id, fy.year_name, 
    fp.fiscal_period_id, fp.period_name, 
    a.account_id, a.account_code, a.account_name
ORDER BY 
    c.company_id, j.journal_date DESC, a.account_code;

-- =========================================================================
-- ACCOUNTS RECEIVABLE AGING VIEW
-- =========================================================================
CREATE VIEW view_accounts_receivable_aging AS
WITH receivable_transactions AS (
    SELECT 
        j.company_id,
        j.journal_date,
        jl.journal_line_id,
        jl.account_id,
        jl.contact_id,
        jl.debit_amount - jl.credit_amount AS outstanding_amount,
        DATEDIFF(CURRENT_DATE, j.journal_date) AS days_outstanding,
        CASE 
            WHEN DATEDIFF(CURRENT_DATE, j.journal_date) <= 30 THEN '1-30'
            WHEN DATEDIFF(CURRENT_DATE, j.journal_date) <= 60 THEN '31-60'
            WHEN DATEDIFF(CURRENT_DATE, j.journal_date) <= 90 THEN '61-90'
            ELSE '90+'
        END AS age_bucket
    FROM 
        journal_line jl
    JOIN 
        journal j ON jl.journal_id = j.journal_id
    JOIN 
        account a ON jl.account_id = a.account_id
    JOIN 
        account_type at ON a.account_type_id = at.account_type_id
    WHERE 
        -- TODO: For robust AR identification, consider adding a specific flag like 'is_accounts_receivable'
        -- to the 'account' table or ensuring a dedicated 'ACCOUNTS_RECEIVABLE' type_name in 'account_type'.
        at.nature = 'ASSET'
        AND a.is_control_account = 1 -- This flag is important for control accounts
        AND (at.type_name = 'ACCOUNTS_RECEIVABLE' OR a.account_name LIKE '%Receivable%') -- Modified condition
        AND j.status = 'POSTED'
        AND (jl.debit_amount - jl.credit_amount) > 0
        AND jl.contact_id IS NOT NULL
)
SELECT 
    rt.company_id,
    c.company_name,
    rt.contact_id,
    con.contact_name,
    rt.account_id,
    a.account_code,
    a.account_name,
    SUM(CASE WHEN rt.age_bucket = '1-30' THEN rt.outstanding_amount ELSE 0 END) AS days_1_30,
    SUM(CASE WHEN rt.age_bucket = '31-60' THEN rt.outstanding_amount ELSE 0 END) AS days_31_60,
    SUM(CASE WHEN rt.age_bucket = '61-90' THEN rt.outstanding_amount ELSE 0 END) AS days_61_90,
    SUM(CASE WHEN rt.age_bucket = '90+' THEN rt.outstanding_amount ELSE 0 END) AS days_90_plus,
    SUM(rt.outstanding_amount) AS total_outstanding,
    MAX(rt.days_outstanding) AS max_days_outstanding,
    COUNT(*) AS outstanding_items
FROM 
    receivable_transactions rt
JOIN 
    company c ON rt.company_id = c.company_id
JOIN 
    contact con ON rt.contact_id = con.contact_id
JOIN 
    account a ON rt.account_id = a.account_id
GROUP BY 
    rt.company_id, c.company_name, rt.contact_id, con.contact_name, 
    rt.account_id, a.account_code, a.account_name
ORDER BY 
    rt.company_id, con.contact_name;

-- =========================================================================
-- BUDGET VS. ACTUAL VIEW
-- =========================================================================
CREATE VIEW view_budget_vs_actual AS
SELECT 
    c.company_id,
    c.company_name,
    fy.fiscal_year_id,
    fy.year_name,
    fp.fiscal_period_id,
    fp.period_name,
    a.account_id,
    a.account_code,
    a.account_name,
    at.nature,
    COALESCE(bp.amount, 0) AS budget_amount,
    CASE 
        WHEN at.nature = 'REVENUE' THEN COALESCE(apb.credit_total - apb.debit_total, 0)
        WHEN at.nature = 'EXPENSE' THEN COALESCE(apb.debit_total - apb.credit_total, 0)
        ELSE 0
    END AS actual_amount,
    CASE 
        WHEN at.nature = 'REVENUE' THEN COALESCE(apb.credit_total - apb.debit_total, 0) - COALESCE(bp.amount, 0)
        WHEN at.nature = 'EXPENSE' THEN COALESCE(bp.amount, 0) - COALESCE(apb.debit_total - apb.credit_total, 0)
        ELSE 0
    END AS variance,
    CASE 
        WHEN COALESCE(bp.amount, 0) = 0 THEN NULL
        WHEN at.nature = 'REVENUE' THEN 
            ((COALESCE(apb.credit_total - apb.debit_total, 0) - COALESCE(bp.amount, 0)) / NULLIF(COALESCE(bp.amount, 0), 0)) * 100
        WHEN at.nature = 'EXPENSE' THEN 
            ((COALESCE(bp.amount, 0) - COALESCE(apb.debit_total - apb.credit_total, 0)) / NULLIF(COALESCE(bp.amount, 0), 0)) * 100
        ELSE NULL
    END AS variance_percentage,
    b.budget_name
FROM 
    account a
JOIN 
    company c ON a.company_id = c.company_id
JOIN 
    account_type at ON a.account_type_id = at.account_type_id
JOIN 
    fiscal_period fp ON 1=1
JOIN 
    fiscal_year fy ON fp.fiscal_year_id = fy.fiscal_year_id AND fy.company_id = c.company_id
LEFT JOIN 
    account_period_balance apb ON a.account_id = apb.account_id 
        AND fp.fiscal_period_id = apb.fiscal_period_id
LEFT JOIN 
    budget b ON fy.fiscal_year_id = b.fiscal_year_id AND b.company_id = c.company_id
LEFT JOIN 
    budget_item bi ON b.budget_id = bi.budget_id AND a.account_id = bi.account_id
LEFT JOIN 
    budget_period bp ON bi.budget_item_id = bp.budget_item_id AND fp.fiscal_period_id = bp.fiscal_period_id
WHERE 
    at.nature IN ('REVENUE', 'EXPENSE')
    AND a.active = 1
ORDER BY 
    c.company_id, fy.fiscal_year_id, fp.fiscal_period_id, a.account_code;

-- =========================================================================
-- CONSOLIDATED FINANCIALS VIEW (NEEDS CUSTOMIZATION)
-- =========================================================================
CREATE VIEW view_consolidated_financials AS
SELECT 
    parent.company_id AS parent_company_id,
    parent.company_name AS parent_company_name,
    child.company_id,
    child.company_name,
    fy.fiscal_year_id,
    fy.year_name,
    fp.fiscal_period_id,
    fp.period_name,
    at.nature,
    SUM(
        CASE 
            WHEN at.nature = 'ASSET' THEN apb.debit_total - apb.credit_total
            WHEN at.nature = 'LIABILITY' THEN apb.credit_total - apb.debit_total
            WHEN at.nature = 'EQUITY' THEN apb.credit_total - apb.debit_total
            WHEN at.nature = 'REVENUE' THEN apb.credit_total - apb.debit_total
            WHEN at.nature = 'EXPENSE' THEN apb.debit_total - apb.credit_total
            ELSE 0
        END
    ) AS amount
FROM 
    company parent
JOIN 
    company child ON parent.company_id = child.parent_company_id
JOIN 
    account_period_balance apb ON child.company_id = apb.company_id
JOIN 
    account a ON apb.account_id = a.account_id
JOIN 
    account_type at ON a.account_type_id = at.account_type_id
JOIN 
    fiscal_period fp ON apb.fiscal_period_id = fp.fiscal_period_id
JOIN 
    fiscal_year fy ON fp.fiscal_year_id = fy.fiscal_year_id
WHERE 
    parent.is_consolidated = 1
    AND a.active = 1
GROUP BY 
    parent.company_id, parent.company_name,
    child.company_id, child.company_name,
    fy.fiscal_year_id, fy.year_name,
    fp.fiscal_period_id, fp.period_name,
    at.nature
ORDER BY 
    parent.company_id, child.company_id, 
    fy.fiscal_year_id, fp.fiscal_period_id,
    CASE 
        WHEN at.nature = 'ASSET' THEN 1
        WHEN at.nature = 'LIABILITY' THEN 2
        WHEN at.nature = 'EQUITY' THEN 3
        WHEN at.nature = 'REVENUE' THEN 4
        WHEN at.nature = 'EXPENSE' THEN 5
        ELSE 6
    END;

