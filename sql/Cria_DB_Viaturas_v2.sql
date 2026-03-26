-- MySQL Fleet Management Database Schema
-- Version 1.1
--
-- This schema defines tables for managing a fleet of vehicles,
-- including drivers, maintenance, vehicle requests, trips, expenses,
-- daily logs, and document associations.
-- It is designed to integrate with 'common_tables.sql'.

-- Prerequisites: Ensure 'common_tables.sql' has been executed.
-- Specifically, tables like 'company', 'sys_user', 'document',
-- 'document_type', and 'currency' are referenced.

SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

-- =========================================================================
-- GENERAL SETUP
-- =========================================================================

SET default_storage_engine = InnoDB;

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

-- Currency table (referenced by various tables via currency_code)
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

-- -----------------------------------------------------
-- Base Fleet Lookup Tables (from Version 1.0)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_status (
  vehicle_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sys_unit_id INT UNSIGNED NOT NULL,
  sys_user_id INT UNSIGNED NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  INDEX idx_vehicle_status_unit (sys_unit_id),
  INDEX idx_vehicle_status_user (sys_user_id),
  CONSTRAINT fk_vehicle_status_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
  CONSTRAINT fk_vehicle_status_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_type (
  vehicle_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sys_unit_id INT UNSIGNED NOT NULL,
  sys_user_id INT UNSIGNED NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  INDEX idx_vehicle_type_unit (sys_unit_id),
  INDEX idx_vehicle_type_user (sys_user_id),
  CONSTRAINT fk_vehicle_type_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
  CONSTRAINT fk_vehicle_type_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS driver_status (
  driver_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sys_unit_id INT UNSIGNED NOT NULL,
  sys_user_id INT UNSIGNED NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  INDEX idx_driver_status_unit (sys_unit_id),
  INDEX idx_driver_status_user (sys_user_id),
  CONSTRAINT fk_driver_status_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
  CONSTRAINT fk_driver_status_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_type ( -- for maintenance
    service_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    INDEX idx_service_type_unit (sys_unit_id),
    INDEX idx_service_type_user (sys_user_id),
    CONSTRAINT fk_service_type_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_service_type_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_status (
  maintenance_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_request_type (
  vehicle_request_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_request_status (
  vehicle_request_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_status (
  trip_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expense_type (
  expense_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_expense_status (
  vehicle_expense_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Main Fleet Entity Tables (from Version 1.0, vehicle_expense modified)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle (
  vehicle_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id INT UNSIGNED NOT NULL,
  plate VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  vehicle_type_id INT UNSIGNED NOT NULL,
  year INT NOT NULL,
  vin VARCHAR(100) UNIQUE NOT NULL,
  vehicle_status_id INT UNSIGNED NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  CONSTRAINT fk_vehicle_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_vehicle_type_id FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type (vehicle_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_vehicle_status_id FOREIGN KEY (vehicle_status_id) REFERENCES vehicle_status (vehicle_status_id) ON DELETE RESTRICT,
  INDEX idx_vehicle_company_id (company_id),
  INDEX idx_vehicle_plate (plate),
  INDEX idx_vehicle_vin (vin),
  INDEX idx_vehicle_type_id (vehicle_type_id),
  INDEX idx_vehicle_status_id (vehicle_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS driver (
  driver_id INT UNSIGNED PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100) NOT NULL,
  license_expiry DATE NOT NULL,
  driver_status_id INT UNSIGNED NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  CONSTRAINT fk_driver_driver_id FOREIGN KEY (driver_id) REFERENCES sys_user (sys_user_id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_driver_status_id FOREIGN KEY (driver_status_id) REFERENCES driver_status (driver_status_id) ON DELETE RESTRICT,
  INDEX idx_driver_company_id (company_id),
  INDEX idx_driver_license_number (license_number),
  INDEX idx_driver_status_id (driver_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance (
  maintenance_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  service_type_id INT UNSIGNED NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completion_date DATE,
  cost DECIMAL(10,2),
  service_provider VARCHAR(255),
  maintenance_status_id INT UNSIGNED NOT NULL,
  notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
  CONSTRAINT fk_maintenance_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_service_type_id FOREIGN KEY (service_type_id) REFERENCES service_type (service_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_maintenance_maintenance_status_id FOREIGN KEY (maintenance_status_id) REFERENCES maintenance_status (maintenance_status_id) ON DELETE RESTRICT,
  INDEX idx_maintenance_vehicle_id (vehicle_id),
  INDEX idx_maintenance_company_id (company_id),
  INDEX idx_maintenance_service_type_id (service_type_id),
  INDEX idx_maintenance_scheduled_date (scheduled_date),
  INDEX idx_maintenance_status_id (maintenance_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_request (
  vehicle_request_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id INT UNSIGNED NOT NULL,
  requester_id INT UNSIGNED NOT NULL,
  requested_vehicle_type_id INT UNSIGNED NOT NULL,
  vehicle_request_type_id INT UNSIGNED NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  destination VARCHAR(255) NOT NULL,
  purpose TEXT,
  number_of_passengers INT,
  vehicle_request_status_id INT UNSIGNED NOT NULL,
  approved_by INT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,
  notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
  CONSTRAINT fk_vehicle_request_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_request_requester_id FOREIGN KEY (requester_id) REFERENCES sys_user (sys_user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_request_requested_vehicle_type_id FOREIGN KEY (requested_vehicle_type_id) REFERENCES vehicle_type (vehicle_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_request_vehicle_request_type_id FOREIGN KEY (vehicle_request_type_id) REFERENCES vehicle_request_type (vehicle_request_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_request_approved_by FOREIGN KEY (approved_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_request_vehicle_request_status_id FOREIGN KEY (vehicle_request_status_id) REFERENCES vehicle_request_status (vehicle_request_status_id) ON DELETE RESTRICT,
  INDEX idx_vr_company_id (company_id),
  INDEX idx_vr_requester_id (requester_id),
  INDEX idx_vr_req_vehicle_type_id (requested_vehicle_type_id),
  INDEX idx_vr_type_id (vehicle_request_type_id),
  INDEX idx_vr_status_id (vehicle_request_status_id),
  INDEX idx_vr_start_date (start_date),
  INDEX idx_vr_approved_by (approved_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip (
  trip_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id INT UNSIGNED NOT NULL,
  vehicle_id CHAR(36) NOT NULL,
  driver_id INT UNSIGNED NOT NULL,
  vehicle_request_id CHAR(36) NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NULL,
  start_location VARCHAR(255),
  destination VARCHAR(255),
  purpose TEXT,
  trip_status_id INT UNSIGNED NOT NULL,
  start_odometer INT UNSIGNED,
  end_odometer INT UNSIGNED,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  CONSTRAINT fk_trip_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_driver_id FOREIGN KEY (driver_id) REFERENCES driver (driver_id) ON DELETE RESTRICT,
  CONSTRAINT fk_trip_vehicle_request_id FOREIGN KEY (vehicle_request_id) REFERENCES vehicle_request (vehicle_request_id) ON DELETE SET NULL,
  CONSTRAINT fk_trip_trip_status_id FOREIGN KEY (trip_status_id) REFERENCES trip_status (trip_status_id) ON DELETE RESTRICT,
  INDEX idx_trip_company_id (company_id),
  INDEX idx_trip_vehicle_id (vehicle_id),
  INDEX idx_trip_driver_id (driver_id),
  INDEX idx_trip_request_id (vehicle_request_id),
  INDEX idx_trip_start_date (start_date),
  INDEX idx_trip_status_id (trip_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_expense (
  vehicle_expense_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  vehicle_id CHAR(36) NOT NULL,
  trip_id CHAR(36) NULL,
  expense_type_id INT UNSIGNED NOT NULL,
  sys_user_id INT UNSIGNED NULL, -- User who incurred or reported
  expense_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code CHAR(3) DEFAULT 'BRL',
  description TEXT,
  receipt_document_id INT UNSIGNED NULL, -- MODIFIED: FK to document.document_id
  vehicle_expense_status_id INT UNSIGNED NOT NULL,
  notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
  CONSTRAINT fk_vehicle_expense_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_expense_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_expense_trip_id FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_expense_expense_type_id FOREIGN KEY (expense_type_id) REFERENCES expense_type (expense_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_expense_sys_user_id FOREIGN KEY (sys_user_id) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_expense_currency_code FOREIGN KEY (currency_code) REFERENCES currency (currency_code) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_expense_receipt_document_id FOREIGN KEY (receipt_document_id) REFERENCES document (document_id) ON DELETE SET NULL, -- ADDED
  CONSTRAINT fk_vehicle_expense_created_by FOREIGN KEY (created_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_expense_vehicle_expense_status_id FOREIGN KEY (vehicle_expense_status_id) REFERENCES vehicle_expense_status (vehicle_expense_status_id) ON DELETE RESTRICT,
  INDEX idx_vexp_company_id (company_id),
  INDEX idx_vexp_vehicle_id (vehicle_id),
  INDEX idx_vexp_trip_id (trip_id),
  INDEX idx_vexp_expense_type_id (expense_type_id),
  INDEX idx_vexp_sys_user_id (sys_user_id),
  INDEX idx_vexp_expense_date (expense_date),
  INDEX idx_vexp_receipt_document_id (receipt_document_id), -- ADDED
  INDEX idx_vexp_status_id (vehicle_expense_status_id),
  INDEX idx_vexp_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- New Document Linking Tables (Version 1.1)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_document (
  vehicle_document_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL,
  document_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  description TEXT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
  UNIQUE KEY uk_vehicle_document (vehicle_id, document_id),
  CONSTRAINT fk_vehicle_document_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_document_document_id FOREIGN KEY (document_id) REFERENCES document (document_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_document_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_document_created_by FOREIGN KEY (created_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  INDEX idx_vd_vehicle_id (vehicle_id),
  INDEX idx_vd_document_id (document_id),
  INDEX idx_vd_company_id (company_id),
  INDEX idx_vd_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS driver_document (
  driver_document_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  driver_id INT UNSIGNED NOT NULL,
  document_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  description TEXT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  UNIQUE KEY uk_driver_document (driver_id, document_id),
  CONSTRAINT fk_driver_document_driver_id FOREIGN KEY (driver_id) REFERENCES driver (driver_id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_document_document_id FOREIGN KEY (document_id) REFERENCES document (document_id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_document_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE SET NULL,
  CONSTRAINT fk_driver_document_created_by FOREIGN KEY (created_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  INDEX idx_dd_driver_id (driver_id),
  INDEX idx_dd_document_id (document_id),
  INDEX idx_dd_company_id (company_id),
  INDEX idx_dd_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_document (
  maintenance_document_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  maintenance_id CHAR(36) NOT NULL,
  document_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  UNIQUE KEY uk_maintenance_document (maintenance_id, document_id),
  CONSTRAINT fk_maintenance_document_maintenance_id FOREIGN KEY (maintenance_id) REFERENCES maintenance (maintenance_id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_document_document_id FOREIGN KEY (document_id) REFERENCES document (document_id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_document_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE SET NULL,
  CONSTRAINT fk_maintenance_document_created_by FOREIGN KEY (created_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  INDEX idx_md_maintenance_id (maintenance_id),
  INDEX idx_md_document_id (document_id),
  INDEX idx_md_company_id (company_id),
  INDEX idx_md_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_document (
  trip_document_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id CHAR(36) NOT NULL,
  document_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  UNIQUE KEY uk_trip_document (trip_id, document_id),
  CONSTRAINT fk_trip_document_trip_id FOREIGN KEY (trip_id) REFERENCES trip (trip_id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_document_document_id FOREIGN KEY (document_id) REFERENCES document (document_id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_document_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE SET NULL,
  CONSTRAINT fk_trip_document_created_by FOREIGN KEY (created_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
  INDEX idx_td_trip_id (trip_id),
  INDEX idx_td_document_id (document_id),
  INDEX idx_td_company_id (company_id),
  INDEX idx_td_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- New Daily Log System Tables (Version 1.1)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS log_event_type (
  log_event_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_incident BOOLEAN DEFAULT FALSE,
  requires_odometer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_daily_log (
  vehicle_daily_log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  driver_id INT UNSIGNED NULL,
  sys_user_id INT UNSIGNED NOT NULL, -- User who created the log
  log_event_type_id INT UNSIGNED NOT NULL,
  log_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  odometer_reading INT UNSIGNED NULL,
  location_description VARCHAR(255) NULL,
  latitude DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  notes TEXT NULL,
  attached_document_id INT UNSIGNED NULL, -- Optional FK to document.document_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT UNSIGNED,
  updated_by INT UNSIGNED,
  deleted_by INT UNSIGNED,
  CONSTRAINT fk_vehicle_daily_log_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_daily_log_company_id FOREIGN KEY (company_id) REFERENCES company (company_id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_daily_log_driver_id FOREIGN KEY (driver_id) REFERENCES driver (driver_id) ON DELETE SET NULL,
  CONSTRAINT fk_vehicle_daily_log_sys_user_id FOREIGN KEY (sys_user_id) REFERENCES sys_user (sys_user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_daily_log_log_event_type_id FOREIGN KEY (log_event_type_id) REFERENCES log_event_type (log_event_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_daily_log_attached_document_id FOREIGN KEY (attached_document_id) REFERENCES document (document_id) ON DELETE SET NULL,
  INDEX idx_vdl_vehicle_id (vehicle_id),
  INDEX idx_vdl_company_id (company_id),
  INDEX idx_vdl_driver_id (driver_id),
  INDEX idx_vdl_sys_user_id (sys_user_id),
  INDEX idx_vdl_log_event_type_id (log_event_type_id),
  INDEX idx_vdl_log_timestamp (log_timestamp),
  INDEX idx_vdl_attached_document_id (attached_document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Default Data Inserts
-- -----------------------------------------------------

-- Base Lookup Data (from Version 1.0)
INSERT IGNORE INTO vehicle_status (name, description) VALUES
('Available', 'Vehicle is ready for use'),
('In Use', 'Vehicle is currently on a trip or assigned'),
('Maintenance', 'Vehicle is undergoing maintenance'),
('Decommissioned', 'Vehicle is no longer in service');

INSERT IGNORE INTO vehicle_type (name, description) VALUES
('Car', 'Standard passenger car'),
('Van', 'Passenger or cargo van'),
('Bus', 'Large passenger vehicle'),
('Truck', 'Cargo truck'),
('Motorcycle', 'Motorcycle for transport or delivery');

INSERT IGNORE INTO driver_status (name, description) VALUES
('Available', 'Driver is available for assignment'),
('On Trip', 'Driver is currently on a trip'),
('Off Duty', 'Driver is not working'),
('On Leave', 'Driver is on scheduled leave'),
('Inactive', 'Driver is no longer active');

INSERT IGNORE INTO service_type (name, description) VALUES
('Preventive Maintenance', 'Scheduled routine checkup'),
('Corrective Maintenance', 'Repairing a specific issue'),
('Oil Change', 'Engine oil and filter replacement'),
('Tire Replacement', 'Replacement of one or more tires'),
('Brake Service', 'Inspection and repair of brake system'),
('Engine Repair', 'Repair of engine components'),
('Body Work', 'Repair of vehicle body'),
('Inspection', 'General or specific vehicle inspection');

INSERT IGNORE INTO maintenance_status (name, description) VALUES
('Requested', 'Maintenance has been requested'),
('Scheduled', 'Maintenance is scheduled'),
('In Progress', 'Maintenance is currently being performed'),
('Pending Parts', 'Maintenance is on hold waiting for parts'),
('Completed', 'Maintenance has been completed'),
('Cancelled', 'Maintenance request has been cancelled');

INSERT IGNORE INTO vehicle_request_type (name, description) VALUES
('Employee Transport', 'Transport for company employees'),
('Client Visit', 'Transport for visiting a client'),
('Goods Delivery', 'Transport for delivering goods'),
('Airport Transfer', 'Transport to or from an airport'),
('Event Transport', 'Transport for a specific event'),
('Removal Service', 'Vehicle for funeral removal services'),
('Transfer Service', 'Vehicle for funeral transfer services'),
('Vehicle Rental', 'Rental of a vehicle (bus/van)');

INSERT IGNORE INTO vehicle_request_status (name, description) VALUES
('Pending', 'Request is awaiting approval'),
('Approved', 'Request has been approved'),
('Rejected', 'Request has been rejected'),
('Scheduled', 'A trip has been scheduled for this request'),
('In Progress', 'The requested service/trip is ongoing'),
('Completed', 'The requested service/trip has been completed'),
('Cancelled', 'Request has been cancelled');

INSERT IGNORE INTO trip_status (name, description) VALUES
('Planned', 'Trip is planned but not yet started'),
('Ongoing', 'Trip is currently in progress'),
('Delayed', 'Trip is delayed'),
('Completed', 'Trip has been successfully completed'),
('Cancelled', 'Trip has been cancelled');

INSERT IGNORE INTO expense_type (name, description) VALUES
('Fuel', 'Cost of fuel'),
('Tolls', 'Road toll charges'),
('Maintenance - Minor Repair', 'Minor, unscheduled repairs'),
('Parking', 'Parking fees'),
('Cleaning', 'Vehicle cleaning services'),
('Driver Meal Allowance', 'Meal allowance for driver on trip'),
('Driver Accommodation', 'Accommodation for driver on overnight trip'),
('Vehicle Supplies', 'Supplies for the vehicle (e.g., oil, washer fluid) bought on trip');

INSERT IGNORE INTO vehicle_expense_status (name, description) VALUES
('Pending', 'Expense report is pending approval/processing'),
('Approved', 'Expense has been approved'),
('Rejected', 'Expense has been rejected'),
('Reimbursed', 'Expense has been reimbursed to the payer'),
('Paid', 'Expense has been paid directly by the company');

-- New Document Type Inserts (Version 1.1)
-- These should be inserted into the common 'document_type' table from 'common_tables.sql'
-- Ensure this part of the script is run where 'document_type' table is accessible
-- and has an auto-incrementing 'document_type_id'.
-- The tool running this cannot run INSERTs into other files, so this is a placeholder.
-- These INSERTs would typically be run by the application or a migration script
-- that has access to 'common_tables.sql' context.
-- For now, commenting them out in the file to be created by the subtask.
--
-- INSERT IGNORE INTO document_type (description) VALUES
-- ('Vehicle Registration Document'),
-- ('Vehicle Insurance Policy'),
-- ('Vehicle Inspection Certificate'),
-- ('Vehicle Photo'),
-- ('Vehicle Damage Photo'),
-- ('Driver License'),
-- ('Driver Certification'),
-- ('Driver Photo'),
-- ('Maintenance Report/Invoice'),
-- ('Maintenance Photo'),
-- ('Trip Manifest'),
-- ('Trip Delivery Note'),
-- ('Trip Route Plan'),
-- ('Trip Log Document'),
-- ('Expense Receipt'), -- This replaces the old vehicle_expense.receipt_url concept
-- ('Daily Log Photo'),
-- ('Daily Log Document');

-- New Log Event Type Inserts (Version 1.1)
INSERT IGNORE INTO log_event_type (name, description, is_incident, requires_odometer) VALUES
('Pre-Trip Inspection', 'Routine check before starting a trip', FALSE, TRUE),
('Post-Trip Check', 'Routine check after completing a trip', FALSE, TRUE),
('Fueling Event', 'Vehicle refueling details', FALSE, TRUE),
('Minor Damage Reported', 'Report of new minor damage', TRUE, FALSE),
('Driver Observation', 'General observation by driver', FALSE, FALSE),
('Vehicle Cleaning', 'Record of vehicle cleaning', FALSE, FALSE),
('Scheduled Checkpoint', 'Log for a scheduled operational checkpoint', FALSE, FALSE),
('Other', 'Generic log event type', FALSE, FALSE);

-- End of Fleet Management Schema Version 1.1
