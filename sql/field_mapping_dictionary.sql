-- =============================================================================
-- Tabela de Mapeamento de Campos (Dicionário de Dados)
-- Purpose: Mapear campos do sistema antigo (Harbour/DBF) para o novo (MySQL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS field_mapping (
    field_mapping_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Estrutura Nova (MySQL)
    table_name_new VARCHAR(100) NOT NULL COMMENT 'Nome da tabela no MySQL',
    field_name_new VARCHAR(100) NOT NULL COMMENT 'Nome do campo no MySQL',
    field_type_new VARCHAR(50) COMMENT 'Tipo de dado MySQL (ex: VARCHAR, INT, DECIMAL)',
    field_size_new INT COMMENT 'Tamanho do campo',
    field_precision_new INT COMMENT 'Precisão (para DECIMAL)',
    nullable_new TINYINT DEFAULT 1 COMMENT '0=NOT NULL, 1=NULLABLE',
    default_value_new VARCHAR(255) COMMENT 'Valor padrão',

    -- Estrutura Antiga (DBF)
    table_name_old VARCHAR(100) COMMENT 'Nome da tabela DBF original',
    field_name_old VARCHAR(100) COMMENT 'Nome do campo no DBF',
    field_type_old VARCHAR(50) COMMENT 'Tipo de dado DBF (C, N, D, L, M)',
    field_size_old INT COMMENT 'Tamanho original',

    -- Metadados
    description VARCHAR(500) COMMENT 'Descrição do campo/regra de negócio',
    context TEXT COLLATE utf8mb4_unicode_ci COMMENT 'Contexto do campo',
    mapping_notes TEXT COMMENT 'Observações sobre a conversão/migração',
    is_mapped TINYINT DEFAULT 0 COMMENT '0=Pendente, 1=Mapeado, 2=Revisado',

    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,

    INDEX idx_table_new (table_name_new),
    INDEX idx_table_old (table_name_old),
    INDEX idx_is_mapped (is_mapped)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Dicionário de dados - Mapeamento Harbour/DBF para MySQL';

-- =============================================================================
-- Tabela de Mapeamento de Tabelas (Visão Macro)
-- =============================================================================

CREATE TABLE IF NOT EXISTS table_mapping (
    table_mapping_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    table_name_new VARCHAR(100) NOT NULL COMMENT 'Nome da tabela no MySQL',
    table_name_old VARCHAR(100) COMMENT 'Nome da tabela DBF original',
    module VARCHAR(50) COMMENT 'Módulo do sistema (ex: finan, estoq, farm, etc)',
    description VARCHAR(500) COMMENT 'Descrição da tabela',
    context TEXT COLLATE utf8mb4_unicode_ci COMMENT 'Contexto da tabela',
    record_count_approx INT COMMENT 'Quantidade aproximada de registros',
    is_active TINYINT DEFAULT 1 COMMENT '0=Inativa, 1=Ativa',
    migration_status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, in_progress, completed, skipped',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    deleted_by INT UNSIGNED,

    UNIQUE KEY uk_table_new (table_name_new),
    INDEX idx_module (module),
    INDEX idx_migration_status (migration_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Dicionário de dados - Mapeamento de tabelas';

-- =============================================================================
-- View para consultas combinadas
-- =============================================================================

CREATE OR REPLACE VIEW v_field_mapping AS
SELECT
    fm.field_mapping_id,
    fm.table_name_new,
    fm.field_name_new,
    fm.field_type_new,
    fm.field_size_new,
    fm.table_name_old,
    fm.field_name_old,
    fm.description,
    fm.context,
    fm.mapping_notes,
    fm.is_mapped,
    tm.module,
    tm.migration_status AS table_migration_status
FROM field_mapping fm
LEFT JOIN table_mapping tm ON fm.table_name_new = tm.table_name_new
WHERE fm.deleted_at IS NULL;