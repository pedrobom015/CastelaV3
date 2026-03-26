-- =============================================================================
-- PARTE 17: PROCEDURES E FUNCTIONS
-- =============================================================================

DELIMITER //

CREATE PROCEDURE create_contract_version(
    IN p_contract_id INT UNSIGNED,
    IN p_group_batch_id INT UNSIGNED,
    IN p_valid_from DATE,
    IN p_change_reason VARCHAR(255),
    IN p_created_by INT UNSIGNED,
    OUT p_new_version_id INT UNSIGNED
)
BEGIN
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
END //

CREATE FUNCTION get_current_contract_version(p_contract_id INT UNSIGNED)
RETURNS INT UNSIGNED
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_version_id INT UNSIGNED;

    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id
      AND is_current = 1
    LIMIT 1;

    RETURN v_version_id;
END //

CREATE FUNCTION get_contract_version_at_date(
    p_contract_id INT UNSIGNED,
    p_date DATE
)
RETURNS INT UNSIGNED
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_version_id INT UNSIGNED;

    SELECT id INTO v_version_id
    FROM contract_version
    WHERE contract_id = p_contract_id
      AND valid_from <= p_date
      AND (valid_to IS NULL OR valid_to >= p_date)
    ORDER BY version_number DESC
    LIMIT 1;

    RETURN v_version_id;
END //

CREATE PROCEDURE create_group_charge(
    IN p_group_batch_id INT UNSIGNED,
    IN p_death_count INT
)
BEGIN
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
END //

CREATE PROCEDURE update_charge_status(
    IN p_charge_id INT UNSIGNED
)
BEGIN
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
END //

DELIMITER ;


-- =============================================================================
-- FINALIZA\x80?O
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- Atualiza\x87?o da vers?o do schema
UPDATE schema_version
SET applied_at = CURRENT_TIMESTAMP
WHERE version = '2.0.3';
