-- ======================================================================
-- VALIDA\x80?O DE CONFORMIDADE MYSQL 8
-- Script para validar integridade de todas as tabelas criadas
-- Data: 24 de mar\x87o de 2026
-- ======================================================================

-- Verificar todas as tabelas e sua conformidade
SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_COLLATION,
    CASE
        WHEN TABLE_COLLATION = 'utf8mb4_unicode_ci' THEN '? OK'
        ELSE '? ERRO - Collation incorreta'
    END AS Conformidade,
    CASE
        WHEN ENGINE = 'InnoDB' THEN '? OK'
        ELSE '? ERRO - Engine n?o \x82 InnoDB'
    END AS Engine_Status,
    CASE
        WHEN COLUMN_NAME IS NULL THEN 'Verificar auditoria'
        ELSE 'Ok'
    END AS Auditoria
FROM INFORMATION_SCHEMA.TABLES t
LEFT JOIN INFORMATION_SCHEMA.COLUMNS c
    ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
    AND t.TABLE_NAME = c.TABLE_NAME
    AND c.COLUMN_NAME = 'created_at'
WHERE t.TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY t.TABLE_NAME;

-- Contar tabelas por conformidade
SELECT
    '=== RESUMO DE CONFORMIDADE ===' as Titulo,
    '' as Info
UNION ALL
SELECT
    CONCAT('Tabelas total: ', COUNT(*)),
    ''
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
UNION ALL
SELECT
    CONCAT('Tabelas InnoDB: ', COUNT(*)),
    ''
FROM INFORMATION_SCHEMA.TABLES
WHERE ENGINE = 'InnoDB'
    AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
UNION ALL
SELECT
    CONCAT('Tabelas utf8mb4_unicode_ci: ', COUNT(*)),
    ''
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_COLLATION = 'utf8mb4_unicode_ci'
    AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
UNION ALL
SELECT
    CONCAT('Campos criados com ON UPDATE: ', COUNT(*)),
    '(deve ter timestamp update)'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'updated_at'
    AND EXTRA LIKE '%DEFAULT_GENERATED%'
    AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys');

-- Validar Foreign Keys relacionadas
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    CASE
        WHEN REFERENCED_TABLE_NAME IS NOT NULL THEN '? FK v\xa0lida'
        ELSE '? FK quebrada'
    END AS Status_FK
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY TABLE_NAME;

-- Verificar tabelas com campos not null sem default (poss\xa1veis problemas)
SELECT
    TABLE_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY COLUMN_NAME) as Campos_sem_Default
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
    AND IS_NULLABLE = 'NO'
    AND COLUMN_DEFAULT IS NULL
    AND COLUMN_KEY != 'PRI'
    AND DATA_TYPE NOT IN ('TIMESTAMP', 'ENUM')
GROUP BY TABLE_NAME
HAVING COUNT(*) > 5
ORDER BY TABLE_NAME;

-- ======================================================================
-- RELAT?RIO DE ?NDICES
-- ======================================================================
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CASE
        WHEN NON_UNIQUE = 0 THEN '?NICO'
        ELSE 'M\xa3ltiplo'
    END AS Tipo_?ndice
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ======================================================================
-- RESUMO: Verificar integridade referencial
-- ======================================================================
-- Execute este script ap\xa2s criar os bancos de dados para validar
-- que as tabelas foram criadas corretamente e est?o em conformidade
-- com MySQL 8.0+
