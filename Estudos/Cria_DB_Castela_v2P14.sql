-- -----------------------------------------------------------------------------
-- PARTE 15: PROTOCOLOS E CARTEIRINHAS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doc_to_send (
    doc_to_send_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sys_unit_id INT UNSIGNED NOT NULL,
    contract_id INT UNSIGNED,
    partner_id INT UNSIGNED, -- destinat rio
    document_type_id INT UNSIGNED,
    status ENUM(
        'GENERATED',
        'PRINTED',
        'READY',
        'IN_DISTRIBUTION',
        'DELIVERED',
        'RETURNED',
        'CANCELLED'
    ) DEFAULT 'GENERATED',
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

