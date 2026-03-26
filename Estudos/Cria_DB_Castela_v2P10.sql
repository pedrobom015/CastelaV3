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

