-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 24/03/2026 às 21:11
-- Versão do servidor: 9.1.0
-- Versão do PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `erp_castela`
--

DELIMITER $$
--
-- Procedimentos
--
DROP PROCEDURE IF EXISTS `create_contract_version`$$
CREATE DEFINER=`presserv_adguias`@`localhost` PROCEDURE `create_contract_version` (IN `p_contract_id` INT UNSIGNED, IN `p_group_batch_id` INT UNSIGNED, IN `p_valid_from` DATE, IN `p_change_reason` VARCHAR(255), IN `p_created_by` INT UNSIGNED, OUT `p_new_version_id` INT UNSIGNED)   BEGIN
    DECLARE v_current_version_id INT UNSIGNED;
    DECLARE v_new_version_number INT UNSIGNED;

    SELECT id, version_number INTO v_current_version_id, v_new_version_number
    FROM contract_version
    WHERE contract_id = p_contract_id AND is_current = 1
    ORDER BY version_number DESC
    LIMIT 1;

    SET v_new_version_number = COALESCE(v_new_version_number, 0) + 1;

    IF v_current_version_id IS NOT NULL THEN
        UPDATE contract_version
        SET is_current = 0,
            valid_to = DATE_SUB(p_valid_from, INTERVAL 1 DAY),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_current_version_id;
    END IF;

    INSERT INTO contract_version (
        contract_id, group_batch_id, version_number,
        valid_from, valid_to, is_current, change_reason, created_by
    ) VALUES (
        p_contract_id, p_group_batch_id, v_new_version_number,
        p_valid_from, NULL, 1, p_change_reason, p_created_by
    );

    SET p_new_version_id = LAST_INSERT_ID();

    UPDATE contract
    SET current_version_id = p_new_version_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_contract_id;
END$$

DROP PROCEDURE IF EXISTS `create_group_charge`$$
CREATE DEFINER=`presserv_adguias`@`localhost` PROCEDURE `create_group_charge` (IN `p_group_batch_id` INT UNSIGNED, IN `p_death_count` INT)   BEGIN
    DECLARE v_amount_per_contract DECIMAL(19,4);
    DECLARE v_contract_count INT;
    DECLARE v_charge_id INT UNSIGNED;
    DECLARE v_cycle_id INT UNSIGNED;

    SELECT COUNT(*) INTO v_contract_count
    FROM contract c
    INNER JOIN contract_version cv ON cv.contract_id = c.id AND cv.is_current = 1
    WHERE cv.group_batch_id = p_group_batch_id
    AND c.current_status = 'active';

    IF v_contract_count > 0 THEN
        SET v_amount_per_contract = p_death_count / v_contract_count;

        INSERT INTO billing_cycle (
            sys_unit_id, sys_user_id, group_batch_id,
            death_event_count, charge_date, amount_per_contract, status
        ) VALUES (
            1, 1, p_group_batch_id,
            p_death_count, CURRENT_TIMESTAMP, v_amount_per_contract, 'PENDING'
        );

        SET v_cycle_id = LAST_INSERT_ID();

        UPDATE group_batch
        SET current_death_count = 0,
            last_death_charge_date = CURRENT_TIMESTAMP
        WHERE id = p_group_batch_id;

        UPDATE death_event
        SET processed_for_billing = 1
        WHERE group_batch_id = p_group_batch_id
        AND processed_for_billing = 0;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `update_charge_status`$$
CREATE DEFINER=`presserv_adguias`@`localhost` PROCEDURE `update_charge_status` (IN `p_charge_id` INT UNSIGNED)   BEGIN
    DECLARE v_total_amount DECIMAL(19,4);
    DECLARE v_paid_amount DECIMAL(19,4);
    DECLARE v_new_status VARCHAR(20);
    DECLARE v_paid_status_id INT UNSIGNED;
    DECLARE v_partial_status_id INT UNSIGNED;

    SELECT amount INTO v_total_amount
    FROM contract_charge
    WHERE id = p_charge_id;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payment_transaction
    WHERE charge_id = p_charge_id;

    IF v_paid_amount >= v_total_amount THEN
        SET v_new_status = 'PAID';
    ELSEIF v_paid_amount > 0 THEN
        SET v_new_status = 'PARTIAL';
    ELSE
        SET v_new_status = 'PENDING';
    END IF;

    SELECT id INTO v_paid_status_id FROM payment_status WHERE name = 'Paid' LIMIT 1;
    SELECT id INTO v_partial_status_id FROM payment_status WHERE name = 'Partial' LIMIT 1;

    UPDATE contract_charge
    SET
        paid_amount = v_paid_amount,
        payment_status_id = CASE
            WHEN v_new_status = 'PAID' THEN COALESCE(v_paid_status_id, payment_status_id)
            WHEN v_new_status = 'PARTIAL' THEN COALESCE(v_partial_status_id, payment_status_id)
            ELSE payment_status_id
        END
    WHERE id = p_charge_id;
END$$

--
-- Funções
--
DROP FUNCTION IF EXISTS `get_contract_version_at_date`$$
CREATE DEFINER=`presserv_adguias`@`localhost` FUNCTION `get_contract_version_at_date` (`p_contract_id` INT UNSIGNED, `p_date` DATE) RETURNS INT UNSIGNED DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_version_id INT UNSIGNED;

    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id
      AND valid_from <= p_date
      AND (valid_to IS NULL OR valid_to >= p_date)
    ORDER BY version_number DESC
    LIMIT 1;

    RETURN v_version_id;
END$$

