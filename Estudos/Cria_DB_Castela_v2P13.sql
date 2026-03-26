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
