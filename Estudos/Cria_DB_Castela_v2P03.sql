-- -----------------------------------------------------------------------------
-- PARTE 4: ENDERE€OS E DOCUMENTOS
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

