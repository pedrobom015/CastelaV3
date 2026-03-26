-- =========================================================================
-- Inventory Management System SQL Schema - MySQL 8.0+
-- =========================================================================
--
-- Created: 17/04/2025, Revised: 18,30/04, 10,14,18,22, Otimizado: 23/05/2025
--
-- This schema includes all necessary tables for a comprehensive inventory management system
-- including product grid handling, multiple warehouses, stock tracking, and full lifecycle
-- from purchase budgeting to final sale.

-- ARQUIVO CORRIGIDO: estoque25_mysql_corrigido.sql
-- Origem: estoque25MyCr.sql
-- Correções aplicadas:
--   1. Adicionadas tabelas faltantes: `status` e `company`
--   2. Reordenadas tabelas de suporte para o início do arquivo (antes das que as referenciam)
--   3. Convertidos campos VARCHAR+CHECK IN(...) para ENUM (padrão MySQL)
--   4. Reescrita a view `vw_supply_chain_kpi` sem CTE (subquery inline)
--   5. Revisão geral: removidas construções residuais incompatíveis com MySQL
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- GENERAL SETUP
-- =========================================================================

SET default_storage_engine = InnoDB;

--    CREATE USER 'presserv_estoque' IDENTIFIED BY 'Pr3ss3rv@Estoque';
--    GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON inventory_system.* TO 'presserv_estoque';
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
-- CORE TABLES
-- =========================================================================

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouse (
    warehouse_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    warehouse_code VARCHAR(20) NOT NULL,
    address VARCHAR(512) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (warehouse_id),
    UNIQUE KEY uk_warehouse_code (sys_unit_id, warehouse_code),
    INDEX idx_warehouse_unit (sys_unit_id),
    INDEX idx_warehouse_user (sys_user_id),
    INDEX idx_warehouse_is_active (is_active),
    INDEX idx_warehouse_manager (manager_id),
    CONSTRAINT fk_warehouse_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_warehouse_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Physical warehouse locations';

-- Storage locations within warehouses
CREATE TABLE IF NOT EXISTS storage_location (
    location_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    location_code VARCHAR(20) NOT NULL,
    location_name VARCHAR(100),
    section VARCHAR(20),
    aisle VARCHAR(20),
    shelf VARCHAR(20),
    bin VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (location_id),
    UNIQUE KEY uk_storage_location_code (warehouse_id, location_code),
    INDEX idx_storage_location_unit (sys_unit_id),
    INDEX idx_storage_location_user (sys_user_id),
    INDEX idx_location_is_active (is_active),
    INDEX idx_location_hierarchy (warehouse_id, section, aisle, shelf, bin),
    CONSTRAINT fk_storage_location_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_storage_location_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_storage_location_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Specific storage locations within warehouses';

-- Product categories
CREATE TABLE IF NOT EXISTS product_category (
    category_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    parent_category_id INT UNSIGNED NULL,
    category_name VARCHAR(100) NOT NULL,
    category_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (category_id),
    UNIQUE KEY uk_product_category_name (category_name),
    INDEX idx_product_category_unit (sys_unit_id),
    INDEX idx_product_category_user (sys_user_id),
    INDEX idx_category_parent (parent_category_id),
    CONSTRAINT fk_product_category_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_category_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_category_parent_category_id FOREIGN KEY (parent_category_id) REFERENCES product_category (category_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FULLTEXT INDEX ft_category_search (category_name, category_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Product categorization hierarchy';

-- Brands
CREATE TABLE IF NOT EXISTS brand (
    brand_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    brand_description VARCHAR(500),
    logo_url VARCHAR(255),
    website VARCHAR(100),
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (brand_id),
    UNIQUE KEY uk_brand_name (brand_name),
    INDEX idx_brand_unit (sys_unit_id),
    INDEX idx_brand_user (sys_user_id),
    FULLTEXT INDEX ft_brand_search (brand_name, brand_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Product brands and manufacturers';

-- Units of measurement
CREATE TABLE IF NOT EXISTS units_of_measurement (
    uom_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    uom_code VARCHAR(10) NOT NULL,
    uom_name VARCHAR(50) NOT NULL,
    uom_description VARCHAR(255),
    uom_type ENUM('weight', 'volume', 'length', 'count', 'other') NOT NULL DEFAULT 'other',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (uom_id),
    UNIQUE KEY uk_uom_code (uom_code),
    INDEX idx_uom_unit (sys_unit_id),
    INDEX idx_uom_user (sys_user_id),
    INDEX idx_uom_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Units of measurement for products';

-- Product base table
CREATE TABLE IF NOT EXISTS product (
    product_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_description VARCHAR(1000),
    category_id INT UNSIGNED NOT NULL,
    brand_id INT UNSIGNED,
    base_uom_id INT UNSIGNED NOT NULL,
    purchase_uom_id INT UNSIGNED,
    sales_uom_id INT UNSIGNED,
    barcode VARCHAR(50),
    sku VARCHAR(50),
    hs_code VARCHAR(20) COMMENT 'Harmonized System code for international trade',
    weight DECIMAL(10,3) COMMENT 'Weight in weight_uom units',
    width DECIMAL(10,3) COMMENT 'Width in dim_uom units',
    height DECIMAL(10,3) COMMENT 'Height in dim_uom units',
    depth DECIMAL(10,3) COMMENT 'Depth in dim_uom units',
    weight_uom_id INT UNSIGNED,
    dim_uom_id INT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    is_sellable BOOLEAN DEFAULT TRUE,
    is_purchasable BOOLEAN DEFAULT TRUE,
    has_variations BOOLEAN DEFAULT FALSE,
    min_purchase_qty DECIMAL(10,3) DEFAULT 1,
    lead_time INT COMMENT 'Lead time in days from primary supplier',
    shelf_life INT COMMENT 'Shelf life in days',
    warranty_period INT COMMENT 'Warranty period in days',
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (product_id),
    UNIQUE KEY uk_product_code (sys_unit_id, product_code),
    INDEX idx_product_unit (sys_unit_id),
    INDEX idx_product_user (sys_user_id),
    INDEX idx_product_is_active (is_active),
    INDEX idx_product_is_sellable (is_sellable),
    INDEX idx_product_is_purchasable (is_purchasable),
    INDEX idx_product_category (category_id),
    INDEX idx_product_brand (brand_id),
    INDEX idx_product_base_uom (base_uom_id),
    INDEX idx_product_purchase_uom (purchase_uom_id),
    INDEX idx_product_sales_uom (sales_uom_id),
    INDEX idx_product_weight_uom (weight_uom_id),
    INDEX idx_product_dim_uom (dim_uom_id),
    INDEX idx_product_is_deleted (is_deleted),
    CONSTRAINT fk_product_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_category_id FOREIGN KEY (category_id) REFERENCES product_category (category_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_product_brand_id FOREIGN KEY (brand_id) REFERENCES brand (brand_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_base_uom_id FOREIGN KEY (base_uom_id) REFERENCES units_of_measurement (uom_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_product_purchase_uom_id FOREIGN KEY (purchase_uom_id) REFERENCES units_of_measurement (uom_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_sales_uom_id FOREIGN KEY (sales_uom_id) REFERENCES units_of_measurement (uom_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_weight_uom_id FOREIGN KEY (weight_uom_id) REFERENCES units_of_measurement (uom_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_dim_uom_id FOREIGN KEY (dim_uom_id) REFERENCES units_of_measurement (uom_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FULLTEXT INDEX ft_product_search (product_code, product_name, product_description, barcode, sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Base product information';

-- Product attributes (color, size, material, etc.)
CREATE TABLE IF NOT EXISTS attribute_type (
    attribute_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    attribute_name VARCHAR(50) NOT NULL,
    attribute_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (attribute_type_id),
    UNIQUE KEY uk_attribute_type_name (attribute_name),
    INDEX idx_attribute_type_unit (sys_unit_id),
    INDEX idx_attribute_type_user (sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attribute values
CREATE TABLE IF NOT EXISTS attribute_value (
    attribute_value_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    attribute_type_id INT UNSIGNED NOT NULL,
    value VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (attribute_value_id),
    UNIQUE KEY uk_attribute_value (attribute_type_id, value),
    INDEX idx_attribute_value_unit (sys_unit_id),
    INDEX idx_attribute_value_user (sys_user_id),
    CONSTRAINT fk_attribute_value_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_attribute_value_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_attribute_value_attribute_type_id FOREIGN KEY (attribute_type_id) REFERENCES attribute_type (attribute_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product variations (specific combinations of attributes)
CREATE TABLE IF NOT EXISTS product_variation (
    variation_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_code VARCHAR(50) NOT NULL,
    variation_name VARCHAR(200),
    barcode VARCHAR(50),
    sku VARCHAR(50),
    weight DECIMAL(10,3),
    width DECIMAL(10,3),
    height DECIMAL(10,3),
    depth DECIMAL(10,3),
    is_active BOOLEAN DEFAULT TRUE,
    additional_cost DECIMAL(15,4) DEFAULT NULL,
    additional_price DECIMAL(15,4) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (variation_id),
    UNIQUE KEY uk_product_variation_code (product_id, variation_code),
    INDEX idx_product_variation_unit (sys_unit_id),
    INDEX idx_product_variation_user (sys_user_id),
    CONSTRAINT fk_product_variation_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_variation_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_variation_product_id FOREIGN KEY (product_id) REFERENCES product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variation attributes - links variations with specific attribute values
CREATE TABLE IF NOT EXISTS variation_attribute (
    var_attr_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NOT NULL,
    attribute_type_id INT UNSIGNED NOT NULL,
    attribute_value_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (var_attr_id),
    UNIQUE KEY uk_variation_attribute (variation_id, attribute_type_id),
    INDEX idx_variation_attribute_unit (sys_unit_id),
    INDEX idx_variation_attribute_user (sys_user_id),
    INDEX idx_va_attribute_type (attribute_type_id),
    INDEX idx_va_attribute_value (attribute_value_id),
    CONSTRAINT fk_variation_attribute_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_variation_attribute_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_variation_attribute_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_variation_attribute_attribute_type_id FOREIGN KEY (attribute_type_id) REFERENCES attribute_type (attribute_type_id),
    CONSTRAINT fk_variation_attribute_attribute_value_id FOREIGN KEY (attribute_value_id) REFERENCES attribute_value (attribute_value_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product pricing
CREATE TABLE IF NOT EXISTS product_pricing (
    price_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    price_list_name VARCHAR(100) NOT NULL DEFAULT 'Standard',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    cost_price DECIMAL(15,4) NOT NULL,
    list_price DECIMAL(15,4) NOT NULL,
    wholesale_price DECIMAL(15,4) DEFAULT NULL,
    retail_price DECIMAL(15,4) NOT NULL,
    minimum_price DECIMAL(15,4) DEFAULT NULL,
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (price_id),
    INDEX idx_product_pricing_unit (sys_unit_id),
    INDEX idx_product_pricing_user (sys_user_id),
    INDEX idx_pp_product_variation (product_id, variation_id),
    INDEX idx_pp_price_list_name (price_list_name),
    INDEX idx_pp_is_active (is_active),
    INDEX idx_pp_valid_to (valid_to),
    CONSTRAINT fk_product_pricing_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_pricing_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_pricing_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_product_pricing_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product images
CREATE TABLE IF NOT EXISTS product_image (
    image_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (image_id),
    INDEX idx_product_image_unit (sys_unit_id),
    INDEX idx_product_image_user (sys_user_id),
    INDEX idx_pi_product_variation (product_id, variation_id),
    CONSTRAINT fk_product_image_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_image_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_image_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_product_image_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_code VARCHAR(50),
    tax_id VARCHAR(20),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(512),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    website VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    supplier_rating INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (supplier_id),
    UNIQUE KEY uk_supplier_code (sys_unit_id, supplier_code),
    INDEX idx_supplier_unit (sys_unit_id),
    INDEX idx_supplier_user (sys_user_id),
    INDEX idx_supplier_name (supplier_name),
    CONSTRAINT fk_supplier_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_supplier_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products and their supplier relationships
CREATE TABLE IF NOT EXISTS product_supplier (
    product_supplier_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    supplier_id INT UNSIGNED NOT NULL,
    supplier_product_code VARCHAR(50),
    supplier_product_name VARCHAR(200),
    is_preferred_supplier BOOLEAN DEFAULT FALSE,
    min_order_qty DECIMAL(10,3),
    purchase_uom_id INT UNSIGNED,
    lead_time INT,
    price DECIMAL(15,4),
    currency_code VARCHAR(3) DEFAULT 'USD',
    last_purchase_date DATE,
    last_purchase_price DECIMAL(15,4),
    supplier_rating INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (product_supplier_id),
    UNIQUE KEY uk_product_supplier (product_id, variation_id, supplier_id),
    INDEX idx_product_supplier_unit (sys_unit_id),
    INDEX idx_product_supplier_user (sys_user_id),
    INDEX idx_ps_supplier (supplier_id),
    INDEX idx_ps_purchase_uom (purchase_uom_id),
    INDEX idx_ps_preferred_supplier (is_preferred_supplier),
    CONSTRAINT fk_product_supplier_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_product_supplier_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_product_supplier_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_product_supplier_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_product_supplier_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    CONSTRAINT fk_product_supplier_purchase_uom_id FOREIGN KEY (purchase_uom_id) REFERENCES units_of_measurement (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INVENTORY MANAGEMENT
-- =========================================================================

-- Stock levels
CREATE TABLE IF NOT EXISTS stock_level (
    stock_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL COMMENT 'NULL for base product',
    warehouse_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED NULL COMMENT 'NULL for unlocated stock',
    qty_on_hand DECIMAL(15,3) NOT NULL DEFAULT 0,
    qty_reserved DECIMAL(15,3) NOT NULL DEFAULT 0,
    qty_available DECIMAL(15,3) GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,
    qty_on_order DECIMAL(15,3) NOT NULL DEFAULT 0,
    min_stock_level DECIMAL(15,3),
    max_stock_level DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    reorder_qty DECIMAL(15,3),
    last_count_date DATE,
    last_received_date DATE,
    last_issued_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (stock_id),
    UNIQUE KEY uk_stock_level (product_id, variation_id, warehouse_id, location_id),
    INDEX idx_stock_level_unit (sys_unit_id),
    INDEX idx_stock_level_user (sys_user_id),
    INDEX idx_sl_variation (variation_id),
    INDEX idx_stock_warehouse (warehouse_id),
    INDEX idx_stock_location (location_id),
    INDEX idx_stock_availability (qty_available),
    INDEX idx_stock_reorder (reorder_point),
    CONSTRAINT fk_stock_level_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_stock_level_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_stock_level_product_id FOREIGN KEY (product_id) REFERENCES product (product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stock_level_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stock_level_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stock_level_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Current stock levels by location';

-- Stock movement types
CREATE TABLE IF NOT EXISTS stock_movement_type (
    movement_type_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NULL,
    sys_user_id INT UNSIGNED NULL,
    type_code VARCHAR(20) NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    affects_qty_on_hand BOOLEAN DEFAULT TRUE,
    direction ENUM('IN', 'OUT', 'TRANSFER'),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (movement_type_id),
    UNIQUE KEY uk_stock_movement_type_code (type_code),
    INDEX idx_stock_movement_type_unit (sys_unit_id),
    INDEX idx_stock_movement_type_user (sys_user_id),
    CONSTRAINT fk_stock_movement_type_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_stock_movement_type_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert common movement types
INSERT INTO stock_movement_type (type_code, type_name, affects_qty_on_hand, direction, description) VALUES
('PO_RECEIPT', 'Purchase Order Receipt', TRUE, 'IN', 'Receipt of goods from purchase order'),
('SALES_ISSUE', 'Sales Order Issue', TRUE, 'OUT', 'Issue of goods for sales order'),
('RETURN_IN', 'Customer Return', TRUE, 'IN', 'Return of goods from customer'),
('RETURN_OUT', 'Supplier Return', TRUE, 'OUT', 'Return of goods to supplier'),
('ADJUST_IN', 'Adjustment In', TRUE, 'IN', 'Positive inventory adjustment'),
('ADJUST_OUT', 'Adjustment Out', TRUE, 'OUT', 'Negative inventory adjustment'),
('TRANSFER_OUT', 'Transfer Out', TRUE, 'TRANSFER', 'Transfer to another warehouse/location'),
('TRANSFER_IN', 'Transfer In', TRUE, 'TRANSFER', 'Transfer from another warehouse/location'),
('PRODUCTION_IN', 'Production Receipt', TRUE, 'IN', 'Receipt from production'),
('PRODUCTION_OUT', 'Production Issue', TRUE, 'OUT', 'Issue for production'),
('COUNT_ADJUST', 'Inventory Count Adjustment', TRUE, 'IN', 'Adjustment after physical count'),
('WASTE', 'Waste/Scrap', TRUE, 'OUT', 'Disposal of damaged/expired goods'),
('RESERVATION', 'Reservation', FALSE, 'OUT', 'Reservation of stock (does not affect on-hand)'),
('UNRESERVATION', 'Remove Reservation', FALSE, 'IN', 'Remove stock reservation');

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movement (
    movement_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    movement_type_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    from_warehouse_id INT UNSIGNED,
    from_location_id INT UNSIGNED,
    to_warehouse_id INT UNSIGNED,
    to_location_id INT UNSIGNED,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,4),
    reference_type VARCHAR(50),
    reference_id INT,
    reference_line_id INT,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    approved_by INT,
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (movement_id, movement_date),
    INDEX idx_stock_movement_unit (sys_unit_id),
    INDEX idx_stock_movement_user (sys_user_id),
    INDEX idx_sm_movement_type (movement_type_id),
    INDEX idx_sm_product (product_id),
    INDEX idx_sm_variation (variation_id),
    INDEX idx_sm_from_warehouse (from_warehouse_id),
    INDEX idx_sm_from_location (from_location_id),
    INDEX idx_sm_to_warehouse (to_warehouse_id),
    INDEX idx_sm_to_location (to_location_id),
    INDEX idx_sm_uom (uom_id),
    INDEX idx_sm_movement_date (movement_date),
    INDEX idx_sm_reference (reference_type, reference_id),
    CONSTRAINT fk_stock_movement_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_stock_movement_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_stock_movement_movement_type_id FOREIGN KEY (movement_type_id) REFERENCES stock_movement_type (movement_type_id),
    CONSTRAINT fk_stock_movement_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_stock_movement_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_stock_movement_from_warehouse_id FOREIGN KEY (from_warehouse_id) REFERENCES warehouse (warehouse_id),
    CONSTRAINT fk_stock_movement_from_location_id FOREIGN KEY (from_location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_stock_movement_to_warehouse_id FOREIGN KEY (to_warehouse_id) REFERENCES warehouse (warehouse_id),
    CONSTRAINT fk_stock_movement_to_location_id FOREIGN KEY (to_location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_stock_movement_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock counts (Inventory physical counting)
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS stock_count (
    count_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    count_name VARCHAR(100) NOT NULL,
    count_date DATE NOT NULL,
    status ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (count_id),
    UNIQUE KEY uk_stock_count_name (sys_unit_id, count_name),
    INDEX idx_stock_count_unit (sys_unit_id),
    INDEX idx_stock_count_user (sys_user_id),
    INDEX idx_sc_warehouse (warehouse_id),
    INDEX idx_sc_status (status),
    INDEX idx_sc_count_date (count_date),
    CONSTRAINT fk_stock_count_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_stock_count_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_stock_count_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock count items
CREATE TABLE IF NOT EXISTS stock_count_item (
    count_item_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sys_unit_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    count_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    location_id INT UNSIGNED,
    expected_qty DECIMAL(15,3) NOT NULL DEFAULT 0,
    counted_qty DECIMAL(15,3),
    difference DECIMAL(15,3) GENERATED ALWAYS AS (counted_qty - expected_qty) STORED,
    uom_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    counted_by INT,
    counted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    PRIMARY KEY (count_item_id),
    INDEX idx_stock_count_item_unit (sys_unit_id),
    INDEX idx_stock_count_item_user (sys_user_id),
    INDEX idx_sci_count (count_id),
    INDEX idx_sci_product (product_id),
    INDEX idx_sci_variation (variation_id),
    INDEX idx_sci_location (location_id),
    INDEX idx_sci_uom (uom_id),
    CONSTRAINT fk_stock_count_item_unit FOREIGN KEY (sys_unit_id) REFERENCES sys_unit(sys_unit_id),
    CONSTRAINT fk_stock_count_item_user FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id),
    CONSTRAINT fk_stock_count_item_count_id FOREIGN KEY (count_id) REFERENCES stock_count (count_id),
    CONSTRAINT fk_stock_count_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_stock_count_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_stock_count_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_stock_count_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock reservations
CREATE TABLE IF NOT EXISTS stock_reservation (
    reservation_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    reservation_type VARCHAR(50) NOT NULL,
    reference_id INT NOT NULL,
    reference_line_id INT,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_stock_reservation_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_stock_reservation_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_stock_reservation_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    CONSTRAINT fk_stock_reservation_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_stock_reservation_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_sr_product (product_id),
    INDEX idx_sr_variation (variation_id),
    INDEX idx_sr_warehouse (warehouse_id),
    INDEX idx_sr_location (location_id),
    INDEX idx_sr_uom (uom_id),
    INDEX idx_sr_reference (reservation_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Batch tracking
CREATE TABLE IF NOT EXISTS batch_tracking (
    batch_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    batch_number VARCHAR(50) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE,
    initial_quantity DECIMAL(15,3) NOT NULL,
    current_quantity DECIMAL(15,3) NOT NULL,
    supplier_id INT UNSIGNED,
    purchase_order_id INT,
    purchase_order_line_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_batch_tracking_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_batch_tracking_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_batch_tracking_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    UNIQUE KEY (product_id, variation_id, batch_number),
    INDEX idx_bt_supplier (supplier_id),
    INDEX idx_bt_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Serial number tracking
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS serial_tracking (
    serial_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    serial_number VARCHAR(50) NOT NULL,
    status ENUM('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED', 'DEFECTIVE') DEFAULT 'IN_STOCK',
    batch_id INT UNSIGNED,
    purchase_date DATE,
    purchase_order_id INT,
    purchase_order_line_id INT,
    sale_date DATE,
    sales_order_id INT,
    sales_order_line_id INT,
    warranty_start_date DATE,
    warranty_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_serial_tracking_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_serial_tracking_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_serial_tracking_batch_id FOREIGN KEY (batch_id) REFERENCES batch_tracking (batch_id),
    UNIQUE KEY (product_id, variation_id, serial_number),
    INDEX idx_st_batch (batch_id),
    INDEX idx_st_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- PROCUREMENT MANAGEMENT
-- =========================================================================

-- Purchase requisitions
CREATE TABLE IF NOT EXISTS purchase_requisition (
    requisition_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    requisition_number VARCHAR(50) NOT NULL,
    requester_id INT NOT NULL,
    department VARCHAR(100),
    request_date DATE NOT NULL,
    required_date DATE,
    warehouse_id INT UNSIGNED,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED') DEFAULT 'DRAFT',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    notes TEXT,
    approved_by INT,
    approved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_purchase_requisition_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_purchase_requisition_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, requisition_number),
    INDEX idx_pr_requester (requester_id),
    INDEX idx_pr_status (status),
    INDEX idx_pr_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase requisition items
CREATE TABLE IF NOT EXISTS purchase_requisition_item (
    req_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    requisition_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    estimated_unit_price DECIMAL(15,4),
    estimated_total_price DECIMAL(15,4),
    required_date DATE,
    preferred_supplier_id INT UNSIGNED,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ORDERED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_purchase_requisition_item_requisition_id FOREIGN KEY (requisition_id) REFERENCES purchase_requisition (requisition_id),
    CONSTRAINT fk_purchase_requisition_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_purchase_requisition_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_purchase_requisition_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_purchase_requisition_item_preferred_supplier_id FOREIGN KEY (preferred_supplier_id) REFERENCES supplier (supplier_id),
    INDEX idx_pri_requisition (requisition_id),
    INDEX idx_pri_product (product_id),
    INDEX idx_pri_variation (variation_id),
    INDEX idx_pri_uom (uom_id),
    INDEX idx_pri_preferred_supplier (preferred_supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Request for quotations (RFQ)
CREATE TABLE IF NOT EXISTS request_for_quotation (
    rfq_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    rfq_number VARCHAR(50) NOT NULL,
    rfq_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('DRAFT', 'SENT', 'CLOSED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_request_for_quotation_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    UNIQUE KEY (company_id, rfq_number),
    INDEX idx_rfq_status (status),
    INDEX idx_rfq_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RFQ items
CREATE TABLE IF NOT EXISTS rfq_item (
    rfq_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    rfq_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    required_date DATE,
    requisition_id INT UNSIGNED,
    requisition_item_id INT UNSIGNED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_rfq_item_rfq_id FOREIGN KEY (rfq_id) REFERENCES request_for_quotation (rfq_id),
    CONSTRAINT fk_rfq_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_rfq_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_rfq_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_rfq_item_requisition_id FOREIGN KEY (requisition_id) REFERENCES purchase_requisition (requisition_id),
    CONSTRAINT fk_rfq_item_requisition_item_id FOREIGN KEY (requisition_item_id) REFERENCES purchase_requisition_item (req_item_id),
    INDEX idx_rfqi_rfq (rfq_id),
    INDEX idx_rfqi_product (product_id),
    INDEX idx_rfqi_variation (variation_id),
    INDEX idx_rfqi_uom (uom_id),
    INDEX idx_rfqi_requisition (requisition_id),
    INDEX idx_rfqi_requisition_item (requisition_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RFQ suppliers
CREATE TABLE IF NOT EXISTS rfq_supplier (
    rfq_supplier_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    rfq_id INT UNSIGNED NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    sent_date DATE,
    response_due_date DATE,
    response_date DATE,
    status ENUM('PENDING', 'SENT', 'RESPONDED', 'DECLINED', 'EXPIRED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_rfq_supplier_rfq_id FOREIGN KEY (rfq_id) REFERENCES request_for_quotation (rfq_id),
    CONSTRAINT fk_rfq_supplier_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    UNIQUE KEY (rfq_id, supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supplier quotations
CREATE TABLE IF NOT EXISTS supplier_quotation (
    quotation_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    rfq_supplier_id INT UNSIGNED NOT NULL,
    quotation_number VARCHAR(50),
    quotation_date DATE NOT NULL,
    valid_until DATE,
    currency_code VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(15,4) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    delivery_time VARCHAR(100),
    status ENUM('RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'EXPIRED') DEFAULT 'RECEIVED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_supplier_quotation_rfq_supplier_id FOREIGN KEY (rfq_supplier_id) REFERENCES rfq_supplier (rfq_supplier_id),
    INDEX idx_sq_rfq_supplier (rfq_supplier_id),
    INDEX idx_sq_status (status),
    INDEX idx_sq_valid_until (valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supplier quotation items
CREATE TABLE IF NOT EXISTS supplier_quotation_item (
    quotation_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    quotation_id INT UNSIGNED NOT NULL,
    rfq_item_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,4) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,4) DEFAULT 0,
    total_price DECIMAL(15,4) NOT NULL,
    lead_time INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_supplier_quotation_item_quotation_id FOREIGN KEY (quotation_id) REFERENCES supplier_quotation (quotation_id),
    CONSTRAINT fk_supplier_quotation_item_rfq_item_id FOREIGN KEY (rfq_item_id) REFERENCES rfq_item (rfq_item_id),
    CONSTRAINT fk_supplier_quotation_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_supplier_quotation_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_supplier_quotation_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_sqi_quotation (quotation_id),
    INDEX idx_sqi_rfq_item (rfq_item_id),
    INDEX idx_sqi_product (product_id),
    INDEX idx_sqi_variation (variation_id),
    INDEX idx_sqi_uom (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_order (
    po_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    quotation_id INT UNSIGNED,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    delivery_address VARCHAR(512),
    warehouse_id INT UNSIGNED,
    currency_code VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(15,4) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    status ENUM('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CANCELLED') DEFAULT 'DRAFT',
    approval_date DATE,
    approved_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_purchase_order_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_purchase_order_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    CONSTRAINT fk_purchase_order_quotation_id FOREIGN KEY (quotation_id) REFERENCES supplier_quotation (quotation_id),
    CONSTRAINT fk_purchase_order_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, po_number),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_quotation (quotation_id),
    INDEX idx_po_warehouse (warehouse_id),
    INDEX idx_po_status (status),
    INDEX idx_po_expected_delivery (expected_delivery_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase order items
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS purchase_order_item (
    po_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    po_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    requisition_id INT UNSIGNED,
    requisition_item_id INT UNSIGNED,
    quotation_item_id INT UNSIGNED,
    supplier_product_code VARCHAR(50),
    supplier_product_name VARCHAR(200),
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,4) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,4) DEFAULT 0,
    total_price DECIMAL(15,4) NOT NULL,
    expected_delivery_date DATE,
    quantity_received DECIMAL(15,3) DEFAULT 0,
    quantity_returned DECIMAL(15,3) DEFAULT 0,
    status ENUM('PENDING', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_purchase_order_item_po_id FOREIGN KEY (po_id) REFERENCES purchase_order (po_id),
    CONSTRAINT fk_purchase_order_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_purchase_order_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_purchase_order_item_requisition_id FOREIGN KEY (requisition_id) REFERENCES purchase_requisition (requisition_id),
    CONSTRAINT fk_purchase_order_item_requisition_item_id FOREIGN KEY (requisition_item_id) REFERENCES purchase_requisition_item (req_item_id),
    CONSTRAINT fk_purchase_order_item_quotation_item_id FOREIGN KEY (quotation_item_id) REFERENCES supplier_quotation_item (quotation_item_id),
    CONSTRAINT fk_purchase_order_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_poi_po (po_id),
    INDEX idx_poi_product (product_id),
    INDEX idx_poi_variation (variation_id),
    INDEX idx_poi_requisition (requisition_id),
    INDEX idx_poi_requisition_item (requisition_item_id),
    INDEX idx_poi_quotation_item (quotation_item_id),
    INDEX idx_poi_uom (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goods receipts (receiving goods from purchase orders)
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS goods_receipt (
    receipt_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    receipt_number VARCHAR(50) NOT NULL,
    po_id INT UNSIGNED NULL,
    supplier_id INT UNSIGNED NOT NULL,
    receipt_date DATE NOT NULL,
    delivery_note_number VARCHAR(50),
    warehouse_id INT UNSIGNED NOT NULL,
    received_by INT UNSIGNED NULL,
    status ENUM('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_goods_receipt_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_goods_receipt_po_id FOREIGN KEY (po_id) REFERENCES purchase_order (po_id),
    CONSTRAINT fk_goods_receipt_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    CONSTRAINT fk_goods_receipt_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, receipt_number),
    INDEX idx_gr_po (po_id),
    INDEX idx_gr_supplier (supplier_id),
    INDEX idx_gr_warehouse (warehouse_id),
    INDEX idx_gr_receipt_date (receipt_date),
    INDEX idx_gr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goods receipt items
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM (dois campos)
CREATE TABLE IF NOT EXISTS goods_receipt_item (
    receipt_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    receipt_id INT UNSIGNED NOT NULL,
    po_id INT UNSIGNED NULL,
    po_item_id INT UNSIGNED NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity_expected DECIMAL(15,3),
    quantity_received DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,4),
    location_id INT UNSIGNED,
    batch_number VARCHAR(50),
    expiry_date DATE,
    quality_check_status ENUM('PENDING', 'PASSED', 'FAILED', 'WAIVED') DEFAULT 'PENDING',
    quality_check_notes TEXT,
    status ENUM('RECEIVED', 'INSPECTING', 'ACCEPTED', 'REJECTED', 'RETURNED') DEFAULT 'RECEIVED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_goods_receipt_item_receipt_id FOREIGN KEY (receipt_id) REFERENCES goods_receipt (receipt_id),
    CONSTRAINT fk_goods_receipt_item_po_id FOREIGN KEY (po_id) REFERENCES purchase_order (po_id),
    CONSTRAINT fk_goods_receipt_item_po_item_id FOREIGN KEY (po_item_id) REFERENCES purchase_order_item (po_item_id),
    CONSTRAINT fk_goods_receipt_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_goods_receipt_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_goods_receipt_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_goods_receipt_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    INDEX idx_gri_receipt (receipt_id),
    INDEX idx_gri_po (po_id),
    INDEX idx_gri_po_item (po_item_id),
    INDEX idx_gri_product (product_id),
    INDEX idx_gri_variation (variation_id),
    INDEX idx_gri_uom (uom_id),
    INDEX idx_gri_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock returns to supplier
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS supplier_return (
    return_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    return_number VARCHAR(50) NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    po_id INT UNSIGNED NULL,
    receipt_id INT UNSIGNED NULL,
    return_date DATE NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    return_reason VARCHAR(100),
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_supplier_return_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_supplier_return_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id),
    CONSTRAINT fk_supplier_return_po_id FOREIGN KEY (po_id) REFERENCES purchase_order (po_id),
    CONSTRAINT fk_supplier_return_receipt_id FOREIGN KEY (receipt_id) REFERENCES goods_receipt (receipt_id),
    CONSTRAINT fk_supplier_return_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, return_number),
    INDEX idx_sr_supplier (supplier_id),
    INDEX idx_sr_po (po_id),
    INDEX idx_sr_receipt (receipt_id),
    INDEX idx_sr_warehouse (warehouse_id),
    INDEX idx_sr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supplier return items
CREATE TABLE IF NOT EXISTS supplier_return_item (
    return_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    return_id INT UNSIGNED NOT NULL,
    receipt_item_id INT UNSIGNED NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity_returned DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,4),
    location_id INT UNSIGNED NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    return_reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_supplier_return_item_return_id FOREIGN KEY (return_id) REFERENCES supplier_return (return_id),
    CONSTRAINT fk_supplier_return_item_receipt_item_id FOREIGN KEY (receipt_item_id) REFERENCES goods_receipt_item (receipt_item_id),
    CONSTRAINT fk_supplier_return_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_supplier_return_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_supplier_return_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_supplier_return_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    INDEX idx_sri_return (return_id),
    INDEX idx_sri_receipt_item (receipt_item_id),
    INDEX idx_sri_product (product_id),
    INDEX idx_sri_variation (variation_id),
    INDEX idx_sri_uom (uom_id),
    INDEX idx_sri_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SALES & FULFILLMENT MANAGEMENT
-- =========================================================================

-- Customers
-- CORRIGIDO: VARCHAR(50)+CHECK -> ENUM (customer_type)
CREATE TABLE IF NOT EXISTS customer (
    customer_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    customer_code VARCHAR(50),
    customer_name VARCHAR(100) NOT NULL,
    customer_type ENUM('INDIVIDUAL', 'BUSINESS', 'GOVERNMENT', 'RESELLER') DEFAULT 'INDIVIDUAL',
    tax_id VARCHAR(20),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(512),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    customer_since DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_customer_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    INDEX idx_customer_company (company_id),
    INDEX idx_customer_name (customer_name),
    INDEX idx_customer_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales orders
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS sales_order (
    so_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    so_number VARCHAR(50) NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    delivery_address VARCHAR(512),
    warehouse_id INT UNSIGNED,
    currency_code VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(15,4) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    status ENUM('DRAFT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'FULLY_SHIPPED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_sales_order_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_sales_order_customer_id FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_sales_order_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, so_number),
    INDEX idx_so_customer (customer_id),
    INDEX idx_so_warehouse (warehouse_id),
    INDEX idx_so_status (status),
    INDEX idx_so_expected_delivery (expected_delivery_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales order items
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS sales_order_item (
    so_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    so_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,4) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,4) DEFAULT 0,
    total_price DECIMAL(15,4) NOT NULL,
    requested_delivery_date DATE,
    quantity_allocated DECIMAL(15,3) DEFAULT 0,
    quantity_shipped DECIMAL(15,3) DEFAULT 0,
    quantity_returned DECIMAL(15,3) DEFAULT 0,
    warehouse_id INT UNSIGNED,
    status ENUM('PENDING', 'ALLOCATED', 'PARTIALLY_SHIPPED', 'FULLY_SHIPPED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_sales_order_item_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_sales_order_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_sales_order_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_sales_order_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_sales_order_item_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    INDEX idx_soi_so (so_id),
    INDEX idx_soi_product (product_id),
    INDEX idx_soi_variation (variation_id),
    INDEX idx_soi_uom (uom_id),
    INDEX idx_soi_warehouse (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock allocations for sales orders
CREATE TABLE IF NOT EXISTS sales_allocation (
    allocation_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    so_id INT UNSIGNED NOT NULL,
    so_item_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED NULL,
    quantity_allocated DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    allocation_date DATE NOT NULL,
    allocated_by INT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_sales_allocation_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_sales_allocation_so_item_id FOREIGN KEY (so_item_id) REFERENCES sales_order_item (so_item_id),
    CONSTRAINT fk_sales_allocation_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_sales_allocation_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_sales_allocation_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    CONSTRAINT fk_sales_allocation_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_sales_allocation_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_sa_so (so_id),
    INDEX idx_sa_so_item (so_item_id),
    INDEX idx_sa_product (product_id),
    INDEX idx_sa_variation (variation_id),
    INDEX idx_sa_warehouse (warehouse_id),
    INDEX idx_sa_location (location_id),
    INDEX idx_sa_uom (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shipments/Deliveries
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS shipment (
    shipment_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    shipment_number VARCHAR(50) NOT NULL,
    so_id INT UNSIGNED NULL,
    customer_id INT UNSIGNED NOT NULL,
    shipping_date DATE NOT NULL,
    delivery_address VARCHAR(512) NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(50),
    shipped_by INT UNSIGNED NULL,
    status ENUM('DRAFT', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_shipment_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_shipment_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_shipment_customer_id FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_shipment_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, shipment_number),
    INDEX idx_shipment_so (so_id),
    INDEX idx_shipment_customer (customer_id),
    INDEX idx_shipment_warehouse (warehouse_id),
    INDEX idx_shipment_status (status),
    INDEX idx_shipment_shipping_date (shipping_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shipment items
CREATE TABLE IF NOT EXISTS shipment_item (
    shipment_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    shipment_id INT UNSIGNED NOT NULL,
    so_id INT UNSIGNED NULL,
    so_item_id INT UNSIGNED NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    allocation_id INT UNSIGNED NULL,
    quantity_shipped DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_shipment_item_shipment_id FOREIGN KEY (shipment_id) REFERENCES shipment (shipment_id),
    CONSTRAINT fk_shipment_item_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_shipment_item_so_item_id FOREIGN KEY (so_item_id) REFERENCES sales_order_item (so_item_id),
    CONSTRAINT fk_shipment_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_shipment_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_shipment_item_allocation_id FOREIGN KEY (allocation_id) REFERENCES sales_allocation (allocation_id),
    CONSTRAINT fk_shipment_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_shipment_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    INDEX idx_si_shipment (shipment_id),
    INDEX idx_si_so (so_id),
    INDEX idx_si_so_item (so_item_id),
    INDEX idx_si_product (product_id),
    INDEX idx_si_variation (variation_id),
    INDEX idx_si_allocation (allocation_id),
    INDEX idx_si_uom (uom_id),
    INDEX idx_si_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer returns
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS customer_return (
    return_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    return_number VARCHAR(50) NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    so_id INT UNSIGNED NULL,
    shipment_id INT UNSIGNED NULL,
    return_date DATE NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    return_reason VARCHAR(100),
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'INSPECTED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_customer_return_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_customer_return_customer_id FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_customer_return_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_customer_return_shipment_id FOREIGN KEY (shipment_id) REFERENCES shipment (shipment_id),
    CONSTRAINT fk_customer_return_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, return_number),
    INDEX idx_cr_customer (customer_id),
    INDEX idx_cr_so (so_id),
    INDEX idx_cr_shipment (shipment_id),
    INDEX idx_cr_warehouse (warehouse_id),
    INDEX idx_cr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer return items
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM (quality_status e inventory_status)
CREATE TABLE IF NOT EXISTS customer_return_item (
    return_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    return_id INT UNSIGNED NOT NULL,
    so_id INT UNSIGNED NULL,
    so_item_id INT UNSIGNED NULL,
    shipment_id INT UNSIGNED NULL,
    shipment_item_id INT UNSIGNED NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    quantity_returned DECIMAL(15,3) NOT NULL,
    uom_id INT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,4),
    location_id INT UNSIGNED NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    return_reason VARCHAR(100),
    quality_status ENUM('PENDING', 'GOOD', 'DAMAGED', 'DEFECTIVE') DEFAULT 'PENDING',
    inventory_status ENUM('PENDING', 'RETURNED_TO_STOCK', 'SCRAPPED', 'SENT_TO_REPAIR') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_customer_return_item_return_id FOREIGN KEY (return_id) REFERENCES customer_return (return_id),
    CONSTRAINT fk_customer_return_item_so_id FOREIGN KEY (so_id) REFERENCES sales_order (so_id),
    CONSTRAINT fk_customer_return_item_so_item_id FOREIGN KEY (so_item_id) REFERENCES sales_order_item (so_item_id),
    CONSTRAINT fk_customer_return_item_shipment_id FOREIGN KEY (shipment_id) REFERENCES shipment (shipment_id),
    CONSTRAINT fk_customer_return_item_shipment_item_id FOREIGN KEY (shipment_item_id) REFERENCES shipment_item (shipment_item_id),
    CONSTRAINT fk_customer_return_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_customer_return_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_customer_return_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    CONSTRAINT fk_customer_return_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    INDEX idx_cri_return (return_id),
    INDEX idx_cri_so (so_id),
    INDEX idx_cri_so_item (so_item_id),
    INDEX idx_cri_shipment (shipment_id),
    INDEX idx_cri_shipment_item (shipment_item_id),
    INDEX idx_cri_product (product_id),
    INDEX idx_cri_variation (variation_id),
    INDEX idx_cri_uom (uom_id),
    INDEX idx_cri_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INVENTORY TRANSFER MANAGEMENT
-- =========================================================================

-- Warehouse transfers
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS warehouse_transfer (
    transfer_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    transfer_number VARCHAR(50) NOT NULL,
    from_warehouse_id INT UNSIGNED NOT NULL,
    to_warehouse_id INT UNSIGNED NOT NULL,
    transfer_date DATE NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_warehouse_transfer_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_warehouse_transfer_from_warehouse_id FOREIGN KEY (from_warehouse_id) REFERENCES warehouse (warehouse_id),
    CONSTRAINT fk_warehouse_transfer_to_warehouse_id FOREIGN KEY (to_warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, transfer_number),
    INDEX idx_wt_from_warehouse (from_warehouse_id),
    INDEX idx_wt_to_warehouse (to_warehouse_id),
    INDEX idx_wt_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Warehouse transfer items
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS warehouse_transfer_item (
    transfer_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    transfer_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    from_location_id INT UNSIGNED NULL,
    to_location_id INT UNSIGNED NULL,
    quantity DECIMAL(15,3) NOT NULL,
    quantity_sent DECIMAL(15,3) DEFAULT 0,
    quantity_received DECIMAL(15,3) DEFAULT 0,
    uom_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    status ENUM('PENDING', 'PICKED', 'SHIPPED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_warehouse_transfer_item_transfer_id FOREIGN KEY (transfer_id) REFERENCES warehouse_transfer (transfer_id),
    CONSTRAINT fk_warehouse_transfer_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_warehouse_transfer_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_warehouse_transfer_item_from_location_id FOREIGN KEY (from_location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_warehouse_transfer_item_to_location_id FOREIGN KEY (to_location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_warehouse_transfer_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_wti_transfer (transfer_id),
    INDEX idx_wti_product (product_id),
    INDEX idx_wti_variation (variation_id),
    INDEX idx_wti_from_location (from_location_id),
    INDEX idx_wti_to_location (to_location_id),
    INDEX idx_wti_uom (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INVENTORY ADJUSTMENTS
-- =========================================================================

-- Inventory adjustments
-- CORRIGIDO: VARCHAR(20)+CHECK -> ENUM
CREATE TABLE IF NOT EXISTS inventory_adjustment (
    adjustment_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    adjustment_number VARCHAR(50) NOT NULL,
    warehouse_id INT UNSIGNED NOT NULL,
    adjustment_date DATE NOT NULL,
    adjustment_reason VARCHAR(100) NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_by INT UNSIGNED NULL,
    CONSTRAINT fk_inventory_adjustment_company_id FOREIGN KEY (company_id) REFERENCES company (company_id),
    CONSTRAINT fk_inventory_adjustment_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id),
    UNIQUE KEY (company_id, adjustment_number),
    INDEX idx_ia_warehouse (warehouse_id),
    INDEX idx_ia_status (status),
    INDEX idx_ia_adjustment_date (adjustment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory adjustment items
CREATE TABLE IF NOT EXISTS inventory_adjustment_item (
    adjustment_item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    adjustment_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED NULL,
    location_id INT UNSIGNED NULL,
    quantity_before DECIMAL(15,3) NOT NULL,
    quantity_after DECIMAL(15,3) NOT NULL,
    adjustment_quantity DECIMAL(15,3) GENERATED ALWAYS AS (quantity_after - quantity_before) STORED,
    uom_id INT UNSIGNED NOT NULL,
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,4),
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),
    reason_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_inventory_adjustment_item_adjustment_id FOREIGN KEY (adjustment_id) REFERENCES inventory_adjustment (adjustment_id),
    CONSTRAINT fk_inventory_adjustment_item_product_id FOREIGN KEY (product_id) REFERENCES product (product_id),
    CONSTRAINT fk_inventory_adjustment_item_variation_id FOREIGN KEY (variation_id) REFERENCES product_variation (variation_id),
    CONSTRAINT fk_inventory_adjustment_item_location_id FOREIGN KEY (location_id) REFERENCES storage_location (location_id),
    CONSTRAINT fk_inventory_adjustment_item_uom_id FOREIGN KEY (uom_id) REFERENCES units_of_measurement (uom_id),
    INDEX idx_iai_adjustment (adjustment_id),
    INDEX idx_iai_product (product_id),
    INDEX idx_iai_variation (variation_id),
    INDEX idx_iai_location (location_id),
    INDEX idx_iai_uom (uom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- AUDIT LOGGING
-- =========================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INT UNSIGNED NULL,
    old_values JSON COMMENT 'JSON snapshot of previous values',
    new_values JSON COMMENT 'JSON snapshot of new values',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,
    CONSTRAINT fk_audit_log_changed_by FOREIGN KEY (changed_by) REFERENCES sys_user (sys_user_id) ON DELETE SET NULL,
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Audit trail for all system changes';

-- Audit log archive table
CREATE TABLE IF NOT EXISTS audit_log_archive LIKE audit_log;

-- =========================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =========================================================================

DELIMITER //

CREATE TRIGGER products_after_insert
AFTER INSERT ON product
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, new_values)
    VALUES ('product', NEW.product_id, 'INSERT', NEW.created_by,
            JSON_OBJECT(
                'product_code', NEW.product_code,
                'product_name', NEW.product_name,
                'is_active', NEW.is_active
            ));
END//

CREATE TRIGGER products_after_update
AFTER UPDATE ON product
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_values, new_values)
    VALUES ('product', NEW.product_id, 'UPDATE', NEW.updated_by,
            JSON_OBJECT(
                'product_code', OLD.product_code,
                'product_name', OLD.product_name,
                'is_active', OLD.is_active
            ),
            JSON_OBJECT(
                'product_code', NEW.product_code,
                'product_name', NEW.product_name,
                'is_active', NEW.is_active
            ));
END//

DELIMITER ;

-- =========================================================================
-- REPORTING VIEWS
-- =========================================================================

-- Current inventory levels view
CREATE VIEW vw_current_inventory AS
SELECT
    p.product_code,
    p.product_name,
    v.variation_code,
    v.variation_name,
    w.warehouse_name,
    sl.location_code,
    s.qty_on_hand,
    s.qty_reserved,
    s.qty_available,
    s.qty_on_order,
    s.min_stock_level,
    s.max_stock_level,
    s.reorder_point,
    s.reorder_qty,
    u.uom_code,
    p.category_id,
    pc.category_name,
    p.brand_id,
    b.brand_name
FROM
    stock_level s
    JOIN product p ON s.product_id = p.product_id
    LEFT JOIN product_variation v ON s.variation_id = v.variation_id
    JOIN warehouse w ON s.warehouse_id = w.warehouse_id
    LEFT JOIN storage_location sl ON s.location_id = sl.location_id
    JOIN units_of_measurement u ON p.base_uom_id = u.uom_id
    JOIN product_category pc ON p.category_id = pc.category_id
    LEFT JOIN brand b ON p.brand_id = b.brand_id
WHERE
    p.is_active = TRUE
    AND p.is_deleted = FALSE;

-- Stock movement history view
CREATE VIEW vw_stock_movement AS
SELECT
    sm.movement_id,
    sm.movement_date,
    smt.type_name AS movement_type,
    smt.direction,
    p.product_code,
    p.product_name,
    v.variation_code,
    v.variation_name,
    sm.quantity,
    u.uom_code,
    fw.warehouse_name AS from_warehouse,
    fl.location_code AS from_location,
    tw.warehouse_name AS to_warehouse,
    tl.location_code AS to_location,
    sm.reference_type,
    sm.reference_id,
    sm.batch_number,
    sm.serial_number,
    sm.unit_cost,
    sm.total_cost
FROM
    stock_movement sm
    JOIN stock_movement_type smt ON sm.movement_type_id = smt.movement_type_id
    JOIN product p ON sm.product_id = p.product_id
    LEFT JOIN product_variation v ON sm.variation_id = v.variation_id
    JOIN units_of_measurement u ON sm.uom_id = u.uom_id
    LEFT JOIN warehouse fw ON sm.from_warehouse_id = fw.warehouse_id
    LEFT JOIN storage_location fl ON sm.from_location_id = fl.location_id
    LEFT JOIN warehouse tw ON sm.to_warehouse_id = tw.warehouse_id
    LEFT JOIN storage_location tl ON sm.to_location_id = tl.location_id
ORDER BY
    sm.movement_date DESC;

-- Inventory valuation view
CREATE VIEW vw_inventory_valuation AS
SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_id,
    v.variation_code,
    v.variation_name,
    w.warehouse_id,
    w.warehouse_name,
    sl.location_id,
    sl.location_code,
    s.qty_on_hand,
    pp.cost_price,
    (s.qty_on_hand * pp.cost_price) AS total_value,
    pp.currency_code,
    pc.category_name,
    b.brand_name
FROM
    stock_level s
    JOIN product p ON s.product_id = p.product_id
    LEFT JOIN product_variation v ON s.variation_id = v.variation_id
    JOIN warehouse w ON s.warehouse_id = w.warehouse_id
    LEFT JOIN storage_location sl ON s.location_id = sl.location_id
    JOIN product_pricing pp ON (p.product_id = pp.product_id AND (s.variation_id = pp.variation_id OR (s.variation_id IS NULL AND pp.variation_id IS NULL)))
    JOIN product_category pc ON p.category_id = pc.category_id
    LEFT JOIN brand b ON p.brand_id = b.brand_id
WHERE
    p.is_active = TRUE
    AND pp.price_list_name = 'Standard'
    AND (pp.valid_to IS NULL OR pp.valid_to >= CURRENT_DATE);

-- Reorder recommendation view
CREATE VIEW vw_reorder_recommendation AS
SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_id,
    v.variation_code,
    v.variation_name,
    w.warehouse_id,
    w.warehouse_name,
    SUM(s.qty_on_hand) AS total_qty_on_hand,
    SUM(s.qty_reserved) AS total_qty_reserved,
    SUM(s.qty_available) AS total_qty_available,
    SUM(s.qty_on_order) AS total_qty_on_order,
    MIN(s.min_stock_level) AS min_stock_level,
    MIN(s.reorder_point) AS reorder_point,
    MIN(s.reorder_qty) AS reorder_qty,
    u.uom_code,
    CASE
        WHEN SUM(s.qty_available) <= MIN(s.reorder_point) THEN TRUE
        ELSE FALSE
    END AS needs_reorder,
    ps.supplier_id,
    sup.supplier_name,
    ps.lead_time,
    ps.min_order_qty,
    ps.price AS supplier_price
FROM
    stock_level s
    JOIN product p ON s.product_id = p.product_id
    LEFT JOIN product_variation v ON s.variation_id = v.variation_id
    JOIN warehouse w ON s.warehouse_id = w.warehouse_id
    JOIN units_of_measurement u ON p.base_uom_id = u.uom_id
    LEFT JOIN product_supplier ps ON (p.product_id = ps.product_id AND (s.variation_id = ps.variation_id OR (s.variation_id IS NULL AND ps.variation_id IS NULL)))
    LEFT JOIN supplier sup ON ps.supplier_id = sup.supplier_id
WHERE
    p.is_active = TRUE
    AND (ps.is_preferred_supplier = TRUE OR ps.supplier_id IS NULL)
GROUP BY
    p.product_id, v.variation_id, w.warehouse_id, u.uom_code, ps.supplier_id, sup.supplier_name, ps.lead_time, ps.min_order_qty, ps.price
HAVING
    SUM(s.qty_available) + SUM(s.qty_on_order) <= MIN(s.reorder_point);

-- Stock turnover rate view
CREATE VIEW vw_stock_turnover AS
SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_id,
    v.variation_code,
    v.variation_name,
    pc.category_name,
    b.brand_name,
    SUM(CASE WHEN (sm.movement_type_id IN (SELECT movement_type_id FROM stock_movement_type WHERE direction = 'OUT')
                  AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
         THEN sm.quantity ELSE 0 END) AS qty_sold_30days,
    AVG(s.qty_on_hand) AS avg_inventory,
    CASE
        WHEN AVG(s.qty_on_hand) > 0 THEN
            SUM(CASE WHEN (sm.movement_type_id IN (SELECT movement_type_id FROM stock_movement_type WHERE direction = 'OUT')
                          AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
                 THEN sm.quantity ELSE 0 END) / NULLIF(AVG(s.qty_on_hand), 0)
        ELSE 0
    END AS turnover_rate_30days,
    MAX(sm.movement_date) AS last_sale_date,
    DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) AS days_since_last_sale
FROM
    product p
    LEFT JOIN product_variation v ON p.product_id = v.product_id
    LEFT JOIN stock_level s ON (p.product_id = s.product_id AND (v.variation_id = s.variation_id OR (v.variation_id IS NULL AND s.variation_id IS NULL)))
    LEFT JOIN stock_movement sm ON (p.product_id = sm.product_id AND (v.variation_id = sm.variation_id OR (v.variation_id IS NULL AND sm.variation_id IS NULL)))
    LEFT JOIN product_category pc ON p.category_id = pc.category_id
    LEFT JOIN brand b ON p.brand_id = b.brand_id
WHERE
    p.is_active = TRUE
    AND sm.movement_type_id IN (SELECT movement_type_id FROM stock_movement_type WHERE direction = 'OUT')
GROUP BY
    p.product_id, v.variation_id, pc.category_name, b.brand_name;

-- Purchase Order Status view
CREATE VIEW vw_purchase_order_status AS
SELECT
    po.po_id,
    po.po_number,
    po.po_date,
    po.expected_delivery_date,
    po.status AS po_status,
    s.supplier_id,
    s.supplier_name,
    w.warehouse_name,
    COUNT(poi.po_item_id) AS total_line_items,
    SUM(poi.quantity) AS total_ordered_qty,
    SUM(poi.quantity_received) AS total_received_qty,
    SUM(poi.quantity_returned) AS total_returned_qty,
    SUM(poi.quantity - poi.quantity_received + poi.quantity_returned) AS total_pending_qty,
    po.subtotal,
    po.tax_amount,
    po.discount_amount,
    po.shipping_amount,
    po.total_amount,
    po.currency_code,
    DATEDIFF(po.expected_delivery_date, CURRENT_DATE) AS days_until_delivery,
    CASE
        WHEN po.status = 'FULLY_RECEIVED' THEN 'Completed'
        WHEN po.expected_delivery_date < CURRENT_DATE AND po.status NOT IN ('FULLY_RECEIVED', 'CLOSED', 'CANCELLED') THEN 'Overdue'
        WHEN DATEDIFF(po.expected_delivery_date, CURRENT_DATE) <= 7 AND po.status NOT IN ('FULLY_RECEIVED', 'CLOSED', 'CANCELLED') THEN 'Due Soon'
        ELSE 'On Track'
    END AS delivery_status
FROM
    purchase_order po
    JOIN supplier s ON po.supplier_id = s.supplier_id
    JOIN purchase_order_item poi ON po.po_id = poi.po_id
    LEFT JOIN warehouse w ON po.warehouse_id = w.warehouse_id
WHERE
    po.status NOT IN ('CANCELLED')
GROUP BY
    po.po_id, s.supplier_id, s.supplier_name, w.warehouse_name;

-- Sales Order Status view
CREATE VIEW vw_sales_order_status AS
SELECT
    so.so_id,
    so.so_number,
    so.order_date,
    so.expected_delivery_date,
    so.status AS so_status,
    c.customer_id,
    c.customer_name,
    w.warehouse_name,
    COUNT(soi.so_item_id) AS total_line_items,
    SUM(soi.quantity) AS total_ordered_qty,
    SUM(soi.quantity_allocated) AS total_allocated_qty,
    SUM(soi.quantity_shipped) AS total_shipped_qty,
    SUM(soi.quantity_returned) AS total_returned_qty,
    SUM(soi.quantity - soi.quantity_shipped) AS total_pending_qty,
    so.subtotal,
    so.tax_amount,
    so.discount_amount,
    so.shipping_amount,
    so.total_amount,
    so.currency_code,
    DATEDIFF(so.expected_delivery_date, CURRENT_DATE) AS days_until_delivery,
    CASE
        WHEN so.status = 'COMPLETED' THEN 'Completed'
        WHEN so.expected_delivery_date < CURRENT_DATE AND so.status NOT IN ('FULLY_SHIPPED', 'COMPLETED', 'CANCELLED') THEN 'Overdue'
        WHEN DATEDIFF(so.expected_delivery_date, CURRENT_DATE) <= 7 AND so.status NOT IN ('FULLY_SHIPPED', 'COMPLETED', 'CANCELLED') THEN 'Due Soon'
        ELSE 'On Track'
    END AS delivery_status
FROM
    sales_order so
    JOIN customer c ON so.customer_id = c.customer_id
    JOIN sales_order_item soi ON so.so_id = soi.so_id
    LEFT JOIN warehouse w ON so.warehouse_id = w.warehouse_id
WHERE
    so.status NOT IN ('CANCELLED')
GROUP BY
    so.so_id, c.customer_id, c.customer_name, w.warehouse_name;

-- Inventory Aging view
CREATE VIEW vw_inventory_aging AS
SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_id,
    v.variation_code,
    v.variation_name,
    w.warehouse_name,
    sl.location_code,
    s.qty_on_hand,
    pp.cost_price,
    (s.qty_on_hand * pp.cost_price) AS total_value,
    pc.category_name,
    b.brand_name,
    MAX(sm.movement_date) AS last_receipt_date,
    DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) AS days_in_inventory,
    CASE
        WHEN DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) <= 30 THEN '0-30 days'
        WHEN DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) <= 60 THEN '31-60 days'
        WHEN DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) <= 90 THEN '61-90 days'
        WHEN DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) <= 180 THEN '91-180 days'
        WHEN DATEDIFF(CURRENT_DATE, MAX(sm.movement_date)) <= 365 THEN '181-365 days'
        ELSE 'Over 365 days'
    END AS age_bucket
FROM
    stock_level s
    JOIN product p ON s.product_id = p.product_id
    LEFT JOIN product_variation v ON s.variation_id = v.variation_id
    JOIN warehouse w ON s.warehouse_id = w.warehouse_id
    LEFT JOIN storage_location sl ON s.location_id = sl.location_id
    JOIN product_pricing pp ON (p.product_id = pp.product_id AND (s.variation_id = pp.variation_id OR (s.variation_id IS NULL AND pp.variation_id IS NULL)))
    JOIN product_category pc ON p.category_id = pc.category_id
    LEFT JOIN brand b ON p.brand_id = b.brand_id
    LEFT JOIN stock_movement sm ON (p.product_id = sm.product_id AND (v.variation_id = sm.variation_id OR (v.variation_id IS NULL AND sm.variation_id IS NULL))
                                    AND sm.movement_type_id IN (SELECT movement_type_id FROM stock_movement_type WHERE direction = 'IN'))
WHERE
    p.is_active = TRUE
    AND pp.price_list_name = 'Standard'
    AND (pp.valid_to IS NULL OR pp.valid_to >= CURRENT_DATE)
    AND s.qty_on_hand > 0
GROUP BY
    p.product_id, v.variation_id, w.warehouse_id, sl.location_id, p.product_code, p.product_name, v.variation_code, v.variation_name, w.warehouse_name, sl.location_code, s.qty_on_hand, pp.cost_price, pp.currency_code, pc.category_name, b.brand_name;

-- Stock Accuracy view
CREATE VIEW vw_stock_accuracy AS
SELECT
    sc.count_id,
    sc.count_name,
    sc.count_date,
    sc.status AS count_status,
    w.warehouse_name,
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_code,
    v.variation_name,
    sci.expected_qty,
    sci.counted_qty,
    sci.difference,
    CASE
        WHEN sci.expected_qty = 0 AND sci.counted_qty > 0 THEN 100.00
        WHEN sci.expected_qty = 0 AND sci.counted_qty = 0 THEN 0.00
        ELSE ABS(sci.difference) / NULLIF(sci.expected_qty, 0) * 100
    END AS discrepancy_percentage,
    u.uom_code,
    pc.category_name,
    CASE
        WHEN sci.difference = 0 THEN 'Accurate'
        WHEN sci.difference > 0 THEN 'Surplus'
        ELSE 'Deficit'
    END AS variance_type
FROM
    stock_count_item sci
    JOIN stock_count sc ON sci.count_id = sc.count_id
    JOIN product p ON sci.product_id = p.product_id
    LEFT JOIN product_variation v ON sci.variation_id = v.variation_id
    JOIN warehouse w ON sc.warehouse_id = w.warehouse_id
    JOIN units_of_measurement u ON sci.uom_id = u.uom_id
    JOIN product_category pc ON p.category_id = pc.category_id
WHERE
    sc.status = 'COMPLETED'
ORDER BY
    sc.count_date DESC, ABS(sci.difference) DESC;

-- Warehouse Transfer Status view
CREATE VIEW vw_warehouse_transfer_status AS
SELECT
    wt.transfer_id,
    wt.transfer_number,
    wt.transfer_date,
    fw.warehouse_name AS from_warehouse,
    tw.warehouse_name AS to_warehouse,
    wt.status AS transfer_status,
    COUNT(wti.transfer_item_id) AS total_line_items,
    SUM(wti.quantity) AS total_transfer_qty,
    SUM(wti.quantity_sent) AS total_sent_qty,
    SUM(wti.quantity_received) AS total_received_qty,
    SUM(wti.quantity - wti.quantity_received) AS total_pending_qty,
    CASE
        WHEN wt.status = 'FULLY_RECEIVED' THEN 'Completed'
        WHEN wt.status = 'IN_TRANSIT' THEN 'In Transit'
        WHEN wt.status = 'PARTIALLY_RECEIVED' THEN 'Partially Received'
        ELSE wt.status
    END AS status_description
FROM
    warehouse_transfer wt
    JOIN warehouse fw ON wt.from_warehouse_id = fw.warehouse_id
    JOIN warehouse tw ON wt.to_warehouse_id = tw.warehouse_id
    JOIN warehouse_transfer_item wti ON wt.transfer_id = wti.transfer_id
WHERE
    wt.status NOT IN ('CANCELLED')
GROUP BY
    wt.transfer_id, fw.warehouse_name, tw.warehouse_name;

-- Product Performance view
CREATE VIEW vw_product_performance AS
SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_id,
    v.variation_code,
    v.variation_name,
    pc.category_name,
    b.brand_name,
    SUM(CASE WHEN (sm.movement_type_id = (SELECT movement_type_id FROM stock_movement_type WHERE type_code = 'SALES_ISSUE')
                  AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
         THEN sm.quantity ELSE 0 END) AS qty_sold_30days,
    SUM(CASE WHEN (sm.movement_type_id = (SELECT movement_type_id FROM stock_movement_type WHERE type_code = 'SALES_ISSUE')
                  AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY))
         THEN sm.quantity ELSE 0 END) AS qty_sold_90days,
    SUM(s.qty_on_hand) AS current_stock,
    SUM(s.qty_available) AS available_stock,
    SUM(s.qty_on_order) AS incoming_stock,
    pp.cost_price,
    pp.retail_price,
    (pp.retail_price - pp.cost_price) AS gross_profit,
    (CASE WHEN pp.retail_price = 0 THEN NULL ELSE ((pp.retail_price - pp.cost_price) / NULLIF(pp.retail_price, 0) * 100) END) AS profit_margin,
    (SUM(CASE WHEN (sm.movement_type_id = (SELECT movement_type_id FROM stock_movement_type WHERE type_code = 'SALES_ISSUE')
                  AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
         THEN sm.quantity ELSE 0 END) / 30) AS daily_velocity,
    (CASE
        WHEN (SUM(CASE WHEN (sm.movement_type_id = (SELECT movement_type_id FROM stock_movement_type WHERE type_code = 'SALES_ISSUE')
                           AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
                  THEN sm.quantity ELSE 0 END) / 30) > 0
        THEN SUM(s.qty_available) / NULLIF((SUM(CASE WHEN (sm.movement_type_id = (SELECT movement_type_id FROM stock_movement_type WHERE type_code = 'SALES_ISSUE')
                                              AND sm.movement_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY))
                                     THEN sm.quantity ELSE 0 END) / 30), 0)
        ELSE NULL
    END) AS days_of_inventory
FROM
    product p
    LEFT JOIN product_variation v ON p.product_id = v.product_id
    LEFT JOIN stock_level s ON (p.product_id = s.product_id AND (v.variation_id = s.variation_id OR (v.variation_id IS NULL AND s.variation_id IS NULL)))
    LEFT JOIN stock_movement sm ON (p.product_id = sm.product_id AND (v.variation_id = sm.variation_id OR (v.variation_id IS NULL AND sm.variation_id IS NULL)))
    LEFT JOIN product_category pc ON p.category_id = pc.category_id
    LEFT JOIN brand b ON p.brand_id = b.brand_id
    LEFT JOIN product_pricing pp ON (p.product_id = pp.product_id AND (v.variation_id = pp.variation_id OR (v.variation_id IS NULL AND pp.variation_id IS NULL)))
WHERE
    p.is_active = TRUE
    AND pp.price_list_name = 'Standard'
    AND (pp.valid_to IS NULL OR pp.valid_to >= CURRENT_DATE)
GROUP BY
    p.product_id, v.variation_id, pc.category_name, b.brand_name, pp.cost_price, pp.retail_price;

-- Batch Expiry view
CREATE VIEW vw_batch_expiry AS
SELECT
    bt.batch_id,
    bt.batch_number,
    p.product_id,
    p.product_code,
    p.product_name,
    v.variation_code,
    v.variation_name,
    bt.manufacture_date,
    bt.expiry_date,
    bt.current_quantity,
    pp.cost_price,
    (bt.current_quantity * pp.cost_price) AS total_value,
    DATEDIFF(bt.expiry_date, CURRENT_DATE) AS days_until_expiry,
    CASE
        WHEN bt.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN DATEDIFF(bt.expiry_date, CURRENT_DATE) <= 30 THEN 'Expiring Soon (<30 days)'
        WHEN DATEDIFF(bt.expiry_date, CURRENT_DATE) <= 90 THEN 'Warning (30-90 days)'
        ELSE 'OK (>90 days)'
    END AS expiry_status,
    s.supplier_name
FROM
    batch_tracking bt
    JOIN product p ON bt.product_id = p.product_id
    LEFT JOIN product_variation v ON bt.variation_id = v.variation_id
    LEFT JOIN product_pricing pp ON (p.product_id = pp.product_id AND (bt.variation_id = pp.variation_id OR (bt.variation_id IS NULL AND pp.variation_id IS NULL)))
    LEFT JOIN supplier s ON bt.supplier_id = s.supplier_id
WHERE
    bt.current_quantity > 0
    AND pp.price_list_name = 'Standard'
    AND (pp.valid_to IS NULL OR pp.valid_to >= CURRENT_DATE);

-- Warehouse Space Utilization view
CREATE VIEW vw_warehouse_utilization AS
SELECT
    w.warehouse_id,
    w.warehouse_name,
    COUNT(DISTINCT sl.location_id) AS total_locations,
    COUNT(DISTINCT s.product_id) AS unique_products,
    SUM(s.qty_on_hand) AS total_items,
    SUM(s.qty_on_hand * p.width * p.height * p.depth) AS total_volume_used,
    COUNT(DISTINCT CASE WHEN s.qty_on_hand = 0 THEN sl.location_id END) AS empty_locations,
    COUNT(DISTINCT CASE WHEN s.qty_on_hand > 0 THEN sl.location_id END) AS occupied_locations,
    (COUNT(DISTINCT CASE WHEN s.qty_on_hand > 0 THEN sl.location_id END) /
     NULLIF(COUNT(DISTINCT sl.location_id), 0)) * 100 AS location_utilization_percentage
FROM
    warehouse w
    LEFT JOIN storage_location sl ON w.warehouse_id = sl.warehouse_id
    LEFT JOIN stock_level s ON sl.location_id = s.location_id
    LEFT JOIN product p ON s.product_id = p.product_id
GROUP BY
    w.warehouse_id, w.warehouse_name;

-- Supply Chain KPI Dashboard view
-- CORRIGIDO: Reescrita sem CTE (WITH ... AS) - substituído por subquery inline
--   O MySQL não suporta CTE dentro de CREATE VIEW
CREATE VIEW vw_supply_chain_kpi AS
SELECT
    CURRENT_DATE AS report_date,
    -- Inventory metrics
    (SELECT COUNT(*) FROM product WHERE is_active = TRUE) AS active_products,
    (SELECT SUM(qty_on_hand) FROM stock_level) AS total_inventory_qty,
    (SELECT SUM(s.qty_on_hand * pp.cost_price)
     FROM stock_level s
     JOIN product p ON s.product_id = p.product_id
     LEFT JOIN product_variation v ON s.variation_id = v.variation_id
     JOIN product_pricing pp ON (p.product_id = pp.product_id AND (s.variation_id = pp.variation_id OR (s.variation_id IS NULL AND pp.variation_id IS NULL)))
     WHERE pp.price_list_name = 'Standard' AND (pp.valid_to IS NULL OR pp.valid_to >= CURRENT_DATE)) AS total_inventory_value,

    -- Procurement metrics
    (SELECT COUNT(*) FROM purchase_order WHERE status IN ('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED')) AS open_purchase_orders,
    (SELECT SUM(total_amount) FROM purchase_order WHERE status IN ('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED')) AS open_po_value,
    (SELECT COUNT(*) FROM goods_receipt WHERE receipt_date = CURRENT_DATE) AS receipts_today,

    -- Sales & fulfillment metrics
    (SELECT COUNT(*) FROM sales_order WHERE status IN ('DRAFT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED')) AS open_sales_orders,
    (SELECT SUM(total_amount) FROM sales_order WHERE status IN ('DRAFT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED')) AS open_so_value,
    (SELECT COUNT(*) FROM shipment WHERE shipping_date = CURRENT_DATE) AS shipments_today,

    -- Inventory control metrics (subquery inline replacing CTE)
    (SELECT COUNT(*)
     FROM (
         SELECT
             p2.product_id,
             v2.variation_id
         FROM product p2
         LEFT JOIN product_variation v2 ON p2.product_id = v2.product_id
         JOIN stock_level s2 ON p2.product_id = s2.product_id
             AND (v2.variation_id = s2.variation_id OR (v2.variation_id IS NULL AND s2.variation_id IS NULL))
         WHERE p2.is_active = TRUE AND s2.reorder_point IS NOT NULL
         GROUP BY p2.product_id, v2.variation_id
         HAVING SUM(s2.qty_available) + SUM(s2.qty_on_order) <= MIN(s2.reorder_point)
     ) AS reorder_subq
    ) AS products_to_reorder,
    (SELECT COUNT(*) FROM inventory_adjustment WHERE adjustment_date = CURRENT_DATE) AS adjustments_today,

    -- Transfers
    (SELECT COUNT(*) FROM warehouse_transfer WHERE status IN ('DRAFT', 'PENDING', 'IN_TRANSIT', 'PARTIALLY_RECEIVED')) AS open_transfers
FROM (SELECT 1) AS dummy;

-- =========================================================================
-- PARTITIONING FOR LARGE TABLES
-- =========================================================================

-- ALTER TABLE stock_movement PARTITION BY RANGE (YEAR(movement_date)) (
--    PARTITION p2023 VALUES LESS THAN (2026),
--    PARTITION p2024 VALUES LESS THAN (2027),
--    PARTITION p2025 VALUES LESS THAN (2028),
--    PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- =========================================================================
-- FINAL SETUP
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- Set up event scheduler for maintenance tasks
SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT nightly_maintenance
ON SCHEDULE EVERY 1 DAY STARTS '2025-01-01 02:00:00'
DO
BEGIN
    OPTIMIZE TABLE stock_movement, stock_level, audit_log;
    INSERT INTO audit_log_archive SELECT * FROM audit_log WHERE changed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    DELETE FROM audit_log WHERE changed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
END//
DELIMITER ;
