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
(2, 'Po‡os', 'POC', '1')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO sys_group (sys_group_id, name, uuid) VALUES 
(1, 'Admin', NULL),
(2, 'Standard', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name);

