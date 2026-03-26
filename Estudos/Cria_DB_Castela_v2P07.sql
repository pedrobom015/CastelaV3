-- -----------------------------------------------------------------------------
-- PARTE 8: BENEFICI?RIOS
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

