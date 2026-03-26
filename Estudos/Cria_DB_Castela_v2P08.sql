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