DROP FUNCTION IF EXISTS `get_current_contract_version`$$
CREATE DEFINER=`presserv_adguias`@`localhost` FUNCTION `get_current_contract_version` (`p_contract_id` INT UNSIGNED) RETURNS INT UNSIGNED DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_version_id INT UNSIGNED;

    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id
      AND is_current = 1
    LIMIT 1;

    RETURN v_version_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `account_type_id` int UNSIGNED NOT NULL,
  `parent_account_id` int UNSIGNED DEFAULT NULL,
  `account_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_bank_account` tinyint DEFAULT '0',
  `is_control_account` tinyint DEFAULT '0',
  `is_tax_relevant` tinyint DEFAULT '0',
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `opening_balance` decimal(19,4) DEFAULT '0.0000',
  `current_balance` decimal(19,4) DEFAULT '0.0000',
  `level` int NOT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `uk_account_company_code` (`company_id`,`account_code`),
  KEY `idx_account_company` (`company_id`),
  KEY `idx_account_parent` (`parent_account_id`),
  KEY `idx_account_type` (`account_type_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `accounting_code`
--

DROP TABLE IF EXISTS `accounting_code`;
CREATE TABLE IF NOT EXISTS `accounting_code` (
  `accounting_code_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type_id` int UNSIGNED DEFAULT NULL,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`accounting_code_id`),
  UNIQUE KEY `uk_accounting_code_company` (`company_id`,`code`),
  KEY `idx_accounting_code_company` (`company_id`),
  KEY `idx_accounting_code_type` (`account_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `account_daily_balance`
--

DROP TABLE IF EXISTS `account_daily_balance`;
CREATE TABLE IF NOT EXISTS `account_daily_balance` (
  `daily_balance_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `balance_date` date NOT NULL,
  `opening_balance` decimal(19,4) NOT NULL,
  `debit_total` decimal(19,4) NOT NULL DEFAULT '0.0000',
  `credit_total` decimal(19,4) NOT NULL DEFAULT '0.0000',
  `closing_balance` decimal(19,4) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`daily_balance_id`),
  UNIQUE KEY `uk_account_daily_balance` (`company_id`,`account_id`,`balance_date`),
  KEY `fk_account_daily_balance_currency` (`currency`),
  KEY `idx_account_daily_balance_company` (`company_id`),
  KEY `idx_account_daily_balance_account` (`account_id`),
  KEY `idx_account_daily_balance_date` (`balance_date`),
  KEY `idx_account_balance_comp_account_date` (`company_id`,`account_id`,`balance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `account_period_balance`
--

DROP TABLE IF EXISTS `account_period_balance`;
CREATE TABLE IF NOT EXISTS `account_period_balance` (
  `period_balance_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `fiscal_period_id` int UNSIGNED NOT NULL,
  `opening_balance` decimal(19,4) NOT NULL,
  `debit_total` decimal(19,4) NOT NULL DEFAULT '0.0000',
  `credit_total` decimal(19,4) NOT NULL DEFAULT '0.0000',
  `closing_balance` decimal(19,4) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `is_adjusted` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`period_balance_id`),
  UNIQUE KEY `uk_account_period_balance` (`company_id`,`account_id`,`fiscal_period_id`),
  KEY `fk_account_period_balance_currency` (`currency`),
  KEY `idx_account_period_balance_company` (`company_id`),
  KEY `idx_account_period_balance_account` (`account_id`),
  KEY `idx_account_period_balance_fiscal_period` (`fiscal_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `account_type`
--

DROP TABLE IF EXISTS `account_type`;
CREATE TABLE IF NOT EXISTS `account_type` (
  `account_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`account_type_id`),
  UNIQUE KEY `uk_account_type_company` (`company_id`,`type_name`),
  KEY `idx_account_type_company` (`company_id`),
  KEY `idx_account_type_unit` (`sys_unit_id`),
  KEY `idx_account_type_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `addendum`
--

DROP TABLE IF EXISTS `addendum`;
CREATE TABLE IF NOT EXISTS `addendum` (
  `addendum_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `status_id` int UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`addendum_id`),
  UNIQUE KEY `uk_addendum_name` (`name`),
  KEY `idx_addendum_unit` (`sys_unit_id`),
  KEY `idx_addendum_status` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `address`
--

DROP TABLE IF EXISTS `address`;
CREATE TABLE IF NOT EXISTS `address` (
  `address_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED NOT NULL,
  `address_type_id` int UNSIGNED NOT NULL,
  `is_main` tinyint DEFAULT '1',
  `zip_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line1` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line2` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacao` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`address_id`),
  KEY `idx_address_sys_user` (`sys_user_id`),
  KEY `idx_address_type` (`address_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `address_type`
--

DROP TABLE IF EXISTS `address_type`;
CREATE TABLE IF NOT EXISTS `address_type` (
  `address_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`address_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `age_addendum`
--

DROP TABLE IF EXISTS `age_addendum`;
CREATE TABLE IF NOT EXISTS `age_addendum` (
  `age_addendum_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `addendum_id` int UNSIGNED NOT NULL,
  `class_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `additional_value` decimal(19,4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`age_addendum_id`),
  UNIQUE KEY `uk_age_addendum_name` (`name`),
  KEY `idx_age_addendum_unit` (`sys_unit_id`),
  KEY `idx_age_addendum_user` (`sys_user_id`),
  KEY `idx_age_addendum_addendum` (`addendum_id`),
  KEY `idx_age_addendum_class` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `api_error`
--

DROP TABLE IF EXISTS `api_error`;
CREATE TABLE IF NOT EXISTS `api_error` (
  `api_error_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `api_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `severity` text COLLATE utf8mb4_unicode_ci,
  `error_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `error_details` text COLLATE utf8mb4_unicode_ci,
  `stack_trace` text COLLATE utf8mb4_unicode_ci,
  `http_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_headers` text COLLATE utf8mb4_unicode_ci,
  `request_body` text COLLATE utf8mb4_unicode_ci,
  `query_parameters` text COLLATE utf8mb4_unicode_ci,
  `http_status` int DEFAULT NULL,
  `response_body` text COLLATE utf8mb4_unicode_ci,
  `response_time_ms` int DEFAULT NULL,
  `class_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `line_number` int DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `user_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `environment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_server` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_resolved` tinyint DEFAULT '0',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int UNSIGNED DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`api_error_id`),
  KEY `idx_api_error_user` (`sys_user_id`),
  KEY `idx_api_error_timestamp` (`api_timestamp`),
  KEY `idx_api_error_resolved` (`is_resolved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `attribute_type`
--

DROP TABLE IF EXISTS `attribute_type`;
CREATE TABLE IF NOT EXISTS `attribute_type` (
  `attribute_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `attribute_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attribute_description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`attribute_type_id`),
  UNIQUE KEY `uk_attribute_type_name` (`attribute_name`),
  KEY `idx_attribute_type_unit` (`sys_unit_id`),
  KEY `idx_attribute_type_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `attribute_value`
--

DROP TABLE IF EXISTS `attribute_value`;
CREATE TABLE IF NOT EXISTS `attribute_value` (
  `attribute_value_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `attribute_type_id` int UNSIGNED NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`attribute_value_id`),
  UNIQUE KEY `uk_attribute_value` (`attribute_type_id`,`value`),
  KEY `idx_attribute_value_unit` (`sys_unit_id`),
  KEY `idx_attribute_value_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE IF NOT EXISTS `audit_log` (
  `audit_log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `audit_action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_table` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `old_values` text COLLATE utf8mb4_unicode_ci,
  `new_values` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_parameters` text COLLATE utf8mb4_unicode_ci,
  `process_outcome` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_audit_log_user` (`sys_user_id`),
  KEY `idx_audit_log_record` (`record_id`),
  KEY `idx_audit_log_table` (`name_table`),
  KEY `idx_audit_log_action` (`audit_action`),
  KEY `idx_audit_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `audit_log_archive`
--

DROP TABLE IF EXISTS `audit_log_archive`;
CREATE TABLE IF NOT EXISTS `audit_log_archive` (
  `audit_log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `audit_action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_table` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `old_values` text COLLATE utf8mb4_unicode_ci,
  `new_values` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_parameters` text COLLATE utf8mb4_unicode_ci,
  `process_outcome` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_audit_log_user` (`sys_user_id`),
  KEY `idx_audit_log_record` (`record_id`),
  KEY `idx_audit_log_table` (`name_table`),
  KEY `idx_audit_log_action` (`audit_action`),
  KEY `idx_audit_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bank_account`
--

DROP TABLE IF EXISTS `bank_account`;
CREATE TABLE IF NOT EXISTS `bank_account` (
  `bank_account_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `routing_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_address` text COLLATE utf8mb4_unicode_ci,
  `account_holder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` enum('CHECKING','SAVINGS','CREDIT_CARD','LOAN','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_reconciled_date` date DEFAULT NULL,
  `default_for_payments` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`bank_account_id`),
  KEY `idx_bank_account_unit` (`sys_unit_id`),
  KEY `idx_bank_account_user` (`sys_user_id`),
  KEY `idx_bank_account_account` (`account_id`),
  KEY `idx_bank_account` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bank_reconciliation`
--

DROP TABLE IF EXISTS `bank_reconciliation`;
CREATE TABLE IF NOT EXISTS `bank_reconciliation` (
  `reconciliation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `statement_date` date NOT NULL,
  `statement_balance` decimal(19,4) NOT NULL,
  `starting_balance` decimal(19,4) NOT NULL,
  `ending_balance` decimal(19,4) NOT NULL,
  `is_reconciled` tinyint DEFAULT '0',
  `reconciled_date` timestamp NULL DEFAULT NULL,
  `reconciled_by` int UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`reconciliation_id`),
  UNIQUE KEY `uk_bank_reconciliation` (`company_id`,`account_id`,`statement_date`),
  KEY `fk_bank_reconciliation_reconciled_by` (`reconciled_by`),
  KEY `fk_bank_reconciliation_created_by` (`created_by`),
  KEY `idx_bank_reconciliation_company` (`company_id`),
  KEY `idx_bank_reconciliation_account` (`account_id`),
  KEY `idx_bank_reconciliation_date` (`statement_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bank_slip`
--

DROP TABLE IF EXISTS `bank_slip`;
CREATE TABLE IF NOT EXISTS `bank_slip` (
  `bank_slip_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `contract_charge_id` int UNSIGNED NOT NULL,
  `seq` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nnumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `charge_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `send_at` timestamp NULL DEFAULT NULL,
  `send_batch` char(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response_at` timestamp NULL DEFAULT NULL,
  `response_batch` char(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `response` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`bank_slip_id`),
  KEY `idx_bank_slip_unit` (`sys_unit_id`),
  KEY `idx_bank_slip_user` (`sys_user_id`),
  KEY `idx_bank_slip_charge` (`contract_charge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `batch_chk`
--

DROP TABLE IF EXISTS `batch_chk`;
CREATE TABLE IF NOT EXISTS `batch_chk` (
  `batch_chk_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `subsidiary_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `batch_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expenses` decimal(19,4) NOT NULL,
  `discharge_date` date NOT NULL,
  `commiss_bill` decimal(5,2) NOT NULL,
  `qtd_other` decimal(5,2) NOT NULL,
  `vl_other` decimal(19,4) NOT NULL,
  `qtd_bill` decimal(5,2) NOT NULL,
  `vl_bill` decimal(19,4) NOT NULL,
  `payment_value` decimal(19,4) NOT NULL,
  `nrcctopay` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cashier_number` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordpgrc_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`batch_chk_id`),
  KEY `idx_batch_chk_subsidiary` (`subsidiary_id`),
  KEY `idx_batch_chk_unit` (`sys_unit_id`),
  KEY `idx_batch_chk_user` (`sys_user_id`),
  KEY `idx_batch_chk_ordpgrc` (`ordpgrc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `batch_detail`
--

DROP TABLE IF EXISTS `batch_detail`;
CREATE TABLE IF NOT EXISTS `batch_detail` (
  `batch_detail_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `batch_chk_id` int UNSIGNED NOT NULL,
  `contract_charge_id` int UNSIGNED NOT NULL,
  `seq_number` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_received` decimal(19,4) NOT NULL,
  `process_status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`batch_detail_id`),
  KEY `idx_batch_detail_batch` (`batch_chk_id`),
  KEY `idx_batch_detail_charge` (`contract_charge_id`),
  KEY `idx_batch_detail_status` (`payment_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `batch_tracking`
--

DROP TABLE IF EXISTS `batch_tracking`;
CREATE TABLE IF NOT EXISTS `batch_tracking` (
  `batch_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `initial_quantity` decimal(15,3) NOT NULL,
  `current_quantity` decimal(15,3) NOT NULL,
  `supplier_id` int UNSIGNED DEFAULT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `purchase_order_line_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`batch_id`),
  UNIQUE KEY `product_id` (`product_id`,`variation_id`,`batch_number`),
  KEY `fk_batch_tracking_variation_id` (`variation_id`),
  KEY `idx_bt_supplier` (`supplier_id`),
  KEY `idx_bt_expiry_date` (`expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `beneficiary`
--

DROP TABLE IF EXISTS `beneficiary`;
CREATE TABLE IF NOT EXISTS `beneficiary` (
  `beneficiary_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint DEFAULT '0',
  `birth_at` date DEFAULT NULL,
  `gender_id` int UNSIGNED DEFAULT NULL,
  `document_id` int UNSIGNED DEFAULT NULL,
  `grace_at` date DEFAULT NULL,
  `is_alive` tinyint DEFAULT '1',
  `is_forbidden` tinyint DEFAULT '0',
  `service_funeral_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`beneficiary_id`),
  KEY `idx_beneficiary_version` (`contract_version_id`),
  KEY `idx_beneficiary_unit` (`sys_unit_id`),
  KEY `idx_beneficiary_gender` (`gender_id`),
  KEY `idx_beneficiary_document` (`document_id`),
  KEY `fk_beneficiary_funservice` (`service_funeral_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `billing_cycle`
--

DROP TABLE IF EXISTS `billing_cycle`;
CREATE TABLE IF NOT EXISTS `billing_cycle` (
  `billing_cycle_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `group_batch_id` int UNSIGNED NOT NULL,
  `death_event_count` int NOT NULL,
  `charge_date` timestamp NOT NULL,
  `amount_per_contract` decimal(19,4) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`billing_cycle_id`),
  KEY `idx_billing_cycle_group` (`group_batch_id`),
  KEY `fk_billing_cycle_unit` (`sys_unit_id`),
  KEY `fk_billing_cycle_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `billing_rule`
--

DROP TABLE IF EXISTS `billing_rule`;
CREATE TABLE IF NOT EXISTS `billing_rule` (
  `billing_rule_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `rule_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `condition_expression` text COLLATE utf8mb4_unicode_ci,
  `charge_expression` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`billing_rule_id`),
  KEY `idx_billing_rule_unit` (`sys_unit_id`),
  KEY `fk_billing_rule_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `billing_rule_application`
--

DROP TABLE IF EXISTS `billing_rule_application`;
CREATE TABLE IF NOT EXISTS `billing_rule_application` (
  `billing_rule_application_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `rule_id` int UNSIGNED NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CONTRACT, GROUP, SERVICE',
  `entity_id` int NOT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`billing_rule_application_id`),
  KEY `idx_billing_rule_app_rule` (`rule_id`),
  KEY `idx_billing_rule_app_entity` (`entity_type`,`entity_id`),
  KEY `fk_billing_rule_app_unit` (`sys_unit_id`),
  KEY `fk_billing_rule_app_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `brand`
--

DROP TABLE IF EXISTS `brand`;
CREATE TABLE IF NOT EXISTS `brand` (
  `brand_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `brand_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`brand_id`),
  UNIQUE KEY `uk_brand_name` (`brand_name`),
  KEY `idx_brand_unit` (`sys_unit_id`),
  KEY `idx_brand_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product brands and manufacturers';

-- --------------------------------------------------------

--
-- Estrutura para tabela `budget`
--

DROP TABLE IF EXISTS `budget`;
CREATE TABLE IF NOT EXISTS `budget` (
  `budget_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `budget_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscal_year_id` int UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`budget_id`),
  UNIQUE KEY `uk_budget_company` (`company_id`,`budget_name`,`fiscal_year_id`),
  KEY `fk_budget_approved_by` (`approved_by`),
  KEY `fk_budget_created_by` (`created_by`),
  KEY `idx_budget_company` (`company_id`),
  KEY `idx_budget_fiscal_year` (`fiscal_year_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `budget_item`
--

DROP TABLE IF EXISTS `budget_item`;
CREATE TABLE IF NOT EXISTS `budget_item` (
  `budget_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `budget_id` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `cost_center_id` int UNSIGNED DEFAULT NULL,
  `department_id` int UNSIGNED DEFAULT NULL,
  `project_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `annual_amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`budget_item_id`),
  KEY `idx_budget_item_budget` (`budget_id`),
  KEY `idx_budget_item_account` (`account_id`),
  KEY `idx_budget_item_cost_center` (`cost_center_id`),
  KEY `idx_budget_item_department` (`department_id`),
  KEY `idx_budget_item_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `budget_period`
--

DROP TABLE IF EXISTS `budget_period`;
CREATE TABLE IF NOT EXISTS `budget_period` (
  `budget_period_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `budget_item_id` int UNSIGNED NOT NULL,
  `fiscal_period_id` int UNSIGNED NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`budget_period_id`),
  UNIQUE KEY `uk_budget_period` (`budget_item_id`,`fiscal_period_id`),
  KEY `idx_budget_period_budget_item` (`budget_item_id`),
  KEY `idx_budget_period_fiscal_period` (`fiscal_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_contracts` int DEFAULT NULL,
  `is_periodic` tinyint NOT NULL DEFAULT '1',
  `purchase_value` decimal(19,4) NOT NULL,
  `number_of_parcels` int NOT NULL,
  `generated_parcels` int NOT NULL,
  `month_value` decimal(19,4) NOT NULL,
  `depend_value` decimal(19,4) DEFAULT NULL,
  `number_of_month_valid` int DEFAULT NULL,
  `is_renewable` tinyint DEFAULT '0',
  `is_renewable_used` tinyint DEFAULT '0',
  `total_value` decimal(19,4) DEFAULT NULL,
  `message1` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message2` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uk_class_name` (`name`),
  KEY `idx_class_unit` (`sys_unit_id`),
  KEY `idx_class_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cep_cache`
--

DROP TABLE IF EXISTS `cep_cache`;
CREATE TABLE IF NOT EXISTS `cep_cache` (
  `cep_cache_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cep` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `neigborhood` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ibge_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uf` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_id` int UNSIGNED DEFAULT NULL,
  `state_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`cep_cache_id`),
  KEY `idx_cep_cache_cep` (`cep`),
  KEY `idx_cep_cache_city` (`city_id`),
  KEY `idx_cep_cache_state` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `charge`
--

DROP TABLE IF EXISTS `charge`;
CREATE TABLE IF NOT EXISTS `charge` (
  `charge_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `group_batch_id` int UNSIGNED NOT NULL,
  `charge_number` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pending_cases_number` int DEFAULT NULL,
  `issue_date` timestamp NULL DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `month_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(19,4) DEFAULT NULL,
  `message` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message1` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_issued` int DEFAULT NULL,
  `amount_paid` int DEFAULT NULL,
  `canceled` int DEFAULT NULL,
  `release_date` timestamp NULL DEFAULT NULL,
  `printing_date` timestamp NULL DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`charge_id`),
  KEY `idx_charge_unit` (`sys_unit_id`),
  KEY `idx_charge_user` (`sys_user_id`),
  KEY `idx_charge_group` (`group_batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `city`
--

DROP TABLE IF EXISTS `city`;
CREATE TABLE IF NOT EXISTS `city` (
  `city_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_ibge` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`city_id`),
  KEY `idx_city_state` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `communication_channel`
--

DROP TABLE IF EXISTS `communication_channel`;
CREATE TABLE IF NOT EXISTS `communication_channel` (
  `channel_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `channel_name` varchar(50) NOT NULL,
  `is_physical` tinyint(1) DEFAULT '0',
  `is_electronic` tinyint(1) DEFAULT '1',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`channel_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `communication_channel`
--

INSERT INTO `communication_channel` (`channel_id`, `channel_name`, `is_physical`, `is_electronic`, `active`) VALUES
(1, 'Correio', 1, 0, 1),
(2, 'Entregador', 1, 0, 1),
(3, 'Email', 0, 1, 1),
(4, 'Telefone', 0, 1, 1),
(5, 'WhatsApp', 0, 1, 1),
(6, 'Telegram', 0, 1, 1),
(7, 'SMS', 0, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `company`
--

DROP TABLE IF EXISTS `company`;
CREATE TABLE IF NOT EXISTS `company` (
  `company_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_company_id` int UNSIGNED DEFAULT NULL,
  `company_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_id` int UNSIGNED DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fiscal_year_start` date DEFAULT NULL,
  `default_currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `is_consolidated` tinyint DEFAULT '0',
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  KEY `idx_company_name` (`company_name`),
  KEY `idx_company_tax_id` (`tax_id`),
  KEY `idx_company_parent` (`parent_company_id`),
  KEY `idx_company_is_active` (`is_active`),
  KEY `fk_company_address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contact`
--

DROP TABLE IF EXISTS `contact`;
CREATE TABLE IF NOT EXISTS `contact` (
  `contact_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `contact_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_type_id` int UNSIGNED NOT NULL,
  `is_customer` tinyint DEFAULT '0',
  `is_vendor` tinyint DEFAULT '0',
  `is_employee` tinyint DEFAULT '0',
  `credit_limit` decimal(19,4) DEFAULT NULL,
  `payment_terms` int DEFAULT NULL,
  `billing_address` text COLLATE utf8mb4_unicode_ci,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `receivable_account_id` int UNSIGNED DEFAULT NULL,
  `payable_account_id` int UNSIGNED DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BRL',
  `tax_code_id` int UNSIGNED DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contact_id`),
  UNIQUE KEY `uk_contact_company_code` (`company_id`,`contact_code`),
  KEY `fk_contact_receivable_account` (`receivable_account_id`),
  KEY `fk_contact_payable_account` (`payable_account_id`),
  KEY `fk_contact_currency` (`currency`),
  KEY `fk_contact_tax_code` (`tax_code_id`),
  KEY `idx_contact_company` (`company_id`),
  KEY `idx_contact_type` (`contact_type_id`),
  KEY `idx_contact_name` (`contact_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contact_bank_account`
--

DROP TABLE IF EXISTS `contact_bank_account`;
CREATE TABLE IF NOT EXISTS `contact_bank_account` (
  `contact_bank_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contact_id` int UNSIGNED NOT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `routing_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_address` text COLLATE utf8mb4_unicode_ci,
  `account_holder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contact_bank_id`),
  KEY `idx_contact_bank_contact` (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contact_type`
--

DROP TABLE IF EXISTS `contact_type`;
CREATE TABLE IF NOT EXISTS `contact_type` (
  `contact_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contact_type_id`),
  UNIQUE KEY `uk_contact_type_company` (`company_id`,`type_name`),
  KEY `idx_contact_type_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract`
--

DROP TABLE IF EXISTS `contract`;
CREATE TABLE IF NOT EXISTS `contract` (
  `contract_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `current_version_id` int UNSIGNED DEFAULT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `owner_id` int UNSIGNED NOT NULL,
  `partner_id` int UNSIGNED DEFAULT NULL,
  `indicated_by` int UNSIGNED DEFAULT NULL,
  `contract_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_contract_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'Status: active, canceled, redeemed, transferred',
  `status_id` int UNSIGNED DEFAULT NULL,
  `seller_id` int UNSIGNED DEFAULT NULL,
  `total_value` decimal(10,2) DEFAULT NULL,
  `installment_value` decimal(10,2) DEFAULT NULL,
  `obs` text COLLATE utf8mb4_unicode_ci,
  `services_amount` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_id`),
  UNIQUE KEY `uk_contract_number` (`contract_number`),
  KEY `idx_contract_unit` (`sys_unit_id`),
  KEY `idx_contract_user` (`sys_user_id`),
  KEY `idx_contract_owner` (`owner_id`),
  KEY `idx_contract_partner` (`partner_id`),
  KEY `idx_contract_status` (`current_status`),
  KEY `idx_contract_seller` (`seller_id`),
  KEY `idx_contract_seller_date` (`seller_id`,`created_at`),
  KEY `idx_contract_indicated` (`indicated_by`),
  KEY `fk_contract_status` (`status_id`),
  KEY `fk_contract_current_version` (`current_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela principal de contratos - identidade e titular';

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_access`
--

DROP TABLE IF EXISTS `contract_access`;
CREATE TABLE IF NOT EXISTS `contract_access` (
  `contract_access_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `access_level` enum('OWNER','DEPENDENT','LEGAL_REPRESENTATIVE') DEFAULT 'OWNER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_access_id`),
  UNIQUE KEY `uk_contract_user` (`contract_id`,`sys_user_id`),
  KEY `sys_user_id` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_active`
--

DROP TABLE IF EXISTS `contract_active`;
CREATE TABLE IF NOT EXISTS `contract_active` (
  `contract_active_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `contract_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_active_id`),
  UNIQUE KEY `uk_contract_active_number` (`contract_number`),
  KEY `idx_contract_active_unit` (`sys_unit_id`),
  KEY `idx_contract_active_user` (`sys_user_id`),
  KEY `idx_contract_active_version` (`contract_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_addendum`
--

DROP TABLE IF EXISTS `contract_addendum`;
CREATE TABLE IF NOT EXISTS `contract_addendum` (
  `contract_addendum_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `addendum_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_addendum_id`),
  KEY `idx_contract_addendum_unit` (`sys_unit_id`),
  KEY `idx_contract_addendum_version` (`contract_version_id`),
  KEY `idx_contract_addendum_addendum` (`addendum_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_billing`
--

DROP TABLE IF EXISTS `contract_billing`;
CREATE TABLE IF NOT EXISTS `contract_billing` (
  `contract_billing_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `cycle_id` int UNSIGNED NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `charge_id` int UNSIGNED DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_billing_id`),
  KEY `idx_contract_billing_cycle` (`cycle_id`),
  KEY `idx_contract_billing_version` (`contract_version_id`),
  KEY `idx_contract_billing_charge` (`charge_id`),
  KEY `fk_contract_billing_unit` (`sys_unit_id`),
  KEY `fk_contract_billing_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_charge`
--

DROP TABLE IF EXISTS `contract_charge`;
CREATE TABLE IF NOT EXISTS `contract_charge` (
  `contract_charge_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `payment_status_id` int UNSIGNED NOT NULL,
  `charge_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `paid_amount` decimal(19,4) DEFAULT NULL,
  `due_month` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_year` char(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `convenio` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payd_month` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payd_year` char(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_charge_id`),
  KEY `idx_contract_charge_version` (`contract_version_id`),
  KEY `idx_contract_charge_unit` (`sys_unit_id`),
  KEY `idx_contract_charge_status` (`payment_status_id`),
  KEY `idx_contract_charge_due` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_config_billing`
--

DROP TABLE IF EXISTS `contract_config_billing`;
CREATE TABLE IF NOT EXISTS `contract_config_billing` (
  `contract_config_billing_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED NOT NULL COMMENT 'FK para contract_version',
  `seller_id` int UNSIGNED DEFAULT NULL COMMENT 'Vendedor',
  `collector_id` int UNSIGNED DEFAULT NULL COMMENT 'Cobrador',
  `region_id` int UNSIGNED DEFAULT NULL COMMENT 'Região',
  `billing_frequency` int NOT NULL DEFAULT '1' COMMENT '1=Mensal, 3=Trimestral, 6=Semestral, 12=Anual',
  `month_initial_billing` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mês inicial (01-12)',
  `year_initial_billing` char(4) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ano inicial (YYYY)',
  `opt_payday` int DEFAULT NULL COMMENT 'Dia de vencimento preferencial',
  `first_charge` int DEFAULT NULL COMMENT 'Primeira cobrança',
  `last_charge` int DEFAULT NULL COMMENT 'Última cobrança',
  `charges_amount` int DEFAULT NULL COMMENT 'Total de cobranças',
  `charges_paid` int DEFAULT NULL COMMENT 'Cobranças pagas',
  `late_fee_percentage` decimal(8,5) DEFAULT NULL COMMENT 'Percentual de multa',
  `is_partial_payments_allowed` tinyint DEFAULT '0' COMMENT 'Permite pagamento parcial',
  `default_plan_installments` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Parcelas padrão do plano',
  `default_plan_frequency` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'MONTHLY' COMMENT 'Frequência do plano',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_config_billing_id`),
  KEY `idx_contract_config_billing_version` (`contract_version_id`),
  KEY `idx_contract_config_billing_seller` (`seller_id`),
  KEY `idx_contract_config_billing_collector` (`collector_id`),
  KEY `idx_contract_config_billing_region` (`region_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuração de cobrança e comercial';

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_covers`
--

DROP TABLE IF EXISTS `contract_covers`;
CREATE TABLE IF NOT EXISTS `contract_covers` (
  `contract_covers_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED NOT NULL COMMENT 'FK para contract_version',
  `group_batch_id` int UNSIGNED NOT NULL,
  `class_id` int UNSIGNED NOT NULL,
  `status_id` int UNSIGNED NOT NULL,
  `contract_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo do contrato',
  `industry` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'FUNERAL' COMMENT 'Indústria/Segmento',
  `start_date` datetime NOT NULL COMMENT 'Data de início',
  `end_date` datetime DEFAULT NULL COMMENT 'Data de término',
  `admission` datetime NOT NULL COMMENT 'Data de admissão',
  `final_grace` datetime DEFAULT NULL COMMENT 'Carência final',
  `grace_period_days` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dias de carência',
  `renew_at` datetime DEFAULT NULL COMMENT 'Data de renovação',
  `services_amount` int DEFAULT NULL COMMENT 'Quantidade de serviços',
  `service_option1` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_option2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alives` int DEFAULT NULL COMMENT 'Vivos',
  `deceaseds` int DEFAULT NULL COMMENT 'Falecidos',
  `dependents` int DEFAULT NULL COMMENT 'Dependentes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_covers_id`),
  KEY `idx_contract_covers_version` (`contract_version_id`),
  KEY `idx_contract_covers_type` (`contract_type`),
  KEY `idx_contract_covers_start` (`start_date`),
  KEY `idx_contract_covers_group` (`group_batch_id`),
  KEY `fk_contract_covers_class` (`class_id`),
  KEY `fk_contract_covers_status` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coberturas do contrato - detalhes do ciclo de vida';

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_events`
--

DROP TABLE IF EXISTS `contract_events`;
CREATE TABLE IF NOT EXISTS `contract_events` (
  `contract_events_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CRIACAO, ADITIVO, CANCELAMENTO, ATENDIMENTO',
  `event_date` timestamp NOT NULL,
  `payload` json DEFAULT NULL COMMENT 'Dados adicionais do evento',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_events_id`),
  KEY `idx_contract_events_version` (`contract_version_id`),
  KEY `idx_contract_events_type` (`event_type`),
  KEY `idx_contract_events_date` (`event_date`),
  KEY `fk_contract_events_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico de eventos do contrato';

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_pool`
--

DROP TABLE IF EXISTS `contract_pool`;
CREATE TABLE IF NOT EXISTS `contract_pool` (
  `contract_pool_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `batch_id` int UNSIGNED DEFAULT NULL,
  `reserved_contract_number` varchar(20) NOT NULL,
  `status` enum('AVAILABLE','ASSIGNED','USED','CANCELLED') DEFAULT 'AVAILABLE',
  `assigned_partner_id` int UNSIGNED DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `used_contract_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_pool_id`),
  KEY `batch_id` (`batch_id`),
  KEY `assigned_partner_id` (`assigned_partner_id`),
  KEY `used_contract_id` (`used_contract_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_status`
--

DROP TABLE IF EXISTS `contract_status`;
CREATE TABLE IF NOT EXISTS `contract_status` (
  `contract_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `generate_charge` tinyint DEFAULT '0',
  `allows_service` tinyint DEFAULT '0',
  `charge_after` int DEFAULT NULL,
  `kanban` tinyint DEFAULT '0',
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kanban_order` int DEFAULT NULL,
  `is_final_state` tinyint DEFAULT '0',
  `is_initial_state` tinyint DEFAULT '0',
  `allow_edition` tinyint DEFAULT '1',
  `allow_deletion` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `unit_id` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_status_id`),
  UNIQUE KEY `uk_contract_status_name` (`name`),
  UNIQUE KEY `uk_contract_status_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_status_history`
--

DROP TABLE IF EXISTS `contract_status_history`;
CREATE TABLE IF NOT EXISTS `contract_status_history` (
  `contract_status_history_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_machine_transition_id` int UNSIGNED NOT NULL,
  `status_reason_id` int UNSIGNED NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `contract_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail_status` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_status_history_id`),
  KEY `idx_contract_status_history_version` (`contract_version_id`),
  KEY `idx_contract_status_history_transition` (`state_machine_transition_id`),
  KEY `idx_contract_status_history_reason` (`status_reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_validation`
--

DROP TABLE IF EXISTS `contract_validation`;
CREATE TABLE IF NOT EXISTS `contract_validation` (
  `validation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` int UNSIGNED NOT NULL,
  `validated_by` int UNSIGNED DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`validation_id`),
  KEY `contract_id` (`contract_id`),
  KEY `validated_by` (`validated_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contract_version`
--

DROP TABLE IF EXISTS `contract_version`;
CREATE TABLE IF NOT EXISTS `contract_version` (
  `contract_version_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` int UNSIGNED NOT NULL COMMENT 'Contrato pai',
  `group_batch_id` int UNSIGNED NOT NULL COMMENT 'Grupo/Lote desta versão',
  `version_number` int UNSIGNED NOT NULL DEFAULT '1' COMMENT 'Número sequencial da versão',
  `valid_from` date NOT NULL COMMENT 'Data de início da validade',
  `valid_to` date DEFAULT NULL COMMENT 'Data de término (NULL = versão atual)',
  `is_current` tinyint DEFAULT '1' COMMENT 'Indica se é a versão ativa',
  `class_id` int UNSIGNED DEFAULT NULL,
  `collector_id` int UNSIGNED DEFAULT NULL,
  `region_id` int UNSIGNED DEFAULT NULL,
  `change_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Motivo da alteração',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`contract_version_id`),
  UNIQUE KEY `uk_contract_version` (`contract_id`,`version_number`),
  KEY `idx_contract_version_contract` (`contract_id`),
  KEY `idx_contract_version_group` (`group_batch_id`),
  KEY `idx_contract_version_current` (`is_current`),
  KEY `idx_contract_version_class` (`class_id`),
  KEY `idx_contract_version_collector` (`collector_id`),
  KEY `idx_contract_region` (`region_id`),
  KEY `idx_contract_version_valid` (`valid_from`,`valid_to`),
  KEY `fk_contract_version_created_by` (`created_by`),
  KEY `fk_contract_version_updated_by` (`updated_by`),
  KEY `fk_contract_version_deleted_by` (`deleted_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Versões do contrato - histórico de alterações';

-- --------------------------------------------------------

--
-- Estrutura para tabela `cost_center`
--

DROP TABLE IF EXISTS `cost_center`;
CREATE TABLE IF NOT EXISTS `cost_center` (
  `cost_center_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `parent_cost_center_id` int UNSIGNED DEFAULT NULL,
  `cost_center_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_center_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `manager_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(19,4) DEFAULT NULL,
  `level` int NOT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`cost_center_id`),
  UNIQUE KEY `uk_cost_center_company_code` (`company_id`,`cost_center_code`),
  KEY `idx_cost_center_unit` (`sys_unit_id`),
  KEY `idx_cost_center_user` (`sys_user_id`),
  KEY `idx_cost_center_company` (`company_id`),
  KEY `idx_cost_center_parent` (`parent_cost_center_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `currency`
--

DROP TABLE IF EXISTS `currency`;
CREATE TABLE IF NOT EXISTS `currency` (
  `currency_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `currency_code` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decimal_places` int NOT NULL DEFAULT '2',
  `rounding_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'HALF_UP',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`currency_id`),
  UNIQUE KEY `uk_currency_code` (`currency_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `customer`
--

DROP TABLE IF EXISTS `customer`;
CREATE TABLE IF NOT EXISTS `customer` (
  `customer_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `customer_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_type` enum('INDIVIDUAL','BUSINESS','GOVERNMENT','RESELLER') COLLATE utf8mb4_unicode_ci DEFAULT 'INDIVIDUAL',
  `tax_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `customer_since` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `idx_customer_company` (`company_id`),
  KEY `idx_customer_name` (`customer_name`),
  KEY `idx_customer_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `customer_return`
--

DROP TABLE IF EXISTS `customer_return`;
CREATE TABLE IF NOT EXISTS `customer_return` (
  `return_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `return_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int UNSIGNED NOT NULL,
  `so_id` int UNSIGNED DEFAULT NULL,
  `shipment_id` int UNSIGNED DEFAULT NULL,
  `return_date` date NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `return_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','RECEIVED','INSPECTED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `company_id` (`company_id`,`return_number`),
  KEY `idx_cr_customer` (`customer_id`),
  KEY `idx_cr_so` (`so_id`),
  KEY `idx_cr_shipment` (`shipment_id`),
  KEY `idx_cr_warehouse` (`warehouse_id`),
  KEY `idx_cr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `customer_return_item`
--

DROP TABLE IF EXISTS `customer_return_item`;
CREATE TABLE IF NOT EXISTS `customer_return_item` (
  `return_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `return_id` int UNSIGNED NOT NULL,
  `so_id` int UNSIGNED DEFAULT NULL,
  `so_item_id` int UNSIGNED DEFAULT NULL,
  `shipment_id` int UNSIGNED DEFAULT NULL,
  `shipment_item_id` int UNSIGNED DEFAULT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity_returned` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) DEFAULT NULL,
  `total_price` decimal(15,4) DEFAULT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quality_status` enum('PENDING','GOOD','DAMAGED','DEFECTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `inventory_status` enum('PENDING','RETURNED_TO_STOCK','SCRAPPED','SENT_TO_REPAIR') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`return_item_id`),
  KEY `idx_cri_return` (`return_id`),
  KEY `idx_cri_so` (`so_id`),
  KEY `idx_cri_so_item` (`so_item_id`),
  KEY `idx_cri_shipment` (`shipment_id`),
  KEY `idx_cri_shipment_item` (`shipment_item_id`),
  KEY `idx_cri_product` (`product_id`),
  KEY `idx_cri_variation` (`variation_id`),
  KEY `idx_cri_uom` (`uom_id`),
  KEY `idx_cri_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `death_event`
--

DROP TABLE IF EXISTS `death_event`;
CREATE TABLE IF NOT EXISTS `death_event` (
  `death_event_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_batch_id` int UNSIGNED NOT NULL,
  `beneficiary_id` int UNSIGNED NOT NULL,
  `service_funeral_id` int UNSIGNED NOT NULL,
  `event_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_for_billing` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`death_event_id`),
  KEY `idx_death_event_group` (`group_batch_id`),
  KEY `idx_death_event_beneficiary` (`beneficiary_id`),
  KEY `idx_death_event_service` (`service_funeral_id`),
  KEY `idx_death_event_group_processed` (`group_batch_id`,`processed_for_billing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `department`
--

DROP TABLE IF EXISTS `department`;
CREATE TABLE IF NOT EXISTS `department` (
  `department_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `parent_department_id` int UNSIGNED DEFAULT NULL,
  `department_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `manager_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_center_id` int UNSIGNED DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uk_department_company_code` (`company_id`,`department_code`),
  KEY `idx_department_unit` (`sys_unit_id`),
  KEY `idx_department_user` (`sys_user_id`),
  KEY `idx_department_company` (`company_id`),
  KEY `idx_department_parent` (`parent_department_id`),
  KEY `idx_department_cost_center` (`cost_center_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `document`
--

DROP TABLE IF EXISTS `document`;
CREATE TABLE IF NOT EXISTS `document` (
  `document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED NOT NULL,
  `document_type_id` int UNSIGNED NOT NULL,
  `document_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`document_id`),
  KEY `idx_document_sys_user` (`sys_user_id`),
  KEY `idx_document_type` (`document_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `document_batch`
--

DROP TABLE IF EXISTS `document_batch`;
CREATE TABLE IF NOT EXISTS `document_batch` (
  `doc_batch_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `partner_id` int UNSIGNED DEFAULT NULL,
  `batch_type` enum('DELIVERY','RETURN') DEFAULT NULL,
  `status` enum('OPEN','CLOSED') DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`doc_batch_id`),
  KEY `idx_document_batch_partner` (`partner_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `document_batch_item`
--

DROP TABLE IF EXISTS `document_batch_item`;
CREATE TABLE IF NOT EXISTS `document_batch_item` (
  `doc_batch_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `doc_batch_id` int UNSIGNED DEFAULT NULL,
  `document_id` int UNSIGNED DEFAULT NULL,
  `status` enum('PENDING','DELIVERED','RETURNED') DEFAULT NULL,
  `notes` varchar(100) DEFAULT NULL,
  `origin_batch_id` int UNSIGNED DEFAULT NULL,
  `last_event_id` int UNSIGNED DEFAULT NULL,
  `attempt_number` int DEFAULT NULL,
  `delivery_status` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `return_reason` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`doc_batch_item_id`),
  UNIQUE KEY `uk_doc_batch_document` (`doc_batch_id`,`document_id`),
  KEY `document_id` (`document_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `document_event`
--

DROP TABLE IF EXISTS `document_event`;
CREATE TABLE IF NOT EXISTS `document_event` (
  `doc_event_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_id` int UNSIGNED DEFAULT NULL,
  `event_type` enum('GENERATED','SCHEDULED','QUEUED','SENT','DELIVERED','READ','FAILED','PRINTED','ASSIGNED','SENT','DELIVERED','RETURNED') DEFAULT NULL,
  `event_date` timestamp NULL DEFAULT NULL,
  `performed_by` int UNSIGNED DEFAULT NULL,
  `partner_id` int UNSIGNED DEFAULT NULL,
  `notes` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`doc_event_id`),
  KEY `document_id` (`document_id`),
  KEY `performed_by` (`performed_by`),
  KEY `partner_id` (`partner_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `document_type`
--

DROP TABLE IF EXISTS `document_type`;
CREATE TABLE IF NOT EXISTS `document_type` (
  `document_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`document_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `document_type`
--

INSERT INTO `document_type` (`document_type_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, NULL, 'CPF', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(2, NULL, 'RG', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(3, NULL, 'CNH', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `doc_to_send`
--

DROP TABLE IF EXISTS `doc_to_send`;
CREATE TABLE IF NOT EXISTS `doc_to_send` (
  `doc_to_send_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `contract_id` int UNSIGNED DEFAULT NULL,
  `partner_id` int UNSIGNED DEFAULT NULL,
  `channel_id` int UNSIGNED NOT NULL,
  `document_type_id` int UNSIGNED DEFAULT NULL,
  `status` enum('GENERATED','QUEUED','SENDING','SENT','ASSIGNED','READ','PRINTED','IN_DISTRIBUTION','DELIVERED','FAILED','RETURNED','CANCELLED') DEFAULT 'GENERATED',
  `destination` varchar(255) DEFAULT NULL,
  `is_automated` tinyint DEFAULT '0',
  `generated_at` timestamp NULL DEFAULT NULL,
  `printed_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `current_batch_id` int UNSIGNED DEFAULT NULL,
  `delivery_attempts` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`doc_to_send_id`),
  KEY `idx_doc_to_send_contract` (`contract_id`),
  KEY `idx_doc_to_send_partner` (`partner_id`),
  KEY `idx_doc_to_send_document_type` (`document_type_id`),
  KEY `idx_doc_to_send_generated` (`generated_at`),
  KEY `idx_doc_to_send_printed` (`printed_at`),
  KEY `channel_id` (`channel_id`),
  KEY `idx_doc_status_batch` (`status`,`current_batch_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `driver`
--

DROP TABLE IF EXISTS `driver`;
CREATE TABLE IF NOT EXISTS `driver` (
  `driver_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_expiry` date NOT NULL,
  `driver_status_id` int UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`driver_id`),
  KEY `idx_driver_company_id` (`company_id`),
  KEY `idx_driver_license_number` (`license_number`),
  KEY `idx_driver_status_id` (`driver_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `driver_document`
--

DROP TABLE IF EXISTS `driver_document`;
CREATE TABLE IF NOT EXISTS `driver_document` (
  `driver_document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` int UNSIGNED NOT NULL,
  `document_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`driver_document_id`),
  UNIQUE KEY `uk_driver_document` (`driver_id`,`document_id`),
  KEY `idx_dd_driver_id` (`driver_id`),
  KEY `idx_dd_document_id` (`document_id`),
  KEY `idx_dd_company_id` (`company_id`),
  KEY `idx_dd_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `driver_status`
--

DROP TABLE IF EXISTS `driver_status`;
CREATE TABLE IF NOT EXISTS `driver_status` (
  `driver_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`driver_status_id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_driver_status_unit` (`sys_unit_id`),
  KEY `idx_driver_status_user` (`sys_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `driver_status`
--

INSERT INTO `driver_status` (`driver_status_id`, `sys_unit_id`, `sys_user_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(6, 0, 0, 'Available', 'Driver is available for assignment', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(7, 0, 0, 'On Trip', 'Driver is currently on a trip', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(8, 0, 0, 'Off Duty', 'Driver is not working', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(9, 0, 0, 'On Leave', 'Driver is on scheduled leave', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(10, 0, 0, 'Inactive', 'Driver is no longer active', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `entity_address`
--

DROP TABLE IF EXISTS `entity_address`;
CREATE TABLE IF NOT EXISTS `entity_address` (
  `entity_address_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type` enum('client','partner') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int UNSIGNED NOT NULL,
  `address_id` int UNSIGNED NOT NULL,
  `is_primary` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`entity_address_id`),
  KEY `idx_entity_address_entity` (`entity_type`,`entity_id`),
  KEY `idx_entity_address_address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `entity_document`
--

DROP TABLE IF EXISTS `entity_document`;
CREATE TABLE IF NOT EXISTS `entity_document` (
  `entity_document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type` enum('client','partner') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int UNSIGNED NOT NULL,
  `document_id` int UNSIGNED NOT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`entity_document_id`),
  KEY `idx_entity_document_entity` (`entity_type`,`entity_id`),
  KEY `idx_entity_document_doc` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `equipament_rental`
--

DROP TABLE IF EXISTS `equipament_rental`;
CREATE TABLE IF NOT EXISTS `equipament_rental` (
  `equipament_rental_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `performed_service_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `contract_version_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`equipament_rental_id`),
  KEY `idx_equipament_rental_performed` (`performed_service_id`),
  KEY `fk_equipament_rental_unit` (`sys_unit_id`),
  KEY `fk_equipament_rental_user` (`sys_user_id`),
  KEY `fk_equipament_rental_version` (`contract_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `expense_type`
--

DROP TABLE IF EXISTS `expense_type`;
CREATE TABLE IF NOT EXISTS `expense_type` (
  `expense_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`expense_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `expense_type`
--

INSERT INTO `expense_type` (`expense_type_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Fuel', 'Cost of fuel', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Tolls', 'Road toll charges', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Maintenance - Minor Repair', 'Minor, unscheduled repairs', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Parking', 'Parking fees', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Cleaning', 'Vehicle cleaning services', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(6, 'Driver Meal Allowance', 'Meal allowance for driver on trip', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(7, 'Driver Accommodation', 'Accommodation for driver on overnight trip', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(8, 'Vehicle Supplies', 'Supplies for the vehicle (e.g., oil, washer fluid) bought on trip', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `financial_ratio`
--

DROP TABLE IF EXISTS `financial_ratio`;
CREATE TABLE IF NOT EXISTS `financial_ratio` (
  `ratio_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `ratio_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratio_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `formula` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_value` decimal(10,4) DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`ratio_id`),
  UNIQUE KEY `uk_financial_ratio_company` (`company_id`,`ratio_code`),
  KEY `idx_financial_ratio_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `financial_ratio_value`
--

DROP TABLE IF EXISTS `financial_ratio_value`;
CREATE TABLE IF NOT EXISTS `financial_ratio_value` (
  `value_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ratio_id` int UNSIGNED NOT NULL,
  `fiscal_period_id` int UNSIGNED NOT NULL,
  `ratio_value` decimal(19,4) NOT NULL,
  `calculation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`value_id`),
  UNIQUE KEY `uk_financial_ratio_value` (`ratio_id`,`fiscal_period_id`),
  KEY `idx_financial_ratio_value_ratio` (`ratio_id`),
  KEY `idx_financial_ratio_value_fiscal_period` (`fiscal_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fiscal_period`
--

DROP TABLE IF EXISTS `fiscal_period`;
CREATE TABLE IF NOT EXISTS `fiscal_period` (
  `fiscal_period_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `fiscal_year_id` int UNSIGNED NOT NULL,
  `period_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_number` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_adjustment` tinyint DEFAULT '0',
  `is_closed` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`fiscal_period_id`),
  UNIQUE KEY `uk_fiscal_period_year` (`fiscal_year_id`,`period_number`),
  KEY `idx_fiscal_period_unit` (`sys_unit_id`),
  KEY `idx_fiscal_period_user` (`sys_user_id`),
  KEY `idx_fiscal_period_year` (`fiscal_year_id`),
  KEY `idx_fiscal_period_dates` (`start_date`,`end_date`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fiscal_year`
--

DROP TABLE IF EXISTS `fiscal_year`;
CREATE TABLE IF NOT EXISTS `fiscal_year` (
  `fiscal_year_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `year_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_closed` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`fiscal_year_id`),
  UNIQUE KEY `uk_fiscal_year_company` (`company_id`,`year_name`),
  KEY `idx_fiscal_year_unit` (`sys_unit_id`),
  KEY `idx_fiscal_year_user` (`sys_user_id`),
  KEY `idx_fiscal_year_company` (`company_id`),
  KEY `idx_fiscal_year_dates` (`start_date`,`end_date`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `gender`
--

DROP TABLE IF EXISTS `gender`;
CREATE TABLE IF NOT EXISTS `gender` (
  `gender_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`gender_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `gender`
--

INSERT INTO `gender` (`gender_id`, `name`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Masculino', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(2, 'Feminino', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `goods_receipt`
--

DROP TABLE IF EXISTS `goods_receipt`;
CREATE TABLE IF NOT EXISTS `goods_receipt` (
  `receipt_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `po_id` int UNSIGNED DEFAULT NULL,
  `supplier_id` int UNSIGNED NOT NULL,
  `receipt_date` date NOT NULL,
  `delivery_note_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `received_by` int UNSIGNED DEFAULT NULL,
  `status` enum('DRAFT','PENDING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`receipt_id`),
  UNIQUE KEY `company_id` (`company_id`,`receipt_number`),
  KEY `idx_gr_po` (`po_id`),
  KEY `idx_gr_supplier` (`supplier_id`),
  KEY `idx_gr_warehouse` (`warehouse_id`),
  KEY `idx_gr_receipt_date` (`receipt_date`),
  KEY `idx_gr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `goods_receipt_item`
--

DROP TABLE IF EXISTS `goods_receipt_item`;
CREATE TABLE IF NOT EXISTS `goods_receipt_item` (
  `receipt_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `receipt_id` int UNSIGNED NOT NULL,
  `po_id` int UNSIGNED DEFAULT NULL,
  `po_item_id` int UNSIGNED DEFAULT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity_expected` decimal(15,3) DEFAULT NULL,
  `quantity_received` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) DEFAULT NULL,
  `total_price` decimal(15,4) DEFAULT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `quality_check_status` enum('PENDING','PASSED','FAILED','WAIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `quality_check_notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('RECEIVED','INSPECTING','ACCEPTED','REJECTED','RETURNED') COLLATE utf8mb4_unicode_ci DEFAULT 'RECEIVED',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`receipt_item_id`),
  KEY `idx_gri_receipt` (`receipt_id`),
  KEY `idx_gri_po` (`po_id`),
  KEY `idx_gri_po_item` (`po_item_id`),
  KEY `idx_gri_product` (`product_id`),
  KEY `idx_gri_variation` (`variation_id`),
  KEY `idx_gri_uom` (`uom_id`),
  KEY `idx_gri_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `group_batch`
--

DROP TABLE IF EXISTS `group_batch`;
CREATE TABLE IF NOT EXISTS `group_batch` (
  `group_batch_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `class_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `begin_code` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `final_code` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_periodic` tinyint NOT NULL,
  `amount_process` int NOT NULL,
  `min_proc` int UNSIGNED NOT NULL,
  `max_proc` int UNSIGNED NOT NULL,
  `compare_admission` tinyint NOT NULL DEFAULT '0',
  `amount_redeem` int NOT NULL,
  `by_service` tinyint NOT NULL DEFAULT '1',
  `death_count` int DEFAULT '0',
  `current_death_count` int DEFAULT '0',
  `death_threshold` int NOT NULL DEFAULT '10',
  `last_billing_number` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_billing_number` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_issue_date` date DEFAULT NULL,
  `last_death_charge_date` timestamp NULL DEFAULT NULL,
  `pending_process` int DEFAULT NULL,
  `number_contracts` int DEFAULT NULL,
  `number_lifes` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`group_batch_id`),
  UNIQUE KEY `uk_group_batch_name` (`name`),
  KEY `idx_group_batch_unit` (`sys_unit_id`),
  KEY `idx_group_batch_user` (`sys_user_id`),
  KEY `idx_group_batch_class` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `integration_mapping`
--

DROP TABLE IF EXISTS `integration_mapping`;
CREATE TABLE IF NOT EXISTS `integration_mapping` (
  `mapping_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `integration_id` int UNSIGNED NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `local_entity_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remote_entity_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mapping_direction` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `additional_data` json DEFAULT NULL,
  `last_sync_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`mapping_id`),
  UNIQUE KEY `uk_integration_mapping` (`integration_id`,`entity_type`,`local_entity_id`),
  KEY `idx_integration_mapping_integration` (`integration_id`),
  KEY `idx_integration_mapping_entity_type` (`entity_type`),
  KEY `idx_integration_mapping_local_entity` (`local_entity_id`),
  KEY `idx_integration_mapping_remote_entity` (`remote_entity_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `integration_setting`
--

DROP TABLE IF EXISTS `integration_setting`;
CREATE TABLE IF NOT EXISTS `integration_setting` (
  `integration_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `integration_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `integration_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_token` text COLLATE utf8mb4_unicode_ci,
  `token_expires_at` timestamp NULL DEFAULT NULL,
  `last_sync_time` timestamp NULL DEFAULT NULL,
  `sync_frequency` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configuration_json` json DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`integration_id`),
  UNIQUE KEY `uk_integration_setting_company` (`company_id`,`integration_name`),
  KEY `idx_integration_setting_company` (`company_id`),
  KEY `idx_integration_setting_type` (`integration_type`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `integration_sync_log`
--

DROP TABLE IF EXISTS `integration_sync_log`;
CREATE TABLE IF NOT EXISTS `integration_sync_log` (
  `log_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `integration_id` int UNSIGNED NOT NULL,
  `sync_start_time` timestamp NOT NULL,
  `sync_end_time` timestamp NULL DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `records_processed` int DEFAULT '0',
  `records_created` int DEFAULT '0',
  `records_updated` int DEFAULT '0',
  `records_failed` int DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_integration_sync_log_integration` (`integration_id`),
  KEY `idx_integration_sync_log_status` (`status`),
  KEY `idx_integration_sync_log_time` (`sync_start_time`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `inventory_adjustment`
--

DROP TABLE IF EXISTS `inventory_adjustment`;
CREATE TABLE IF NOT EXISTS `inventory_adjustment` (
  `adjustment_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `adjustment_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `adjustment_date` date NOT NULL,
  `adjustment_reason` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`adjustment_id`),
  UNIQUE KEY `company_id` (`company_id`,`adjustment_number`),
  KEY `idx_ia_warehouse` (`warehouse_id`),
  KEY `idx_ia_status` (`status`),
  KEY `idx_ia_adjustment_date` (`adjustment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `inventory_adjustment_item`
--

DROP TABLE IF EXISTS `inventory_adjustment_item`;
CREATE TABLE IF NOT EXISTS `inventory_adjustment_item` (
  `adjustment_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `adjustment_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `quantity_before` decimal(15,3) NOT NULL,
  `quantity_after` decimal(15,3) NOT NULL,
  `adjustment_quantity` decimal(15,3) GENERATED ALWAYS AS ((`quantity_after` - `quantity_before`)) STORED,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT NULL,
  `total_cost` decimal(15,4) DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`adjustment_item_id`),
  KEY `idx_iai_adjustment` (`adjustment_id`),
  KEY `idx_iai_product` (`product_id`),
  KEY `idx_iai_variation` (`variation_id`),
  KEY `idx_iai_location` (`location_id`),
  KEY `idx_iai_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `journal`
--

DROP TABLE IF EXISTS `journal`;
CREATE TABLE IF NOT EXISTS `journal` (
  `journal_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `journal_type_id` int UNSIGNED NOT NULL,
  `journal_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `journal_date` date NOT NULL,
  `fiscal_period_id` int UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `exchange_rate` decimal(19,6) DEFAULT '1.000000',
  `total_amount` decimal(19,4) NOT NULL,
  `is_recurring` tinyint DEFAULT '0',
  `recurrence_pattern` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_recurrence_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_intercompany` tinyint DEFAULT '0',
  `related_company_id` int UNSIGNED DEFAULT NULL,
  `posted_date` timestamp NULL DEFAULT NULL,
  `posted_by` int UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`journal_id`),
  UNIQUE KEY `uk_journal_company_number` (`company_id`,`journal_number`),
  KEY `fk_journal_currency` (`currency`),
  KEY `fk_journal_related_company` (`related_company_id`),
  KEY `fk_journal_posted_by` (`posted_by`),
  KEY `fk_journal_approved_by` (`approved_by`),
  KEY `idx_journal_company` (`company_id`),
  KEY `idx_journal_type` (`journal_type_id`),
  KEY `idx_journal_date` (`journal_date`),
  KEY `idx_journal_fiscal_period` (`fiscal_period_id`),
  KEY `idx_journal_status` (`status`),
  KEY `idx_journal_created_by` (`created_by`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `journal_attachment`
--

DROP TABLE IF EXISTS `journal_attachment`;
CREATE TABLE IF NOT EXISTS `journal_attachment` (
  `attachment_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `journal_id` int UNSIGNED NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `uploaded_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`attachment_id`),
  KEY `fk_journal_attachment_uploaded_by` (`uploaded_by`),
  KEY `idx_journal_attachment_journal` (`journal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `journal_line`
--

DROP TABLE IF EXISTS `journal_line`;
CREATE TABLE IF NOT EXISTS `journal_line` (
  `journal_line_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `journal_id` int UNSIGNED NOT NULL,
  `line_number` int UNSIGNED NOT NULL,
  `account_id` int UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `debit_amount` decimal(19,4) DEFAULT '0.0000',
  `credit_amount` decimal(19,4) DEFAULT '0.0000',
  `cost_center_id` int UNSIGNED DEFAULT NULL,
  `department_id` int UNSIGNED DEFAULT NULL,
  `project_id` int UNSIGNED DEFAULT NULL,
  `contact_id` int UNSIGNED DEFAULT NULL,
  `tax_code_id` int UNSIGNED DEFAULT NULL,
  `tax_amount` decimal(19,4) DEFAULT '0.0000',
  `reference` text COLLATE utf8mb4_unicode_ci,
  `reconciled` tinyint DEFAULT '0',
  `reconciliation_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`journal_line_id`),
  UNIQUE KEY `uk_journal_line` (`journal_id`,`line_number`),
  KEY `fk_journal_line_tax_code` (`tax_code_id`),
  KEY `idx_journal_line_journal` (`journal_id`),
  KEY `idx_journal_line_account` (`account_id`),
  KEY `idx_journal_line_cost_center` (`cost_center_id`),
  KEY `idx_journal_line_department` (`department_id`),
  KEY `idx_journal_line_project` (`project_id`),
  KEY `idx_journal_line_contact` (`contact_id`),
  KEY `idx_journal_line_reconciled` (`reconciled`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `journal_type`
--

DROP TABLE IF EXISTS `journal_type`;
CREATE TABLE IF NOT EXISTS `journal_type` (
  `journal_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `type_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `auto_numbering` tinyint DEFAULT '1',
  `number_prefix` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`journal_type_id`),
  UNIQUE KEY `uk_journal_type_company` (`company_id`,`type_code`),
  KEY `idx_journal_type_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `log_event_type`
--

DROP TABLE IF EXISTS `log_event_type`;
CREATE TABLE IF NOT EXISTS `log_event_type` (
  `log_event_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_incident` tinyint(1) DEFAULT '0',
  `requires_odometer` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`log_event_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `log_event_type`
--

INSERT INTO `log_event_type` (`log_event_type_id`, `name`, `description`, `is_incident`, `requires_odometer`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Pre-Trip Inspection', 'Routine check before starting a trip', 0, 1, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Post-Trip Check', 'Routine check after completing a trip', 0, 1, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Fueling Event', 'Vehicle refueling details', 0, 1, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Minor Damage Reported', 'Report of new minor damage', 1, 0, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Driver Observation', 'General observation by driver', 0, 0, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(6, 'Vehicle Cleaning', 'Record of vehicle cleaning', 0, 0, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(7, 'Scheduled Checkpoint', 'Log for a scheduled operational checkpoint', 0, 0, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(8, 'Other', 'Generic log event type', 0, 0, '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `maintenance`
--

DROP TABLE IF EXISTS `maintenance`;
CREATE TABLE IF NOT EXISTS `maintenance` (
  `maintenance_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `service_type_id` int UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `scheduled_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `service_provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maintenance_status_id` int UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`maintenance_id`),
  KEY `idx_maintenance_vehicle_id` (`vehicle_id`),
  KEY `idx_maintenance_company_id` (`company_id`),
  KEY `idx_maintenance_service_type_id` (`service_type_id`),
  KEY `idx_maintenance_scheduled_date` (`scheduled_date`),
  KEY `idx_maintenance_status_id` (`maintenance_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `maintenance_document`
--

DROP TABLE IF EXISTS `maintenance_document`;
CREATE TABLE IF NOT EXISTS `maintenance_document` (
  `maintenance_document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `maintenance_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`maintenance_document_id`),
  UNIQUE KEY `uk_maintenance_document` (`maintenance_id`,`document_id`),
  KEY `idx_md_maintenance_id` (`maintenance_id`),
  KEY `idx_md_document_id` (`document_id`),
  KEY `idx_md_company_id` (`company_id`),
  KEY `idx_md_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `maintenance_status`
--

DROP TABLE IF EXISTS `maintenance_status`;
CREATE TABLE IF NOT EXISTS `maintenance_status` (
  `maintenance_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`maintenance_status_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `maintenance_status`
--

INSERT INTO `maintenance_status` (`maintenance_status_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Requested', 'Maintenance has been requested', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Scheduled', 'Maintenance is scheduled', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'In Progress', 'Maintenance is currently being performed', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Pending Parts', 'Maintenance is on hold waiting for parts', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Completed', 'Maintenance has been completed', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(6, 'Cancelled', 'Maintenance request has been cancelled', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `medical_foward`
--

DROP TABLE IF EXISTS `medical_foward`;
CREATE TABLE IF NOT EXISTS `medical_foward` (
  `medical_foward_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `partner_id` int UNSIGNED NOT NULL,
  `performed_service_id` int UNSIGNED NOT NULL,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `val_payment` decimal(19,4) DEFAULT NULL,
  `val_aux` decimal(19,4) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `cashier_number` char(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method_pay` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `obs_pay` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordpgrc_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`medical_foward_id`),
  KEY `idx_medical_foward_unit` (`sys_unit_id`),
  KEY `idx_medical_foward_user` (`sys_user_id`),
  KEY `idx_medical_foward_partner` (`partner_id`),
  KEY `idx_medical_foward_service` (`performed_service_id`),
  KEY `fk_medical_foward_ordpgrc` (`ordpgrc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `membership_card`
--

DROP TABLE IF EXISTS `membership_card`;
CREATE TABLE IF NOT EXISTS `membership_card` (
  `membership_card_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `performed_service_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `contract_version_id` int UNSIGNED DEFAULT NULL,
  `beneficiary_id` int UNSIGNED DEFAULT NULL,
  `card_cod` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código impresso no cartão',
  `vencimento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Válido até...',
  `observacao` text COLLATE utf8mb4_unicode_ci,
  `importado_at` timestamp NULL DEFAULT NULL COMMENT 'Data que foi importado',
  `exportado_at` timestamp NULL DEFAULT NULL COMMENT 'Data que exportou para impressão',
  `retorno_at` timestamp NULL DEFAULT NULL COMMENT 'Data do recebimento do cartão impresso',
  `entregue_at` timestamp NULL DEFAULT NULL COMMENT 'Data da entrega ao beneficiário',
  `valor` decimal(19,4) DEFAULT NULL COMMENT 'Valor (quando cobrado)',
  `pago_at` timestamp NULL DEFAULT NULL COMMENT 'Data do pagamento',
  `numop` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número do caixa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`membership_card_id`),
  KEY `idx_membership_card_performed` (`performed_service_id`),
  KEY `idx_membership_card_unit` (`sys_unit_id`),
  KEY `idx_membership_card_user` (`sys_user_id`),
  KEY `idx_membership_card_version` (`contract_version_id`),
  KEY `idx_membership_card_beneficiary` (`beneficiary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `message_template`
--

DROP TABLE IF EXISTS `message_template`;
CREATE TABLE IF NOT EXISTS `message_template` (
  `template_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_name` varchar(100) DEFAULT NULL,
  `channel_id` int DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message_text` text,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`template_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ordpgrc`
--

DROP TABLE IF EXISTS `ordpgrc`;
CREATE TABLE IF NOT EXISTS `ordpgrc` (
  `ordpgrc_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `sys_user_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(19,4) NOT NULL,
  `number_receipt` int UNSIGNED DEFAULT NULL,
  `closing_date` timestamp NULL DEFAULT NULL,
  `status` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`ordpgrc_id`),
  KEY `idx_ordpgrc_unit` (`sys_unit_id`),
  KEY `idx_ordpgrc_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `partner`
--

DROP TABLE IF EXISTS `partner`;
CREATE TABLE IF NOT EXISTS `partner` (
  `partner_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `owner_id` int UNSIGNED NOT NULL,
  `partner_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partner_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `partner_type_id` int UNSIGNED NOT NULL,
  `is_customer` tinyint DEFAULT '0',
  `is_vendor` tinyint DEFAULT '0',
  `is_collector` tinyint DEFAULT '0',
  `is_employee` tinyint DEFAULT '0',
  `is_accredited` tinyint DEFAULT '0',
  `specialty_id` int UNSIGNED DEFAULT NULL,
  `advantages` text COLLATE utf8mb4_unicode_ci,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `credit_limit` decimal(19,4) DEFAULT NULL,
  `payment_terms` int DEFAULT NULL,
  `billing_address_id` int UNSIGNED DEFAULT NULL,
  `shipping_address_id` int UNSIGNED DEFAULT NULL,
  `document1_id` int UNSIGNED DEFAULT NULL,
  `document2_id` int UNSIGNED DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_partner_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `receivable_account_id` int UNSIGNED DEFAULT NULL,
  `payable_account_id` int UNSIGNED DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BRL',
  `tax_code_id` int UNSIGNED DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `is_customer_flag` tinyint GENERATED ALWAYS AS (if((`is_customer` = 1),1,NULL)) VIRTUAL,
  `is_vendor_flag` tinyint GENERATED ALWAYS AS (if((`is_vendor` = 1),1,NULL)) VIRTUAL,
  PRIMARY KEY (`partner_id`),
  UNIQUE KEY `uk_partner_code` (`company_id`,`partner_code`),
  UNIQUE KEY `idx_partner_tax_id_company` (`company_id`,`tax_id`),
  KEY `idx_partner_company` (`company_id`),
  KEY `idx_partner_unit` (`sys_unit_id`),
  KEY `idx_partner_user` (`sys_user_id`),
  KEY `idx_partner_type` (`partner_type_id`),
  KEY `idx_partner_name` (`partner_name`),
  KEY `idx_partner_specialty` (`specialty_id`),
  KEY `fk_partner_owner` (`owner_id`),
  KEY `fk_partner_billing_addr` (`billing_address_id`),
  KEY `fk_partner_shipping_addr` (`shipping_address_id`),
  KEY `fk_partner_doc1` (`document1_id`),
  KEY `fk_partner_doc2` (`document2_id`),
  KEY `idx_partner_customer` (`company_id`,`is_customer_flag`),
  KEY `idx_partner_vendor` (`company_id`,`is_vendor_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `partner_bank_account`
--

DROP TABLE IF EXISTS `partner_bank_account`;
CREATE TABLE IF NOT EXISTS `partner_bank_account` (
  `partner_bank_account_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `partner_id` int UNSIGNED NOT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `routing_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_address` text COLLATE utf8mb4_unicode_ci,
  `account_holder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`partner_bank_account_id`),
  KEY `idx_partner_bank_partner` (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `partner_type`
--

DROP TABLE IF EXISTS `partner_type`;
CREATE TABLE IF NOT EXISTS `partner_type` (
  `partner_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`partner_type_id`),
  UNIQUE KEY `uk_partner_type_company` (`company_id`,`type_name`),
  KEY `idx_partner_type_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_method`
--

DROP TABLE IF EXISTS `payment_method`;
CREATE TABLE IF NOT EXISTS `payment_method` (
  `payment_method_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `method_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_electronic` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_method_id`),
  UNIQUE KEY `uk_payment_method_company` (`company_id`,`method_code`),
  KEY `idx_payment_method_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_plan`
--

DROP TABLE IF EXISTS `payment_plan`;
CREATE TABLE IF NOT EXISTS `payment_plan` (
  `payment_plan_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `plan_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(19,4) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_plan_id`),
  KEY `idx_payment_plan_version` (`contract_version_id`),
  KEY `fk_payment_plan_unit` (`sys_unit_id`),
  KEY `fk_payment_plan_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_plan_installment`
--

DROP TABLE IF EXISTS `payment_plan_installment`;
CREATE TABLE IF NOT EXISTS `payment_plan_installment` (
  `payment_plan_installment_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `plan_id` int UNSIGNED NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `paid_amount` decimal(19,4) DEFAULT '0.0000',
  `paid_date` date DEFAULT NULL,
  `charge_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_plan_installment_id`),
  KEY `idx_installment_plan` (`plan_id`),
  KEY `idx_installment_charge` (`charge_id`),
  KEY `fk_installment_unit` (`sys_unit_id`),
  KEY `fk_installment_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_receipt`
--

DROP TABLE IF EXISTS `payment_receipt`;
CREATE TABLE IF NOT EXISTS `payment_receipt` (
  `payment_receipt_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `subsidiary_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `status` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `val_payment` decimal(19,4) DEFAULT NULL,
  `val_aux` decimal(19,4) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `cashier_number` char(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method_pay` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `obs_pay` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordpgrc_id` int UNSIGNED NOT NULL,
  `payment_status_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_receipt_id`),
  KEY `idx_payment_receipt_subsidiary` (`subsidiary_id`),
  KEY `idx_payment_receipt_unit` (`sys_unit_id`),
  KEY `idx_payment_receipt_user` (`sys_user_id`),
  KEY `idx_payment_receipt_version` (`contract_version_id`),
  KEY `idx_payment_receipt_ordpgrc` (`ordpgrc_id`),
  KEY `idx_payment_receipt_status` (`payment_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_status`
--

DROP TABLE IF EXISTS `payment_status`;
CREATE TABLE IF NOT EXISTS `payment_status` (
  `payment_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kanban` tinyint DEFAULT '0',
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kanban_order` int DEFAULT NULL,
  `final_state` tinyint DEFAULT '0',
  `initial_state` tinyint DEFAULT '0',
  `allow_edition` tinyint DEFAULT '1',
  `allow_deletion` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_transaction`
--

DROP TABLE IF EXISTS `payment_transaction`;
CREATE TABLE IF NOT EXISTS `payment_transaction` (
  `payment_transaction_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `charge_id` int UNSIGNED DEFAULT NULL,
  `installment_id` int UNSIGNED DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`payment_transaction_id`),
  KEY `idx_transaction_version` (`contract_version_id`),
  KEY `idx_transaction_charge` (`charge_id`),
  KEY `idx_transaction_installment` (`installment_id`),
  KEY `fk_transaction_unit` (`sys_unit_id`),
  KEY `fk_transaction_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `performed_service`
--

DROP TABLE IF EXISTS `performed_service`;
CREATE TABLE IF NOT EXISTS `performed_service` (
  `performed_service_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `contract_version_id` int UNSIGNED NOT NULL,
  `beneficiary_id` int UNSIGNED DEFAULT NULL,
  `service_type_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`performed_service_id`),
  KEY `idx_performed_service_unit` (`sys_unit_id`),
  KEY `idx_performed_service_version` (`contract_version_id`),
  KEY `idx_performed_service_beneficiary` (`beneficiary_id`),
  KEY `idx_performed_service_type` (`service_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int UNSIGNED NOT NULL,
  `brand_id` int UNSIGNED DEFAULT NULL,
  `base_uom_id` int UNSIGNED NOT NULL,
  `purchase_uom_id` int UNSIGNED DEFAULT NULL,
  `sales_uom_id` int UNSIGNED DEFAULT NULL,
  `barcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hs_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Harmonized System code for international trade',
  `weight` decimal(10,3) DEFAULT NULL COMMENT 'Weight in weight_uom units',
  `width` decimal(10,3) DEFAULT NULL COMMENT 'Width in dim_uom units',
  `height` decimal(10,3) DEFAULT NULL COMMENT 'Height in dim_uom units',
  `depth` decimal(10,3) DEFAULT NULL COMMENT 'Depth in dim_uom units',
  `weight_uom_id` int UNSIGNED DEFAULT NULL,
  `dim_uom_id` int UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_sellable` tinyint(1) DEFAULT '1',
  `is_purchasable` tinyint(1) DEFAULT '1',
  `has_variations` tinyint(1) DEFAULT '0',
  `min_purchase_qty` decimal(10,3) DEFAULT '1.000',
  `lead_time` int DEFAULT NULL COMMENT 'Lead time in days from primary supplier',
  `shelf_life` int DEFAULT NULL COMMENT 'Shelf life in days',
  `warranty_period` int DEFAULT NULL COMMENT 'Warranty period in days',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT 'Soft delete flag',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uk_product_code` (`sys_unit_id`,`product_code`),
  KEY `idx_product_unit` (`sys_unit_id`),
  KEY `idx_product_user` (`sys_user_id`),
  KEY `idx_product_is_active` (`is_active`),
  KEY `idx_product_is_sellable` (`is_sellable`),
  KEY `idx_product_is_purchasable` (`is_purchasable`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_brand` (`brand_id`),
  KEY `idx_product_base_uom` (`base_uom_id`),
  KEY `idx_product_purchase_uom` (`purchase_uom_id`),
  KEY `idx_product_sales_uom` (`sales_uom_id`),
  KEY `idx_product_weight_uom` (`weight_uom_id`),
  KEY `idx_product_dim_uom` (`dim_uom_id`),
  KEY `idx_product_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Base product information';

--
-- Acionadores `product`
--
DROP TRIGGER IF EXISTS `products_after_insert`;
DELIMITER $$
CREATE TRIGGER `products_after_insert` AFTER INSERT ON `product` FOR EACH ROW BEGIN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, new_values)
    VALUES ('product', NEW.product_id, 'INSERT', NEW.created_by,
            JSON_OBJECT(
                'product_code', NEW.product_code,
                'product_name', NEW.product_name,
                'is_active', NEW.is_active
            ));
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `products_after_update`;
DELIMITER $$
CREATE TRIGGER `products_after_update` AFTER UPDATE ON `product` FOR EACH ROW BEGIN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_values, new_values)
    VALUES ('product', NEW.product_id, 'UPDATE', NEW.updated_by,
            JSON_OBJECT(
                'product_code', OLD.product_code,
                'product_name', OLD.product_name,
                'is_active', OLD.is_active
            ),
            JSON_OBJECT(
                'product_code', NEW.product_code,
                'product_name', NEW.product_name,
                'is_active', NEW.is_active
            ));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_category`
--

DROP TABLE IF EXISTS `product_category`;
CREATE TABLE IF NOT EXISTS `product_category` (
  `category_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `parent_category_id` int UNSIGNED DEFAULT NULL,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uk_product_category_name` (`category_name`),
  KEY `idx_product_category_unit` (`sys_unit_id`),
  KEY `idx_product_category_user` (`sys_user_id`),
  KEY `idx_category_parent` (`parent_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product categorization hierarchy';

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_image`
--

DROP TABLE IF EXISTS `product_image`;
CREATE TABLE IF NOT EXISTS `product_image` (
  `image_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  KEY `idx_product_image_unit` (`sys_unit_id`),
  KEY `idx_product_image_user` (`sys_user_id`),
  KEY `idx_pi_product_variation` (`product_id`,`variation_id`),
  KEY `fk_product_image_variation_id` (`variation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_pricing`
--

DROP TABLE IF EXISTS `product_pricing`;
CREATE TABLE IF NOT EXISTS `product_pricing` (
  `price_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `price_list_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Standard',
  `currency_code` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `cost_price` decimal(15,4) NOT NULL,
  `list_price` decimal(15,4) NOT NULL,
  `wholesale_price` decimal(15,4) DEFAULT NULL,
  `retail_price` decimal(15,4) NOT NULL,
  `minimum_price` decimal(15,4) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`price_id`),
  KEY `idx_product_pricing_unit` (`sys_unit_id`),
  KEY `idx_product_pricing_user` (`sys_user_id`),
  KEY `idx_pp_product_variation` (`product_id`,`variation_id`),
  KEY `idx_pp_price_list_name` (`price_list_name`),
  KEY `idx_pp_is_active` (`is_active`),
  KEY `idx_pp_valid_to` (`valid_to`),
  KEY `fk_product_pricing_variation_id` (`variation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_supplier`
--

DROP TABLE IF EXISTS `product_supplier`;
CREATE TABLE IF NOT EXISTS `product_supplier` (
  `product_supplier_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `supplier_id` int UNSIGNED NOT NULL,
  `supplier_product_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_preferred_supplier` tinyint(1) DEFAULT '0',
  `min_order_qty` decimal(10,3) DEFAULT NULL,
  `purchase_uom_id` int UNSIGNED DEFAULT NULL,
  `lead_time` int DEFAULT NULL,
  `price` decimal(15,4) DEFAULT NULL,
  `currency_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `last_purchase_date` date DEFAULT NULL,
  `last_purchase_price` decimal(15,4) DEFAULT NULL,
  `supplier_rating` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`product_supplier_id`),
  UNIQUE KEY `uk_product_supplier` (`product_id`,`variation_id`,`supplier_id`),
  KEY `idx_product_supplier_unit` (`sys_unit_id`),
  KEY `idx_product_supplier_user` (`sys_user_id`),
  KEY `idx_ps_supplier` (`supplier_id`),
  KEY `idx_ps_purchase_uom` (`purchase_uom_id`),
  KEY `idx_ps_preferred_supplier` (`is_preferred_supplier`),
  KEY `fk_product_supplier_variation_id` (`variation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_variation`
--

DROP TABLE IF EXISTS `product_variation`;
CREATE TABLE IF NOT EXISTS `product_variation` (
  `variation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variation_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `width` decimal(10,3) DEFAULT NULL,
  `height` decimal(10,3) DEFAULT NULL,
  `depth` decimal(10,3) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `additional_cost` decimal(15,4) DEFAULT NULL,
  `additional_price` decimal(15,4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`variation_id`),
  UNIQUE KEY `uk_product_variation_code` (`product_id`,`variation_code`),
  KEY `idx_product_variation_unit` (`sys_unit_id`),
  KEY `idx_product_variation_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `project`
--

DROP TABLE IF EXISTS `project`;
CREATE TABLE IF NOT EXISTS `project` (
  `project_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `project_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `manager_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_center_id` int UNSIGNED DEFAULT NULL,
  `department_id` int UNSIGNED DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `budget` decimal(19,4) DEFAULT NULL,
  `status` enum('PLANNED','ACTIVE','ON_HOLD','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `uk_project_company_code` (`company_id`,`project_code`),
  KEY `idx_project_unit` (`sys_unit_id`),
  KEY `idx_project_user` (`sys_user_id`),
  KEY `idx_project_company` (`company_id`),
  KEY `idx_project_cost_center` (`cost_center_id`),
  KEY `idx_project_department` (`department_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `prorated_service`
--

DROP TABLE IF EXISTS `prorated_service`;
CREATE TABLE IF NOT EXISTS `prorated_service` (
  `prorated_service_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `charge_id` int UNSIGNED NOT NULL,
  `service_funeral_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`prorated_service_id`),
  KEY `idx_prorated_service_charge` (`charge_id`),
  KEY `idx_prorated_service_funeral` (`service_funeral_id`),
  KEY `fk_prorated_service_id_unit` (`sys_unit_id`),
  KEY `fk_prorated_service_id_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `purchase_order`
--

DROP TABLE IF EXISTS `purchase_order`;
CREATE TABLE IF NOT EXISTS `purchase_order` (
  `po_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int UNSIGNED NOT NULL,
  `quotation_id` int UNSIGNED DEFAULT NULL,
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `delivery_address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int UNSIGNED DEFAULT NULL,
  `currency_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subtotal` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `shipping_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','SENT','PARTIALLY_RECEIVED','FULLY_RECEIVED','CLOSED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `approval_date` date DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`po_id`),
  UNIQUE KEY `company_id` (`company_id`,`po_number`),
  KEY `idx_po_supplier` (`supplier_id`),
  KEY `idx_po_quotation` (`quotation_id`),
  KEY `idx_po_warehouse` (`warehouse_id`),
  KEY `idx_po_status` (`status`),
  KEY `idx_po_expected_delivery` (`expected_delivery_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `purchase_order_item`
--

DROP TABLE IF EXISTS `purchase_order_item`;
CREATE TABLE IF NOT EXISTS `purchase_order_item` (
  `po_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `po_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `requisition_id` int UNSIGNED DEFAULT NULL,
  `requisition_item_id` int UNSIGNED DEFAULT NULL,
  `quotation_item_id` int UNSIGNED DEFAULT NULL,
  `supplier_product_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,4) DEFAULT '0.0000',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(15,4) DEFAULT '0.0000',
  `total_price` decimal(15,4) NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `quantity_received` decimal(15,3) DEFAULT '0.000',
  `quantity_returned` decimal(15,3) DEFAULT '0.000',
  `status` enum('PENDING','PARTIALLY_RECEIVED','FULLY_RECEIVED','CLOSED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`po_item_id`),
  KEY `idx_poi_po` (`po_id`),
  KEY `idx_poi_product` (`product_id`),
  KEY `idx_poi_variation` (`variation_id`),
  KEY `idx_poi_requisition` (`requisition_id`),
  KEY `idx_poi_requisition_item` (`requisition_item_id`),
  KEY `idx_poi_quotation_item` (`quotation_item_id`),
  KEY `idx_poi_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `purchase_requisition`
--

DROP TABLE IF EXISTS `purchase_requisition`;
CREATE TABLE IF NOT EXISTS `purchase_requisition` (
  `requisition_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `requisition_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requester_id` int NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_date` date NOT NULL,
  `required_date` date DEFAULT NULL,
  `warehouse_id` int UNSIGNED DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','REJECTED','CONVERTED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `priority` enum('LOW','NORMAL','HIGH','URGENT') COLLATE utf8mb4_unicode_ci DEFAULT 'NORMAL',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`requisition_id`),
  UNIQUE KEY `company_id` (`company_id`,`requisition_number`),
  KEY `fk_purchase_requisition_warehouse_id` (`warehouse_id`),
  KEY `idx_pr_requester` (`requester_id`),
  KEY `idx_pr_status` (`status`),
  KEY `idx_pr_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `purchase_requisition_item`
--

DROP TABLE IF EXISTS `purchase_requisition_item`;
CREATE TABLE IF NOT EXISTS `purchase_requisition_item` (
  `req_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `requisition_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `estimated_unit_price` decimal(15,4) DEFAULT NULL,
  `estimated_total_price` decimal(15,4) DEFAULT NULL,
  `required_date` date DEFAULT NULL,
  `preferred_supplier_id` int UNSIGNED DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','ORDERED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`req_item_id`),
  KEY `idx_pri_requisition` (`requisition_id`),
  KEY `idx_pri_product` (`product_id`),
  KEY `idx_pri_variation` (`variation_id`),
  KEY `idx_pri_uom` (`uom_id`),
  KEY `idx_pri_preferred_supplier` (`preferred_supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reconciliation_item`
--

DROP TABLE IF EXISTS `reconciliation_item`;
CREATE TABLE IF NOT EXISTS `reconciliation_item` (
  `item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `reconciliation_id` int UNSIGNED NOT NULL,
  `journal_line_id` int UNSIGNED DEFAULT NULL,
  `transaction_id` int UNSIGNED DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(19,4) NOT NULL,
  `is_matched` tinyint DEFAULT '0',
  `matched_date` timestamp NULL DEFAULT NULL,
  `matched_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_reconciliation_item_matched_by` (`matched_by`),
  KEY `idx_reconciliation_item_reconciliation` (`reconciliation_id`),
  KEY `idx_reconciliation_item_journal_line` (`journal_line_id`),
  KEY `idx_reconciliation_item_transaction` (`transaction_id`),
  KEY `idx_reconciliation_item_date` (`transaction_date`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `region`
--

DROP TABLE IF EXISTS `region`;
CREATE TABLE IF NOT EXISTS `region` (
  `region_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`region_id`),
  KEY `idx_region_unit` (`sys_unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `report_definition`
--

DROP TABLE IF EXISTS `report_definition`;
CREATE TABLE IF NOT EXISTS `report_definition` (
  `report_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `report_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `report_query` text COLLATE utf8mb4_unicode_ci,
  `parameters` json DEFAULT NULL,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uk_report_definition_company` (`company_id`,`report_code`),
  KEY `fk_report_definition_created_by` (`created_by`),
  KEY `idx_report_definition_company` (`company_id`),
  KEY `idx_report_definition_type` (`report_type`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `request_for_quotation`
--

DROP TABLE IF EXISTS `request_for_quotation`;
CREATE TABLE IF NOT EXISTS `request_for_quotation` (
  `rfq_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `rfq_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rfq_date` date NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('DRAFT','SENT','CLOSED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`rfq_id`),
  UNIQUE KEY `company_id` (`company_id`,`rfq_number`),
  KEY `idx_rfq_status` (`status`),
  KEY `idx_rfq_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rfq_item`
--

DROP TABLE IF EXISTS `rfq_item`;
CREATE TABLE IF NOT EXISTS `rfq_item` (
  `rfq_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `rfq_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `required_date` date DEFAULT NULL,
  `requisition_id` int UNSIGNED DEFAULT NULL,
  `requisition_item_id` int UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`rfq_item_id`),
  KEY `idx_rfqi_rfq` (`rfq_id`),
  KEY `idx_rfqi_product` (`product_id`),
  KEY `idx_rfqi_variation` (`variation_id`),
  KEY `idx_rfqi_uom` (`uom_id`),
  KEY `idx_rfqi_requisition` (`requisition_id`),
  KEY `idx_rfqi_requisition_item` (`requisition_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rfq_supplier`
--

DROP TABLE IF EXISTS `rfq_supplier`;
CREATE TABLE IF NOT EXISTS `rfq_supplier` (
  `rfq_supplier_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `rfq_id` int UNSIGNED NOT NULL,
  `supplier_id` int UNSIGNED NOT NULL,
  `sent_date` date DEFAULT NULL,
  `response_due_date` date DEFAULT NULL,
  `response_date` date DEFAULT NULL,
  `status` enum('PENDING','SENT','RESPONDED','DECLINED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`rfq_supplier_id`),
  UNIQUE KEY `rfq_id` (`rfq_id`,`supplier_id`),
  KEY `fk_rfq_supplier_supplier_id` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_allocation`
--

DROP TABLE IF EXISTS `sales_allocation`;
CREATE TABLE IF NOT EXISTS `sales_allocation` (
  `allocation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `so_id` int UNSIGNED NOT NULL,
  `so_item_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `quantity_allocated` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allocation_date` date NOT NULL,
  `allocated_by` int UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`allocation_id`),
  KEY `idx_sa_so` (`so_id`),
  KEY `idx_sa_so_item` (`so_item_id`),
  KEY `idx_sa_product` (`product_id`),
  KEY `idx_sa_variation` (`variation_id`),
  KEY `idx_sa_warehouse` (`warehouse_id`),
  KEY `idx_sa_location` (`location_id`),
  KEY `idx_sa_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_batches`
--

DROP TABLE IF EXISTS `sales_batches`;
CREATE TABLE IF NOT EXISTS `sales_batches` (
  `batch_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('OPEN','CLOSED','CANCELLED') DEFAULT 'OPEN',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`batch_id`),
  KEY `company_id` (`company_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_commission`
--

DROP TABLE IF EXISTS `sales_commission`;
CREATE TABLE IF NOT EXISTS `sales_commission` (
  `commission_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `contract_id` int UNSIGNED NOT NULL,
  `partner_id` int UNSIGNED NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `amount` decimal(19,4) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','PAID') DEFAULT 'PENDING',
  `due_date` date DEFAULT NULL,
  `paid_transaction_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`commission_id`),
  KEY `contract_id` (`contract_id`),
  KEY `partner_id` (`partner_id`),
  KEY `paid_transaction_id` (`paid_transaction_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_distribution`
--

DROP TABLE IF EXISTS `sales_distribution`;
CREATE TABLE IF NOT EXISTS `sales_distribution` (
  `distribution_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `batch_id` int UNSIGNED DEFAULT NULL,
  `partner_id` int UNSIGNED DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `status` enum('DELIVERED','PARTIAL_RETURN','RETURNED') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`distribution_id`),
  KEY `batch_id` (`batch_id`),
  KEY `partner_id` (`partner_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_order`
--

DROP TABLE IF EXISTS `sales_order`;
CREATE TABLE IF NOT EXISTS `sales_order` (
  `so_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `so_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int UNSIGNED NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `delivery_address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int UNSIGNED DEFAULT NULL,
  `currency_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subtotal` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `shipping_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','CONFIRMED','PROCESSING','PARTIALLY_SHIPPED','FULLY_SHIPPED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`so_id`),
  UNIQUE KEY `company_id` (`company_id`,`so_number`),
  KEY `idx_so_customer` (`customer_id`),
  KEY `idx_so_warehouse` (`warehouse_id`),
  KEY `idx_so_status` (`status`),
  KEY `idx_so_expected_delivery` (`expected_delivery_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sales_order_item`
--

DROP TABLE IF EXISTS `sales_order_item`;
CREATE TABLE IF NOT EXISTS `sales_order_item` (
  `so_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `so_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,4) DEFAULT '0.0000',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(15,4) DEFAULT '0.0000',
  `total_price` decimal(15,4) NOT NULL,
  `requested_delivery_date` date DEFAULT NULL,
  `quantity_allocated` decimal(15,3) DEFAULT '0.000',
  `quantity_shipped` decimal(15,3) DEFAULT '0.000',
  `quantity_returned` decimal(15,3) DEFAULT '0.000',
  `warehouse_id` int UNSIGNED DEFAULT NULL,
  `status` enum('PENDING','ALLOCATED','PARTIALLY_SHIPPED','FULLY_SHIPPED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`so_item_id`),
  KEY `idx_soi_so` (`so_id`),
  KEY `idx_soi_product` (`product_id`),
  KEY `idx_soi_variation` (`variation_id`),
  KEY `idx_soi_uom` (`uom_id`),
  KEY `idx_soi_warehouse` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `schema_version`
--

DROP TABLE IF EXISTS `schema_version`;
CREATE TABLE IF NOT EXISTS `schema_version` (
  `schema_version_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`schema_version_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `schema_version`
--

INSERT INTO `schema_version` (`schema_version_id`, `version`, `applied_at`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, '2.0.1', '2026-03-24 21:04:48', 'ContractMaster schema with contract versioning support - fixed naming', '2026-03-24 21:04:48', '2026-03-24 21:04:48', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `serial_tracking`
--

DROP TABLE IF EXISTS `serial_tracking`;
CREATE TABLE IF NOT EXISTS `serial_tracking` (
  `serial_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('IN_STOCK','RESERVED','SOLD','RETURNED','DEFECTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'IN_STOCK',
  `batch_id` int UNSIGNED DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `purchase_order_line_id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `sales_order_line_id` int DEFAULT NULL,
  `warranty_start_date` date DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`serial_id`),
  UNIQUE KEY `product_id` (`product_id`,`variation_id`,`serial_number`),
  KEY `fk_serial_tracking_variation_id` (`variation_id`),
  KEY `idx_st_batch` (`batch_id`),
  KEY `idx_st_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `service_funeral`
--

DROP TABLE IF EXISTS `service_funeral`;
CREATE TABLE IF NOT EXISTS `service_funeral` (
  `service_funeral_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_version_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL COMMENT 'Unit where service was performed',
  `sys_user_id` int UNSIGNED NOT NULL COMMENT 'User who recorded the service',
  `performed_service_id` int UNSIGNED NOT NULL COMMENT 'Link to general service tracking',
  `declarant_id` int UNSIGNED DEFAULT NULL,
  `deceased_id` int UNSIGNED DEFAULT NULL,
  `office_users_id` int UNSIGNED NOT NULL,
  `process_number` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `occurr_at` date NOT NULL,
  `category` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PL',
  `kinship` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `death_at` date DEFAULT NULL,
  `death_time` char(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `death_address_id` int UNSIGNED DEFAULT NULL,
  `payment_at` date DEFAULT NULL,
  `burial_date` date DEFAULT NULL,
  `burial_time` char(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cemetery` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(19,4) DEFAULT NULL,
  `paid_in_date` date DEFAULT NULL,
  `group_batch_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`service_funeral_id`),
  KEY `idx_service_funeral_version` (`contract_version_id`),
  KEY `idx_service_funeral_unit` (`sys_unit_id`),
  KEY `idx_service_funeral_user` (`sys_user_id`),
  KEY `idx_service_funeral_performed` (`performed_service_id`),
  KEY `idx_service_funeral_deceased` (`deceased_id`),
  KEY `idx_service_funeral_declarant` (`declarant_id`),
  KEY `idx_service_funeral_office` (`office_users_id`),
  KEY `idx_service_funeral_group` (`group_batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Funeral services provided to contract beneficiaries';

-- --------------------------------------------------------

--
-- Estrutura para tabela `service_type`
--

DROP TABLE IF EXISTS `service_type`;
CREATE TABLE IF NOT EXISTS `service_type` (
  `service_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `route` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'FUNERAL',
  `is_billable` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`service_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uk_service_type_name` (`name`),
  KEY `idx_service_type_unit` (`sys_unit_id`),
  KEY `idx_service_type_user` (`sys_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `service_type`
--

INSERT INTO `service_type` (`service_type_id`, `sys_unit_id`, `sys_user_id`, `name`, `description`, `route`, `industry`, `is_billable`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(9, 0, 0, 'Preventive Maintenance', 'Scheduled routine checkup', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(10, 0, 0, 'Corrective Maintenance', 'Repairing a specific issue', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(11, 0, 0, 'Oil Change', 'Engine oil and filter replacement', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(12, 0, 0, 'Tire Replacement', 'Replacement of one or more tires', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(13, 0, 0, 'Brake Service', 'Inspection and repair of brake system', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(14, 0, 0, 'Engine Repair', 'Repair of engine components', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(15, 0, 0, 'Body Work', 'Repair of vehicle body', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(16, 0, 0, 'Inspection', 'General or specific vehicle inspection', NULL, 'FUNERAL', 1, '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `shipment`
--

DROP TABLE IF EXISTS `shipment`;
CREATE TABLE IF NOT EXISTS `shipment` (
  `shipment_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `shipment_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_id` int UNSIGNED DEFAULT NULL,
  `customer_id` int UNSIGNED NOT NULL,
  `shipping_date` date NOT NULL,
  `delivery_address` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `shipping_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_by` int UNSIGNED DEFAULT NULL,
  `status` enum('DRAFT','PICKING','PACKED','SHIPPED','DELIVERED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `company_id` (`company_id`,`shipment_number`),
  KEY `idx_shipment_so` (`so_id`),
  KEY `idx_shipment_customer` (`customer_id`),
  KEY `idx_shipment_warehouse` (`warehouse_id`),
  KEY `idx_shipment_status` (`status`),
  KEY `idx_shipment_shipping_date` (`shipping_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `shipment_item`
--

DROP TABLE IF EXISTS `shipment_item`;
CREATE TABLE IF NOT EXISTS `shipment_item` (
  `shipment_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `shipment_id` int UNSIGNED NOT NULL,
  `so_id` int UNSIGNED DEFAULT NULL,
  `so_item_id` int UNSIGNED DEFAULT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `allocation_id` int UNSIGNED DEFAULT NULL,
  `quantity_shipped` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`shipment_item_id`),
  KEY `idx_si_shipment` (`shipment_id`),
  KEY `idx_si_so` (`so_id`),
  KEY `idx_si_so_item` (`so_item_id`),
  KEY `idx_si_product` (`product_id`),
  KEY `idx_si_variation` (`variation_id`),
  KEY `idx_si_allocation` (`allocation_id`),
  KEY `idx_si_uom` (`uom_id`),
  KEY `idx_si_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `specialty`
--

DROP TABLE IF EXISTS `specialty`;
CREATE TABLE IF NOT EXISTS `specialty` (
  `specialty_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`specialty_id`),
  UNIQUE KEY `uk_specialty_name` (`name`),
  KEY `idx_specialty_unit` (`sys_unit_id`),
  KEY `idx_specialty_user` (`sys_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `state`
--

DROP TABLE IF EXISTS `state`;
CREATE TABLE IF NOT EXISTS `state` (
  `state_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uf` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_ibge` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `state_machine_transitions`
--

DROP TABLE IF EXISTS `state_machine_transitions`;
CREATE TABLE IF NOT EXISTS `state_machine_transitions` (
  `state_machine_transitions_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_status_id_from` int UNSIGNED DEFAULT NULL,
  `contract_status_id_to` int UNSIGNED NOT NULL,
  `generate_charge` tinyint DEFAULT '0',
  `allows_service` tinyint DEFAULT '0',
  `charge_after` int DEFAULT NULL,
  `kanban` tinyint DEFAULT '0',
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kanban_order` int DEFAULT NULL,
  `final_state` tinyint DEFAULT '0',
  `initial_state` tinyint DEFAULT '0',
  `allow_edition` tinyint DEFAULT '1',
  `allow_deletion` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `unit_id` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`state_machine_transitions_id`),
  KEY `fk_smt_from` (`contract_status_id_from`),
  KEY `fk_smt_to` (`contract_status_id_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `status`
--

DROP TABLE IF EXISTS `status`;
CREATE TABLE IF NOT EXISTS `status` (
  `status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `status_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `generate_charge` tinyint DEFAULT '0',
  `allows_service` tinyint DEFAULT '0',
  `charge_after` int DEFAULT NULL,
  `kanban` tinyint DEFAULT '0',
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kanban_order` int DEFAULT NULL,
  `final_state` tinyint DEFAULT '0',
  `initial_state` tinyint DEFAULT '0',
  `allow_edition` tinyint DEFAULT '1',
  `allow_deletion` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `uk_status_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reference table for status codes used throughout the system';

--
-- Despejando dados para a tabela `status`
--

INSERT INTO `status` (`status_id`, `status_code`, `status_name`, `description`, `generate_charge`, `allows_service`, `charge_after`, `kanban`, `color`, `kanban_order`, `final_state`, `initial_state`, `allow_edition`, `allow_deletion`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'ACTIVE', 'Active', 'Active record', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(2, 'INACTIVE', 'Inactive', 'Inactive record', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(3, 'DRAFT', 'Draft', 'Initial draft state', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(4, 'PENDING', 'Pending', 'Awaiting action', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(5, 'APPROVED', 'Approved', 'Approved for processing', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(6, 'COMPLETED', 'Completed', 'Process completed', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(7, 'CANCELED', 'Canceled', 'Process cancelado', 0, 0, NULL, 0, NULL, NULL, 0, 0, 1, 1, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `status_reason`
--

DROP TABLE IF EXISTS `status_reason`;
CREATE TABLE IF NOT EXISTS `status_reason` (
  `status_reason_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `reason` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `unit_id` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`status_reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_count`
--

DROP TABLE IF EXISTS `stock_count`;
CREATE TABLE IF NOT EXISTS `stock_count` (
  `count_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `count_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count_date` date NOT NULL,
  `status` enum('DRAFT','IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`count_id`),
  UNIQUE KEY `uk_stock_count_name` (`sys_unit_id`,`count_name`),
  KEY `idx_stock_count_unit` (`sys_unit_id`),
  KEY `idx_stock_count_user` (`sys_user_id`),
  KEY `idx_sc_warehouse` (`warehouse_id`),
  KEY `idx_sc_status` (`status`),
  KEY `idx_sc_count_date` (`count_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_count_item`
--

DROP TABLE IF EXISTS `stock_count_item`;
CREATE TABLE IF NOT EXISTS `stock_count_item` (
  `count_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `count_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `expected_qty` decimal(15,3) NOT NULL DEFAULT '0.000',
  `counted_qty` decimal(15,3) DEFAULT NULL,
  `difference` decimal(15,3) GENERATED ALWAYS AS ((`counted_qty` - `expected_qty`)) STORED,
  `uom_id` int UNSIGNED NOT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `counted_by` int DEFAULT NULL,
  `counted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`count_item_id`),
  KEY `idx_stock_count_item_unit` (`sys_unit_id`),
  KEY `idx_stock_count_item_user` (`sys_user_id`),
  KEY `idx_sci_count` (`count_id`),
  KEY `idx_sci_product` (`product_id`),
  KEY `idx_sci_variation` (`variation_id`),
  KEY `idx_sci_location` (`location_id`),
  KEY `idx_sci_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_level`
--

DROP TABLE IF EXISTS `stock_level`;
CREATE TABLE IF NOT EXISTS `stock_level` (
  `stock_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL COMMENT 'NULL for base product',
  `warehouse_id` int UNSIGNED NOT NULL,
  `location_id` int UNSIGNED DEFAULT NULL COMMENT 'NULL for unlocated stock',
  `qty_on_hand` decimal(15,3) NOT NULL DEFAULT '0.000',
  `qty_reserved` decimal(15,3) NOT NULL DEFAULT '0.000',
  `qty_available` decimal(15,3) GENERATED ALWAYS AS ((`qty_on_hand` - `qty_reserved`)) STORED,
  `qty_on_order` decimal(15,3) NOT NULL DEFAULT '0.000',
  `min_stock_level` decimal(15,3) DEFAULT NULL,
  `max_stock_level` decimal(15,3) DEFAULT NULL,
  `reorder_point` decimal(15,3) DEFAULT NULL,
  `reorder_qty` decimal(15,3) DEFAULT NULL,
  `last_count_date` date DEFAULT NULL,
  `last_received_date` date DEFAULT NULL,
  `last_issued_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `uk_stock_level` (`product_id`,`variation_id`,`warehouse_id`,`location_id`),
  KEY `idx_stock_level_unit` (`sys_unit_id`),
  KEY `idx_stock_level_user` (`sys_user_id`),
  KEY `idx_sl_variation` (`variation_id`),
  KEY `idx_stock_warehouse` (`warehouse_id`),
  KEY `idx_stock_location` (`location_id`),
  KEY `idx_stock_availability` (`qty_available`),
  KEY `idx_stock_reorder` (`reorder_point`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Current stock levels by location';

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_movement`
--

DROP TABLE IF EXISTS `stock_movement`;
CREATE TABLE IF NOT EXISTS `stock_movement` (
  `movement_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `movement_type_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `from_warehouse_id` int UNSIGNED DEFAULT NULL,
  `from_location_id` int UNSIGNED DEFAULT NULL,
  `to_warehouse_id` int UNSIGNED DEFAULT NULL,
  `to_location_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT NULL,
  `total_cost` decimal(15,4) DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `reference_line_id` int DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `movement_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`movement_id`,`movement_date`),
  KEY `idx_stock_movement_unit` (`sys_unit_id`),
  KEY `idx_stock_movement_user` (`sys_user_id`),
  KEY `idx_sm_movement_type` (`movement_type_id`),
  KEY `idx_sm_product` (`product_id`),
  KEY `idx_sm_variation` (`variation_id`),
  KEY `idx_sm_from_warehouse` (`from_warehouse_id`),
  KEY `idx_sm_from_location` (`from_location_id`),
  KEY `idx_sm_to_warehouse` (`to_warehouse_id`),
  KEY `idx_sm_to_location` (`to_location_id`),
  KEY `idx_sm_uom` (`uom_id`),
  KEY `idx_sm_movement_date` (`movement_date`),
  KEY `idx_sm_reference` (`reference_type`,`reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_movement_type`
--

DROP TABLE IF EXISTS `stock_movement_type`;
CREATE TABLE IF NOT EXISTS `stock_movement_type` (
  `movement_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `type_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affects_qty_on_hand` tinyint(1) DEFAULT '1',
  `direction` enum('IN','OUT','TRANSFER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`movement_type_id`),
  UNIQUE KEY `uk_stock_movement_type_code` (`type_code`),
  KEY `idx_stock_movement_type_unit` (`sys_unit_id`),
  KEY `idx_stock_movement_type_user` (`sys_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `stock_movement_type`
--

INSERT INTO `stock_movement_type` (`movement_type_id`, `sys_unit_id`, `sys_user_id`, `type_code`, `type_name`, `affects_qty_on_hand`, `direction`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, NULL, NULL, 'PO_RECEIPT', 'Purchase Order Receipt', 1, 'IN', 'Receipt of goods from purchase order', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(2, NULL, NULL, 'SALES_ISSUE', 'Sales Order Issue', 1, 'OUT', 'Issue of goods for sales order', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(3, NULL, NULL, 'RETURN_IN', 'Customer Return', 1, 'IN', 'Return of goods from customer', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(4, NULL, NULL, 'RETURN_OUT', 'Supplier Return', 1, 'OUT', 'Return of goods to supplier', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(5, NULL, NULL, 'ADJUST_IN', 'Adjustment In', 1, 'IN', 'Positive inventory adjustment', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(6, NULL, NULL, 'ADJUST_OUT', 'Adjustment Out', 1, 'OUT', 'Negative inventory adjustment', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(7, NULL, NULL, 'TRANSFER_OUT', 'Transfer Out', 1, 'TRANSFER', 'Transfer to another warehouse/location', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(8, NULL, NULL, 'TRANSFER_IN', 'Transfer In', 1, 'TRANSFER', 'Transfer from another warehouse/location', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(9, NULL, NULL, 'PRODUCTION_IN', 'Production Receipt', 1, 'IN', 'Receipt from production', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(10, NULL, NULL, 'PRODUCTION_OUT', 'Production Issue', 1, 'OUT', 'Issue for production', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(11, NULL, NULL, 'COUNT_ADJUST', 'Inventory Count Adjustment', 1, 'IN', 'Adjustment after physical count', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(12, NULL, NULL, 'WASTE', 'Waste/Scrap', 1, 'OUT', 'Disposal of damaged/expired goods', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(13, NULL, NULL, 'RESERVATION', 'Reservation', 0, 'OUT', 'Reservation of stock (does not affect on-hand)', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL),
(14, NULL, NULL, 'UNRESERVATION', 'Remove Reservation', 0, 'IN', 'Remove stock reservation', '2026-03-24 21:05:43', '2026-03-24 21:05:43', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `stock_reservation`
--

DROP TABLE IF EXISTS `stock_reservation`;
CREATE TABLE IF NOT EXISTS `stock_reservation` (
  `reservation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `reservation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` int NOT NULL,
  `reference_line_id` int DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`reservation_id`),
  KEY `idx_sr_product` (`product_id`),
  KEY `idx_sr_variation` (`variation_id`),
  KEY `idx_sr_warehouse` (`warehouse_id`),
  KEY `idx_sr_location` (`location_id`),
  KEY `idx_sr_uom` (`uom_id`),
  KEY `idx_sr_reference` (`reservation_type`,`reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `storage_location`
--

DROP TABLE IF EXISTS `storage_location`;
CREATE TABLE IF NOT EXISTS `storage_location` (
  `location_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `location_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aisle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shelf` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `uk_storage_location_code` (`warehouse_id`,`location_code`),
  KEY `idx_storage_location_unit` (`sys_unit_id`),
  KEY `idx_storage_location_user` (`sys_user_id`),
  KEY `idx_location_is_active` (`is_active`),
  KEY `idx_location_hierarchy` (`warehouse_id`,`section`,`aisle`,`shelf`,`bin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Specific storage locations within warehouses';

-- --------------------------------------------------------

--
-- Estrutura para tabela `subsidiary`
--

DROP TABLE IF EXISTS `subsidiary`;
CREATE TABLE IF NOT EXISTS `subsidiary` (
  `subsidiary_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`subsidiary_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `subsidiary`
--

INSERT INTO `subsidiary` (`subsidiary_id`, `name`, `code`, `status`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Matriz', 'BPL', '1', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(2, 'Poços', 'POC', '1', '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier`
--

DROP TABLE IF EXISTS `supplier`;
CREATE TABLE IF NOT EXISTS `supplier` (
  `supplier_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `supplier_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `supplier_rating` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `uk_supplier_code` (`sys_unit_id`,`supplier_code`),
  KEY `idx_supplier_unit` (`sys_unit_id`),
  KEY `idx_supplier_user` (`sys_user_id`),
  KEY `idx_supplier_name` (`supplier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier_quotation`
--

DROP TABLE IF EXISTS `supplier_quotation`;
CREATE TABLE IF NOT EXISTS `supplier_quotation` (
  `quotation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `rfq_supplier_id` int UNSIGNED NOT NULL,
  `quotation_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quotation_date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `currency_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subtotal` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_time` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('RECEIVED','UNDER_REVIEW','ACCEPTED','REJECTED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'RECEIVED',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`quotation_id`),
  KEY `idx_sq_rfq_supplier` (`rfq_supplier_id`),
  KEY `idx_sq_status` (`status`),
  KEY `idx_sq_valid_until` (`valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier_quotation_item`
--

DROP TABLE IF EXISTS `supplier_quotation_item`;
CREATE TABLE IF NOT EXISTS `supplier_quotation_item` (
  `quotation_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `quotation_id` int UNSIGNED NOT NULL,
  `rfq_item_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(15,4) DEFAULT '0.0000',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(15,4) DEFAULT '0.0000',
  `total_price` decimal(15,4) NOT NULL,
  `lead_time` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`quotation_item_id`),
  KEY `idx_sqi_quotation` (`quotation_id`),
  KEY `idx_sqi_rfq_item` (`rfq_item_id`),
  KEY `idx_sqi_product` (`product_id`),
  KEY `idx_sqi_variation` (`variation_id`),
  KEY `idx_sqi_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier_return`
--

DROP TABLE IF EXISTS `supplier_return`;
CREATE TABLE IF NOT EXISTS `supplier_return` (
  `return_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `return_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int UNSIGNED NOT NULL,
  `po_id` int UNSIGNED DEFAULT NULL,
  `receipt_id` int UNSIGNED DEFAULT NULL,
  `return_date` date NOT NULL,
  `warehouse_id` int UNSIGNED NOT NULL,
  `return_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `company_id` (`company_id`,`return_number`),
  KEY `idx_sr_supplier` (`supplier_id`),
  KEY `idx_sr_po` (`po_id`),
  KEY `idx_sr_receipt` (`receipt_id`),
  KEY `idx_sr_warehouse` (`warehouse_id`),
  KEY `idx_sr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier_return_item`
--

DROP TABLE IF EXISTS `supplier_return_item`;
CREATE TABLE IF NOT EXISTS `supplier_return_item` (
  `return_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `return_id` int UNSIGNED NOT NULL,
  `receipt_item_id` int UNSIGNED DEFAULT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `quantity_returned` decimal(15,3) NOT NULL,
  `uom_id` int UNSIGNED NOT NULL,
  `unit_price` decimal(15,4) DEFAULT NULL,
  `total_price` decimal(15,4) DEFAULT NULL,
  `location_id` int UNSIGNED DEFAULT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`return_item_id`),
  KEY `idx_sri_return` (`return_id`),
  KEY `idx_sri_receipt_item` (`receipt_item_id`),
  KEY `idx_sri_product` (`product_id`),
  KEY `idx_sri_variation` (`variation_id`),
  KEY `idx_sri_uom` (`uom_id`),
  KEY `idx_sri_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_audit_log`
--

DROP TABLE IF EXISTS `sys_audit_log`;
CREATE TABLE IF NOT EXISTS `sys_audit_log` (
  `audit_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED DEFAULT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `action_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_sys_audit_log_company` (`company_id`),
  KEY `idx_sys_audit_log_user` (`sys_user_id`),
  KEY `idx_sys_audit_log_action_time` (`action_time`),
  KEY `idx_sys_audit_log_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_group`
--

DROP TABLE IF EXISTS `sys_group`;
CREATE TABLE IF NOT EXISTS `sys_group` (
  `sys_group_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `sys_group`
--

INSERT INTO `sys_group` (`sys_group_id`, `name`, `uuid`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Admin', NULL, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL),
(2, 'Standard', NULL, '2026-03-24 21:04:51', '2026-03-24 21:04:51', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_group_program`
--

DROP TABLE IF EXISTS `sys_group_program`;
CREATE TABLE IF NOT EXISTS `sys_group_program` (
  `sys_group_program_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_group_id` int UNSIGNED NOT NULL,
  `sys_program_id` int UNSIGNED NOT NULL,
  `actions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_group_program_id`),
  KEY `idx_sys_group_program_group` (`sys_group_id`),
  KEY `idx_sys_group_program_program` (`sys_program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_preference`
--

DROP TABLE IF EXISTS `sys_preference`;
CREATE TABLE IF NOT EXISTS `sys_preference` (
  `sys_preference_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preference` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_preference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_program`
--

DROP TABLE IF EXISTS `sys_program`;
CREATE TABLE IF NOT EXISTS `sys_program` (
  `sys_program_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `controller` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `actions` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`sys_program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_setting`
--

DROP TABLE IF EXISTS `sys_setting`;
CREATE TABLE IF NOT EXISTS `sys_setting` (
  `setting_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED DEFAULT NULL,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `data_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `uk_sys_setting` (`company_id`,`setting_key`),
  KEY `idx_sys_setting_company` (`company_id`),
  KEY `idx_sys_setting_key` (`setting_key`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_unit`
--

DROP TABLE IF EXISTS `sys_unit`;
CREATE TABLE IF NOT EXISTS `sys_unit` (
  `sys_unit_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `subsidiary_id` int UNSIGNED NOT NULL,
  `status_id` int UNSIGNED DEFAULT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection_name` text COLLATE utf8mb4_unicode_ci,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_unit_id`),
  UNIQUE KEY `uk_sys_unit_code` (`code`),
  KEY `idx_sys_unit_subsidiary` (`subsidiary_id`),
  KEY `idx_sys_unit_status` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_user`
--

DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE IF NOT EXISTS `sys_user` (
  `sys_user_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_salt` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frontpage_id` int UNSIGNED DEFAULT NULL,
  `sys_unit_id` int UNSIGNED DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `accepted_term_policy_at` timestamp NULL DEFAULT NULL,
  `accepted_term_policy` tinyint DEFAULT NULL,
  `two_factor_enabled` tinyint DEFAULT '0',
  `two_factor_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_admin` tinyint DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_user_id`),
  UNIQUE KEY `uk_sys_user_name` (`name`),
  UNIQUE KEY `uk_sys_user_email` (`email`),
  KEY `idx_user_id` (`sys_user_id`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_username` (`name`),
  KEY `idx_sys_user_login` (`login`),
  KEY `idx_sys_user_unit` (`sys_unit_id`),
  KEY `fk_sys_user_frontpg` (`frontpage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_user_group`
--

DROP TABLE IF EXISTS `sys_user_group`;
CREATE TABLE IF NOT EXISTS `sys_user_group` (
  `sys_user_group_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED NOT NULL,
  `sys_group_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_user_group_id`),
  KEY `idx_sys_user_group_user` (`sys_user_id`),
  KEY `idx_sys_user_group_group` (`sys_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_user_program`
--

DROP TABLE IF EXISTS `sys_user_program`;
CREATE TABLE IF NOT EXISTS `sys_user_program` (
  `sys_user_program_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED NOT NULL,
  `sys_program_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_user_program_id`),
  KEY `idx_sys_user_program_user` (`sys_user_id`),
  KEY `idx_sys_user_program_program` (`sys_program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sys_user_unit`
--

DROP TABLE IF EXISTS `sys_user_unit`;
CREATE TABLE IF NOT EXISTS `sys_user_unit` (
  `sys_user_unit_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_user_id` int UNSIGNED NOT NULL,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sys_user_unit_id`),
  KEY `idx_sys_user_unit_user` (`sys_user_id`),
  KEY `idx_sys_user_unit_unit` (`sys_unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tax_code`
--

DROP TABLE IF EXISTS `tax_code`;
CREATE TABLE IF NOT EXISTS `tax_code` (
  `tax_code_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `rate` decimal(8,4) NOT NULL,
  `is_recoverable` tinyint DEFAULT '1',
  `liability_account_id` int UNSIGNED DEFAULT NULL,
  `receivable_account_id` int UNSIGNED DEFAULT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`tax_code_id`),
  UNIQUE KEY `uk_tax_code_company` (`company_id`,`code`),
  KEY `fk_tax_code_liability_account` (`liability_account_id`),
  KEY `fk_tax_code_receivable_account` (`receivable_account_id`),
  KEY `idx_tax_code_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `transaction`
--

DROP TABLE IF EXISTS `transaction`;
CREATE TABLE IF NOT EXISTS `transaction` (
  `transaction_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `transaction_type_id` int UNSIGNED NOT NULL,
  `transaction_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` date NOT NULL,
  `from_account_id` int UNSIGNED DEFAULT NULL,
  `from_contact_id` int UNSIGNED DEFAULT NULL,
  `to_account_id` int UNSIGNED DEFAULT NULL,
  `to_contact_id` int UNSIGNED DEFAULT NULL,
  `payment_method_id` int UNSIGNED DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRL',
  `exchange_rate` decimal(19,6) DEFAULT '1.000000',
  `amount` decimal(19,4) NOT NULL,
  `reference_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `memo` text COLLATE utf8mb4_unicode_ci,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_id` int UNSIGNED DEFAULT NULL,
  `is_reconciled_from` tinyint DEFAULT '0',
  `reconciliation_date_from` timestamp NULL DEFAULT NULL,
  `is_reconciled_to` tinyint DEFAULT '0',
  `reconciliation_date_to` timestamp NULL DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `uk_transaction_company_number` (`company_id`,`transaction_number`),
  KEY `fk_transaction_from_contact` (`from_contact_id`),
  KEY `fk_transaction_to_contact` (`to_contact_id`),
  KEY `fk_transaction_payment_method` (`payment_method_id`),
  KEY `fk_transaction_currency` (`currency`),
  KEY `fk_transaction_created_by` (`created_by`),
  KEY `idx_transaction_company` (`company_id`),
  KEY `idx_transaction_from_account` (`from_account_id`),
  KEY `idx_transaction_to_account` (`to_account_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_transaction_status` (`status`),
  KEY `idx_transaction_journal` (`journal_id`),
  KEY `idx_transaction_type` (`transaction_type_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `transaction_allocation`
--

DROP TABLE IF EXISTS `transaction_allocation`;
CREATE TABLE IF NOT EXISTS `transaction_allocation` (
  `allocation_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_id` int UNSIGNED NOT NULL,
  `invoice_id` int UNSIGNED DEFAULT NULL,
  `original_amount` decimal(19,4) NOT NULL,
  `allocated_amount` decimal(19,4) NOT NULL,
  `discount_amount` decimal(19,4) DEFAULT '0.0000',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`allocation_id`),
  KEY `idx_transaction_allocation_transaction` (`transaction_id`),
  KEY `idx_transaction_allocation_invoice` (`invoice_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `transaction_type`
--

DROP TABLE IF EXISTS `transaction_type`;
CREATE TABLE IF NOT EXISTS `transaction_type` (
  `transaction_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `type_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`transaction_type_id`),
  UNIQUE KEY `uk_transaction_type_company` (`company_id`,`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `trip`
--

DROP TABLE IF EXISTS `trip`;
CREATE TABLE IF NOT EXISTS `trip` (
  `trip_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `company_id` int UNSIGNED NOT NULL,
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` int UNSIGNED NOT NULL,
  `vehicle_request_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `start_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `trip_status_id` int UNSIGNED NOT NULL,
  `start_odometer` int UNSIGNED DEFAULT NULL,
  `end_odometer` int UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`trip_id`),
  KEY `idx_trip_company_id` (`company_id`),
  KEY `idx_trip_vehicle_id` (`vehicle_id`),
  KEY `idx_trip_driver_id` (`driver_id`),
  KEY `idx_trip_request_id` (`vehicle_request_id`),
  KEY `idx_trip_start_date` (`start_date`),
  KEY `idx_trip_status_id` (`trip_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `trip_document`
--

DROP TABLE IF EXISTS `trip_document`;
CREATE TABLE IF NOT EXISTS `trip_document` (
  `trip_document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`trip_document_id`),
  UNIQUE KEY `uk_trip_document` (`trip_id`,`document_id`),
  KEY `idx_td_trip_id` (`trip_id`),
  KEY `idx_td_document_id` (`document_id`),
  KEY `idx_td_company_id` (`company_id`),
  KEY `idx_td_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `trip_status`
--

DROP TABLE IF EXISTS `trip_status`;
CREATE TABLE IF NOT EXISTS `trip_status` (
  `trip_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`trip_status_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `trip_status`
--

INSERT INTO `trip_status` (`trip_status_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Planned', 'Trip is planned but not yet started', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Ongoing', 'Trip is currently in progress', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Delayed', 'Trip is delayed', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Completed', 'Trip has been successfully completed', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Cancelled', 'Trip has been cancelled', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `units_of_measurement`
--

DROP TABLE IF EXISTS `units_of_measurement`;
CREATE TABLE IF NOT EXISTS `units_of_measurement` (
  `uom_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `uom_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom_type` enum('weight','volume','length','count','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`uom_id`),
  UNIQUE KEY `uk_uom_code` (`uom_code`),
  KEY `idx_uom_unit` (`sys_unit_id`),
  KEY `idx_uom_user` (`sys_user_id`),
  KEY `idx_uom_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Units of measurement for products';

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_company_access`
--

DROP TABLE IF EXISTS `user_company_access`;
CREATE TABLE IF NOT EXISTS `user_company_access` (
  `user_company_access_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `can_view` tinyint DEFAULT '1',
  `can_edit` tinyint DEFAULT '0',
  `can_approve` tinyint DEFAULT '0',
  `can_admin` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`user_company_access_id`),
  UNIQUE KEY `uk_user_company` (`sys_user_id`,`company_id`),
  KEY `idx_user_access_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `validation_rule`
--

DROP TABLE IF EXISTS `validation_rule`;
CREATE TABLE IF NOT EXISTS `validation_rule` (
  `rule_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED DEFAULT NULL,
  `rule_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition_sql` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`rule_id`),
  KEY `fk_validation_rule_company` (`company_id`)
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `variation_attribute`
--

DROP TABLE IF EXISTS `variation_attribute`;
CREATE TABLE IF NOT EXISTS `variation_attribute` (
  `var_attr_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED NOT NULL,
  `attribute_type_id` int UNSIGNED NOT NULL,
  `attribute_value_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`var_attr_id`),
  UNIQUE KEY `uk_variation_attribute` (`variation_id`,`attribute_type_id`),
  KEY `idx_variation_attribute_unit` (`sys_unit_id`),
  KEY `idx_variation_attribute_user` (`sys_user_id`),
  KEY `idx_va_attribute_type` (`attribute_type_id`),
  KEY `idx_va_attribute_value` (`attribute_value_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
CREATE TABLE IF NOT EXISTS `vehicle` (
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `company_id` int UNSIGNED NOT NULL,
  `plate` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type_id` int UNSIGNED NOT NULL,
  `year` int NOT NULL,
  `vin` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_status_id` int UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `plate` (`plate`),
  UNIQUE KEY `vin` (`vin`),
  KEY `idx_vehicle_company_id` (`company_id`),
  KEY `idx_vehicle_plate` (`plate`),
  KEY `idx_vehicle_vin` (`vin`),
  KEY `idx_vehicle_type_id` (`vehicle_type_id`),
  KEY `idx_vehicle_status_id` (`vehicle_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_daily_log`
--

DROP TABLE IF EXISTS `vehicle_daily_log`;
CREATE TABLE IF NOT EXISTS `vehicle_daily_log` (
  `vehicle_daily_log_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int UNSIGNED NOT NULL,
  `driver_id` int UNSIGNED DEFAULT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `log_event_type_id` int UNSIGNED NOT NULL,
  `log_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `odometer_reading` int UNSIGNED DEFAULT NULL,
  `location_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `attached_document_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_daily_log_id`),
  KEY `idx_vdl_vehicle_id` (`vehicle_id`),
  KEY `idx_vdl_company_id` (`company_id`),
  KEY `idx_vdl_driver_id` (`driver_id`),
  KEY `idx_vdl_sys_user_id` (`sys_user_id`),
  KEY `idx_vdl_log_event_type_id` (`log_event_type_id`),
  KEY `idx_vdl_log_timestamp` (`log_timestamp`),
  KEY `idx_vdl_attached_document_id` (`attached_document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_document`
--

DROP TABLE IF EXISTS `vehicle_document`;
CREATE TABLE IF NOT EXISTS `vehicle_document` (
  `vehicle_document_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_document_id`),
  UNIQUE KEY `uk_vehicle_document` (`vehicle_id`,`document_id`),
  KEY `idx_vd_vehicle_id` (`vehicle_id`),
  KEY `idx_vd_document_id` (`document_id`),
  KEY `idx_vd_company_id` (`company_id`),
  KEY `idx_vd_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_expense`
--

DROP TABLE IF EXISTS `vehicle_expense`;
CREATE TABLE IF NOT EXISTS `vehicle_expense` (
  `vehicle_expense_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trip_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_type_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED DEFAULT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency_code` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BRL',
  `description` text COLLATE utf8mb4_unicode_ci,
  `receipt_document_id` int UNSIGNED DEFAULT NULL,
  `vehicle_expense_status_id` int UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_expense_id`),
  KEY `fk_vehicle_expense_currency_code` (`currency_code`),
  KEY `idx_vexp_company_id` (`company_id`),
  KEY `idx_vexp_vehicle_id` (`vehicle_id`),
  KEY `idx_vexp_trip_id` (`trip_id`),
  KEY `idx_vexp_expense_type_id` (`expense_type_id`),
  KEY `idx_vexp_sys_user_id` (`sys_user_id`),
  KEY `idx_vexp_expense_date` (`expense_date`),
  KEY `idx_vexp_receipt_document_id` (`receipt_document_id`),
  KEY `idx_vexp_status_id` (`vehicle_expense_status_id`),
  KEY `idx_vexp_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_expense_status`
--

DROP TABLE IF EXISTS `vehicle_expense_status`;
CREATE TABLE IF NOT EXISTS `vehicle_expense_status` (
  `vehicle_expense_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_expense_status_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vehicle_expense_status`
--

INSERT INTO `vehicle_expense_status` (`vehicle_expense_status_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Pending', 'Expense report is pending approval/processing', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Approved', 'Expense has been approved', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Rejected', 'Expense has been rejected', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Reimbursed', 'Expense has been reimbursed to the payer', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Paid', 'Expense has been paid directly by the company', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_request`
--

DROP TABLE IF EXISTS `vehicle_request`;
CREATE TABLE IF NOT EXISTS `vehicle_request` (
  `vehicle_request_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `company_id` int UNSIGNED NOT NULL,
  `requester_id` int UNSIGNED NOT NULL,
  `requested_vehicle_type_id` int UNSIGNED NOT NULL,
  `vehicle_request_type_id` int UNSIGNED NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `number_of_passengers` int DEFAULT NULL,
  `vehicle_request_status_id` int UNSIGNED NOT NULL,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_request_id`),
  KEY `idx_vr_company_id` (`company_id`),
  KEY `idx_vr_requester_id` (`requester_id`),
  KEY `idx_vr_req_vehicle_type_id` (`requested_vehicle_type_id`),
  KEY `idx_vr_type_id` (`vehicle_request_type_id`),
  KEY `idx_vr_status_id` (`vehicle_request_status_id`),
  KEY `idx_vr_start_date` (`start_date`),
  KEY `idx_vr_approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_request_status`
--

DROP TABLE IF EXISTS `vehicle_request_status`;
CREATE TABLE IF NOT EXISTS `vehicle_request_status` (
  `vehicle_request_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_request_status_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vehicle_request_status`
--

INSERT INTO `vehicle_request_status` (`vehicle_request_status_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Pending', 'Request is awaiting approval', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Approved', 'Request has been approved', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Rejected', 'Request has been rejected', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Scheduled', 'A trip has been scheduled for this request', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'In Progress', 'The requested service/trip is ongoing', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(6, 'Completed', 'The requested service/trip has been completed', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(7, 'Cancelled', 'Request has been cancelled', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_request_type`
--

DROP TABLE IF EXISTS `vehicle_request_type`;
CREATE TABLE IF NOT EXISTS `vehicle_request_type` (
  `vehicle_request_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_request_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vehicle_request_type`
--

INSERT INTO `vehicle_request_type` (`vehicle_request_type_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Employee Transport', 'Transport for company employees', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(2, 'Client Visit', 'Transport for visiting a client', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(3, 'Goods Delivery', 'Transport for delivering goods', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(4, 'Airport Transfer', 'Transport to or from an airport', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(5, 'Event Transport', 'Transport for a specific event', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(6, 'Removal Service', 'Vehicle for funeral removal services', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(7, 'Transfer Service', 'Vehicle for funeral transfer services', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL),
(8, 'Vehicle Rental', 'Rental of a vehicle (bus/van)', '2026-03-24 21:06:14', '2026-03-24 21:06:14', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_status`
--

DROP TABLE IF EXISTS `vehicle_status`;
CREATE TABLE IF NOT EXISTS `vehicle_status` (
  `vehicle_status_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_status_id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_vehicle_status_unit` (`sys_unit_id`),
  KEY `idx_vehicle_status_user` (`sys_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vehicle_status`
--

INSERT INTO `vehicle_status` (`vehicle_status_id`, `sys_unit_id`, `sys_user_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(5, 0, 0, 'Available', 'Vehicle is ready for use', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(6, 0, 0, 'In Use', 'Vehicle is currently on a trip or assigned', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(7, 0, 0, 'Maintenance', 'Vehicle is undergoing maintenance', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(8, 0, 0, 'Decommissioned', 'Vehicle is no longer in service', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vehicle_type`
--

DROP TABLE IF EXISTS `vehicle_type`;
CREATE TABLE IF NOT EXISTS `vehicle_type` (
  `vehicle_type_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`vehicle_type_id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_vehicle_type_unit` (`sys_unit_id`),
  KEY `idx_vehicle_type_user` (`sys_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vehicle_type`
--

INSERT INTO `vehicle_type` (`vehicle_type_id`, `sys_unit_id`, `sys_user_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`) VALUES
(6, 0, 0, 'Car', 'Standard passenger car', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(7, 0, 0, 'Van', 'Passenger or cargo van', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(8, 0, 0, 'Bus', 'Large passenger vehicle', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(9, 0, 0, 'Truck', 'Cargo truck', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL),
(10, 0, 0, 'Motorcycle', 'Motorcycle for transport or delivery', '2026-03-24 21:09:41', '2026-03-24 21:09:41', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_accounts_receivable_aging`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_accounts_receivable_aging`;
CREATE TABLE IF NOT EXISTS `view_accounts_receivable_aging` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`company_id` int unsigned
,`company_name` varchar(100)
,`contact_id` int unsigned
,`contact_name` varchar(100)
,`days_1_30` decimal(42,4)
,`days_31_60` decimal(42,4)
,`days_61_90` decimal(42,4)
,`days_90_plus` decimal(42,4)
,`max_days_outstanding` int
,`outstanding_items` bigint
,`total_outstanding` decimal(42,4)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_balance_sheet`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_balance_sheet`;
CREATE TABLE IF NOT EXISTS `view_balance_sheet` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`account_type` varchar(50)
,`account_type_id` int unsigned
,`balance_amount` decimal(20,4)
,`company_id` int unsigned
,`company_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`nature_total` decimal(42,4)
,`period_end_date` date
,`period_name` varchar(50)
,`running_total` decimal(42,4)
,`total_assets` decimal(42,4)
,`total_equity` decimal(42,4)
,`total_liabilities` decimal(42,4)
,`total_liabilities_equity` decimal(42,4)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_budget_vs_actual`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_budget_vs_actual`;
CREATE TABLE IF NOT EXISTS `view_budget_vs_actual` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`actual_amount` decimal(20,4)
,`budget_amount` decimal(19,4)
,`budget_name` varchar(100)
,`company_id` int unsigned
,`company_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`period_name` varchar(50)
,`variance` decimal(21,4)
,`variance_percentage` decimal(32,8)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_cash_flow`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_cash_flow`;
CREATE TABLE IF NOT EXISTS `view_cash_flow` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`cash_inflow` decimal(41,4)
,`cash_outflow` decimal(41,4)
,`company_id` int unsigned
,`company_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`journal_date` date
,`net_cash_flow` decimal(42,4)
,`period_name` varchar(50)
,`transaction_count` bigint
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_consolidated_financials`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_consolidated_financials`;
CREATE TABLE IF NOT EXISTS `view_consolidated_financials` (
`amount` decimal(42,4)
,`company_id` int unsigned
,`company_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`parent_company_id` int unsigned
,`parent_company_name` varchar(100)
,`period_name` varchar(50)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_general_ledger`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_general_ledger`;
CREATE TABLE IF NOT EXISTS `view_general_ledger` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`account_nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`company_id` int unsigned
,`company_name` varchar(100)
,`contact_id` int unsigned
,`contact_name` varchar(100)
,`cost_center_code` varchar(30)
,`cost_center_id` int unsigned
,`cost_center_name` varchar(100)
,`created_at` timestamp
,`created_by` varchar(50)
,`credit_amount` decimal(19,4)
,`debit_amount` decimal(19,4)
,`department_code` varchar(30)
,`department_id` int unsigned
,`department_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`journal_date` date
,`journal_description` text
,`journal_id` int unsigned
,`journal_line_id` int unsigned
,`journal_number` varchar(30)
,`journal_type` varchar(50)
,`line_description` text
,`line_number` int unsigned
,`period_name` varchar(50)
,`project_code` varchar(30)
,`project_id` int unsigned
,`project_name` varchar(100)
,`reference_number` varchar(50)
,`status` varchar(20)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_income_statement`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_income_statement`;
CREATE TABLE IF NOT EXISTS `view_income_statement` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`account_type` varchar(50)
,`account_type_id` int unsigned
,`company_id` int unsigned
,`company_name` varchar(100)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`nature_total` decimal(42,4)
,`net_amount` decimal(20,4)
,`net_income` decimal(42,4)
,`period_end_date` date
,`period_name` varchar(50)
,`period_start_date` date
,`running_total` decimal(42,4)
,`total_expense` decimal(42,4)
,`total_revenue` decimal(42,4)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `view_trial_balance`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `view_trial_balance`;
CREATE TABLE IF NOT EXISTS `view_trial_balance` (
`account_code` varchar(30)
,`account_id` int unsigned
,`account_name` varchar(100)
,`account_type` varchar(50)
,`account_type_id` int unsigned
,`closing_balance` decimal(19,4)
,`company_id` int unsigned
,`company_name` varchar(100)
,`credit_total` decimal(19,4)
,`debit_total` decimal(19,4)
,`fiscal_period_id` int unsigned
,`fiscal_year_id` int unsigned
,`nature` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')
,`net_balance` decimal(20,4)
,`opening_balance` decimal(19,4)
,`period_name` varchar(50)
,`year_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_batch_expiry`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_batch_expiry`;
CREATE TABLE IF NOT EXISTS `vw_batch_expiry` (
`batch_id` int unsigned
,`batch_number` varchar(50)
,`cost_price` decimal(15,4)
,`current_quantity` decimal(15,3)
,`days_until_expiry` int
,`expiry_date` date
,`expiry_status` varchar(24)
,`manufacture_date` date
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`supplier_name` varchar(100)
,`total_value` decimal(30,7)
,`variation_code` varchar(50)
,`variation_name` varchar(200)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_current_inventory`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_current_inventory`;
CREATE TABLE IF NOT EXISTS `vw_current_inventory` (
`brand_id` int unsigned
,`brand_name` varchar(100)
,`category_id` int unsigned
,`category_name` varchar(100)
,`location_code` varchar(20)
,`max_stock_level` decimal(15,3)
,`min_stock_level` decimal(15,3)
,`product_code` varchar(50)
,`product_name` varchar(200)
,`qty_available` decimal(15,3)
,`qty_on_hand` decimal(15,3)
,`qty_on_order` decimal(15,3)
,`qty_reserved` decimal(15,3)
,`reorder_point` decimal(15,3)
,`reorder_qty` decimal(15,3)
,`uom_code` varchar(10)
,`variation_code` varchar(50)
,`variation_name` varchar(200)
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_inventory_aging`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_inventory_aging`;
CREATE TABLE IF NOT EXISTS `vw_inventory_aging` (
`age_bucket` varchar(13)
,`brand_name` varchar(100)
,`category_name` varchar(100)
,`cost_price` decimal(15,4)
,`days_in_inventory` int
,`last_receipt_date` timestamp
,`location_code` varchar(20)
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`qty_on_hand` decimal(15,3)
,`total_value` decimal(30,7)
,`variation_code` varchar(50)
,`variation_id` int unsigned
,`variation_name` varchar(200)
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_inventory_valuation`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_inventory_valuation`;
CREATE TABLE IF NOT EXISTS `vw_inventory_valuation` (
`brand_name` varchar(100)
,`category_name` varchar(100)
,`cost_price` decimal(15,4)
,`currency_code` varchar(3)
,`location_code` varchar(20)
,`location_id` int unsigned
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`qty_on_hand` decimal(15,3)
,`total_value` decimal(30,7)
,`variation_code` varchar(50)
,`variation_id` int unsigned
,`variation_name` varchar(200)
,`warehouse_id` int unsigned
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_product_performance`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_product_performance`;
CREATE TABLE IF NOT EXISTS `vw_product_performance` (
`available_stock` decimal(37,3)
,`brand_name` varchar(100)
,`category_name` varchar(100)
,`cost_price` decimal(15,4)
,`current_stock` decimal(37,3)
,`daily_velocity` decimal(41,7)
,`days_of_inventory` decimal(48,7)
,`gross_profit` decimal(16,4)
,`incoming_stock` decimal(37,3)
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`profit_margin` decimal(27,8)
,`qty_sold_30days` decimal(37,3)
,`qty_sold_90days` decimal(37,3)
,`retail_price` decimal(15,4)
,`variation_code` varchar(50)
,`variation_id` int unsigned
,`variation_name` varchar(200)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_purchase_order_status`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_purchase_order_status`;
CREATE TABLE IF NOT EXISTS `vw_purchase_order_status` (
`currency_code` varchar(3)
,`days_until_delivery` int
,`delivery_status` varchar(9)
,`discount_amount` decimal(15,4)
,`expected_delivery_date` date
,`po_date` date
,`po_id` int unsigned
,`po_number` varchar(50)
,`po_status` enum('DRAFT','APPROVED','SENT','PARTIALLY_RECEIVED','FULLY_RECEIVED','CLOSED','CANCELLED')
,`shipping_amount` decimal(15,4)
,`subtotal` decimal(15,4)
,`supplier_id` int unsigned
,`supplier_name` varchar(100)
,`tax_amount` decimal(15,4)
,`total_amount` decimal(15,4)
,`total_line_items` bigint
,`total_ordered_qty` decimal(37,3)
,`total_pending_qty` decimal(39,3)
,`total_received_qty` decimal(37,3)
,`total_returned_qty` decimal(37,3)
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_reorder_recommendation`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_reorder_recommendation`;
CREATE TABLE IF NOT EXISTS `vw_reorder_recommendation` (
`lead_time` int
,`min_order_qty` decimal(10,3)
,`min_stock_level` decimal(15,3)
,`needs_reorder` int
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`reorder_point` decimal(15,3)
,`reorder_qty` decimal(15,3)
,`supplier_id` int unsigned
,`supplier_name` varchar(100)
,`supplier_price` decimal(15,4)
,`total_qty_available` decimal(37,3)
,`total_qty_on_hand` decimal(37,3)
,`total_qty_on_order` decimal(37,3)
,`total_qty_reserved` decimal(37,3)
,`uom_code` varchar(10)
,`variation_code` varchar(50)
,`variation_id` int unsigned
,`variation_name` varchar(200)
,`warehouse_id` int unsigned
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_sales_order_status`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_sales_order_status`;
CREATE TABLE IF NOT EXISTS `vw_sales_order_status` (
`currency_code` varchar(3)
,`customer_id` int unsigned
,`customer_name` varchar(100)
,`days_until_delivery` int
,`delivery_status` varchar(9)
,`discount_amount` decimal(15,4)
,`expected_delivery_date` date
,`order_date` date
,`shipping_amount` decimal(15,4)
,`so_id` int unsigned
,`so_number` varchar(50)
,`so_status` enum('DRAFT','CONFIRMED','PROCESSING','PARTIALLY_SHIPPED','FULLY_SHIPPED','COMPLETED','CANCELLED')
,`subtotal` decimal(15,4)
,`tax_amount` decimal(15,4)
,`total_allocated_qty` decimal(37,3)
,`total_amount` decimal(15,4)
,`total_line_items` bigint
,`total_ordered_qty` decimal(37,3)
,`total_pending_qty` decimal(38,3)
,`total_returned_qty` decimal(37,3)
,`total_shipped_qty` decimal(37,3)
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_stock_accuracy`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_stock_accuracy`;
CREATE TABLE IF NOT EXISTS `vw_stock_accuracy` (
`category_name` varchar(100)
,`count_date` date
,`count_id` int unsigned
,`count_name` varchar(100)
,`count_status` enum('DRAFT','IN_PROGRESS','COMPLETED','CANCELLED')
,`counted_qty` decimal(15,3)
,`difference` decimal(15,3)
,`discrepancy_percentage` decimal(25,7)
,`expected_qty` decimal(15,3)
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`uom_code` varchar(10)
,`variance_type` varchar(8)
,`variation_code` varchar(50)
,`variation_name` varchar(200)
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_stock_movement`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_stock_movement`;
CREATE TABLE IF NOT EXISTS `vw_stock_movement` (
`batch_number` varchar(50)
,`direction` enum('IN','OUT','TRANSFER')
,`from_location` varchar(20)
,`from_warehouse` varchar(100)
,`movement_date` timestamp
,`movement_id` int unsigned
,`movement_type` varchar(50)
,`product_code` varchar(50)
,`product_name` varchar(200)
,`quantity` decimal(15,3)
,`reference_id` int
,`reference_type` varchar(50)
,`serial_number` varchar(50)
,`to_location` varchar(20)
,`to_warehouse` varchar(100)
,`total_cost` decimal(15,4)
,`unit_cost` decimal(15,4)
,`uom_code` varchar(10)
,`variation_code` varchar(50)
,`variation_name` varchar(200)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_stock_turnover`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_stock_turnover`;
CREATE TABLE IF NOT EXISTS `vw_stock_turnover` (
`avg_inventory` decimal(19,7)
,`brand_name` varchar(100)
,`category_name` varchar(100)
,`days_since_last_sale` int
,`last_sale_date` timestamp
,`product_code` varchar(50)
,`product_id` int unsigned
,`product_name` varchar(200)
,`qty_sold_30days` decimal(37,3)
,`turnover_rate_30days` decimal(48,7)
,`variation_code` varchar(50)
,`variation_id` int unsigned
,`variation_name` varchar(200)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_supply_chain_kpi`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_supply_chain_kpi`;
CREATE TABLE IF NOT EXISTS `vw_supply_chain_kpi` (
`active_products` bigint
,`adjustments_today` bigint
,`open_po_value` decimal(37,4)
,`open_purchase_orders` bigint
,`open_sales_orders` bigint
,`open_so_value` decimal(37,4)
,`open_transfers` bigint
,`products_to_reorder` bigint
,`receipts_today` bigint
,`report_date` date
,`shipments_today` bigint
,`total_inventory_qty` decimal(37,3)
,`total_inventory_value` decimal(52,7)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_warehouse_transfer_status`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_warehouse_transfer_status`;
CREATE TABLE IF NOT EXISTS `vw_warehouse_transfer_status` (
`from_warehouse` varchar(100)
,`status_description` varchar(18)
,`to_warehouse` varchar(100)
,`total_line_items` bigint
,`total_pending_qty` decimal(38,3)
,`total_received_qty` decimal(37,3)
,`total_sent_qty` decimal(37,3)
,`total_transfer_qty` decimal(37,3)
,`transfer_date` date
,`transfer_id` int unsigned
,`transfer_number` varchar(50)
,`transfer_status` enum('DRAFT','PENDING','IN_TRANSIT','PARTIALLY_RECEIVED','FULLY_RECEIVED','CANCELLED')
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_warehouse_utilization`
-- (Veja abaixo para a visão atual)
--
DROP VIEW IF EXISTS `vw_warehouse_utilization`;
CREATE TABLE IF NOT EXISTS `vw_warehouse_utilization` (
`empty_locations` bigint
,`location_utilization_percentage` decimal(27,4)
,`occupied_locations` bigint
,`total_items` decimal(37,3)
,`total_locations` bigint
,`total_volume_used` decimal(65,12)
,`unique_products` bigint
,`warehouse_id` int unsigned
,`warehouse_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `warehouse`
--

DROP TABLE IF EXISTS `warehouse`;
CREATE TABLE IF NOT EXISTS `warehouse` (
  `warehouse_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sys_unit_id` int UNSIGNED NOT NULL,
  `sys_user_id` int UNSIGNED NOT NULL,
  `warehouse_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`warehouse_id`),
  UNIQUE KEY `uk_warehouse_code` (`sys_unit_id`,`warehouse_code`),
  KEY `idx_warehouse_unit` (`sys_unit_id`),
  KEY `idx_warehouse_user` (`sys_user_id`),
  KEY `idx_warehouse_is_active` (`is_active`),
  KEY `idx_warehouse_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Physical warehouse locations';

-- --------------------------------------------------------

--
-- Estrutura para tabela `warehouse_transfer`
--

DROP TABLE IF EXISTS `warehouse_transfer`;
CREATE TABLE IF NOT EXISTS `warehouse_transfer` (
  `transfer_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL,
  `transfer_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_warehouse_id` int UNSIGNED NOT NULL,
  `to_warehouse_id` int UNSIGNED NOT NULL,
  `transfer_date` date NOT NULL,
  `status` enum('DRAFT','PENDING','IN_TRANSIT','PARTIALLY_RECEIVED','FULLY_RECEIVED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`transfer_id`),
  UNIQUE KEY `company_id` (`company_id`,`transfer_number`),
  KEY `idx_wt_from_warehouse` (`from_warehouse_id`),
  KEY `idx_wt_to_warehouse` (`to_warehouse_id`),
  KEY `idx_wt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `warehouse_transfer_item`
--

DROP TABLE IF EXISTS `warehouse_transfer_item`;
CREATE TABLE IF NOT EXISTS `warehouse_transfer_item` (
  `transfer_item_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `transfer_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `variation_id` int UNSIGNED DEFAULT NULL,
  `from_location_id` int UNSIGNED DEFAULT NULL,
  `to_location_id` int UNSIGNED DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `quantity_sent` decimal(15,3) DEFAULT '0.000',
  `quantity_received` decimal(15,3) DEFAULT '0.000',
  `uom_id` int UNSIGNED NOT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','PICKED','SHIPPED','PARTIALLY_RECEIVED','FULLY_RECEIVED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`transfer_item_id`),
  KEY `idx_wti_transfer` (`transfer_id`),
  KEY `idx_wti_product` (`product_id`),
  KEY `idx_wti_variation` (`variation_id`),
  KEY `idx_wti_from_location` (`from_location_id`),
  KEY `idx_wti_to_location` (`to_location_id`),
  KEY `idx_wti_uom` (`uom_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para view `view_accounts_receivable_aging`
--
DROP TABLE IF EXISTS `view_accounts_receivable_aging`;

DROP VIEW IF EXISTS `view_accounts_receivable_aging`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_accounts_receivable_aging`  AS WITH     `receivable_transactions` as (select `j`.`company_id` AS `company_id`,`j`.`journal_date` AS `journal_date`,`jl`.`journal_line_id` AS `journal_line_id`,`jl`.`account_id` AS `account_id`,`jl`.`contact_id` AS `contact_id`,(`jl`.`debit_amount` - `jl`.`credit_amount`) AS `outstanding_amount`,(to_days(curdate()) - to_days(`j`.`journal_date`)) AS `days_outstanding`,(case when ((to_days(curdate()) - to_days(`j`.`journal_date`)) <= 30) then '1-30' when ((to_days(curdate()) - to_days(`j`.`journal_date`)) <= 60) then '31-60' when ((to_days(curdate()) - to_days(`j`.`journal_date`)) <= 90) then '61-90' else '90+' end) AS `age_bucket` from (((`journal_line` `jl` join `journal` `j` on((`jl`.`journal_id` = `j`.`journal_id`))) join `account` `a` on((`jl`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) where ((`at`.`nature` = 'ASSET') and (`a`.`is_control_account` = 1) and ((`at`.`type_name` = 'ACCOUNTS_RECEIVABLE') or (`a`.`account_name` like '%Receivable%')) and (`j`.`status` = 'POSTED') and ((`jl`.`debit_amount` - `jl`.`credit_amount`) > 0) and (`jl`.`contact_id` is not null))) select `rt`.`company_id` AS `company_id`,`c`.`company_name` AS `company_name`,`rt`.`contact_id` AS `contact_id`,`con`.`contact_name` AS `contact_name`,`rt`.`account_id` AS `account_id`,`a`.`account_code` AS `account_code`,`a`.`account_name` AS `account_name`,sum((case when (`rt`.`age_bucket` = '1-30') then `rt`.`outstanding_amount` else 0 end)) AS `days_1_30`,sum((case when (`rt`.`age_bucket` = '31-60') then `rt`.`outstanding_amount` else 0 end)) AS `days_31_60`,sum((case when (`rt`.`age_bucket` = '61-90') then `rt`.`outstanding_amount` else 0 end)) AS `days_61_90`,sum((case when (`rt`.`age_bucket` = '90+') then `rt`.`outstanding_amount` else 0 end)) AS `days_90_plus`,sum(`rt`.`outstanding_amount`) AS `total_outstanding`,max(`rt`.`days_outstanding`) AS `max_days_outstanding`,count(0) AS `outstanding_items` from (((`receivable_transactions` `rt` join `company` `c` on((`rt`.`company_id` = `c`.`company_id`))) join `contact` `con` on((`rt`.`contact_id` = `con`.`contact_id`))) join `account` `a` on((`rt`.`account_id` = `a`.`account_id`))) group by `rt`.`company_id`,`c`.`company_name`,`rt`.`contact_id`,`con`.`contact_name`,`rt`.`account_id`,`a`.`account_code`,`a`.`account_name` order by `rt`.`company_id`,`con`.`contact_name`  ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_balance_sheet`
--
DROP TABLE IF EXISTS `view_balance_sheet`;

DROP VIEW IF EXISTS `view_balance_sheet`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_balance_sheet`  AS WITH     `period_amounts` as (select `apb`.`company_id` AS `company_id`,`fp`.`fiscal_year_id` AS `fiscal_year_id`,`apb`.`fiscal_period_id` AS `fiscal_period_id`,`a`.`account_id` AS `account_id`,`a`.`account_code` AS `account_code`,`a`.`account_name` AS `account_name`,`at`.`account_type_id` AS `account_type_id`,`at`.`type_name` AS `account_type`,`at`.`nature` AS `nature`,(case when (`at`.`nature` = 'ASSET') then (`apb`.`debit_total` - `apb`.`credit_total`) when (`at`.`nature` in ('LIABILITY','EQUITY')) then (`apb`.`credit_total` - `apb`.`debit_total`) else 0 end) AS `balance_amount` from (((`account_period_balance` `apb` join `account` `a` on((`apb`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `fiscal_period` `fp` on((`apb`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) where ((`at`.`nature` in ('ASSET','LIABILITY','EQUITY')) and (`a`.`active` = 1))) select `pa`.`company_id` AS `company_id`,`c`.`company_name` AS `company_name`,`pa`.`fiscal_year_id` AS `fiscal_year_id`,`fy`.`year_name` AS `year_name`,`pa`.`fiscal_period_id` AS `fiscal_period_id`,`fp`.`period_name` AS `period_name`,`fp`.`end_date` AS `period_end_date`,`pa`.`account_id` AS `account_id`,`pa`.`account_code` AS `account_code`,`pa`.`account_name` AS `account_name`,`pa`.`account_type_id` AS `account_type_id`,`pa`.`account_type` AS `account_type`,`pa`.`nature` AS `nature`,`pa`.`balance_amount` AS `balance_amount`,sum(`pa`.`balance_amount`) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,`pa`.`nature` ORDER BY `pa`.`account_code` ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  AS `running_total`,sum(`pa`.`balance_amount`) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,`pa`.`nature` )  AS `nature_total`,sum((case when (`pa`.`nature` = 'ASSET') then `pa`.`balance_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_assets`,sum((case when (`pa`.`nature` = 'LIABILITY') then `pa`.`balance_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_liabilities`,sum((case when (`pa`.`nature` = 'EQUITY') then `pa`.`balance_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_equity`,sum((case when (`pa`.`nature` in ('LIABILITY','EQUITY')) then `pa`.`balance_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_liabilities_equity` from (((`period_amounts` `pa` join `company` `c` on((`pa`.`company_id` = `c`.`company_id`))) join `fiscal_year` `fy` on((`pa`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) join `fiscal_period` `fp` on((`pa`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) order by `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,(case when (`pa`.`nature` = 'ASSET') then 1 when (`pa`.`nature` = 'LIABILITY') then 2 else 3 end),`pa`.`account_code`  ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_budget_vs_actual`
--
DROP TABLE IF EXISTS `view_budget_vs_actual`;

DROP VIEW IF EXISTS `view_budget_vs_actual`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_budget_vs_actual`  AS SELECT `c`.`company_id` AS `company_id`, `c`.`company_name` AS `company_name`, `fy`.`fiscal_year_id` AS `fiscal_year_id`, `fy`.`year_name` AS `year_name`, `fp`.`fiscal_period_id` AS `fiscal_period_id`, `fp`.`period_name` AS `period_name`, `a`.`account_id` AS `account_id`, `a`.`account_code` AS `account_code`, `a`.`account_name` AS `account_name`, `at`.`nature` AS `nature`, coalesce(`bp`.`amount`,0) AS `budget_amount`, (case when (`at`.`nature` = 'REVENUE') then coalesce((`apb`.`credit_total` - `apb`.`debit_total`),0) when (`at`.`nature` = 'EXPENSE') then coalesce((`apb`.`debit_total` - `apb`.`credit_total`),0) else 0 end) AS `actual_amount`, (case when (`at`.`nature` = 'REVENUE') then (coalesce((`apb`.`credit_total` - `apb`.`debit_total`),0) - coalesce(`bp`.`amount`,0)) when (`at`.`nature` = 'EXPENSE') then (coalesce(`bp`.`amount`,0) - coalesce((`apb`.`debit_total` - `apb`.`credit_total`),0)) else 0 end) AS `variance`, (case when (coalesce(`bp`.`amount`,0) = 0) then NULL when (`at`.`nature` = 'REVENUE') then (((coalesce((`apb`.`credit_total` - `apb`.`debit_total`),0) - coalesce(`bp`.`amount`,0)) / nullif(coalesce(`bp`.`amount`,0),0)) * 100) when (`at`.`nature` = 'EXPENSE') then (((coalesce(`bp`.`amount`,0) - coalesce((`apb`.`debit_total` - `apb`.`credit_total`),0)) / nullif(coalesce(`bp`.`amount`,0),0)) * 100) else NULL end) AS `variance_percentage`, `b`.`budget_name` AS `budget_name` FROM ((((((((`account` `a` join `company` `c` on((`a`.`company_id` = `c`.`company_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `fiscal_period` `fp` on((1 = 1))) join `fiscal_year` `fy` on(((`fp`.`fiscal_year_id` = `fy`.`fiscal_year_id`) and (`fy`.`company_id` = `c`.`company_id`)))) left join `account_period_balance` `apb` on(((`a`.`account_id` = `apb`.`account_id`) and (`fp`.`fiscal_period_id` = `apb`.`fiscal_period_id`)))) left join `budget` `b` on(((`fy`.`fiscal_year_id` = `b`.`fiscal_year_id`) and (`b`.`company_id` = `c`.`company_id`)))) left join `budget_item` `bi` on(((`b`.`budget_id` = `bi`.`budget_id`) and (`a`.`account_id` = `bi`.`account_id`)))) left join `budget_period` `bp` on(((`bi`.`budget_item_id` = `bp`.`budget_item_id`) and (`fp`.`fiscal_period_id` = `bp`.`fiscal_period_id`)))) WHERE ((`at`.`nature` in ('REVENUE','EXPENSE')) AND (`a`.`active` = 1)) ORDER BY `c`.`company_id` ASC, `fy`.`fiscal_year_id` ASC, `fp`.`fiscal_period_id` ASC, `a`.`account_code` ASC ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_cash_flow`
--
DROP TABLE IF EXISTS `view_cash_flow`;

DROP VIEW IF EXISTS `view_cash_flow`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_cash_flow`  AS SELECT `c`.`company_id` AS `company_id`, `c`.`company_name` AS `company_name`, `j`.`journal_date` AS `journal_date`, `fy`.`fiscal_year_id` AS `fiscal_year_id`, `fy`.`year_name` AS `year_name`, `fp`.`fiscal_period_id` AS `fiscal_period_id`, `fp`.`period_name` AS `period_name`, `a`.`account_id` AS `account_id`, `a`.`account_code` AS `account_code`, `a`.`account_name` AS `account_name`, sum(`jl`.`debit_amount`) AS `cash_inflow`, sum(`jl`.`credit_amount`) AS `cash_outflow`, sum((`jl`.`debit_amount` - `jl`.`credit_amount`)) AS `net_cash_flow`, count(distinct `j`.`journal_id`) AS `transaction_count` FROM (((((`journal_line` `jl` join `journal` `j` on((`jl`.`journal_id` = `j`.`journal_id`))) join `account` `a` on((`jl`.`account_id` = `a`.`account_id`))) join `company` `c` on((`j`.`company_id` = `c`.`company_id`))) join `fiscal_period` `fp` on((`j`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) join `fiscal_year` `fy` on((`fp`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) WHERE ((`a`.`is_bank_account` = 1) AND (`j`.`status` = 'POSTED')) GROUP BY `c`.`company_id`, `c`.`company_name`, `j`.`journal_date`, `fy`.`fiscal_year_id`, `fy`.`year_name`, `fp`.`fiscal_period_id`, `fp`.`period_name`, `a`.`account_id`, `a`.`account_code`, `a`.`account_name` ORDER BY `c`.`company_id` ASC, `j`.`journal_date` DESC, `a`.`account_code` ASC ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_consolidated_financials`
--
DROP TABLE IF EXISTS `view_consolidated_financials`;

DROP VIEW IF EXISTS `view_consolidated_financials`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_consolidated_financials`  AS SELECT `parent`.`company_id` AS `parent_company_id`, `parent`.`company_name` AS `parent_company_name`, `child`.`company_id` AS `company_id`, `child`.`company_name` AS `company_name`, `fy`.`fiscal_year_id` AS `fiscal_year_id`, `fy`.`year_name` AS `year_name`, `fp`.`fiscal_period_id` AS `fiscal_period_id`, `fp`.`period_name` AS `period_name`, `at`.`nature` AS `nature`, sum((case when (`at`.`nature` = 'ASSET') then (`apb`.`debit_total` - `apb`.`credit_total`) when (`at`.`nature` = 'LIABILITY') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'EQUITY') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'REVENUE') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'EXPENSE') then (`apb`.`debit_total` - `apb`.`credit_total`) else 0 end)) AS `amount` FROM ((((((`company` `parent` join `company` `child` on((`parent`.`company_id` = `child`.`parent_company_id`))) join `account_period_balance` `apb` on((`child`.`company_id` = `apb`.`company_id`))) join `account` `a` on((`apb`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `fiscal_period` `fp` on((`apb`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) join `fiscal_year` `fy` on((`fp`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) WHERE ((`parent`.`is_consolidated` = 1) AND (`a`.`active` = 1)) GROUP BY `parent`.`company_id`, `parent`.`company_name`, `child`.`company_id`, `child`.`company_name`, `fy`.`fiscal_year_id`, `fy`.`year_name`, `fp`.`fiscal_period_id`, `fp`.`period_name`, `at`.`nature` ORDER BY `parent`.`company_id` ASC, `child`.`company_id` ASC, `fy`.`fiscal_year_id` ASC, `fp`.`fiscal_period_id` ASC, (case when (`at`.`nature` = 'ASSET') then 1 when (`at`.`nature` = 'LIABILITY') then 2 when (`at`.`nature` = 'EQUITY') then 3 when (`at`.`nature` = 'REVENUE') then 4 when (`at`.`nature` = 'EXPENSE') then 5 else 6 end) ASC ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_general_ledger`
--
DROP TABLE IF EXISTS `view_general_ledger`;

DROP VIEW IF EXISTS `view_general_ledger`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_general_ledger`  AS SELECT `c`.`company_id` AS `company_id`, `c`.`company_name` AS `company_name`, `j`.`journal_id` AS `journal_id`, `j`.`journal_number` AS `journal_number`, `j`.`journal_date` AS `journal_date`, `jt`.`type_name` AS `journal_type`, `j`.`description` AS `journal_description`, `j`.`reference_number` AS `reference_number`, `j`.`status` AS `status`, `jl`.`journal_line_id` AS `journal_line_id`, `jl`.`line_number` AS `line_number`, `a`.`account_id` AS `account_id`, `a`.`account_code` AS `account_code`, `a`.`account_name` AS `account_name`, `at`.`nature` AS `account_nature`, `jl`.`description` AS `line_description`, `jl`.`debit_amount` AS `debit_amount`, `jl`.`credit_amount` AS `credit_amount`, `cc`.`cost_center_id` AS `cost_center_id`, `cc`.`cost_center_code` AS `cost_center_code`, `cc`.`cost_center_name` AS `cost_center_name`, `d`.`department_id` AS `department_id`, `d`.`department_code` AS `department_code`, `d`.`department_name` AS `department_name`, `p`.`project_id` AS `project_id`, `p`.`project_code` AS `project_code`, `p`.`project_name` AS `project_name`, `con`.`contact_id` AS `contact_id`, `con`.`contact_name` AS `contact_name`, `u`.`name` AS `created_by`, `j`.`created_at` AS `created_at`, `fp`.`fiscal_period_id` AS `fiscal_period_id`, `fp`.`period_name` AS `period_name`, `fy`.`fiscal_year_id` AS `fiscal_year_id`, `fy`.`year_name` AS `year_name` FROM ((((((((((((`journal` `j` join `company` `c` on((`j`.`company_id` = `c`.`company_id`))) join `journal_type` `jt` on((`j`.`journal_type_id` = `jt`.`journal_type_id`))) join `journal_line` `jl` on((`j`.`journal_id` = `jl`.`journal_id`))) join `account` `a` on((`jl`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `sys_user` `u` on((`j`.`created_by` = `u`.`sys_user_id`))) left join `cost_center` `cc` on((`jl`.`cost_center_id` = `cc`.`cost_center_id`))) left join `department` `d` on((`jl`.`department_id` = `d`.`department_id`))) left join `project` `p` on((`jl`.`project_id` = `p`.`project_id`))) left join `contact` `con` on((`jl`.`contact_id` = `con`.`contact_id`))) left join `fiscal_period` `fp` on((`j`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) left join `fiscal_year` `fy` on((`fp`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) WHERE (`j`.`status` = 'POSTED') ORDER BY `j`.`journal_date` DESC, `j`.`journal_id` ASC, `jl`.`line_number` ASC ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_income_statement`
--
DROP TABLE IF EXISTS `view_income_statement`;

DROP VIEW IF EXISTS `view_income_statement`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_income_statement`  AS WITH     `period_amount` as (select `apb`.`company_id` AS `company_id`,`fp`.`fiscal_year_id` AS `fiscal_year_id`,`apb`.`fiscal_period_id` AS `fiscal_period_id`,`a`.`account_id` AS `account_id`,`a`.`account_code` AS `account_code`,`a`.`account_name` AS `account_name`,`at`.`account_type_id` AS `account_type_id`,`at`.`type_name` AS `account_type`,`at`.`nature` AS `nature`,(case when (`at`.`nature` = 'REVENUE') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'EXPENSE') then (`apb`.`debit_total` - `apb`.`credit_total`) else 0 end) AS `net_amount` from (((`account_period_balance` `apb` join `account` `a` on((`apb`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `fiscal_period` `fp` on((`apb`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) where ((`at`.`nature` in ('REVENUE','EXPENSE')) and (`a`.`active` = 1))) select `pa`.`company_id` AS `company_id`,`c`.`company_name` AS `company_name`,`pa`.`fiscal_year_id` AS `fiscal_year_id`,`fy`.`year_name` AS `year_name`,`pa`.`fiscal_period_id` AS `fiscal_period_id`,`fp`.`period_name` AS `period_name`,`fp`.`start_date` AS `period_start_date`,`fp`.`end_date` AS `period_end_date`,`pa`.`account_id` AS `account_id`,`pa`.`account_code` AS `account_code`,`pa`.`account_name` AS `account_name`,`pa`.`account_type_id` AS `account_type_id`,`pa`.`account_type` AS `account_type`,`pa`.`nature` AS `nature`,`pa`.`net_amount` AS `net_amount`,sum(`pa`.`net_amount`) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,`pa`.`nature` ORDER BY `pa`.`account_code` ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  AS `running_total`,sum(`pa`.`net_amount`) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,`pa`.`nature` )  AS `nature_total`,sum((case when (`pa`.`nature` = 'REVENUE') then `pa`.`net_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_revenue`,sum((case when (`pa`.`nature` = 'EXPENSE') then `pa`.`net_amount` else 0 end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `total_expense`,sum((case when (`pa`.`nature` = 'REVENUE') then `pa`.`net_amount` else -(`pa`.`net_amount`) end)) OVER (PARTITION BY `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id` )  AS `net_income` from (((`period_amount` `pa` join `company` `c` on((`pa`.`company_id` = `c`.`company_id`))) join `fiscal_year` `fy` on((`pa`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) join `fiscal_period` `fp` on((`pa`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) order by `pa`.`company_id`,`pa`.`fiscal_year_id`,`pa`.`fiscal_period_id`,(case when (`pa`.`nature` = 'REVENUE') then 1 else 2 end),`pa`.`account_code`  ;

-- --------------------------------------------------------

--
-- Estrutura para view `view_trial_balance`
--
DROP TABLE IF EXISTS `view_trial_balance`;

DROP VIEW IF EXISTS `view_trial_balance`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `view_trial_balance`  AS SELECT `c`.`company_id` AS `company_id`, `c`.`company_name` AS `company_name`, `fp`.`fiscal_year_id` AS `fiscal_year_id`, `fy`.`year_name` AS `year_name`, `fp`.`fiscal_period_id` AS `fiscal_period_id`, `fp`.`period_name` AS `period_name`, `a`.`account_id` AS `account_id`, `a`.`account_code` AS `account_code`, `a`.`account_name` AS `account_name`, `at`.`account_type_id` AS `account_type_id`, `at`.`type_name` AS `account_type`, `at`.`nature` AS `nature`, `apb`.`opening_balance` AS `opening_balance`, `apb`.`debit_total` AS `debit_total`, `apb`.`credit_total` AS `credit_total`, `apb`.`closing_balance` AS `closing_balance`, (case when (`at`.`nature` = 'ASSET') then (`apb`.`debit_total` - `apb`.`credit_total`) when (`at`.`nature` = 'LIABILITY') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'EQUITY') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'REVENUE') then (`apb`.`credit_total` - `apb`.`debit_total`) when (`at`.`nature` = 'EXPENSE') then (`apb`.`debit_total` - `apb`.`credit_total`) else 0 end) AS `net_balance` FROM (((((`account_period_balance` `apb` join `account` `a` on((`apb`.`account_id` = `a`.`account_id`))) join `account_type` `at` on((`a`.`account_type_id` = `at`.`account_type_id`))) join `company` `c` on((`apb`.`company_id` = `c`.`company_id`))) join `fiscal_period` `fp` on((`apb`.`fiscal_period_id` = `fp`.`fiscal_period_id`))) join `fiscal_year` `fy` on((`fp`.`fiscal_year_id` = `fy`.`fiscal_year_id`))) WHERE (`a`.`active` = 1) ORDER BY `c`.`company_id` ASC, `fp`.`fiscal_period_id` ASC, `a`.`account_code` ASC ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_batch_expiry`
--
DROP TABLE IF EXISTS `vw_batch_expiry`;

DROP VIEW IF EXISTS `vw_batch_expiry`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_batch_expiry`  AS SELECT `bt`.`batch_id` AS `batch_id`, `bt`.`batch_number` AS `batch_number`, `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `bt`.`manufacture_date` AS `manufacture_date`, `bt`.`expiry_date` AS `expiry_date`, `bt`.`current_quantity` AS `current_quantity`, `pp`.`cost_price` AS `cost_price`, (`bt`.`current_quantity` * `pp`.`cost_price`) AS `total_value`, (to_days(`bt`.`expiry_date`) - to_days(curdate())) AS `days_until_expiry`, (case when (`bt`.`expiry_date` < curdate()) then 'Expired' when ((to_days(`bt`.`expiry_date`) - to_days(curdate())) <= 30) then 'Expiring Soon (<30 days)' when ((to_days(`bt`.`expiry_date`) - to_days(curdate())) <= 90) then 'Warning (30-90 days)' else 'OK (>90 days)' end) AS `expiry_status`, `s`.`supplier_name` AS `supplier_name` FROM ((((`batch_tracking` `bt` join `product` `p` on((`bt`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`bt`.`variation_id` = `v`.`variation_id`))) left join `product_pricing` `pp` on(((`p`.`product_id` = `pp`.`product_id`) and ((`bt`.`variation_id` = `pp`.`variation_id`) or ((`bt`.`variation_id` is null) and (`pp`.`variation_id` is null)))))) left join `supplier` `s` on((`bt`.`supplier_id` = `s`.`supplier_id`))) WHERE ((`bt`.`current_quantity` > 0) AND (`pp`.`price_list_name` = 'Standard') AND ((`pp`.`valid_to` is null) OR (`pp`.`valid_to` >= curdate()))) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_current_inventory`
--
DROP TABLE IF EXISTS `vw_current_inventory`;

DROP VIEW IF EXISTS `vw_current_inventory`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_current_inventory`  AS SELECT `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `w`.`warehouse_name` AS `warehouse_name`, `sl`.`location_code` AS `location_code`, `s`.`qty_on_hand` AS `qty_on_hand`, `s`.`qty_reserved` AS `qty_reserved`, `s`.`qty_available` AS `qty_available`, `s`.`qty_on_order` AS `qty_on_order`, `s`.`min_stock_level` AS `min_stock_level`, `s`.`max_stock_level` AS `max_stock_level`, `s`.`reorder_point` AS `reorder_point`, `s`.`reorder_qty` AS `reorder_qty`, `u`.`uom_code` AS `uom_code`, `p`.`category_id` AS `category_id`, `pc`.`category_name` AS `category_name`, `p`.`brand_id` AS `brand_id`, `b`.`brand_name` AS `brand_name` FROM (((((((`stock_level` `s` join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`s`.`variation_id` = `v`.`variation_id`))) join `warehouse` `w` on((`s`.`warehouse_id` = `w`.`warehouse_id`))) left join `storage_location` `sl` on((`s`.`location_id` = `sl`.`location_id`))) join `units_of_measurement` `u` on((`p`.`base_uom_id` = `u`.`uom_id`))) join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `brand` `b` on((`p`.`brand_id` = `b`.`brand_id`))) WHERE ((`p`.`is_active` = true) AND (`p`.`is_deleted` = false)) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_inventory_aging`
--
DROP TABLE IF EXISTS `vw_inventory_aging`;

DROP VIEW IF EXISTS `vw_inventory_aging`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_inventory_aging`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_id` AS `variation_id`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `w`.`warehouse_name` AS `warehouse_name`, `sl`.`location_code` AS `location_code`, `s`.`qty_on_hand` AS `qty_on_hand`, `pp`.`cost_price` AS `cost_price`, (`s`.`qty_on_hand` * `pp`.`cost_price`) AS `total_value`, `pc`.`category_name` AS `category_name`, `b`.`brand_name` AS `brand_name`, max(`sm`.`movement_date`) AS `last_receipt_date`, (to_days(curdate()) - to_days(max(`sm`.`movement_date`))) AS `days_in_inventory`, (case when ((to_days(curdate()) - to_days(max(`sm`.`movement_date`))) <= 30) then '0-30 days' when ((to_days(curdate()) - to_days(max(`sm`.`movement_date`))) <= 60) then '31-60 days' when ((to_days(curdate()) - to_days(max(`sm`.`movement_date`))) <= 90) then '61-90 days' when ((to_days(curdate()) - to_days(max(`sm`.`movement_date`))) <= 180) then '91-180 days' when ((to_days(curdate()) - to_days(max(`sm`.`movement_date`))) <= 365) then '181-365 days' else 'Over 365 days' end) AS `age_bucket` FROM ((((((((`stock_level` `s` join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`s`.`variation_id` = `v`.`variation_id`))) join `warehouse` `w` on((`s`.`warehouse_id` = `w`.`warehouse_id`))) left join `storage_location` `sl` on((`s`.`location_id` = `sl`.`location_id`))) join `product_pricing` `pp` on(((`p`.`product_id` = `pp`.`product_id`) and ((`s`.`variation_id` = `pp`.`variation_id`) or ((`s`.`variation_id` is null) and (`pp`.`variation_id` is null)))))) join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `brand` `b` on((`p`.`brand_id` = `b`.`brand_id`))) left join `stock_movement` `sm` on(((`p`.`product_id` = `sm`.`product_id`) and ((`v`.`variation_id` = `sm`.`variation_id`) or ((`v`.`variation_id` is null) and (`sm`.`variation_id` is null))) and `sm`.`movement_type_id` in (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`direction` = 'IN'))))) WHERE ((`p`.`is_active` = true) AND (`pp`.`price_list_name` = 'Standard') AND ((`pp`.`valid_to` is null) OR (`pp`.`valid_to` >= curdate())) AND (`s`.`qty_on_hand` > 0)) GROUP BY `p`.`product_id`, `v`.`variation_id`, `w`.`warehouse_id`, `sl`.`location_id`, `p`.`product_code`, `p`.`product_name`, `v`.`variation_code`, `v`.`variation_name`, `w`.`warehouse_name`, `sl`.`location_code`, `s`.`qty_on_hand`, `pp`.`cost_price`, `pp`.`currency_code`, `pc`.`category_name`, `b`.`brand_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_inventory_valuation`
--
DROP TABLE IF EXISTS `vw_inventory_valuation`;

DROP VIEW IF EXISTS `vw_inventory_valuation`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_inventory_valuation`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_id` AS `variation_id`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `w`.`warehouse_id` AS `warehouse_id`, `w`.`warehouse_name` AS `warehouse_name`, `sl`.`location_id` AS `location_id`, `sl`.`location_code` AS `location_code`, `s`.`qty_on_hand` AS `qty_on_hand`, `pp`.`cost_price` AS `cost_price`, (`s`.`qty_on_hand` * `pp`.`cost_price`) AS `total_value`, `pp`.`currency_code` AS `currency_code`, `pc`.`category_name` AS `category_name`, `b`.`brand_name` AS `brand_name` FROM (((((((`stock_level` `s` join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`s`.`variation_id` = `v`.`variation_id`))) join `warehouse` `w` on((`s`.`warehouse_id` = `w`.`warehouse_id`))) left join `storage_location` `sl` on((`s`.`location_id` = `sl`.`location_id`))) join `product_pricing` `pp` on(((`p`.`product_id` = `pp`.`product_id`) and ((`s`.`variation_id` = `pp`.`variation_id`) or ((`s`.`variation_id` is null) and (`pp`.`variation_id` is null)))))) join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `brand` `b` on((`p`.`brand_id` = `b`.`brand_id`))) WHERE ((`p`.`is_active` = true) AND (`pp`.`price_list_name` = 'Standard') AND ((`pp`.`valid_to` is null) OR (`pp`.`valid_to` >= curdate()))) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_product_performance`
--
DROP TABLE IF EXISTS `vw_product_performance`;

DROP VIEW IF EXISTS `vw_product_performance`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_product_performance`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_id` AS `variation_id`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `pc`.`category_name` AS `category_name`, `b`.`brand_name` AS `brand_name`, sum((case when ((`sm`.`movement_type_id` = (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`type_code` = 'SALES_ISSUE'))) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) AS `qty_sold_30days`, sum((case when ((`sm`.`movement_type_id` = (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`type_code` = 'SALES_ISSUE'))) and (`sm`.`movement_date` >= (curdate() - interval 90 day))) then `sm`.`quantity` else 0 end)) AS `qty_sold_90days`, sum(`s`.`qty_on_hand`) AS `current_stock`, sum(`s`.`qty_available`) AS `available_stock`, sum(`s`.`qty_on_order`) AS `incoming_stock`, `pp`.`cost_price` AS `cost_price`, `pp`.`retail_price` AS `retail_price`, (`pp`.`retail_price` - `pp`.`cost_price`) AS `gross_profit`, (case when (`pp`.`retail_price` = 0) then NULL else (((`pp`.`retail_price` - `pp`.`cost_price`) / nullif(`pp`.`retail_price`,0)) * 100) end) AS `profit_margin`, (sum((case when ((`sm`.`movement_type_id` = (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`type_code` = 'SALES_ISSUE'))) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) / 30) AS `daily_velocity`, (case when ((sum((case when ((`sm`.`movement_type_id` = (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`type_code` = 'SALES_ISSUE'))) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) / 30) > 0) then (sum(`s`.`qty_available`) / nullif((sum((case when ((`sm`.`movement_type_id` = (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`type_code` = 'SALES_ISSUE'))) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) / 30),0)) else NULL end) AS `days_of_inventory` FROM ((((((`product` `p` left join `product_variation` `v` on((`p`.`product_id` = `v`.`product_id`))) left join `stock_level` `s` on(((`p`.`product_id` = `s`.`product_id`) and ((`v`.`variation_id` = `s`.`variation_id`) or ((`v`.`variation_id` is null) and (`s`.`variation_id` is null)))))) left join `stock_movement` `sm` on(((`p`.`product_id` = `sm`.`product_id`) and ((`v`.`variation_id` = `sm`.`variation_id`) or ((`v`.`variation_id` is null) and (`sm`.`variation_id` is null)))))) left join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `brand` `b` on((`p`.`brand_id` = `b`.`brand_id`))) left join `product_pricing` `pp` on(((`p`.`product_id` = `pp`.`product_id`) and ((`v`.`variation_id` = `pp`.`variation_id`) or ((`v`.`variation_id` is null) and (`pp`.`variation_id` is null)))))) WHERE ((`p`.`is_active` = true) AND (`pp`.`price_list_name` = 'Standard') AND ((`pp`.`valid_to` is null) OR (`pp`.`valid_to` >= curdate()))) GROUP BY `p`.`product_id`, `v`.`variation_id`, `pc`.`category_name`, `b`.`brand_name`, `pp`.`cost_price`, `pp`.`retail_price` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_purchase_order_status`
--
DROP TABLE IF EXISTS `vw_purchase_order_status`;

DROP VIEW IF EXISTS `vw_purchase_order_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_purchase_order_status`  AS SELECT `po`.`po_id` AS `po_id`, `po`.`po_number` AS `po_number`, `po`.`po_date` AS `po_date`, `po`.`expected_delivery_date` AS `expected_delivery_date`, `po`.`status` AS `po_status`, `s`.`supplier_id` AS `supplier_id`, `s`.`supplier_name` AS `supplier_name`, `w`.`warehouse_name` AS `warehouse_name`, count(`poi`.`po_item_id`) AS `total_line_items`, sum(`poi`.`quantity`) AS `total_ordered_qty`, sum(`poi`.`quantity_received`) AS `total_received_qty`, sum(`poi`.`quantity_returned`) AS `total_returned_qty`, sum(((`poi`.`quantity` - `poi`.`quantity_received`) + `poi`.`quantity_returned`)) AS `total_pending_qty`, `po`.`subtotal` AS `subtotal`, `po`.`tax_amount` AS `tax_amount`, `po`.`discount_amount` AS `discount_amount`, `po`.`shipping_amount` AS `shipping_amount`, `po`.`total_amount` AS `total_amount`, `po`.`currency_code` AS `currency_code`, (to_days(`po`.`expected_delivery_date`) - to_days(curdate())) AS `days_until_delivery`, (case when (`po`.`status` = 'FULLY_RECEIVED') then 'Completed' when ((`po`.`expected_delivery_date` < curdate()) and (`po`.`status` not in ('FULLY_RECEIVED','CLOSED','CANCELLED'))) then 'Overdue' when (((to_days(`po`.`expected_delivery_date`) - to_days(curdate())) <= 7) and (`po`.`status` not in ('FULLY_RECEIVED','CLOSED','CANCELLED'))) then 'Due Soon' else 'On Track' end) AS `delivery_status` FROM (((`purchase_order` `po` join `supplier` `s` on((`po`.`supplier_id` = `s`.`supplier_id`))) join `purchase_order_item` `poi` on((`po`.`po_id` = `poi`.`po_id`))) left join `warehouse` `w` on((`po`.`warehouse_id` = `w`.`warehouse_id`))) WHERE (`po`.`status` <> 'CANCELLED') GROUP BY `po`.`po_id`, `s`.`supplier_id`, `s`.`supplier_name`, `w`.`warehouse_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_reorder_recommendation`
--
DROP TABLE IF EXISTS `vw_reorder_recommendation`;

DROP VIEW IF EXISTS `vw_reorder_recommendation`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_reorder_recommendation`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_id` AS `variation_id`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `w`.`warehouse_id` AS `warehouse_id`, `w`.`warehouse_name` AS `warehouse_name`, sum(`s`.`qty_on_hand`) AS `total_qty_on_hand`, sum(`s`.`qty_reserved`) AS `total_qty_reserved`, sum(`s`.`qty_available`) AS `total_qty_available`, sum(`s`.`qty_on_order`) AS `total_qty_on_order`, min(`s`.`min_stock_level`) AS `min_stock_level`, min(`s`.`reorder_point`) AS `reorder_point`, min(`s`.`reorder_qty`) AS `reorder_qty`, `u`.`uom_code` AS `uom_code`, (case when (sum(`s`.`qty_available`) <= min(`s`.`reorder_point`)) then true else false end) AS `needs_reorder`, `ps`.`supplier_id` AS `supplier_id`, `sup`.`supplier_name` AS `supplier_name`, `ps`.`lead_time` AS `lead_time`, `ps`.`min_order_qty` AS `min_order_qty`, `ps`.`price` AS `supplier_price` FROM ((((((`stock_level` `s` join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`s`.`variation_id` = `v`.`variation_id`))) join `warehouse` `w` on((`s`.`warehouse_id` = `w`.`warehouse_id`))) join `units_of_measurement` `u` on((`p`.`base_uom_id` = `u`.`uom_id`))) left join `product_supplier` `ps` on(((`p`.`product_id` = `ps`.`product_id`) and ((`s`.`variation_id` = `ps`.`variation_id`) or ((`s`.`variation_id` is null) and (`ps`.`variation_id` is null)))))) left join `supplier` `sup` on((`ps`.`supplier_id` = `sup`.`supplier_id`))) WHERE ((`p`.`is_active` = true) AND ((`ps`.`is_preferred_supplier` = true) OR (`ps`.`supplier_id` is null))) GROUP BY `p`.`product_id`, `v`.`variation_id`, `w`.`warehouse_id`, `u`.`uom_code`, `ps`.`supplier_id`, `sup`.`supplier_name`, `ps`.`lead_time`, `ps`.`min_order_qty`, `ps`.`price` HAVING ((sum(`s`.`qty_available`) + sum(`s`.`qty_on_order`)) <= min(`s`.`reorder_point`)) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_sales_order_status`
--
DROP TABLE IF EXISTS `vw_sales_order_status`;

DROP VIEW IF EXISTS `vw_sales_order_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_sales_order_status`  AS SELECT `so`.`so_id` AS `so_id`, `so`.`so_number` AS `so_number`, `so`.`order_date` AS `order_date`, `so`.`expected_delivery_date` AS `expected_delivery_date`, `so`.`status` AS `so_status`, `c`.`customer_id` AS `customer_id`, `c`.`customer_name` AS `customer_name`, `w`.`warehouse_name` AS `warehouse_name`, count(`soi`.`so_item_id`) AS `total_line_items`, sum(`soi`.`quantity`) AS `total_ordered_qty`, sum(`soi`.`quantity_allocated`) AS `total_allocated_qty`, sum(`soi`.`quantity_shipped`) AS `total_shipped_qty`, sum(`soi`.`quantity_returned`) AS `total_returned_qty`, sum((`soi`.`quantity` - `soi`.`quantity_shipped`)) AS `total_pending_qty`, `so`.`subtotal` AS `subtotal`, `so`.`tax_amount` AS `tax_amount`, `so`.`discount_amount` AS `discount_amount`, `so`.`shipping_amount` AS `shipping_amount`, `so`.`total_amount` AS `total_amount`, `so`.`currency_code` AS `currency_code`, (to_days(`so`.`expected_delivery_date`) - to_days(curdate())) AS `days_until_delivery`, (case when (`so`.`status` = 'COMPLETED') then 'Completed' when ((`so`.`expected_delivery_date` < curdate()) and (`so`.`status` not in ('FULLY_SHIPPED','COMPLETED','CANCELLED'))) then 'Overdue' when (((to_days(`so`.`expected_delivery_date`) - to_days(curdate())) <= 7) and (`so`.`status` not in ('FULLY_SHIPPED','COMPLETED','CANCELLED'))) then 'Due Soon' else 'On Track' end) AS `delivery_status` FROM (((`sales_order` `so` join `customer` `c` on((`so`.`customer_id` = `c`.`customer_id`))) join `sales_order_item` `soi` on((`so`.`so_id` = `soi`.`so_id`))) left join `warehouse` `w` on((`so`.`warehouse_id` = `w`.`warehouse_id`))) WHERE (`so`.`status` <> 'CANCELLED') GROUP BY `so`.`so_id`, `c`.`customer_id`, `c`.`customer_name`, `w`.`warehouse_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_stock_accuracy`
--
DROP TABLE IF EXISTS `vw_stock_accuracy`;

DROP VIEW IF EXISTS `vw_stock_accuracy`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_accuracy`  AS SELECT `sc`.`count_id` AS `count_id`, `sc`.`count_name` AS `count_name`, `sc`.`count_date` AS `count_date`, `sc`.`status` AS `count_status`, `w`.`warehouse_name` AS `warehouse_name`, `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `sci`.`expected_qty` AS `expected_qty`, `sci`.`counted_qty` AS `counted_qty`, `sci`.`difference` AS `difference`, (case when ((`sci`.`expected_qty` = 0) and (`sci`.`counted_qty` > 0)) then 100.00 when ((`sci`.`expected_qty` = 0) and (`sci`.`counted_qty` = 0)) then 0.00 else ((abs(`sci`.`difference`) / nullif(`sci`.`expected_qty`,0)) * 100) end) AS `discrepancy_percentage`, `u`.`uom_code` AS `uom_code`, `pc`.`category_name` AS `category_name`, (case when (`sci`.`difference` = 0) then 'Accurate' when (`sci`.`difference` > 0) then 'Surplus' else 'Deficit' end) AS `variance_type` FROM ((((((`stock_count_item` `sci` join `stock_count` `sc` on((`sci`.`count_id` = `sc`.`count_id`))) join `product` `p` on((`sci`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`sci`.`variation_id` = `v`.`variation_id`))) join `warehouse` `w` on((`sc`.`warehouse_id` = `w`.`warehouse_id`))) join `units_of_measurement` `u` on((`sci`.`uom_id` = `u`.`uom_id`))) join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) WHERE (`sc`.`status` = 'COMPLETED') ORDER BY `sc`.`count_date` DESC, abs(`sci`.`difference`) DESC ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_stock_movement`
--
DROP TABLE IF EXISTS `vw_stock_movement`;

DROP VIEW IF EXISTS `vw_stock_movement`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_movement`  AS SELECT `sm`.`movement_id` AS `movement_id`, `sm`.`movement_date` AS `movement_date`, `smt`.`type_name` AS `movement_type`, `smt`.`direction` AS `direction`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `sm`.`quantity` AS `quantity`, `u`.`uom_code` AS `uom_code`, `fw`.`warehouse_name` AS `from_warehouse`, `fl`.`location_code` AS `from_location`, `tw`.`warehouse_name` AS `to_warehouse`, `tl`.`location_code` AS `to_location`, `sm`.`reference_type` AS `reference_type`, `sm`.`reference_id` AS `reference_id`, `sm`.`batch_number` AS `batch_number`, `sm`.`serial_number` AS `serial_number`, `sm`.`unit_cost` AS `unit_cost`, `sm`.`total_cost` AS `total_cost` FROM ((((((((`stock_movement` `sm` join `stock_movement_type` `smt` on((`sm`.`movement_type_id` = `smt`.`movement_type_id`))) join `product` `p` on((`sm`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`sm`.`variation_id` = `v`.`variation_id`))) join `units_of_measurement` `u` on((`sm`.`uom_id` = `u`.`uom_id`))) left join `warehouse` `fw` on((`sm`.`from_warehouse_id` = `fw`.`warehouse_id`))) left join `storage_location` `fl` on((`sm`.`from_location_id` = `fl`.`location_id`))) left join `warehouse` `tw` on((`sm`.`to_warehouse_id` = `tw`.`warehouse_id`))) left join `storage_location` `tl` on((`sm`.`to_location_id` = `tl`.`location_id`))) ORDER BY `sm`.`movement_date` DESC ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_stock_turnover`
--
DROP TABLE IF EXISTS `vw_stock_turnover`;

DROP VIEW IF EXISTS `vw_stock_turnover`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_turnover`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`product_code` AS `product_code`, `p`.`product_name` AS `product_name`, `v`.`variation_id` AS `variation_id`, `v`.`variation_code` AS `variation_code`, `v`.`variation_name` AS `variation_name`, `pc`.`category_name` AS `category_name`, `b`.`brand_name` AS `brand_name`, sum((case when (`sm`.`movement_type_id` in (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`direction` = 'OUT')) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) AS `qty_sold_30days`, avg(`s`.`qty_on_hand`) AS `avg_inventory`, (case when (avg(`s`.`qty_on_hand`) > 0) then (sum((case when (`sm`.`movement_type_id` in (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`direction` = 'OUT')) and (`sm`.`movement_date` >= (curdate() - interval 30 day))) then `sm`.`quantity` else 0 end)) / nullif(avg(`s`.`qty_on_hand`),0)) else 0 end) AS `turnover_rate_30days`, max(`sm`.`movement_date`) AS `last_sale_date`, (to_days(curdate()) - to_days(max(`sm`.`movement_date`))) AS `days_since_last_sale` FROM (((((`product` `p` left join `product_variation` `v` on((`p`.`product_id` = `v`.`product_id`))) left join `stock_level` `s` on(((`p`.`product_id` = `s`.`product_id`) and ((`v`.`variation_id` = `s`.`variation_id`) or ((`v`.`variation_id` is null) and (`s`.`variation_id` is null)))))) left join `stock_movement` `sm` on(((`p`.`product_id` = `sm`.`product_id`) and ((`v`.`variation_id` = `sm`.`variation_id`) or ((`v`.`variation_id` is null) and (`sm`.`variation_id` is null)))))) left join `product_category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `brand` `b` on((`p`.`brand_id` = `b`.`brand_id`))) WHERE ((`p`.`is_active` = true) AND `sm`.`movement_type_id` in (select `stock_movement_type`.`movement_type_id` from `stock_movement_type` where (`stock_movement_type`.`direction` = 'OUT'))) GROUP BY `p`.`product_id`, `v`.`variation_id`, `pc`.`category_name`, `b`.`brand_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_supply_chain_kpi`
--
DROP TABLE IF EXISTS `vw_supply_chain_kpi`;

DROP VIEW IF EXISTS `vw_supply_chain_kpi`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_supply_chain_kpi`  AS SELECT curdate() AS `report_date`, (select count(0) from `product` where (`product`.`is_active` = true)) AS `active_products`, (select sum(`stock_level`.`qty_on_hand`) from `stock_level`) AS `total_inventory_qty`, (select sum((`s`.`qty_on_hand` * `pp`.`cost_price`)) from (((`stock_level` `s` join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) left join `product_variation` `v` on((`s`.`variation_id` = `v`.`variation_id`))) join `product_pricing` `pp` on(((`p`.`product_id` = `pp`.`product_id`) and ((`s`.`variation_id` = `pp`.`variation_id`) or ((`s`.`variation_id` is null) and (`pp`.`variation_id` is null)))))) where ((`pp`.`price_list_name` = 'Standard') and ((`pp`.`valid_to` is null) or (`pp`.`valid_to` >= curdate())))) AS `total_inventory_value`, (select count(0) from `purchase_order` where (`purchase_order`.`status` in ('DRAFT','APPROVED','SENT','PARTIALLY_RECEIVED'))) AS `open_purchase_orders`, (select sum(`purchase_order`.`total_amount`) from `purchase_order` where (`purchase_order`.`status` in ('DRAFT','APPROVED','SENT','PARTIALLY_RECEIVED'))) AS `open_po_value`, (select count(0) from `goods_receipt` where (`goods_receipt`.`receipt_date` = curdate())) AS `receipts_today`, (select count(0) from `sales_order` where (`sales_order`.`status` in ('DRAFT','CONFIRMED','PROCESSING','PARTIALLY_SHIPPED'))) AS `open_sales_orders`, (select sum(`sales_order`.`total_amount`) from `sales_order` where (`sales_order`.`status` in ('DRAFT','CONFIRMED','PROCESSING','PARTIALLY_SHIPPED'))) AS `open_so_value`, (select count(0) from `shipment` where (`shipment`.`shipping_date` = curdate())) AS `shipments_today`, (select count(0) from (select `p2`.`product_id` AS `product_id`,`v2`.`variation_id` AS `variation_id` from ((`product` `p2` left join `product_variation` `v2` on((`p2`.`product_id` = `v2`.`product_id`))) join `stock_level` `s2` on(((`p2`.`product_id` = `s2`.`product_id`) and ((`v2`.`variation_id` = `s2`.`variation_id`) or ((`v2`.`variation_id` is null) and (`s2`.`variation_id` is null)))))) where ((`p2`.`is_active` = true) and (`s2`.`reorder_point` is not null)) group by `p2`.`product_id`,`v2`.`variation_id` having ((sum(`s2`.`qty_available`) + sum(`s2`.`qty_on_order`)) <= min(`s2`.`reorder_point`))) `reorder_subq`) AS `products_to_reorder`, (select count(0) from `inventory_adjustment` where (`inventory_adjustment`.`adjustment_date` = curdate())) AS `adjustments_today`, (select count(0) from `warehouse_transfer` where (`warehouse_transfer`.`status` in ('DRAFT','PENDING','IN_TRANSIT','PARTIALLY_RECEIVED'))) AS `open_transfers` FROM (select 1 AS `1`) AS `dummy` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_warehouse_transfer_status`
--
DROP TABLE IF EXISTS `vw_warehouse_transfer_status`;

DROP VIEW IF EXISTS `vw_warehouse_transfer_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_warehouse_transfer_status`  AS SELECT `wt`.`transfer_id` AS `transfer_id`, `wt`.`transfer_number` AS `transfer_number`, `wt`.`transfer_date` AS `transfer_date`, `fw`.`warehouse_name` AS `from_warehouse`, `tw`.`warehouse_name` AS `to_warehouse`, `wt`.`status` AS `transfer_status`, count(`wti`.`transfer_item_id`) AS `total_line_items`, sum(`wti`.`quantity`) AS `total_transfer_qty`, sum(`wti`.`quantity_sent`) AS `total_sent_qty`, sum(`wti`.`quantity_received`) AS `total_received_qty`, sum((`wti`.`quantity` - `wti`.`quantity_received`)) AS `total_pending_qty`, (case when (`wt`.`status` = 'FULLY_RECEIVED') then 'Completed' when (`wt`.`status` = 'IN_TRANSIT') then 'In Transit' when (`wt`.`status` = 'PARTIALLY_RECEIVED') then 'Partially Received' else `wt`.`status` end) AS `status_description` FROM (((`warehouse_transfer` `wt` join `warehouse` `fw` on((`wt`.`from_warehouse_id` = `fw`.`warehouse_id`))) join `warehouse` `tw` on((`wt`.`to_warehouse_id` = `tw`.`warehouse_id`))) join `warehouse_transfer_item` `wti` on((`wt`.`transfer_id` = `wti`.`transfer_id`))) WHERE (`wt`.`status` <> 'CANCELLED') GROUP BY `wt`.`transfer_id`, `fw`.`warehouse_name`, `tw`.`warehouse_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_warehouse_utilization`
--
DROP TABLE IF EXISTS `vw_warehouse_utilization`;

DROP VIEW IF EXISTS `vw_warehouse_utilization`;
CREATE ALGORITHM=UNDEFINED DEFINER=`presserv_adguias`@`localhost` SQL SECURITY DEFINER VIEW `vw_warehouse_utilization`  AS SELECT `w`.`warehouse_id` AS `warehouse_id`, `w`.`warehouse_name` AS `warehouse_name`, count(distinct `sl`.`location_id`) AS `total_locations`, count(distinct `s`.`product_id`) AS `unique_products`, sum(`s`.`qty_on_hand`) AS `total_items`, sum((((`s`.`qty_on_hand` * `p`.`width`) * `p`.`height`) * `p`.`depth`)) AS `total_volume_used`, count(distinct (case when (`s`.`qty_on_hand` = 0) then `sl`.`location_id` end)) AS `empty_locations`, count(distinct (case when (`s`.`qty_on_hand` > 0) then `sl`.`location_id` end)) AS `occupied_locations`, ((count(distinct (case when (`s`.`qty_on_hand` > 0) then `sl`.`location_id` end)) / nullif(count(distinct `sl`.`location_id`),0)) * 100) AS `location_utilization_percentage` FROM (((`warehouse` `w` left join `storage_location` `sl` on((`w`.`warehouse_id` = `sl`.`warehouse_id`))) left join `stock_level` `s` on((`sl`.`location_id` = `s`.`location_id`))) left join `product` `p` on((`s`.`product_id` = `p`.`product_id`))) GROUP BY `w`.`warehouse_id`, `w`.`warehouse_name` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `brand`
--
ALTER TABLE `brand` ADD FULLTEXT KEY `ft_brand_search` (`brand_name`,`brand_description`);

--
-- Índices de tabela `product`
--
ALTER TABLE `product` ADD FULLTEXT KEY `ft_product_search` (`product_code`,`product_name`,`product_description`,`barcode`,`sku`);

--
-- Índices de tabela `product_category`
--
ALTER TABLE `product_category` ADD FULLTEXT KEY `ft_category_search` (`category_name`,`category_description`);

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `fk_account_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_account_parent` FOREIGN KEY (`parent_account_id`) REFERENCES `account` (`account_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_account_type` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`);

--
-- Restrições para tabelas `accounting_code`
--
ALTER TABLE `accounting_code`
  ADD CONSTRAINT `fk_accounting_code_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_accounting_code_type` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`);

--
-- Restrições para tabelas `account_daily_balance`
--
ALTER TABLE `account_daily_balance`
  ADD CONSTRAINT `fk_account_daily_balance_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_account_daily_balance_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_account_daily_balance_currency` FOREIGN KEY (`currency`) REFERENCES `currency` (`currency_code`);

--
-- Restrições para tabelas `account_period_balance`
--
ALTER TABLE `account_period_balance`
  ADD CONSTRAINT `fk_account_period_balance_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_account_period_balance_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_account_period_balance_currency` FOREIGN KEY (`currency`) REFERENCES `currency` (`currency_code`),
  ADD CONSTRAINT `fk_account_period_balance_fiscal_period` FOREIGN KEY (`fiscal_period_id`) REFERENCES `fiscal_period` (`fiscal_period_id`);

--
-- Restrições para tabelas `account_type`
--
ALTER TABLE `account_type`
  ADD CONSTRAINT `fk_account_type_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_account_type_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_account_type_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `addendum`
--
ALTER TABLE `addendum`
  ADD CONSTRAINT `fk_addendum_gstat` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
  ADD CONSTRAINT `fk_addendum_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `fk_address_addtype` FOREIGN KEY (`address_type_id`) REFERENCES `address_type` (`address_type_id`),
  ADD CONSTRAINT `fk_address_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `age_addendum`
--
ALTER TABLE `age_addendum`
  ADD CONSTRAINT `fk_age_addendum_addendum` FOREIGN KEY (`addendum_id`) REFERENCES `addendum` (`addendum_id`),
  ADD CONSTRAINT `fk_age_addendum_class` FOREIGN KEY (`class_id`) REFERENCES `category` (`category_id`),
  ADD CONSTRAINT `fk_age_addendum_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_age_addendum_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `attribute_value`
--
ALTER TABLE `attribute_value`
  ADD CONSTRAINT `fk_attribute_value_attribute_type_id` FOREIGN KEY (`attribute_type_id`) REFERENCES `attribute_type` (`attribute_type_id`),
  ADD CONSTRAINT `fk_attribute_value_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_attribute_value_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `bank_account`
--
ALTER TABLE `bank_account`
  ADD CONSTRAINT `fk_bank_account_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bank_account_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_bank_account_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `bank_reconciliation`
--
ALTER TABLE `bank_reconciliation`
  ADD CONSTRAINT `fk_bank_reconciliation_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_bank_reconciliation_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bank_reconciliation_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_bank_reconciliation_reconciled_by` FOREIGN KEY (`reconciled_by`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `bank_slip`
--
ALTER TABLE `bank_slip`
  ADD CONSTRAINT `fk_bank_slip_charge` FOREIGN KEY (`contract_charge_id`) REFERENCES `contract_charge` (`contract_charge_id`),
  ADD CONSTRAINT `fk_bank_slip_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_bank_slip_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `batch_chk`
--
ALTER TABLE `batch_chk`
  ADD CONSTRAINT `fk_batch_chk_ordpgrc` FOREIGN KEY (`ordpgrc_id`) REFERENCES `ordpgrc` (`ordpgrc_id`),
  ADD CONSTRAINT `fk_batch_chk_subsidiary` FOREIGN KEY (`subsidiary_id`) REFERENCES `subsidiary` (`subsidiary_id`),
  ADD CONSTRAINT `fk_batch_chk_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_batch_chk_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `batch_detail`
--
ALTER TABLE `batch_detail`
  ADD CONSTRAINT `fk_batch_detail_batch` FOREIGN KEY (`batch_chk_id`) REFERENCES `batch_chk` (`batch_chk_id`),
  ADD CONSTRAINT `fk_batch_detail_contcharge` FOREIGN KEY (`contract_charge_id`) REFERENCES `contract_charge` (`contract_charge_id`),
  ADD CONSTRAINT `fk_batch_detail_paymstat` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_status` (`payment_status_id`);

--
-- Restrições para tabelas `batch_tracking`
--
ALTER TABLE `batch_tracking`
  ADD CONSTRAINT `fk_batch_tracking_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_batch_tracking_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_batch_tracking_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `beneficiary`
--
ALTER TABLE `beneficiary`
  ADD CONSTRAINT `fk_beneficiary_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_beneficiary_document` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`),
  ADD CONSTRAINT `fk_beneficiary_funservice` FOREIGN KEY (`service_funeral_id`) REFERENCES `service_funeral` (`service_funeral_id`),
  ADD CONSTRAINT `fk_beneficiary_gender` FOREIGN KEY (`gender_id`) REFERENCES `gender` (`gender_id`),
  ADD CONSTRAINT `fk_beneficiary_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `billing_cycle`
--
ALTER TABLE `billing_cycle`
  ADD CONSTRAINT `fk_billing_cycle_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_billing_cycle_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_billing_cycle_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `billing_rule`
--
ALTER TABLE `billing_rule`
  ADD CONSTRAINT `fk_billing_rule_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_billing_rule_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `billing_rule_application`
--
ALTER TABLE `billing_rule_application`
  ADD CONSTRAINT `fk_billing_rule_app_rule` FOREIGN KEY (`rule_id`) REFERENCES `billing_rule` (`billing_rule_id`),
  ADD CONSTRAINT `fk_billing_rule_app_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_billing_rule_app_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `budget`
--
ALTER TABLE `budget`
  ADD CONSTRAINT `fk_budget_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_budget_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_budget_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_budget_fiscal_year` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`fiscal_year_id`);

--
-- Restrições para tabelas `budget_item`
--
ALTER TABLE `budget_item`
  ADD CONSTRAINT `fk_budget_item_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_budget_item_budget` FOREIGN KEY (`budget_id`) REFERENCES `budget` (`budget_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_budget_item_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`cost_center_id`),
  ADD CONSTRAINT `fk_budget_item_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `fk_budget_item_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

--
-- Restrições para tabelas `budget_period`
--
ALTER TABLE `budget_period`
  ADD CONSTRAINT `fk_budget_period_budget_item` FOREIGN KEY (`budget_item_id`) REFERENCES `budget_item` (`budget_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_budget_period_fiscal_period` FOREIGN KEY (`fiscal_period_id`) REFERENCES `fiscal_period` (`fiscal_period_id`);

--
-- Restrições para tabelas `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `fk_class_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_class_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `charge`
--
ALTER TABLE `charge`
  ADD CONSTRAINT `fk_charge_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_charge_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_charge_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `city`
--
ALTER TABLE `city`
  ADD CONSTRAINT `fk_city_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`state_id`);

--
-- Restrições para tabelas `company`
--
ALTER TABLE `company`
  ADD CONSTRAINT `fk_company_address` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  ADD CONSTRAINT `fk_company_parent` FOREIGN KEY (`parent_company_id`) REFERENCES `company` (`company_id`);

--
-- Restrições para tabelas `contact`
--
ALTER TABLE `contact`
  ADD CONSTRAINT `fk_contact_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_contact_currency` FOREIGN KEY (`currency`) REFERENCES `currency` (`currency_code`),
  ADD CONSTRAINT `fk_contact_payable_account` FOREIGN KEY (`payable_account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_contact_receivable_account` FOREIGN KEY (`receivable_account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_contact_tax_code` FOREIGN KEY (`tax_code_id`) REFERENCES `tax_code` (`tax_code_id`),
  ADD CONSTRAINT `fk_contact_type` FOREIGN KEY (`contact_type_id`) REFERENCES `contact_type` (`contact_type_id`);

--
-- Restrições para tabelas `contact_bank_account`
--
ALTER TABLE `contact_bank_account`
  ADD CONSTRAINT `fk_contact_bank_contact` FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `contact_type`
--
ALTER TABLE `contact_type`
  ADD CONSTRAINT `fk_contact_type_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `contract`
--
ALTER TABLE `contract`
  ADD CONSTRAINT `fk_contract_current_version` FOREIGN KEY (`current_version_id`) REFERENCES `contract_version` (`contract_version_id`),
  ADD CONSTRAINT `fk_contract_indicated` FOREIGN KEY (`indicated_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_owner` FOREIGN KEY (`owner_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_partner` FOREIGN KEY (`partner_id`) REFERENCES `partner` (`partner_id`),
  ADD CONSTRAINT `fk_contract_seller` FOREIGN KEY (`seller_id`) REFERENCES `partner` (`partner_id`),
  ADD CONSTRAINT `fk_contract_status` FOREIGN KEY (`status_id`) REFERENCES `contract_status` (`contract_status_id`),
  ADD CONSTRAINT `fk_contract_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_contract_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `contract_access`
--
ALTER TABLE `contract_access`
  ADD CONSTRAINT `contract_access_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`contract_id`),
  ADD CONSTRAINT `contract_access_ibfk_2` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `contract_active`
--
ALTER TABLE `contract_active`
  ADD CONSTRAINT `fk_contract_active_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_contract_active_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_number_unique_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `contract_addendum`
--
ALTER TABLE `contract_addendum`
  ADD CONSTRAINT `fk_contract_addendum_addendum` FOREIGN KEY (`addendum_id`) REFERENCES `addendum` (`addendum_id`),
  ADD CONSTRAINT `fk_contract_addendum_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`),
  ADD CONSTRAINT `fk_contract_addendum_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `contract_billing`
--
ALTER TABLE `contract_billing`
  ADD CONSTRAINT `fk_contract_billing_charge` FOREIGN KEY (`charge_id`) REFERENCES `contract_charge` (`contract_charge_id`),
  ADD CONSTRAINT `fk_contract_billing_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `billing_cycle` (`billing_cycle_id`),
  ADD CONSTRAINT `fk_contract_billing_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_contract_billing_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_billing_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `contract_charge`
--
ALTER TABLE `contract_charge`
  ADD CONSTRAINT `fk_contract_charge_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contract_charge_payment` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_status` (`payment_status_id`),
  ADD CONSTRAINT `fk_contract_charge_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `contract_config_billing`
--
ALTER TABLE `contract_config_billing`
  ADD CONSTRAINT `fk_contract_config_billing_collector` FOREIGN KEY (`collector_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_config_billing_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`region_id`),
  ADD CONSTRAINT `fk_contract_config_billing_seller` FOREIGN KEY (`seller_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_config_billing_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `contract_covers`
--
ALTER TABLE `contract_covers`
  ADD CONSTRAINT `fk_contract_covers_class` FOREIGN KEY (`class_id`) REFERENCES `category` (`category_id`),
  ADD CONSTRAINT `fk_contract_covers_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_contract_covers_status` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
  ADD CONSTRAINT `fk_contract_covers_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `contract_events`
--
ALTER TABLE `contract_events`
  ADD CONSTRAINT `fk_contract_events_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_events_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `contract_status_history`
--
ALTER TABLE `contract_status_history`
  ADD CONSTRAINT `fk_contract_status_history_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`),
  ADD CONSTRAINT `fk_contract_status_history_statreason` FOREIGN KEY (`status_reason_id`) REFERENCES `status_reason` (`status_reason_id`),
  ADD CONSTRAINT `fk_contract_status_history_transition` FOREIGN KEY (`state_machine_transition_id`) REFERENCES `state_machine_transitions` (`state_machine_transitions_id`);

--
-- Restrições para tabelas `contract_version`
--
ALTER TABLE `contract_version`
  ADD CONSTRAINT `fk_contract_version_class` FOREIGN KEY (`class_id`) REFERENCES `category` (`category_id`),
  ADD CONSTRAINT `fk_contract_version_collector` FOREIGN KEY (`collector_id`) REFERENCES `partner` (`partner_id`),
  ADD CONSTRAINT `fk_contract_version_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`contract_id`),
  ADD CONSTRAINT `fk_contract_version_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_version_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_contract_version_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_contract_version_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`region_id`),
  ADD CONSTRAINT `fk_contract_version_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `cost_center`
--
ALTER TABLE `cost_center`
  ADD CONSTRAINT `fk_cost_center_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cost_center_parent` FOREIGN KEY (`parent_cost_center_id`) REFERENCES `cost_center` (`cost_center_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_cost_center_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_cost_center_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `fk_customer_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`);

--
-- Restrições para tabelas `customer_return`
--
ALTER TABLE `customer_return`
  ADD CONSTRAINT `fk_customer_return_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_customer_return_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `fk_customer_return_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`shipment_id`),
  ADD CONSTRAINT `fk_customer_return_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_customer_return_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `customer_return_item`
--
ALTER TABLE `customer_return_item`
  ADD CONSTRAINT `fk_customer_return_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_customer_return_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_customer_return_item_return_id` FOREIGN KEY (`return_id`) REFERENCES `customer_return` (`return_id`),
  ADD CONSTRAINT `fk_customer_return_item_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`shipment_id`),
  ADD CONSTRAINT `fk_customer_return_item_shipment_item_id` FOREIGN KEY (`shipment_item_id`) REFERENCES `shipment_item` (`shipment_item_id`),
  ADD CONSTRAINT `fk_customer_return_item_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_customer_return_item_so_item_id` FOREIGN KEY (`so_item_id`) REFERENCES `sales_order_item` (`so_item_id`),
  ADD CONSTRAINT `fk_customer_return_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_customer_return_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `death_event`
--
ALTER TABLE `death_event`
  ADD CONSTRAINT `fk_death_event_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary` (`beneficiary_id`),
  ADD CONSTRAINT `fk_death_event_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_death_event_service` FOREIGN KEY (`service_funeral_id`) REFERENCES `service_funeral` (`service_funeral_id`);

--
-- Restrições para tabelas `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `fk_department_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_department_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`cost_center_id`),
  ADD CONSTRAINT `fk_department_parent` FOREIGN KEY (`parent_department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_department_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_department_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `fk_document_doctype` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`document_type_id`),
  ADD CONSTRAINT `fk_document_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `driver`
--
ALTER TABLE `driver`
  ADD CONSTRAINT `fk_driver_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_driver_driver_id` FOREIGN KEY (`driver_id`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_driver_driver_status_id` FOREIGN KEY (`driver_status_id`) REFERENCES `driver_status` (`driver_status_id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `driver_document`
--
ALTER TABLE `driver_document`
  ADD CONSTRAINT `fk_driver_document_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_driver_document_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_driver_document_document_id` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_driver_document_driver_id` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `driver_status`
--
ALTER TABLE `driver_status`
  ADD CONSTRAINT `fk_driver_status_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_driver_status_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `entity_address`
--
ALTER TABLE `entity_address`
  ADD CONSTRAINT `fk_entity_address_address` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`);

--
-- Restrições para tabelas `entity_document`
--
ALTER TABLE `entity_document`
  ADD CONSTRAINT `fk_entity_document_doc` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`);

--
-- Restrições para tabelas `equipament_rental`
--
ALTER TABLE `equipament_rental`
  ADD CONSTRAINT `fk_equipament_rental_perfservic` FOREIGN KEY (`performed_service_id`) REFERENCES `performed_service` (`performed_service_id`),
  ADD CONSTRAINT `fk_equipament_rental_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_equipament_rental_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_equipament_rental_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `financial_ratio`
--
ALTER TABLE `financial_ratio`
  ADD CONSTRAINT `fk_financial_ratio_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `financial_ratio_value`
--
ALTER TABLE `financial_ratio_value`
  ADD CONSTRAINT `fk_financial_ratio_value_fiscal_period` FOREIGN KEY (`fiscal_period_id`) REFERENCES `fiscal_period` (`fiscal_period_id`),
  ADD CONSTRAINT `fk_financial_ratio_value_ratio` FOREIGN KEY (`ratio_id`) REFERENCES `financial_ratio` (`ratio_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `fiscal_period`
--
ALTER TABLE `fiscal_period`
  ADD CONSTRAINT `fk_fiscal_period_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_fiscal_period_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_fiscal_period_year` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`fiscal_year_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `fiscal_year`
--
ALTER TABLE `fiscal_year`
  ADD CONSTRAINT `fk_fiscal_year_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fiscal_year_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_fiscal_year_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `goods_receipt`
--
ALTER TABLE `goods_receipt`
  ADD CONSTRAINT `fk_goods_receipt_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_goods_receipt_po_id` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`),
  ADD CONSTRAINT `fk_goods_receipt_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_goods_receipt_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `goods_receipt_item`
--
ALTER TABLE `goods_receipt_item`
  ADD CONSTRAINT `fk_goods_receipt_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_po_id` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_po_item_id` FOREIGN KEY (`po_item_id`) REFERENCES `purchase_order_item` (`po_item_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_receipt_id` FOREIGN KEY (`receipt_id`) REFERENCES `goods_receipt` (`receipt_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_goods_receipt_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `group_batch`
--
ALTER TABLE `group_batch`
  ADD CONSTRAINT `fk_group_batch_class` FOREIGN KEY (`class_id`) REFERENCES `category` (`category_id`),
  ADD CONSTRAINT `fk_group_batch_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_group_batch_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `integration_mapping`
--
ALTER TABLE `integration_mapping`
  ADD CONSTRAINT `fk_integration_mapping_integration` FOREIGN KEY (`integration_id`) REFERENCES `integration_setting` (`integration_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `integration_setting`
--
ALTER TABLE `integration_setting`
  ADD CONSTRAINT `fk_integration_setting_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `integration_sync_log`
--
ALTER TABLE `integration_sync_log`
  ADD CONSTRAINT `fk_integration_sync_log_integration` FOREIGN KEY (`integration_id`) REFERENCES `integration_setting` (`integration_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `inventory_adjustment`
--
ALTER TABLE `inventory_adjustment`
  ADD CONSTRAINT `fk_inventory_adjustment_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_inventory_adjustment_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `inventory_adjustment_item`
--
ALTER TABLE `inventory_adjustment_item`
  ADD CONSTRAINT `fk_inventory_adjustment_item_adjustment_id` FOREIGN KEY (`adjustment_id`) REFERENCES `inventory_adjustment` (`adjustment_id`),
  ADD CONSTRAINT `fk_inventory_adjustment_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_inventory_adjustment_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_inventory_adjustment_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_inventory_adjustment_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `journal`
--
ALTER TABLE `journal`
  ADD CONSTRAINT `fk_journal_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_journal_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_journal_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_journal_currency` FOREIGN KEY (`currency`) REFERENCES `currency` (`currency_code`),
  ADD CONSTRAINT `fk_journal_fiscal_period` FOREIGN KEY (`fiscal_period_id`) REFERENCES `fiscal_period` (`fiscal_period_id`),
  ADD CONSTRAINT `fk_journal_posted_by` FOREIGN KEY (`posted_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_journal_related_company` FOREIGN KEY (`related_company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_journal_type` FOREIGN KEY (`journal_type_id`) REFERENCES `journal_type` (`journal_type_id`);

--
-- Restrições para tabelas `journal_attachment`
--
ALTER TABLE `journal_attachment`
  ADD CONSTRAINT `fk_journal_attachment_journal` FOREIGN KEY (`journal_id`) REFERENCES `journal` (`journal_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_journal_attachment_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `journal_line`
--
ALTER TABLE `journal_line`
  ADD CONSTRAINT `fk_journal_line_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_journal_line_contact` FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`),
  ADD CONSTRAINT `fk_journal_line_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`cost_center_id`),
  ADD CONSTRAINT `fk_journal_line_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `fk_journal_line_journal` FOREIGN KEY (`journal_id`) REFERENCES `journal` (`journal_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_journal_line_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`),
  ADD CONSTRAINT `fk_journal_line_tax_code` FOREIGN KEY (`tax_code_id`) REFERENCES `tax_code` (`tax_code_id`);

--
-- Restrições para tabelas `journal_type`
--
ALTER TABLE `journal_type`
  ADD CONSTRAINT `fk_journal_type_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `fk_maintenance_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_maintenance_maintenance_status_id` FOREIGN KEY (`maintenance_status_id`) REFERENCES `maintenance_status` (`maintenance_status_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_maintenance_service_type_id` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`service_type_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_maintenance_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `maintenance_document`
--
ALTER TABLE `maintenance_document`
  ADD CONSTRAINT `fk_maintenance_document_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_maintenance_document_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_maintenance_document_document_id` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_maintenance_document_maintenance_id` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance` (`maintenance_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `medical_foward`
--
ALTER TABLE `medical_foward`
  ADD CONSTRAINT `fk_medical_foward_accredit` FOREIGN KEY (`partner_id`) REFERENCES `partner` (`partner_id`),
  ADD CONSTRAINT `fk_medical_foward_ordpgrc` FOREIGN KEY (`ordpgrc_id`) REFERENCES `ordpgrc` (`ordpgrc_id`),
  ADD CONSTRAINT `fk_medical_foward_perfservic` FOREIGN KEY (`performed_service_id`) REFERENCES `performed_service` (`performed_service_id`),
  ADD CONSTRAINT `fk_medical_foward_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_medical_foward_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `membership_card`
--
ALTER TABLE `membership_card`
  ADD CONSTRAINT `fk_membership_card_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary` (`beneficiary_id`),
  ADD CONSTRAINT `fk_membership_card_service` FOREIGN KEY (`performed_service_id`) REFERENCES `performed_service` (`performed_service_id`),
  ADD CONSTRAINT `fk_membership_card_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_membership_card_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_membership_card_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `ordpgrc`
--
ALTER TABLE `ordpgrc`
  ADD CONSTRAINT `fk_ordpgrc_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_ordpgrc_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `partner`
--
ALTER TABLE `partner`
  ADD CONSTRAINT `fk_partner_billing_addr` FOREIGN KEY (`billing_address_id`) REFERENCES `address` (`address_id`),
  ADD CONSTRAINT `fk_partner_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_partner_doc1` FOREIGN KEY (`document1_id`) REFERENCES `document` (`document_id`),
  ADD CONSTRAINT `fk_partner_doc2` FOREIGN KEY (`document2_id`) REFERENCES `document` (`document_id`),
  ADD CONSTRAINT `fk_partner_owner` FOREIGN KEY (`owner_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_partner_shipping_addr` FOREIGN KEY (`shipping_address_id`) REFERENCES `address` (`address_id`),
  ADD CONSTRAINT `fk_partner_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `specialty` (`specialty_id`),
  ADD CONSTRAINT `fk_partner_type` FOREIGN KEY (`partner_type_id`) REFERENCES `partner_type` (`partner_type_id`),
  ADD CONSTRAINT `fk_partner_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_partner_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `partner_bank_account`
--
ALTER TABLE `partner_bank_account`
  ADD CONSTRAINT `fk_partner_bank_partner` FOREIGN KEY (`partner_id`) REFERENCES `partner` (`partner_id`);

--
-- Restrições para tabelas `partner_type`
--
ALTER TABLE `partner_type`
  ADD CONSTRAINT `fk_partner_type_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`);

--
-- Restrições para tabelas `payment_method`
--
ALTER TABLE `payment_method`
  ADD CONSTRAINT `fk_payment_method_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `payment_plan`
--
ALTER TABLE `payment_plan`
  ADD CONSTRAINT `fk_payment_plan_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_payment_plan_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_payment_plan_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `payment_plan_installment`
--
ALTER TABLE `payment_plan_installment`
  ADD CONSTRAINT `fk_installment_charge` FOREIGN KEY (`charge_id`) REFERENCES `contract_charge` (`contract_charge_id`),
  ADD CONSTRAINT `fk_installment_plan` FOREIGN KEY (`plan_id`) REFERENCES `payment_plan` (`payment_plan_id`),
  ADD CONSTRAINT `fk_installment_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_installment_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `payment_receipt`
--
ALTER TABLE `payment_receipt`
  ADD CONSTRAINT `fk_payment_receipt_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`),
  ADD CONSTRAINT `fk_payment_receipt_ordpgrc` FOREIGN KEY (`ordpgrc_id`) REFERENCES `ordpgrc` (`ordpgrc_id`),
  ADD CONSTRAINT `fk_payment_receipt_paystat` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_status` (`payment_status_id`),
  ADD CONSTRAINT `fk_payment_receipt_subsidiary` FOREIGN KEY (`subsidiary_id`) REFERENCES `subsidiary` (`subsidiary_id`),
  ADD CONSTRAINT `fk_payment_receipt_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_payment_receipt_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `payment_transaction`
--
ALTER TABLE `payment_transaction`
  ADD CONSTRAINT `fk_transaction_charge` FOREIGN KEY (`charge_id`) REFERENCES `contract_charge` (`contract_charge_id`),
  ADD CONSTRAINT `fk_transaction_installment` FOREIGN KEY (`installment_id`) REFERENCES `payment_plan_installment` (`payment_plan_installment_id`),
  ADD CONSTRAINT `fk_transaction_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_transaction_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_transaction_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `performed_service`
--
ALTER TABLE `performed_service`
  ADD CONSTRAINT `fk_performed_service_benefic` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary` (`beneficiary_id`),
  ADD CONSTRAINT `fk_performed_service_contract` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`),
  ADD CONSTRAINT `fk_performed_service_servtype` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`service_type_id`),
  ADD CONSTRAINT `fk_performed_service_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_base_uom_id` FOREIGN KEY (`base_uom_id`) REFERENCES `units_of_measurement` (`uom_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_brand_id` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`brand_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_category_id` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_dim_uom_id` FOREIGN KEY (`dim_uom_id`) REFERENCES `units_of_measurement` (`uom_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_purchase_uom_id` FOREIGN KEY (`purchase_uom_id`) REFERENCES `units_of_measurement` (`uom_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_sales_uom_id` FOREIGN KEY (`sales_uom_id`) REFERENCES `units_of_measurement` (`uom_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_product_weight_uom_id` FOREIGN KEY (`weight_uom_id`) REFERENCES `units_of_measurement` (`uom_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `product_category`
--
ALTER TABLE `product_category`
  ADD CONSTRAINT `fk_product_category_parent_category_id` FOREIGN KEY (`parent_category_id`) REFERENCES `product_category` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_category_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_category_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `product_image`
--
ALTER TABLE `product_image`
  ADD CONSTRAINT `fk_product_image_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_product_image_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_image_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_product_image_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `product_pricing`
--
ALTER TABLE `product_pricing`
  ADD CONSTRAINT `fk_product_pricing_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_product_pricing_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_pricing_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_product_pricing_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `product_supplier`
--
ALTER TABLE `product_supplier`
  ADD CONSTRAINT `fk_product_supplier_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_product_supplier_purchase_uom_id` FOREIGN KEY (`purchase_uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_product_supplier_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_product_supplier_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_supplier_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_product_supplier_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `product_variation`
--
ALTER TABLE `product_variation`
  ADD CONSTRAINT `fk_product_variation_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_product_variation_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_product_variation_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `fk_project_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_project_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`cost_center_id`),
  ADD CONSTRAINT `fk_project_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `fk_project_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_project_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `prorated_service`
--
ALTER TABLE `prorated_service`
  ADD CONSTRAINT `fk_prorated_service_id_charge` FOREIGN KEY (`charge_id`) REFERENCES `charge` (`charge_id`),
  ADD CONSTRAINT `fk_prorated_service_id_servfuner` FOREIGN KEY (`service_funeral_id`) REFERENCES `service_funeral` (`service_funeral_id`),
  ADD CONSTRAINT `fk_prorated_service_id_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_prorated_service_id_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD CONSTRAINT `fk_purchase_order_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_purchase_order_quotation_id` FOREIGN KEY (`quotation_id`) REFERENCES `supplier_quotation` (`quotation_id`),
  ADD CONSTRAINT `fk_purchase_order_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_purchase_order_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `purchase_order_item`
--
ALTER TABLE `purchase_order_item`
  ADD CONSTRAINT `fk_purchase_order_item_po_id` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`),
  ADD CONSTRAINT `fk_purchase_order_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_purchase_order_item_quotation_item_id` FOREIGN KEY (`quotation_item_id`) REFERENCES `supplier_quotation_item` (`quotation_item_id`),
  ADD CONSTRAINT `fk_purchase_order_item_requisition_id` FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisition` (`requisition_id`),
  ADD CONSTRAINT `fk_purchase_order_item_requisition_item_id` FOREIGN KEY (`requisition_item_id`) REFERENCES `purchase_requisition_item` (`req_item_id`),
  ADD CONSTRAINT `fk_purchase_order_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_purchase_order_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `purchase_requisition`
--
ALTER TABLE `purchase_requisition`
  ADD CONSTRAINT `fk_purchase_requisition_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_purchase_requisition_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `purchase_requisition_item`
--
ALTER TABLE `purchase_requisition_item`
  ADD CONSTRAINT `fk_purchase_requisition_item_preferred_supplier_id` FOREIGN KEY (`preferred_supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_purchase_requisition_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_purchase_requisition_item_requisition_id` FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisition` (`requisition_id`),
  ADD CONSTRAINT `fk_purchase_requisition_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_purchase_requisition_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `reconciliation_item`
--
ALTER TABLE `reconciliation_item`
  ADD CONSTRAINT `fk_reconciliation_item_journal_line` FOREIGN KEY (`journal_line_id`) REFERENCES `journal_line` (`journal_line_id`),
  ADD CONSTRAINT `fk_reconciliation_item_matched_by` FOREIGN KEY (`matched_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_reconciliation_item_reconciliation` FOREIGN KEY (`reconciliation_id`) REFERENCES `bank_reconciliation` (`reconciliation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reconciliation_item_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transaction` (`transaction_id`);

--
-- Restrições para tabelas `region`
--
ALTER TABLE `region`
  ADD CONSTRAINT `fk_region_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `report_definition`
--
ALTER TABLE `report_definition`
  ADD CONSTRAINT `fk_report_definition_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_report_definition_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `request_for_quotation`
--
ALTER TABLE `request_for_quotation`
  ADD CONSTRAINT `fk_request_for_quotation_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`);

--
-- Restrições para tabelas `rfq_item`
--
ALTER TABLE `rfq_item`
  ADD CONSTRAINT `fk_rfq_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_rfq_item_requisition_id` FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisition` (`requisition_id`),
  ADD CONSTRAINT `fk_rfq_item_requisition_item_id` FOREIGN KEY (`requisition_item_id`) REFERENCES `purchase_requisition_item` (`req_item_id`),
  ADD CONSTRAINT `fk_rfq_item_rfq_id` FOREIGN KEY (`rfq_id`) REFERENCES `request_for_quotation` (`rfq_id`),
  ADD CONSTRAINT `fk_rfq_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_rfq_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `rfq_supplier`
--
ALTER TABLE `rfq_supplier`
  ADD CONSTRAINT `fk_rfq_supplier_rfq_id` FOREIGN KEY (`rfq_id`) REFERENCES `request_for_quotation` (`rfq_id`),
  ADD CONSTRAINT `fk_rfq_supplier_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`);

--
-- Restrições para tabelas `sales_allocation`
--
ALTER TABLE `sales_allocation`
  ADD CONSTRAINT `fk_sales_allocation_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_sales_allocation_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_sales_allocation_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_sales_allocation_so_item_id` FOREIGN KEY (`so_item_id`) REFERENCES `sales_order_item` (`so_item_id`),
  ADD CONSTRAINT `fk_sales_allocation_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_sales_allocation_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`),
  ADD CONSTRAINT `fk_sales_allocation_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `sales_order`
--
ALTER TABLE `sales_order`
  ADD CONSTRAINT `fk_sales_order_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_sales_order_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `fk_sales_order_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `sales_order_item`
--
ALTER TABLE `sales_order_item`
  ADD CONSTRAINT `fk_sales_order_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_sales_order_item_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_sales_order_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_sales_order_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`),
  ADD CONSTRAINT `fk_sales_order_item_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `serial_tracking`
--
ALTER TABLE `serial_tracking`
  ADD CONSTRAINT `fk_serial_tracking_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `batch_tracking` (`batch_id`),
  ADD CONSTRAINT `fk_serial_tracking_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_serial_tracking_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `service_funeral`
--
ALTER TABLE `service_funeral`
  ADD CONSTRAINT `fk_service_funeral_deceased` FOREIGN KEY (`deceased_id`) REFERENCES `beneficiary` (`beneficiary_id`),
  ADD CONSTRAINT `fk_service_funeral_declarant` FOREIGN KEY (`declarant_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_service_funeral_group` FOREIGN KEY (`group_batch_id`) REFERENCES `group_batch` (`group_batch_id`),
  ADD CONSTRAINT `fk_service_funeral_officer` FOREIGN KEY (`office_users_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_service_funeral_perfservic` FOREIGN KEY (`performed_service_id`) REFERENCES `performed_service` (`performed_service_id`),
  ADD CONSTRAINT `fk_service_funeral_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_service_funeral_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_service_funeral_version` FOREIGN KEY (`contract_version_id`) REFERENCES `contract_version` (`contract_version_id`);

--
-- Restrições para tabelas `service_type`
--
ALTER TABLE `service_type`
  ADD CONSTRAINT `fk_service_type_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_service_type_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `shipment`
--
ALTER TABLE `shipment`
  ADD CONSTRAINT `fk_shipment_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_shipment_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `fk_shipment_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_shipment_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `shipment_item`
--
ALTER TABLE `shipment_item`
  ADD CONSTRAINT `fk_shipment_item_allocation_id` FOREIGN KEY (`allocation_id`) REFERENCES `sales_allocation` (`allocation_id`),
  ADD CONSTRAINT `fk_shipment_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_shipment_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_shipment_item_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`shipment_id`),
  ADD CONSTRAINT `fk_shipment_item_so_id` FOREIGN KEY (`so_id`) REFERENCES `sales_order` (`so_id`),
  ADD CONSTRAINT `fk_shipment_item_so_item_id` FOREIGN KEY (`so_item_id`) REFERENCES `sales_order_item` (`so_item_id`),
  ADD CONSTRAINT `fk_shipment_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_shipment_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `specialty`
--
ALTER TABLE `specialty`
  ADD CONSTRAINT `fk_specialty_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_specialty_users` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `state_machine_transitions`
--
ALTER TABLE `state_machine_transitions`
  ADD CONSTRAINT `fk_smt_from` FOREIGN KEY (`contract_status_id_from`) REFERENCES `contract_status` (`contract_status_id`),
  ADD CONSTRAINT `fk_smt_to` FOREIGN KEY (`contract_status_id_to`) REFERENCES `contract_status` (`contract_status_id`);

--
-- Restrições para tabelas `stock_count`
--
ALTER TABLE `stock_count`
  ADD CONSTRAINT `fk_stock_count_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_stock_count_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_stock_count_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `stock_count_item`
--
ALTER TABLE `stock_count_item`
  ADD CONSTRAINT `fk_stock_count_item_count_id` FOREIGN KEY (`count_id`) REFERENCES `stock_count` (`count_id`),
  ADD CONSTRAINT `fk_stock_count_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_stock_count_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_stock_count_item_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_stock_count_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_stock_count_item_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_stock_count_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `stock_level`
--
ALTER TABLE `stock_level`
  ADD CONSTRAINT `fk_stock_level_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_level_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_level_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_stock_level_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_stock_level_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_level_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `stock_movement`
--
ALTER TABLE `stock_movement`
  ADD CONSTRAINT `fk_stock_movement_from_location_id` FOREIGN KEY (`from_location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_stock_movement_from_warehouse_id` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouse` (`warehouse_id`),
  ADD CONSTRAINT `fk_stock_movement_movement_type_id` FOREIGN KEY (`movement_type_id`) REFERENCES `stock_movement_type` (`movement_type_id`),
  ADD CONSTRAINT `fk_stock_movement_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_stock_movement_to_location_id` FOREIGN KEY (`to_location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_stock_movement_to_warehouse_id` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouse` (`warehouse_id`),
  ADD CONSTRAINT `fk_stock_movement_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_stock_movement_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_stock_movement_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_stock_movement_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `stock_movement_type`
--
ALTER TABLE `stock_movement_type`
  ADD CONSTRAINT `fk_stock_movement_type_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_stock_movement_type_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `stock_reservation`
--
ALTER TABLE `stock_reservation`
  ADD CONSTRAINT `fk_stock_reservation_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_stock_reservation_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_stock_reservation_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_stock_reservation_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`),
  ADD CONSTRAINT `fk_stock_reservation_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `storage_location`
--
ALTER TABLE `storage_location`
  ADD CONSTRAINT `fk_storage_location_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_storage_location_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_storage_location_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `supplier`
--
ALTER TABLE `supplier`
  ADD CONSTRAINT `fk_supplier_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_supplier_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `supplier_quotation`
--
ALTER TABLE `supplier_quotation`
  ADD CONSTRAINT `fk_supplier_quotation_rfq_supplier_id` FOREIGN KEY (`rfq_supplier_id`) REFERENCES `rfq_supplier` (`rfq_supplier_id`);

--
-- Restrições para tabelas `supplier_quotation_item`
--
ALTER TABLE `supplier_quotation_item`
  ADD CONSTRAINT `fk_supplier_quotation_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_supplier_quotation_item_quotation_id` FOREIGN KEY (`quotation_id`) REFERENCES `supplier_quotation` (`quotation_id`),
  ADD CONSTRAINT `fk_supplier_quotation_item_rfq_item_id` FOREIGN KEY (`rfq_item_id`) REFERENCES `rfq_item` (`rfq_item_id`),
  ADD CONSTRAINT `fk_supplier_quotation_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_supplier_quotation_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `supplier_return`
--
ALTER TABLE `supplier_return`
  ADD CONSTRAINT `fk_supplier_return_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_supplier_return_po_id` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`),
  ADD CONSTRAINT `fk_supplier_return_receipt_id` FOREIGN KEY (`receipt_id`) REFERENCES `goods_receipt` (`receipt_id`),
  ADD CONSTRAINT `fk_supplier_return_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`),
  ADD CONSTRAINT `fk_supplier_return_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `supplier_return_item`
--
ALTER TABLE `supplier_return_item`
  ADD CONSTRAINT `fk_supplier_return_item_location_id` FOREIGN KEY (`location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_supplier_return_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_supplier_return_item_receipt_item_id` FOREIGN KEY (`receipt_item_id`) REFERENCES `goods_receipt_item` (`receipt_item_id`),
  ADD CONSTRAINT `fk_supplier_return_item_return_id` FOREIGN KEY (`return_id`) REFERENCES `supplier_return` (`return_id`),
  ADD CONSTRAINT `fk_supplier_return_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_supplier_return_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `sys_audit_log`
--
ALTER TABLE `sys_audit_log`
  ADD CONSTRAINT `fk_sys_audit_log_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sys_audit_log_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `sys_group_program`
--
ALTER TABLE `sys_group_program`
  ADD CONSTRAINT `fk_sys_group_program_group` FOREIGN KEY (`sys_group_id`) REFERENCES `sys_group` (`sys_group_id`),
  ADD CONSTRAINT `fk_sys_group_program_program` FOREIGN KEY (`sys_program_id`) REFERENCES `sys_program` (`sys_program_id`);

--
-- Restrições para tabelas `sys_setting`
--
ALTER TABLE `sys_setting`
  ADD CONSTRAINT `fk_sys_setting_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `sys_unit`
--
ALTER TABLE `sys_unit`
  ADD CONSTRAINT `fk_sys_unit_genstat` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
  ADD CONSTRAINT `fk_sys_unit_subsidiary` FOREIGN KEY (`subsidiary_id`) REFERENCES `subsidiary` (`subsidiary_id`);

--
-- Restrições para tabelas `sys_user`
--
ALTER TABLE `sys_user`
  ADD CONSTRAINT `fk_sys_user_frontpg` FOREIGN KEY (`frontpage_id`) REFERENCES `sys_program` (`sys_program_id`),
  ADD CONSTRAINT `fk_sys_user_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`);

--
-- Restrições para tabelas `sys_user_group`
--
ALTER TABLE `sys_user_group`
  ADD CONSTRAINT `fk_sys_user_group_group` FOREIGN KEY (`sys_group_id`) REFERENCES `sys_group` (`sys_group_id`),
  ADD CONSTRAINT `fk_sys_user_group_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `sys_user_program`
--
ALTER TABLE `sys_user_program`
  ADD CONSTRAINT `fk_sys_user_program_progrm` FOREIGN KEY (`sys_program_id`) REFERENCES `sys_program` (`sys_program_id`),
  ADD CONSTRAINT `fk_sys_user_program_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `sys_user_unit`
--
ALTER TABLE `sys_user_unit`
  ADD CONSTRAINT `fk_sys_user_unit_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_sys_user_unit_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `tax_code`
--
ALTER TABLE `tax_code`
  ADD CONSTRAINT `fk_tax_code_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tax_code_liability_account` FOREIGN KEY (`liability_account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_tax_code_receivable_account` FOREIGN KEY (`receivable_account_id`) REFERENCES `account` (`account_id`);

--
-- Restrições para tabelas `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `fk_transaction_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transaction_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_transaction_currency` FOREIGN KEY (`currency`) REFERENCES `currency` (`currency_code`),
  ADD CONSTRAINT `fk_transaction_from_account` FOREIGN KEY (`from_account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_transaction_from_contact` FOREIGN KEY (`from_contact_id`) REFERENCES `contact` (`contact_id`),
  ADD CONSTRAINT `fk_transaction_journal` FOREIGN KEY (`journal_id`) REFERENCES `journal` (`journal_id`),
  ADD CONSTRAINT `fk_transaction_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method` (`payment_method_id`),
  ADD CONSTRAINT `fk_transaction_to_account` FOREIGN KEY (`to_account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `fk_transaction_to_contact` FOREIGN KEY (`to_contact_id`) REFERENCES `contact` (`contact_id`),
  ADD CONSTRAINT `fk_transaction_type` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_type` (`transaction_type_id`);

--
-- Restrições para tabelas `transaction_allocation`
--
ALTER TABLE `transaction_allocation`
  ADD CONSTRAINT `fk_transaction_allocation_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transaction` (`transaction_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `transaction_type`
--
ALTER TABLE `transaction_type`
  ADD CONSTRAINT `fk_transaction_type_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `trip`
--
ALTER TABLE `trip`
  ADD CONSTRAINT `fk_trip_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_trip_driver_id` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_trip_trip_status_id` FOREIGN KEY (`trip_status_id`) REFERENCES `trip_status` (`trip_status_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_trip_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_trip_vehicle_request_id` FOREIGN KEY (`vehicle_request_id`) REFERENCES `vehicle_request` (`vehicle_request_id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `trip_document`
--
ALTER TABLE `trip_document`
  ADD CONSTRAINT `fk_trip_document_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_trip_document_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_trip_document_document_id` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_trip_document_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trip` (`trip_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_company_access`
--
ALTER TABLE `user_company_access`
  ADD CONSTRAINT `fk_user_access_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_user_access_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `validation_rule`
--
ALTER TABLE `validation_rule`
  ADD CONSTRAINT `fk_validation_rule_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `variation_attribute`
--
ALTER TABLE `variation_attribute`
  ADD CONSTRAINT `fk_variation_attribute_attribute_type_id` FOREIGN KEY (`attribute_type_id`) REFERENCES `attribute_type` (`attribute_type_id`),
  ADD CONSTRAINT `fk_variation_attribute_attribute_value_id` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_value` (`attribute_value_id`),
  ADD CONSTRAINT `fk_variation_attribute_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_variation_attribute_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`),
  ADD CONSTRAINT `fk_variation_attribute_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

--
-- Restrições para tabelas `vehicle`
--
ALTER TABLE `vehicle`
  ADD CONSTRAINT `fk_vehicle_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_vehicle_status_id` FOREIGN KEY (`vehicle_status_id`) REFERENCES `vehicle_status` (`vehicle_status_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_vehicle_type_id` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_type` (`vehicle_type_id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `vehicle_daily_log`
--
ALTER TABLE `vehicle_daily_log`
  ADD CONSTRAINT `fk_vehicle_daily_log_attached_document_id` FOREIGN KEY (`attached_document_id`) REFERENCES `document` (`document_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_daily_log_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_daily_log_driver_id` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_daily_log_log_event_type_id` FOREIGN KEY (`log_event_type_id`) REFERENCES `log_event_type` (`log_event_type_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_daily_log_sys_user_id` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_daily_log_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `vehicle_document`
--
ALTER TABLE `vehicle_document`
  ADD CONSTRAINT `fk_vehicle_document_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_document_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_document_document_id` FOREIGN KEY (`document_id`) REFERENCES `document` (`document_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_document_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `vehicle_expense`
--
ALTER TABLE `vehicle_expense`
  ADD CONSTRAINT `fk_vehicle_expense_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_expense_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_expense_currency_code` FOREIGN KEY (`currency_code`) REFERENCES `currency` (`currency_code`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_expense_expense_type_id` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_type` (`expense_type_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_expense_receipt_document_id` FOREIGN KEY (`receipt_document_id`) REFERENCES `document` (`document_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_expense_sys_user_id` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_expense_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trip` (`trip_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_expense_vehicle_expense_status_id` FOREIGN KEY (`vehicle_expense_status_id`) REFERENCES `vehicle_expense_status` (`vehicle_expense_status_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_expense_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `vehicle_request`
--
ALTER TABLE `vehicle_request`
  ADD CONSTRAINT `fk_vehicle_request_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vehicle_request_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_request_requested_vehicle_type_id` FOREIGN KEY (`requested_vehicle_type_id`) REFERENCES `vehicle_type` (`vehicle_type_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_request_requester_id` FOREIGN KEY (`requester_id`) REFERENCES `sys_user` (`sys_user_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_request_vehicle_request_status_id` FOREIGN KEY (`vehicle_request_status_id`) REFERENCES `vehicle_request_status` (`vehicle_request_status_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_vehicle_request_vehicle_request_type_id` FOREIGN KEY (`vehicle_request_type_id`) REFERENCES `vehicle_request_type` (`vehicle_request_type_id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `vehicle_status`
--
ALTER TABLE `vehicle_status`
  ADD CONSTRAINT `fk_vehicle_status_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_vehicle_status_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `vehicle_type`
--
ALTER TABLE `vehicle_type`
  ADD CONSTRAINT `fk_vehicle_type_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_vehicle_type_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `warehouse`
--
ALTER TABLE `warehouse`
  ADD CONSTRAINT `fk_warehouse_unit` FOREIGN KEY (`sys_unit_id`) REFERENCES `sys_unit` (`sys_unit_id`),
  ADD CONSTRAINT `fk_warehouse_user` FOREIGN KEY (`sys_user_id`) REFERENCES `sys_user` (`sys_user_id`);

--
-- Restrições para tabelas `warehouse_transfer`
--
ALTER TABLE `warehouse_transfer`
  ADD CONSTRAINT `fk_warehouse_transfer_company_id` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_from_warehouse_id` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouse` (`warehouse_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_to_warehouse_id` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouse` (`warehouse_id`);

--
-- Restrições para tabelas `warehouse_transfer_item`
--
ALTER TABLE `warehouse_transfer_item`
  ADD CONSTRAINT `fk_warehouse_transfer_item_from_location_id` FOREIGN KEY (`from_location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_item_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_item_to_location_id` FOREIGN KEY (`to_location_id`) REFERENCES `storage_location` (`location_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_item_transfer_id` FOREIGN KEY (`transfer_id`) REFERENCES `warehouse_transfer` (`transfer_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_item_uom_id` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measurement` (`uom_id`),
  ADD CONSTRAINT `fk_warehouse_transfer_item_variation_id` FOREIGN KEY (`variation_id`) REFERENCES `product_variation` (`variation_id`);

DELIMITER $$
--
-- Eventos
--
DROP EVENT IF EXISTS `nightly_maintenance`$$
CREATE DEFINER=`presserv_adguias`@`localhost` EVENT `nightly_maintenance` ON SCHEDULE EVERY 1 DAY STARTS '2025-01-01 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    OPTIMIZE TABLE stock_movement, stock_level, audit_log;
    INSERT INTO audit_log_archive SELECT * FROM audit_log WHERE changed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    DELETE FROM audit_log WHERE changed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
