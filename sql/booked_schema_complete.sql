-- ============================================================
-- Booked Scheduler - Schema Completo (Adaptado para ERP Castela)
-- Adaptado para usar sys_user em vez de users
-- Charset: utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Tabela: announcements
-- ============================================================

-- DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
    `announcement_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `announcement_text` TEXT NOT NULL,
    `priority` INT,
    `start_date` DATETIME,
    `end_date` DATETIME,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`announcement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: layouts (definição de layout de horários)
-- ============================================================

-- DROP TABLE IF EXISTS `layouts`;
CREATE TABLE IF NOT EXISTS `layouts` (
    `layout_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`layout_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: time_blocks (blocos de horário)
-- ============================================================

-- DROP TABLE IF EXISTS `time_blocks`;
CREATE TABLE IF NOT EXISTS `time_blocks` (
    `block_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(85),
    `end_label` VARCHAR(85),
    `availability_code` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `layout_id` INT UNSIGNED NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `day_of_week` SMALLINT UNSIGNED,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`block_id`),
    INDEX (`layout_id`),
    CONSTRAINT fk_time_blocks_layout FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`layout_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: schedules (grades de horários)
-- ============================================================

-- DROP TABLE IF EXISTS `schedules`;
CREATE TABLE IF NOT EXISTS `schedules` (
    `schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NOT NULL,
    `is_default` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `weekday_start` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `days_visible` TINYINT UNSIGNED NOT NULL DEFAULT 7,
    `layout_id` INT UNSIGNED NOT NULL,
    `sys_unit_id` INT UNSIGNED,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`schedule_id`),
    INDEX (`layout_id`),
    CONSTRAINT fk_schedules_layout FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`layout_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_schedules_unit FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit`(`sys_unit_id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_types (tipos de recurso)
-- ============================================================

-- DROP TABLE IF EXISTS `resource_types`;
CREATE TABLE IF NOT EXISTS `resource_types` (
    `resource_type_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`resource_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resources (itens agendáveis - salas, veículos, equipamentos)
-- ============================================================

-- DROP TABLE IF EXISTS `resources`;
CREATE TABLE IF NOT EXISTS `resources` (
    `resource_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NOT NULL,
    `location` VARCHAR(85),
    `contact_info` VARCHAR(85),
    `description` TEXT,
    `notes` TEXT,
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `min_duration` INT,
    `min_increment` INT,
    `max_duration` INT,
    `unit_cost` DECIMAL(10,2),
    `auto_assign` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `requires_approval` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `allow_multiday_reservations` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `max_participants` INT UNSIGNED,
    `min_notice_time` INT,
    `max_notice_time` INT,
    `image_name` VARCHAR(50),
    `schedule_id` INT UNSIGNED NOT NULL,
    `resource_type_id` INT UNSIGNED,
    `sys_unit_id` INT UNSIGNED,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`resource_id`),
    INDEX (`schedule_id`),
    INDEX (`resource_type_id`),
    CONSTRAINT fk_resources_schedule FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`schedule_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_resources_type FOREIGN KEY (`resource_type_id`) REFERENCES `resource_types`(`resource_type_id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_resources_unit FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit`(`sys_unit_id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_groups (agrupamento de recursos)
-- ============================================================

-- DROP TABLE IF EXISTS `resource_groups`;
CREATE TABLE IF NOT EXISTS `resource_groups` (
    `resource_group_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NOT NULL,
    `description` TEXT,
    `parent_id` INT UNSIGNED,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`resource_group_id`),
    INDEX (`parent_id`),
    CONSTRAINT fk_resource_groups_parent FOREIGN KEY (`parent_id`) REFERENCES `resource_groups`(`resource_group_id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_group_assignment
-- ============================================================

-- DROP TABLE IF EXISTS `resource_group_assignment`;
CREATE TABLE IF NOT EXISTS `resource_group_assignment` (
    `resource_id` INT UNSIGNED NOT NULL,
    `resource_group_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`resource_id`, `resource_group_id`),
    INDEX (`resource_group_id`),
    CONSTRAINT fk_rga_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rga_group FOREIGN KEY (`resource_group_id`) REFERENCES `resource_groups`(`resource_group_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_status_reasons
-- ============================================================

-- DROP TABLE IF EXISTS `resource_status_reasons`;
CREATE TABLE IF NOT EXISTS `resource_status_reasons` (
    `resource_status_reason_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`resource_status_reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: user_resource_permissions
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `user_resource_permissions`;
CREATE TABLE IF NOT EXISTS `user_resource_permissions` (
    `sys_user_id` INT UNSIGNED NOT NULL,
    `resource_id` INT UNSIGNED NOT NULL,
    `permission_id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`sys_user_id`, `resource_id`),
    INDEX (`sys_user_id`),
    INDEX (`resource_id`),
    CONSTRAINT fk_urp_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_urp_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: group_resource_permissions
-- ATENÇÃO: Usa sys_group (não groups do Booked)
-- ============================================================

-- DROP TABLE IF EXISTS `group_resource_permissions`;
CREATE TABLE IF NOT EXISTS `group_resource_permissions` (
    `sys_group_id` INT UNSIGNED NOT NULL,
    `resource_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`sys_group_id`, `resource_id`),
    INDEX (`sys_group_id`),
    INDEX (`resource_id`),
    CONSTRAINT fk_grp_group FOREIGN KEY (`sys_group_id`) REFERENCES `sys_group`(`sys_group_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_grp_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_accessories
-- ============================================================

-- DROP TABLE IF EXISTS `resource_accessories`;
CREATE TABLE IF NOT EXISTS `resource_accessories` (
    `resource_id` INT UNSIGNED NOT NULL,
    `accessory_id` INT UNSIGNED NOT NULL,
    `quantity_required` INT UNSIGNED DEFAULT 1,
    PRIMARY KEY (`resource_id`, `accessory_id`),
    INDEX (`accessory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_images
-- ============================================================

-- DROP TABLE IF EXISTS `resource_images`;
CREATE TABLE IF NOT EXISTS `resource_images` (
    `resource_image_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `resource_id` INT UNSIGNED NOT NULL,
    `file_name` VARCHAR(100) NOT NULL,
    `file_size` INT UNSIGNED,
    `file_type` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`resource_image_id`),
    INDEX (`resource_id`),
    CONSTRAINT fk_ri_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_types
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_types`;
CREATE TABLE IF NOT EXISTS `reservation_types` (
    `type_id` TINYINT UNSIGNED NOT NULL,
    `label` VARCHAR(85) NOT NULL,
    PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_statuses
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_statuses`;
CREATE TABLE IF NOT EXISTS `reservation_statuses` (
    `status_id` TINYINT UNSIGNED NOT NULL,
    `label` VARCHAR(85) NOT NULL,
    PRIMARY KEY (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_series (cabeçalho da reserva)
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_series`;
CREATE TABLE IF NOT EXISTS `reservation_series` (
    `series_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `title` VARCHAR(85) NOT NULL,
    `description` TEXT,
    `allow_participation` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `allow_anon_participation` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `type_id` TINYINT UNSIGNED NOT NULL,
    `status_id` TINYINT UNSIGNED NOT NULL,
    `repeat_type` VARCHAR(10) DEFAULT NULL,
    `repeat_options` VARCHAR(255) DEFAULT NULL,
    `owner_id` INT UNSIGNED NOT NULL,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`series_id`),
    INDEX (`type_id`),
    INDEX (`status_id`),
    INDEX (`owner_id`),
    CONSTRAINT fk_rs_type FOREIGN KEY (`type_id`) REFERENCES `reservation_types`(`type_id`) ON UPDATE CASCADE,
    CONSTRAINT fk_rs_status FOREIGN KEY (`status_id`) REFERENCES `reservation_statuses`(`status_id`) ON UPDATE CASCADE,
    CONSTRAINT fk_rs_owner FOREIGN KEY (`owner_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_instances (ocorrências da reserva)
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_instances`;
CREATE TABLE IF NOT EXISTS `reservation_instances` (
    `reservation_instance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `reference_number` VARCHAR(50) NOT NULL,
    `series_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`reservation_instance_id`),
    INDEX (`start_date`),
    INDEX (`end_date`),
    INDEX (`reference_number`),
    INDEX (`series_id`),
    CONSTRAINT fk_ri_series FOREIGN KEY (`series_id`) REFERENCES `reservation_series`(`series_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_users (participantes)
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_users`;
CREATE TABLE IF NOT EXISTS `reservation_users` (
    `reservation_instance_id` INT UNSIGNED NOT NULL,
    `sys_user_id` INT UNSIGNED NOT NULL,
    `reservation_user_level` TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (`reservation_instance_id`, `sys_user_id`),
    INDEX (`reservation_instance_id`),
    INDEX (`sys_user_id`),
    INDEX (`reservation_user_level`),
    CONSTRAINT fk_ru_instance FOREIGN KEY (`reservation_instance_id`) REFERENCES `reservation_instances`(`reservation_instance_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_resources (recursos reservados)
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_resources`;
CREATE TABLE IF NOT EXISTS `reservation_resources` (
    `series_id` INT UNSIGNED NOT NULL,
    `resource_id` INT UNSIGNED NOT NULL,
    `resource_level_id` TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (`series_id`, `resource_id`),
    INDEX (`resource_id`),
    INDEX (`series_id`),
    CONSTRAINT fk_rr_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rresource_series FOREIGN KEY (`series_id`) REFERENCES `reservation_series`(`series_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: blackout_series (série de bloqueios)
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `blackout_series`;
CREATE TABLE IF NOT EXISTS `blackout_series` (
    `blackout_series_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `title` VARCHAR(85) NOT NULL,
    `description` TEXT,
    `owner_id` INT UNSIGNED NOT NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    PRIMARY KEY (`blackout_series_id`),
    INDEX (`owner_id`),
    CONSTRAINT fk_bs_owner FOREIGN KEY (`owner_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: blackout_instances
-- ============================================================

-- DROP TABLE IF EXISTS `blackout_instances`;
CREATE TABLE IF NOT EXISTS `blackout_instances` (
    `blackout_instance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `blackout_series_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`blackout_instance_id`),
    INDEX (`start_date`),
    INDEX (`end_date`),
    INDEX (`blackout_series_id`),
    CONSTRAINT fk_bi_series FOREIGN KEY (`blackout_series_id`) REFERENCES `blackout_series`(`blackout_series_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: blackout_series_resources
-- ============================================================

-- DROP TABLE IF EXISTS `blackout_series_resources`;
CREATE TABLE IF NOT EXISTS `blackout_series_resources` (
    `blackout_series_id` INT UNSIGNED NOT NULL,
    `resource_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`blackout_series_id`, `resource_id`),
    INDEX (`resource_id`),
    CONSTRAINT fk_bsr_series FOREIGN KEY (`blackout_series_id`) REFERENCES `blackout_series`(`blackout_series_id`) ON DELETE CASCADE,
    CONSTRAINT fk_bsr_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: user_email_preferences
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `user_email_preferences`;
CREATE TABLE IF NOT EXISTS `user_email_preferences` (
    `sys_user_id` INT UNSIGNED NOT NULL,
    `event_category` VARCHAR(45) NOT NULL,
    `event_type` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`sys_user_id`, `event_category`, `event_type`),
    CONSTRAINT fk_uep_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: quotas
-- ============================================================

-- DROP TABLE IF EXISTS `quotas`;
CREATE TABLE IF NOT EXISTS `quotas` (
    `quota_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `quantity` INT NOT NULL,
    `duration` INT,
    `units` VARCHAR(25),
    `group_id` INT UNSIGNED,
    `resource_id` INT UNSIGNED,
    `schedule_id` INT UNSIGNED,
    PRIMARY KEY (`quota_id`),
    INDEX (`group_id`),
    INDEX (`resource_id`),
    INDEX (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: accessories (acessórios/extras)
-- ============================================================

-- DROP TABLE IF EXISTS `accessories`;
CREATE TABLE IF NOT EXISTS `accessories` (
    `accessory_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NOT NULL,
    `quantity_available` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`accessory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_accessories
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_accessories`;
CREATE TABLE IF NOT EXISTS `reservation_accessories` (
    `series_id` INT UNSIGNED NOT NULL,
    `accessory_id` INT UNSIGNED NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`series_id`, `accessory_id`),
    INDEX (`accessory_id`),
    CONSTRAINT fk_ra_series FOREIGN KEY (`series_id`) REFERENCES `reservation_series`(`series_id`) ON DELETE CASCADE,
    CONSTRAINT fk_ra_accessory FOREIGN KEY (`accessory_id`) REFERENCES `accessories`(`accessory_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: dbversion
-- ============================================================

-- DROP TABLE IF EXISTS `dbversion`;
CREATE TABLE IF NOT EXISTS `dbversion` (
    `version_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `major` INT UNSIGNED NOT NULL,
    `minor` INT UNSIGNED NOT NULL,
    `revision` INT UNSIGNED NOT NULL,
    `build` INT UNSIGNED NOT NULL,
    `completed` DATETIME NOT NULL,
    PRIMARY KEY (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: custom_attributes
-- ============================================================

-- DROP TABLE IF EXISTS `custom_attributes`;
CREATE TABLE IF NOT EXISTS `custom_attributes` (
    `attribute_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `required` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `possible_values` TEXT,
    `sort_order` INT UNSIGNED DEFAULT 0,
    `category` VARCHAR(50),
    `regex_validation` VARCHAR(200),
    `is_private` TINYINT UNSIGNED DEFAULT 0,
    `is_multi` TINYINT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    `created_by` INT UNSIGNED,
    `updated_by` INT UNSIGNED,
    `deleted_by` INT UNSIGNED,
    PRIMARY KEY (`attribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: custom_attribute_values
-- ============================================================

-- DROP TABLE IF EXISTS `custom_attribute_values`;
CREATE TABLE IF NOT EXISTS `custom_attribute_values` (
    `attribute_id` INT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `value` TEXT,
    PRIMARY KEY (`attribute_id`, `entity_id`, `entity_type`),
    INDEX (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: custom_attribute_entities
-- ============================================================

-- DROP TABLE IF EXISTS `custom_attribute_entities`;
CREATE TABLE IF NOT EXISTS `custom_attribute_entities` (
    `attribute_id` INT UNSIGNED NOT NULL,
    `entity_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`attribute_id`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: custom_time_blocks
-- ============================================================

-- DROP TABLE IF EXISTS `custom_time_blocks`;
CREATE TABLE IF NOT EXISTS `custom_time_blocks` (
    `custom_block_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `schedule_id` INT UNSIGNED NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `day_of_week` TINYINT UNSIGNED,
    `date` DATE,
    `all_day` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`custom_block_id`),
    INDEX (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: account_activation
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `account_activation`;
CREATE TABLE IF NOT EXISTS `account_activation` (
    `account_activation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sys_user_id` INT UNSIGNED NOT NULL,
    `activation_code` VARCHAR(30) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`account_activation_id`),
    INDEX (`activation_code`),
    UNIQUE KEY (`activation_code`),
    CONSTRAINT fk_aa_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_files (anexos)
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_files`;
CREATE TABLE IF NOT EXISTS `reservation_files` (
    `file_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `series_id` INT UNSIGNED NOT NULL,
    `file_name` VARCHAR(100) NOT NULL,
    `file_size` INT UNSIGNED,
    `file_type` VARCHAR(50),
    `uploaded_at` DATETIME NOT NULL,
    PRIMARY KEY (`file_id`),
    INDEX (`series_id`),
    CONSTRAINT fk_rf_series FOREIGN KEY (`series_id`) REFERENCES `reservation_series`(`series_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: saved_reports
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `saved_reports`;
CREATE TABLE IF NOT EXISTS `saved_reports` (
    `saved_report_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_name` VARCHAR(50),
    `sys_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `report_details` VARCHAR(500) NOT NULL,
    PRIMARY KEY (`saved_report_id`),
    INDEX (`sys_user_id`),
    CONSTRAINT fk_sr_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: user_session
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `user_session`;
CREATE TABLE IF NOT EXISTS `user_session` (
    `user_session_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sys_user_id` INT UNSIGNED NOT NULL,
    `session_token` VARCHAR(100) NOT NULL,
    `user_session_value` TEXT NOT NULL,
    `expiry_date` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_session_id`),
    INDEX (`sys_user_id`),
    INDEX (`session_token`),
    CONSTRAINT fk_us_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reminders
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `reminders`;
CREATE TABLE IF NOT EXISTS `reminders` (
    `reminder_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `address` TEXT NOT NULL,
    `message` TEXT NOT NULL,
    `send_time` DATETIME NOT NULL,
    `ref_number` TEXT NOT NULL,
    `reminder_type` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`reminder_id`),
    INDEX (`user_id`),
    CONSTRAINT fk_reminders_user FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_reminders
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_reminders`;
CREATE TABLE IF NOT EXISTS `reservation_reminders` (
    `reservation_reminder_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `series_id` INT UNSIGNED NOT NULL,
    `minutes_prior` INT UNSIGNED NOT NULL,
    `reminder_type` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`reservation_reminder_id`),
    INDEX (`series_id`),
    CONSTRAINT fk_rremainder_series FOREIGN KEY (`series_id`) REFERENCES `reservation_series`(`series_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: peak_times
-- ============================================================

-- DROP TABLE IF EXISTS `peak_times`;
CREATE TABLE IF NOT EXISTS `peak_times` (
    `peak_time_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `schedule_id` INT UNSIGNED NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `day_of_week` TINYINT UNSIGNED,
    `all_day` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`peak_time_id`),
    INDEX (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: user_preferences
-- ATENÇÃO: Usa sys_user (não users)
-- ============================================================

-- DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE IF NOT EXISTS `user_preferences` (
    `user_preferences_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sys_user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `value` VARCHAR(100),
    PRIMARY KEY (`user_preferences_id`),
    UNIQUE KEY (`sys_user_id`, `name`),
    CONSTRAINT fk_up_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_color_rules
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_color_rules`;
CREATE TABLE IF NOT EXISTS `reservation_color_rules` (
    `reservation_color_rule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `schedule_id` INT UNSIGNED,
    `resource_id` INT UNSIGNED,
    `rule_type` VARCHAR(30) NOT NULL,
    `color` VARCHAR(7),
    `background_color` VARCHAR(7),
    PRIMARY KEY (`reservation_color_rule_id`),
    INDEX (`schedule_id`),
    INDEX (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: resource_type_assignment
-- ============================================================

-- DROP TABLE IF EXISTS `resource_type_assignment`;
CREATE TABLE IF NOT EXISTS `resource_type_assignment` (
    `resource_id` INT UNSIGNED NOT NULL,
    `resource_type_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`resource_id`, `resource_type_id`),
    CONSTRAINT fk_rta_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE,
    CONSTRAINT fk_rta_type FOREIGN KEY (`resource_type_id`) REFERENCES `resource_types`(`resource_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_guests
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_guests`;
CREATE TABLE IF NOT EXISTS `reservation_guests` (
    `reservation_instance_id` INT UNSIGNED NOT NULL,
    `email` VARCHAR(85) NOT NULL,
    `full_name` VARCHAR(85),
    PRIMARY KEY (`reservation_instance_id`, `email`),
    CONSTRAINT fk_rg_instance FOREIGN KEY (`reservation_instance_id`) REFERENCES `reservation_instances`(`reservation_instance_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: reservation_waitlist_requests
-- ============================================================

-- DROP TABLE IF EXISTS `reservation_waitlist_requests`;
CREATE TABLE IF NOT EXISTS `reservation_waitlist_requests` (
    `waitlist_request_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sys_user_id` INT UNSIGNED,
    `resource_id` INT UNSIGNED NOT NULL,
    `schedule_id` INT UNSIGNED NOT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`waitlist_request_id`),
    INDEX (`sys_user_id`),
    INDEX (`resource_id`),
    INDEX (`schedule_id`),
    CONSTRAINT fk_wwr_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE SET NULL,
    CONSTRAINT fk_wwr_resource FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE,
    CONSTRAINT fk_wwr_schedule FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`schedule_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: announcement_groups
-- ============================================================

-- DROP TABLE IF EXISTS `announcement_groups`;
CREATE TABLE IF NOT EXISTS `announcement_groups` (
    `announcement_id` INT UNSIGNED NOT NULL,
    `group_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`announcement_id`, `group_id`),
    INDEX (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: announcement_resources
-- ============================================================

-- DROP TABLE IF EXISTS `announcement_resources`;
CREATE TABLE IF NOT EXISTS `announcement_resources` (
    `announcement_id` INT UNSIGNED NOT NULL,
    `resource_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`announcement_id`, `resource_id`),
    INDEX (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: payment_configuration
-- ============================================================

-- DROP TABLE IF EXISTS `payment_configuration`;
CREATE TABLE IF NOT EXISTS `payment_configuration` (
    `payment_configuration_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `is_enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `payment_type` VARCHAR(50),
    `currency` VARCHAR(3) DEFAULT 'BRL',
    `tax_id` VARCHAR(20),
    PRIMARY KEY (`payment_configuration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: payment_gateway_settings
-- ============================================================

-- DROP TABLE IF EXISTS `payment_gateway_settings`;
CREATE TABLE IF NOT EXISTS `payment_gateway_settings` (
    `payment_gateway_setting_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `gateway_type` VARCHAR(50) NOT NULL,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT,
    `is_encrypted` TINYINT UNSIGNED DEFAULT 0,
    PRIMARY KEY (`payment_gateway_setting_id`),
    UNIQUE KEY (`gateway_type`, `setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: credit_log
-- ============================================================

-- DROP TABLE IF EXISTS `credit_log`;
CREATE TABLE IF NOT EXISTS `credit_log` (
    `credit_log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sys_user_id` INT UNSIGNED NOT NULL,
    `credit_amount` DECIMAL(10,2) NOT NULL,
    `credit_type` VARCHAR(20),
    `reference_id` INT UNSIGNED,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`credit_log_id`),
    INDEX (`sys_user_id`),
    CONSTRAINT fk_cl_user FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user`(`sys_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: payment_transaction_log
-- ============================================================

-- DROP TABLE IF EXISTS `payment_transaction_log`;
CREATE TABLE IF NOT EXISTS `payment_transaction_log` (
    `payment_transaction_log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(50) NOT NULL,
    `series_id` INT UNSIGNED NOT NULL,
    `transaction_date` DATETIME NOT NULL,
    `transaction_type` VARCHAR(20),
    `transaction_status` VARCHAR(20),
    `amount` DECIMAL(10,2),
    `currency` VARCHAR(3),
    `gateway_type` VARCHAR(50),
    `gateway_transaction_id` VARCHAR(100),
    `raw_response` TEXT,
    PRIMARY KEY (`payment_transaction_log_id`),
    UNIQUE KEY (`transaction_id`),
    INDEX (`series_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: refund_transaction_log
-- ============================================================

-- DROP TABLE IF EXISTS `refund_transaction_log`;
CREATE TABLE IF NOT EXISTS `refund_transaction_log` (
    `refund_transaction_log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `refund_id` VARCHAR(50) NOT NULL,
    `payment_transaction_log_id` INT UNSIGNED NOT NULL,
    `refund_date` DATETIME NOT NULL,
    `refund_amount` DECIMAL(10,2),
    `refund_reason` TEXT,
    PRIMARY KEY (`refund_transaction_log_id`),
    UNIQUE KEY (`refund_id`),
    INDEX (`payment_transaction_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabela: terms_of_service
-- ============================================================

-- DROP TABLE IF EXISTS `terms_of_service`;
CREATE TABLE IF NOT EXISTS `terms_of_service` (
    `terms_of_service_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `terms_text` TEXT NOT NULL,
    `terms_type` VARCHAR(20) DEFAULT 'general',
    `effective_date` DATETIME NOT NULL,
    PRIMARY KEY (`terms_of_service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Inserções de dados iniciais (tipos e status)
-- ============================================================

INSERT INTO `reservation_types` (`type_id`, `label`) VALUES 
    (1, 'reservation'),
    (2, 'reservation');

INSERT INTO `reservation_statuses` (`status_id`, `label`) VALUES 
    (1, 'pending'),
    (2, 'approved'),
    (3, 'cancelled'),
    (4, 'waitlisted');

SET FOREIGN_KEY_CHECKS = 1;
