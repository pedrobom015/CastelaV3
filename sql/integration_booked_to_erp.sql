-- ============================================================
-- Script de Integração: Booked Scheduler -> sys_user (ERP)
-- Objetivo: Substituir tabela 'users' pelo 'sys_user' do ERP
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- PASSO 1: Adicionar campos necessários ao sys_user
-- ============================================================

ALTER TABLE sys_user 
    ADD COLUMN timezone VARCHAR(85) NOT NULL DEFAULT 'America/Sao_Paulo' AFTER last_login,
    ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'pt-BR' AFTER timezone,
    ADD COLUMN organization VARCHAR(85) AFTER language,
    ADD COLUMN phone VARCHAR(85) AFTER organization,
    ADD COLUMN homepage_id INT UNSIGNED DEFAULT 1 AFTER phone,
    ADD COLUMN status_id TINYINT UNSIGNED DEFAULT 1 AFTER homepage_id;

-- Adicionar constraint de FK para homepage_id (se sys_program existir)
-- ALTER TABLE sys_user 
--     ADD CONSTRAINT fk_sys_user_homepage FOREIGN KEY (homepage_id) REFERENCES sys_program(sys_program_id);

-- ============================================================
-- PASSO 2: Migrar dados de users para sys_user
-- ============================================================

-- Inserir usuários do Booked que não existem no sys_user
INSERT INTO sys_user (
    login,
    name,
    email,
    password_hash,
    password_salt,
    first_name,
    last_name,
    timezone,
    language,
    organization,
    phone,
    homepage_id,
    status_id,
    active,
    last_login,
    created_at
)
SELECT 
    username AS login,
    CONCAT(fname, ' ', lname) AS name,
    email,
    password AS password_hash,
    salt AS password_salt,
    fname AS first_name,
    lname AS last_name,
    COALESCE(timezone, 'America/Sao_Paulo') AS timezone,
    COALESCE(language, 'pt-BR') AS language,
    organization,
    phone,
    homepageid AS homepage_id,
    status_id,
    CASE WHEN status_id = 1 THEN 1 ELSE 0 END AS active,
    lastlogin AS last_login,
    date_created AS created_at
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM sys_user su 
    WHERE su.email = u.email OR su.login = u.username
);

-- ============================================================
-- PASSO 3: Criar tabela de mapeamento user_id -> sys_user_id
-- ============================================================

DROP TABLE IF EXISTS booked_user_mapping;
CREATE TABLE booked_user_mapping (
    booked_user_id INT UNSIGNED NOT NULL,
    sys_user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (booked_user_id),
    INDEX idx_sys_user_id (sys_user_id)
);

-- Popular o mapeamento
INSERT INTO booked_user_mapping (booked_user_id, sys_user_id)
SELECT u.user_id, su.sys_user_id
FROM users u
INNER JOIN sys_user su ON (
    su.email = u.email OR su.login = u.username
);

-- ============================================================
-- PASSO 4: Alterar tabelas do Booked para usar sys_user_id
-- ============================================================

-- Tabela: reservation_series (owner_id)
ALTER TABLE reservation_series 
    MODIFY COLUMN owner_id INT UNSIGNED NOT NULL,
    DROP FOREIGN KEY reservations_owner,
    ADD CONSTRAINT fk_reservation_series_owner 
        FOREIGN KEY (owner_id) REFERENCES sys_user(sys_user_id) ON DELETE CASCADE;

-- Tabela: reservation_users (user_id)
ALTER TABLE reservation_users 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL,
    DROP FOREIGN KEY reservation_users_ibfk_2,
    ADD CONSTRAINT fk_reservation_users_user 
        FOREIGN KEY (user_id) REFERENCES sys_user(sys_user_id) ON DELETE CASCADE;

-- Tabela: blackout_series (owner_id)
ALTER TABLE blackout_series 
    MODIFY COLUMN owner_id INT UNSIGNED NOT NULL;

-- Tabela: user_groups
ALTER TABLE user_groups 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: user_resource_permissions
ALTER TABLE user_resource_permissions 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: user_email_preferences
ALTER TABLE user_email_preferences 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: account_activation
ALTER TABLE account_activation 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: saved_reports
ALTER TABLE saved_reports 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: user_session
ALTER TABLE user_session 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: reminders
ALTER TABLE reminders 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- Tabela: user_preferences
ALTER TABLE user_preferences 
    MODIFY COLUMN user_id INT UNSIGNED NOT NULL;

-- ============================================================
-- PASSO 5: Remover tabela users (após todas as FK removidas)
-- ============================================================

-- Primeiro, remover as FK que ainda apontam para users
-- (algumas podem não ter sido cobertas acima)

-- Agora sim, podemos remover a tabela users
-- ATENÇÃO: Faça um backup antes desta linha!
-- DROP TABLE IF EXISTS users;

-- ============================================================
-- PASSO 6: (Opcional) Remover tabelas duplicadas do Booked
-- ============================================================

-- Estas tabelas já existem no ERP e podem ser removidas do Booked:
-- - groups (usar sys_group)
-- - roles (verificar necessidade)
-- - user_statuses (usar status com categoria)

-- sys_group pode precisar de campos adicionais para o Booked

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Verificação
-- ============================================================

-- Verificar se há usuários mapeados
SELECT 
    'Total de usuários mapeados' AS info,
    COUNT(*) AS total
FROM booked_user_mapping;

-- Verificar usuários do Booked que NÃO foram mapeados
SELECT 
    u.user_id,
    u.username,
    u.email
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM booked_user_mapping bum 
    WHERE bum.booked_user_id = u.user_id
);
