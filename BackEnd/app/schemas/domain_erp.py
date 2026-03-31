from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AccountBase(BaseModel):
    account_id: Optional[int] = None
    company_id: Optional[int] = None
    account_type_id: Optional[int] = None
    parent_account_id: Optional[int] = None
    account_code: Optional[str] = None
    account_name: Optional[str] = None
    description: Optional[str] = None
    is_bank_account: Optional[int] = None
    is_control_account: Optional[int] = None
    is_tax_relevant: Optional[int] = None
    currency: Optional[str] = None
    opening_balance: Optional[float] = None
    current_balance: Optional[float] = None
    level: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    account_id: Optional[int] = None
    company_id: Optional[int] = None
    account_type_id: Optional[int] = None
    parent_account_id: Optional[int] = None
    account_code: Optional[str] = None
    account_name: Optional[str] = None
    description: Optional[str] = None
    is_bank_account: Optional[int] = None
    is_control_account: Optional[int] = None
    is_tax_relevant: Optional[int] = None
    currency: Optional[str] = None
    opening_balance: Optional[float] = None
    current_balance: Optional[float] = None
    level: Optional[int] = None
    active: Optional[int] = None

class Account(AccountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AccountingcodeBase(BaseModel):
    accounting_code_id: Optional[int] = None
    company_id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    account_type_id: Optional[int] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccountingcodeCreate(AccountingcodeBase):
    pass

class AccountingcodeUpdate(BaseModel):
    accounting_code_id: Optional[int] = None
    company_id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    account_type_id: Optional[int] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Accountingcode(AccountingcodeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AccountdailybalanceBase(BaseModel):
    daily_balance_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    balance_date: Optional[datetime]
    opening_balance: Optional[float] = None
    debit_total: Optional[float] = None
    credit_total: Optional[float] = None
    closing_balance: Optional[float] = None
    currency: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccountdailybalanceCreate(AccountdailybalanceBase):
    pass

class AccountdailybalanceUpdate(BaseModel):
    daily_balance_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    balance_date: Optional[datetime] = None
    opening_balance: Optional[float] = None
    debit_total: Optional[float] = None
    credit_total: Optional[float] = None
    closing_balance: Optional[float] = None
    currency: Optional[str] = None

class Accountdailybalance(AccountdailybalanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AccountperiodbalanceBase(BaseModel):
    period_balance_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    opening_balance: Optional[float] = None
    debit_total: Optional[float] = None
    credit_total: Optional[float] = None
    closing_balance: Optional[float] = None
    currency: Optional[str] = None
    is_adjusted: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccountperiodbalanceCreate(AccountperiodbalanceBase):
    pass

class AccountperiodbalanceUpdate(BaseModel):
    period_balance_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    opening_balance: Optional[float] = None
    debit_total: Optional[float] = None
    credit_total: Optional[float] = None
    closing_balance: Optional[float] = None
    currency: Optional[str] = None
    is_adjusted: Optional[int] = None

class Accountperiodbalance(AccountperiodbalanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AccounttypeBase(BaseModel):
    account_type_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    type_name: Optional[str] = None
    nature: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccounttypeCreate(AccounttypeBase):
    pass

class AccounttypeUpdate(BaseModel):
    account_type_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    type_name: Optional[str] = None
    nature: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Accounttype(AccounttypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AddendumBase(BaseModel):
    addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AddendumCreate(AddendumBase):
    pass

class AddendumUpdate(BaseModel):
    addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None

class Addendum(AddendumBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AddressBase(BaseModel):
    address_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    address_type_id: Optional[int] = None
    is_main: Optional[int] = None
    zip_code: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    observacao: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    address_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    address_type_id: Optional[int] = None
    is_main: Optional[int] = None
    zip_code: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    observacao: Optional[str] = None

class Address(AddressBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AddresstypeBase(BaseModel):
    address_type_id: Optional[int] = None
    name: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AddresstypeCreate(AddresstypeBase):
    pass

class AddresstypeUpdate(BaseModel):
    address_type_id: Optional[int] = None
    name: Optional[str] = None

class Addresstype(AddresstypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AgeaddendumBase(BaseModel):
    age_addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    addendum_id: Optional[int] = None
    class_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    additional_value: Optional[float] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AgeaddendumCreate(AgeaddendumBase):
    pass

class AgeaddendumUpdate(BaseModel):
    age_addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    addendum_id: Optional[int] = None
    class_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    additional_value: Optional[float] = None

class Ageaddendum(AgeaddendumBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ApierrorBase(BaseModel):
    api_error_id: Optional[int] = None
    api_timestamp: Optional[datetime]
    severity: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    error_details: Optional[str] = None
    stack_trace: Optional[str] = None
    http_method: Optional[str] = None
    endpoint: Optional[str] = None
    full_url: Optional[str] = None
    request_headers: Optional[str] = None
    request_body: Optional[str] = None
    query_parameters: Optional[str] = None
    http_status: Optional[int] = None
    response_body: Optional[str] = None
    response_time_ms: Optional[int] = None
    class_name: Optional[str] = None
    method_name: Optional[str] = None
    line_number: Optional[int] = None
    file_name: Optional[str] = None
    sys_user_id: Optional[int] = None
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    environment: Optional[str] = None
    name_server: Optional[str] = None
    is_resolved: Optional[int] = None
    resolved_at: Optional[datetime]
    resolved_by: Optional[int] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ApierrorCreate(ApierrorBase):
    pass

class ApierrorUpdate(BaseModel):
    api_error_id: Optional[int] = None
    api_timestamp: Optional[datetime] = None
    severity: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    error_details: Optional[str] = None
    stack_trace: Optional[str] = None
    http_method: Optional[str] = None
    endpoint: Optional[str] = None
    full_url: Optional[str] = None
    request_headers: Optional[str] = None
    request_body: Optional[str] = None
    query_parameters: Optional[str] = None
    http_status: Optional[int] = None
    response_body: Optional[str] = None
    response_time_ms: Optional[int] = None
    class_name: Optional[str] = None
    method_name: Optional[str] = None
    line_number: Optional[int] = None
    file_name: Optional[str] = None
    sys_user_id: Optional[int] = None
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    environment: Optional[str] = None
    name_server: Optional[str] = None
    is_resolved: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    resolution_notes: Optional[str] = None

class Apierror(ApierrorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AttributetypeBase(BaseModel):
    attribute_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    attribute_name: Optional[str] = None
    attribute_description: Optional[str] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AttributetypeCreate(AttributetypeBase):
    pass

class AttributetypeUpdate(BaseModel):
    attribute_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    attribute_name: Optional[str] = None
    attribute_description: Optional[str] = None
    is_active: Optional[int] = None

class Attributetype(AttributetypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AttributevalueBase(BaseModel):
    attribute_value_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    attribute_type_id: Optional[int] = None
    value: Optional[str] = None
    sort_order: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AttributevalueCreate(AttributevalueBase):
    pass

class AttributevalueUpdate(BaseModel):
    attribute_value_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    attribute_type_id: Optional[int] = None
    value: Optional[str] = None
    sort_order: Optional[int] = None

class Attributevalue(AttributevalueBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AuditlogBase(BaseModel):
    audit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    audit_action: Optional[str] = None
    name_table: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    process_name: Optional[str] = None
    process_parameters: Optional[str] = None
    process_outcome: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AuditlogCreate(AuditlogBase):
    pass

class AuditlogUpdate(BaseModel):
    audit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    audit_action: Optional[str] = None
    name_table: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    process_name: Optional[str] = None
    process_parameters: Optional[str] = None
    process_outcome: Optional[str] = None
    error_message: Optional[str] = None

class Auditlog(AuditlogBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AuditlogarchiveBase(BaseModel):
    audit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    audit_action: Optional[str] = None
    name_table: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    process_name: Optional[str] = None
    process_parameters: Optional[str] = None
    process_outcome: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AuditlogarchiveCreate(AuditlogarchiveBase):
    pass

class AuditlogarchiveUpdate(BaseModel):
    audit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    audit_action: Optional[str] = None
    name_table: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    process_name: Optional[str] = None
    process_parameters: Optional[str] = None
    process_outcome: Optional[str] = None
    error_message: Optional[str] = None

class Auditlogarchive(AuditlogarchiveBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BankaccountBase(BaseModel):
    bank_account_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    account_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    last_reconciled_date: Optional[datetime]
    default_for_payments: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BankaccountCreate(BankaccountBase):
    pass

class BankaccountUpdate(BaseModel):
    bank_account_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    account_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    last_reconciled_date: Optional[datetime] = None
    default_for_payments: Optional[int] = None
    active: Optional[int] = None

class Bankaccount(BankaccountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BankreconciliationBase(BaseModel):
    reconciliation_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    statement_date: Optional[datetime]
    statement_balance: Optional[float] = None
    starting_balance: Optional[float] = None
    ending_balance: Optional[float] = None
    is_reconciled: Optional[int] = None
    reconciled_date: Optional[datetime]
    reconciled_by: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BankreconciliationCreate(BankreconciliationBase):
    pass

class BankreconciliationUpdate(BaseModel):
    reconciliation_id: Optional[int] = None
    company_id: Optional[int] = None
    account_id: Optional[int] = None
    statement_date: Optional[datetime] = None
    statement_balance: Optional[float] = None
    starting_balance: Optional[float] = None
    ending_balance: Optional[float] = None
    is_reconciled: Optional[int] = None
    reconciled_date: Optional[datetime] = None
    reconciled_by: Optional[int] = None
    notes: Optional[str] = None

class Bankreconciliation(BankreconciliationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BankslipBase(BaseModel):
    bank_slip_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_charge_id: Optional[int] = None
    seq: Optional[str] = None
    nnumber: Optional[str] = None
    charge_code: Optional[str] = None
    status: Optional[str] = None
    send_at: Optional[datetime]
    send_batch: Optional[str] = None
    response_at: Optional[datetime]
    response_batch: Optional[str] = None
    response: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BankslipCreate(BankslipBase):
    pass

class BankslipUpdate(BaseModel):
    bank_slip_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_charge_id: Optional[int] = None
    seq: Optional[str] = None
    nnumber: Optional[str] = None
    charge_code: Optional[str] = None
    status: Optional[str] = None
    send_at: Optional[datetime] = None
    send_batch: Optional[str] = None
    response_at: Optional[datetime] = None
    response_batch: Optional[str] = None
    response: Optional[str] = None

class Bankslip(BankslipBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BatchchkBase(BaseModel):
    batch_chk_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    batch_number: Optional[str] = None
    detail: Optional[str] = None
    expenses: Optional[float] = None
    discharge_date: Optional[datetime]
    commiss_bill: Optional[float] = None
    qtd_other: Optional[float] = None
    vl_other: Optional[float] = None
    qtd_bill: Optional[float] = None
    vl_bill: Optional[float] = None
    payment_value: Optional[float] = None
    nrcctopay: Optional[str] = None
    cashier_number: Optional[str] = None
    ordpgrc_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BatchchkCreate(BatchchkBase):
    pass

class BatchchkUpdate(BaseModel):
    batch_chk_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    batch_number: Optional[str] = None
    detail: Optional[str] = None
    expenses: Optional[float] = None
    discharge_date: Optional[datetime] = None
    commiss_bill: Optional[float] = None
    qtd_other: Optional[float] = None
    vl_other: Optional[float] = None
    qtd_bill: Optional[float] = None
    vl_bill: Optional[float] = None
    payment_value: Optional[float] = None
    nrcctopay: Optional[str] = None
    cashier_number: Optional[str] = None
    ordpgrc_id: Optional[int] = None

class Batchchk(BatchchkBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BatchdetailBase(BaseModel):
    batch_detail_id: Optional[int] = None
    batch_chk_id: Optional[int] = None
    contract_charge_id: Optional[int] = None
    seq_number: Optional[str] = None
    billing_number: Optional[str] = None
    amount_received: Optional[float] = None
    process_status: Optional[str] = None
    payment_status_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BatchdetailCreate(BatchdetailBase):
    pass

class BatchdetailUpdate(BaseModel):
    batch_detail_id: Optional[int] = None
    batch_chk_id: Optional[int] = None
    contract_charge_id: Optional[int] = None
    seq_number: Optional[str] = None
    billing_number: Optional[str] = None
    amount_received: Optional[float] = None
    process_status: Optional[str] = None
    payment_status_id: Optional[int] = None

class Batchdetail(BatchdetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BatchtrackingBase(BaseModel):
    batch_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    batch_number: Optional[str] = None
    manufacture_date: Optional[datetime]
    expiry_date: Optional[datetime]
    initial_quantity: Optional[float] = None
    current_quantity: Optional[float] = None
    supplier_id: Optional[int] = None
    purchase_order_id: Optional[int] = None
    purchase_order_line_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BatchtrackingCreate(BatchtrackingBase):
    pass

class BatchtrackingUpdate(BaseModel):
    batch_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    batch_number: Optional[str] = None
    manufacture_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    initial_quantity: Optional[float] = None
    current_quantity: Optional[float] = None
    supplier_id: Optional[int] = None
    purchase_order_id: Optional[int] = None
    purchase_order_line_id: Optional[int] = None
    notes: Optional[str] = None

class Batchtracking(BatchtrackingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BeneficiaryBase(BaseModel):
    beneficiary_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    name: Optional[str] = None
    relationship: Optional[str] = None
    is_primary: Optional[int] = None
    birth_at: Optional[datetime]
    gender_id: Optional[int] = None
    document_id: Optional[int] = None
    grace_at: Optional[datetime]
    is_alive: Optional[int] = None
    is_forbidden: Optional[int] = None
    service_funeral_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BeneficiaryCreate(BeneficiaryBase):
    pass

class BeneficiaryUpdate(BaseModel):
    beneficiary_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    name: Optional[str] = None
    relationship: Optional[str] = None
    is_primary: Optional[int] = None
    birth_at: Optional[datetime] = None
    gender_id: Optional[int] = None
    document_id: Optional[int] = None
    grace_at: Optional[datetime] = None
    is_alive: Optional[int] = None
    is_forbidden: Optional[int] = None
    service_funeral_id: Optional[int] = None

class Beneficiary(BeneficiaryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BillingcycleBase(BaseModel):
    billing_cycle_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    death_event_count: Optional[int] = None
    charge_date: Optional[datetime]
    amount_per_contract: Optional[float] = None
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BillingcycleCreate(BillingcycleBase):
    pass

class BillingcycleUpdate(BaseModel):
    billing_cycle_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    death_event_count: Optional[int] = None
    charge_date: Optional[datetime] = None
    amount_per_contract: Optional[float] = None
    status: Optional[str] = None

class Billingcycle(BillingcycleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BillingruleBase(BaseModel):
    billing_rule_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    rule_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    condition_expression: Optional[str] = None
    charge_expression: Optional[str] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BillingruleCreate(BillingruleBase):
    pass

class BillingruleUpdate(BaseModel):
    billing_rule_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    rule_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    condition_expression: Optional[str] = None
    charge_expression: Optional[str] = None
    is_active: Optional[int] = None

class Billingrule(BillingruleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BillingruleapplicationBase(BaseModel):
    billing_rule_application_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    rule_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    applied_at: Optional[datetime]
    applied_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BillingruleapplicationCreate(BillingruleapplicationBase):
    pass

class BillingruleapplicationUpdate(BaseModel):
    billing_rule_application_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    rule_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    applied_at: Optional[datetime] = None
    applied_by: Optional[int] = None

class Billingruleapplication(BillingruleapplicationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BrandBase(BaseModel):
    brand_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    brand_name: Optional[str] = None
    brand_description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    contact_info: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    brand_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    brand_name: Optional[str] = None
    brand_description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    contact_info: Optional[str] = None

class Brand(BrandBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BudgetBase(BaseModel):
    budget_id: Optional[int] = None
    company_id: Optional[int] = None
    budget_name: Optional[str] = None
    fiscal_year_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    approval_date: Optional[datetime]
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    budget_id: Optional[int] = None
    company_id: Optional[int] = None
    budget_name: Optional[str] = None
    fiscal_year_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    approval_date: Optional[datetime] = None
    approved_by: Optional[int] = None

class Budget(BudgetBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BudgetitemBase(BaseModel):
    budget_item_id: Optional[int] = None
    budget_id: Optional[int] = None
    account_id: Optional[int] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    description: Optional[str] = None
    annual_amount: Optional[float] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BudgetitemCreate(BudgetitemBase):
    pass

class BudgetitemUpdate(BaseModel):
    budget_item_id: Optional[int] = None
    budget_id: Optional[int] = None
    account_id: Optional[int] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    description: Optional[str] = None
    annual_amount: Optional[float] = None

class Budgetitem(BudgetitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class BudgetperiodBase(BaseModel):
    budget_period_id: Optional[int] = None
    budget_item_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    amount: Optional[float] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class BudgetperiodCreate(BudgetperiodBase):
    pass

class BudgetperiodUpdate(BaseModel):
    budget_period_id: Optional[int] = None
    budget_item_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    amount: Optional[float] = None

class Budgetperiod(BudgetperiodBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    category_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount_contracts: Optional[int] = None
    is_periodic: Optional[int] = None
    purchase_value: Optional[float] = None
    number_of_parcels: Optional[int] = None
    generated_parcels: Optional[int] = None
    month_value: Optional[float] = None
    depend_value: Optional[float] = None
    number_of_month_valid: Optional[int] = None
    is_renewable: Optional[int] = None
    is_renewable_used: Optional[int] = None
    total_value: Optional[float] = None
    message1: Optional[str] = None
    message2: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    category_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount_contracts: Optional[int] = None
    is_periodic: Optional[int] = None
    purchase_value: Optional[float] = None
    number_of_parcels: Optional[int] = None
    generated_parcels: Optional[int] = None
    month_value: Optional[float] = None
    depend_value: Optional[float] = None
    number_of_month_valid: Optional[int] = None
    is_renewable: Optional[int] = None
    is_renewable_used: Optional[int] = None
    total_value: Optional[float] = None
    message1: Optional[str] = None
    message2: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CepcacheBase(BaseModel):
    cep_cache_id: Optional[int] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    neigborhood: Optional[str] = None
    ibge_code: Optional[str] = None
    uf: Optional[str] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CepcacheCreate(CepcacheBase):
    pass

class CepcacheUpdate(BaseModel):
    cep_cache_id: Optional[int] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    neigborhood: Optional[str] = None
    ibge_code: Optional[str] = None
    uf: Optional[str] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None

class Cepcache(CepcacheBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ChargeBase(BaseModel):
    charge_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    charge_number: Optional[str] = None
    pending_cases_number: Optional[int] = None
    issue_date: Optional[datetime]
    due_date: Optional[datetime]
    month_ref: Optional[str] = None
    amount: Optional[float] = None
    message: Optional[str] = None
    message1: Optional[str] = None
    message2: Optional[str] = None
    amount_issued: Optional[int] = None
    amount_paid: Optional[int] = None
    canceled: Optional[int] = None
    release_date: Optional[datetime]
    printing_date: Optional[datetime]
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ChargeCreate(ChargeBase):
    pass

class ChargeUpdate(BaseModel):
    charge_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    charge_number: Optional[str] = None
    pending_cases_number: Optional[int] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    month_ref: Optional[str] = None
    amount: Optional[float] = None
    message: Optional[str] = None
    message1: Optional[str] = None
    message2: Optional[str] = None
    amount_issued: Optional[int] = None
    amount_paid: Optional[int] = None
    canceled: Optional[int] = None
    release_date: Optional[datetime] = None
    printing_date: Optional[datetime] = None
    status: Optional[str] = None

class Charge(ChargeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CityBase(BaseModel):
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    name: Optional[str] = None
    codigo_ibge: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CityCreate(CityBase):
    pass

class CityUpdate(BaseModel):
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    name: Optional[str] = None
    codigo_ibge: Optional[str] = None

class City(CityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CommunicationchannelBase(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    is_physical: Optional[int] = None
    is_electronic: Optional[int] = None
    active: Optional[int] = None

class CommunicationchannelCreate(CommunicationchannelBase):
    pass

class CommunicationchannelUpdate(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    is_physical: Optional[int] = None
    is_electronic: Optional[int] = None
    active: Optional[int] = None

class Communicationchannel(CommunicationchannelBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CompanyBase(BaseModel):
    company_id: Optional[int] = None
    parent_company_id: Optional[int] = None
    company_name: Optional[str] = None
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None
    address_id: Optional[int] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    fiscal_year_start: Optional[datetime]
    default_currency: Optional[str] = None
    is_consolidated: Optional[int] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_id: Optional[int] = None
    parent_company_id: Optional[int] = None
    company_name: Optional[str] = None
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None
    address_id: Optional[int] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    fiscal_year_start: Optional[datetime] = None
    default_currency: Optional[str] = None
    is_consolidated: Optional[int] = None
    is_active: Optional[int] = None

class Company(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContactBase(BaseModel):
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    contact_code: Optional[str] = None
    contact_name: Optional[str] = None
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None
    contact_type_id: Optional[int] = None
    is_customer: Optional[int] = None
    is_vendor: Optional[int] = None
    is_employee: Optional[int] = None
    credit_limit: Optional[float] = None
    payment_terms: Optional[int] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    primary_contact_person: Optional[str] = None
    notes: Optional[str] = None
    receivable_account_id: Optional[int] = None
    payable_account_id: Optional[int] = None
    currency: Optional[str] = None
    tax_code_id: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    contact_code: Optional[str] = None
    contact_name: Optional[str] = None
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None
    contact_type_id: Optional[int] = None
    is_customer: Optional[int] = None
    is_vendor: Optional[int] = None
    is_employee: Optional[int] = None
    credit_limit: Optional[float] = None
    payment_terms: Optional[int] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    primary_contact_person: Optional[str] = None
    notes: Optional[str] = None
    receivable_account_id: Optional[int] = None
    payable_account_id: Optional[int] = None
    currency: Optional[str] = None
    tax_code_id: Optional[int] = None
    active: Optional[int] = None

class Contact(ContactBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContactbankaccountBase(BaseModel):
    contact_bank_id: Optional[int] = None
    contact_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    is_default: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContactbankaccountCreate(ContactbankaccountBase):
    pass

class ContactbankaccountUpdate(BaseModel):
    contact_bank_id: Optional[int] = None
    contact_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    is_default: Optional[int] = None
    active: Optional[int] = None

class Contactbankaccount(ContactbankaccountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContacttypeBase(BaseModel):
    contact_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContacttypeCreate(ContacttypeBase):
    pass

class ContacttypeUpdate(BaseModel):
    contact_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Contacttype(ContacttypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractBase(BaseModel):
    contract_id: Optional[int] = None
    current_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    owner_id: Optional[int] = None
    partner_id: Optional[int] = None
    indicated_by: Optional[int] = None
    contract_name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contract_number: Optional[str] = None
    original_contract_number: Optional[str] = None
    current_status: Optional[str] = None
    status_id: Optional[int] = None
    seller_id: Optional[int] = None
    total_value: Optional[float] = None
    installment_value: Optional[float] = None
    obs: Optional[str] = None
    services_amount: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    contract_id: Optional[int] = None
    current_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    owner_id: Optional[int] = None
    partner_id: Optional[int] = None
    indicated_by: Optional[int] = None
    contract_name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contract_number: Optional[str] = None
    original_contract_number: Optional[str] = None
    current_status: Optional[str] = None
    status_id: Optional[int] = None
    seller_id: Optional[int] = None
    total_value: Optional[float] = None
    installment_value: Optional[float] = None
    obs: Optional[str] = None
    services_amount: Optional[int] = None

class Contract(ContractBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractaccessBase(BaseModel):
    contract_access_id: Optional[int] = None
    contract_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    access_level: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractaccessCreate(ContractaccessBase):
    pass

class ContractaccessUpdate(BaseModel):
    contract_access_id: Optional[int] = None
    contract_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    access_level: Optional[str] = None

class Contractaccess(ContractaccessBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractactiveBase(BaseModel):
    contract_active_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_number: Optional[str] = None
    contract_version_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractactiveCreate(ContractactiveBase):
    pass

class ContractactiveUpdate(BaseModel):
    contract_active_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_number: Optional[str] = None
    contract_version_id: Optional[int] = None

class Contractactive(ContractactiveBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractaddendumBase(BaseModel):
    contract_addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    addendum_id: Optional[int] = None
    name: Optional[str] = None
    product_code: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractaddendumCreate(ContractaddendumBase):
    pass

class ContractaddendumUpdate(BaseModel):
    contract_addendum_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    addendum_id: Optional[int] = None
    name: Optional[str] = None
    product_code: Optional[str] = None

class Contractaddendum(ContractaddendumBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractbillingBase(BaseModel):
    contract_billing_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    cycle_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    charge_id: Optional[int] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractbillingCreate(ContractbillingBase):
    pass

class ContractbillingUpdate(BaseModel):
    contract_billing_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    cycle_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    charge_id: Optional[int] = None
    amount: Optional[float] = None
    status: Optional[str] = None

class Contractbilling(ContractbillingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractchargeBase(BaseModel):
    contract_charge_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    payment_status_id: Optional[int] = None
    charge_code: Optional[str] = None
    due_date: Optional[datetime]
    amount: Optional[float] = None
    payment_date: Optional[datetime]
    paid_amount: Optional[float] = None
    due_month: Optional[str] = None
    due_year: Optional[str] = None
    convenio: Optional[str] = None
    payd_month: Optional[str] = None
    payd_year: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractchargeCreate(ContractchargeBase):
    pass

class ContractchargeUpdate(BaseModel):
    contract_charge_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    payment_status_id: Optional[int] = None
    charge_code: Optional[str] = None
    due_date: Optional[datetime] = None
    amount: Optional[float] = None
    payment_date: Optional[datetime] = None
    paid_amount: Optional[float] = None
    due_month: Optional[str] = None
    due_year: Optional[str] = None
    convenio: Optional[str] = None
    payd_month: Optional[str] = None
    payd_year: Optional[str] = None

class Contractcharge(ContractchargeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractconfigbillingBase(BaseModel):
    contract_config_billing_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    seller_id: Optional[int] = None
    collector_id: Optional[int] = None
    region_id: Optional[int] = None
    billing_frequency: Optional[int] = None
    month_initial_billing: Optional[str] = None
    year_initial_billing: Optional[str] = None
    opt_payday: Optional[int] = None
    first_charge: Optional[int] = None
    last_charge: Optional[int] = None
    charges_amount: Optional[int] = None
    charges_paid: Optional[int] = None
    late_fee_percentage: Optional[float] = None
    is_partial_payments_allowed: Optional[int] = None
    default_plan_installments: Optional[str] = None
    default_plan_frequency: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractconfigbillingCreate(ContractconfigbillingBase):
    pass

class ContractconfigbillingUpdate(BaseModel):
    contract_config_billing_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    seller_id: Optional[int] = None
    collector_id: Optional[int] = None
    region_id: Optional[int] = None
    billing_frequency: Optional[int] = None
    month_initial_billing: Optional[str] = None
    year_initial_billing: Optional[str] = None
    opt_payday: Optional[int] = None
    first_charge: Optional[int] = None
    last_charge: Optional[int] = None
    charges_amount: Optional[int] = None
    charges_paid: Optional[int] = None
    late_fee_percentage: Optional[float] = None
    is_partial_payments_allowed: Optional[int] = None
    default_plan_installments: Optional[str] = None
    default_plan_frequency: Optional[str] = None

class Contractconfigbilling(ContractconfigbillingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractcoversBase(BaseModel):
    contract_covers_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    class_id: Optional[int] = None
    status_id: Optional[int] = None
    contract_type: Optional[str] = None
    industry: Optional[str] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    admission: Optional[datetime]
    final_grace: Optional[datetime]
    grace_period_days: Optional[str] = None
    renew_at: Optional[datetime]
    services_amount: Optional[int] = None
    service_option1: Optional[str] = None
    service_option2: Optional[str] = None
    alives: Optional[int] = None
    deceaseds: Optional[int] = None
    dependents: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractcoversCreate(ContractcoversBase):
    pass

class ContractcoversUpdate(BaseModel):
    contract_covers_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    class_id: Optional[int] = None
    status_id: Optional[int] = None
    contract_type: Optional[str] = None
    industry: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    admission: Optional[datetime] = None
    final_grace: Optional[datetime] = None
    grace_period_days: Optional[str] = None
    renew_at: Optional[datetime] = None
    services_amount: Optional[int] = None
    service_option1: Optional[str] = None
    service_option2: Optional[str] = None
    alives: Optional[int] = None
    deceaseds: Optional[int] = None
    dependents: Optional[int] = None

class Contractcovers(ContractcoversBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContracteventsBase(BaseModel):
    contract_events_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime]
    payload: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContracteventsCreate(ContracteventsBase):
    pass

class ContracteventsUpdate(BaseModel):
    contract_events_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    payload: Optional[str] = None

class Contractevents(ContracteventsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractpoolBase(BaseModel):
    contract_pool_id: Optional[int] = None
    company_id: Optional[int] = None
    batch_id: Optional[int] = None
    reserved_contract_number: Optional[str] = None
    status: Optional[str] = None
    assigned_partner_id: Optional[int] = None
    assigned_at: Optional[datetime]
    used_contract_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractpoolCreate(ContractpoolBase):
    pass

class ContractpoolUpdate(BaseModel):
    contract_pool_id: Optional[int] = None
    company_id: Optional[int] = None
    batch_id: Optional[int] = None
    reserved_contract_number: Optional[str] = None
    status: Optional[str] = None
    assigned_partner_id: Optional[int] = None
    assigned_at: Optional[datetime] = None
    used_contract_id: Optional[int] = None

class Contractpool(ContractpoolBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractstatusBase(BaseModel):
    contract_status_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    is_final_state: Optional[int] = None
    is_initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    unit_id: Optional[int] = None

class ContractstatusCreate(ContractstatusBase):
    pass

class ContractstatusUpdate(BaseModel):
    contract_status_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    is_final_state: Optional[int] = None
    is_initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    unit_id: Optional[int] = None

class Contractstatus(ContractstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractstatushistoryBase(BaseModel):
    contract_status_history_id: Optional[int] = None
    state_machine_transition_id: Optional[int] = None
    status_reason_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    contract_number: Optional[str] = None
    detail_status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractstatushistoryCreate(ContractstatushistoryBase):
    pass

class ContractstatushistoryUpdate(BaseModel):
    contract_status_history_id: Optional[int] = None
    state_machine_transition_id: Optional[int] = None
    status_reason_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    contract_number: Optional[str] = None
    detail_status: Optional[str] = None

class Contractstatushistory(ContractstatushistoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractvalidationBase(BaseModel):
    validation_id: Optional[int] = None
    contract_id: Optional[int] = None
    validated_by: Optional[int] = None
    validated_at: Optional[datetime]
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractvalidationCreate(ContractvalidationBase):
    pass

class ContractvalidationUpdate(BaseModel):
    validation_id: Optional[int] = None
    contract_id: Optional[int] = None
    validated_by: Optional[int] = None
    validated_at: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Contractvalidation(ContractvalidationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContractversionBase(BaseModel):
    contract_version_id: Optional[int] = None
    contract_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    version_number: Optional[int] = None
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    is_current: Optional[int] = None
    class_id: Optional[int] = None
    collector_id: Optional[int] = None
    region_id: Optional[int] = None
    change_reason: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ContractversionCreate(ContractversionBase):
    pass

class ContractversionUpdate(BaseModel):
    contract_version_id: Optional[int] = None
    contract_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    version_number: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    is_current: Optional[int] = None
    class_id: Optional[int] = None
    collector_id: Optional[int] = None
    region_id: Optional[int] = None
    change_reason: Optional[str] = None

class Contractversion(ContractversionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CostcenterBase(BaseModel):
    cost_center_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    parent_cost_center_id: Optional[int] = None
    cost_center_code: Optional[str] = None
    cost_center_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    budget: Optional[float] = None
    level: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CostcenterCreate(CostcenterBase):
    pass

class CostcenterUpdate(BaseModel):
    cost_center_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    parent_cost_center_id: Optional[int] = None
    cost_center_code: Optional[str] = None
    cost_center_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    budget: Optional[float] = None
    level: Optional[int] = None
    active: Optional[int] = None

class Costcenter(CostcenterBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CurrencyBase(BaseModel):
    currency_id: Optional[int] = None
    currency_code: Optional[str] = None
    currency_name: Optional[str] = None
    currency_symbol: Optional[str] = None
    decimal_places: Optional[int] = None
    rounding_method: Optional[str] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CurrencyCreate(CurrencyBase):
    pass

class CurrencyUpdate(BaseModel):
    currency_id: Optional[int] = None
    currency_code: Optional[str] = None
    currency_name: Optional[str] = None
    currency_symbol: Optional[str] = None
    decimal_places: Optional[int] = None
    rounding_method: Optional[str] = None
    active: Optional[int] = None

class Currency(CurrencyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CustomerBase(BaseModel):
    customer_id: Optional[int] = None
    company_id: Optional[int] = None
    customer_code: Optional[str] = None
    customer_name: Optional[str] = None
    customer_type: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    discount_percent: Optional[float] = None
    is_active: Optional[int] = None
    customer_since: Optional[datetime]
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_id: Optional[int] = None
    company_id: Optional[int] = None
    customer_code: Optional[str] = None
    customer_name: Optional[str] = None
    customer_type: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    discount_percent: Optional[float] = None
    is_active: Optional[int] = None
    customer_since: Optional[datetime] = None
    notes: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CustomerreturnBase(BaseModel):
    return_id: Optional[int] = None
    company_id: Optional[int] = None
    return_number: Optional[str] = None
    customer_id: Optional[int] = None
    so_id: Optional[int] = None
    shipment_id: Optional[int] = None
    return_date: Optional[datetime]
    warehouse_id: Optional[int] = None
    return_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CustomerreturnCreate(CustomerreturnBase):
    pass

class CustomerreturnUpdate(BaseModel):
    return_id: Optional[int] = None
    company_id: Optional[int] = None
    return_number: Optional[str] = None
    customer_id: Optional[int] = None
    so_id: Optional[int] = None
    shipment_id: Optional[int] = None
    return_date: Optional[datetime] = None
    warehouse_id: Optional[int] = None
    return_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Customerreturn(CustomerreturnBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CustomerreturnitemBase(BaseModel):
    return_item_id: Optional[int] = None
    return_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    shipment_id: Optional[int] = None
    shipment_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_returned: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    return_reason: Optional[str] = None
    quality_status: Optional[str] = None
    inventory_status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CustomerreturnitemCreate(CustomerreturnitemBase):
    pass

class CustomerreturnitemUpdate(BaseModel):
    return_item_id: Optional[int] = None
    return_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    shipment_id: Optional[int] = None
    shipment_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_returned: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    return_reason: Optional[str] = None
    quality_status: Optional[str] = None
    inventory_status: Optional[str] = None
    notes: Optional[str] = None

class Customerreturnitem(CustomerreturnitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DeatheventBase(BaseModel):
    death_event_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    service_funeral_id: Optional[int] = None
    event_date: Optional[datetime]
    processed_for_billing: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DeatheventCreate(DeatheventBase):
    pass

class DeatheventUpdate(BaseModel):
    death_event_id: Optional[int] = None
    group_batch_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    service_funeral_id: Optional[int] = None
    event_date: Optional[datetime] = None
    processed_for_billing: Optional[int] = None

class Deathevent(DeatheventBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DepartmentBase(BaseModel):
    department_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    parent_department_id: Optional[int] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    cost_center_id: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    department_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    parent_department_id: Optional[int] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    cost_center_id: Optional[int] = None
    active: Optional[int] = None

class Department(DepartmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    document_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    document_type_id: Optional[int] = None
    document_number: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    document_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    document_type_id: Optional[int] = None
    document_number: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class Document(DocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentbatchBase(BaseModel):
    doc_batch_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    partner_id: Optional[int] = None
    batch_type: Optional[str] = None
    status: Optional[str] = None
    closed_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DocumentbatchCreate(DocumentbatchBase):
    pass

class DocumentbatchUpdate(BaseModel):
    doc_batch_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    partner_id: Optional[int] = None
    batch_type: Optional[str] = None
    status: Optional[str] = None
    closed_at: Optional[datetime] = None

class Documentbatch(DocumentbatchBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentbatchitemBase(BaseModel):
    doc_batch_item_id: Optional[int] = None
    doc_batch_id: Optional[int] = None
    document_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    origin_batch_id: Optional[int] = None
    last_event_id: Optional[int] = None
    attempt_number: Optional[int] = None
    delivery_status: Optional[str] = None
    return_reason: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DocumentbatchitemCreate(DocumentbatchitemBase):
    pass

class DocumentbatchitemUpdate(BaseModel):
    doc_batch_item_id: Optional[int] = None
    doc_batch_id: Optional[int] = None
    document_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    origin_batch_id: Optional[int] = None
    last_event_id: Optional[int] = None
    attempt_number: Optional[int] = None
    delivery_status: Optional[str] = None
    return_reason: Optional[str] = None

class Documentbatchitem(DocumentbatchitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumenteventBase(BaseModel):
    doc_event_id: Optional[int] = None
    document_id: Optional[int] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime]
    performed_by: Optional[int] = None
    partner_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DocumenteventCreate(DocumenteventBase):
    pass

class DocumenteventUpdate(BaseModel):
    doc_event_id: Optional[int] = None
    document_id: Optional[int] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    performed_by: Optional[int] = None
    partner_id: Optional[int] = None
    notes: Optional[str] = None

class Documentevent(DocumenteventBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumenttypeBase(BaseModel):
    document_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DocumenttypeCreate(DocumenttypeBase):
    pass

class DocumenttypeUpdate(BaseModel):
    document_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Documenttype(DocumenttypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DoctosendBase(BaseModel):
    doc_to_send_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_id: Optional[int] = None
    partner_id: Optional[int] = None
    channel_id: Optional[int] = None
    document_type_id: Optional[int] = None
    status: Optional[str] = None
    destination: Optional[str] = None
    is_automated: Optional[int] = None
    generated_at: Optional[datetime]
    printed_at: Optional[datetime]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    returned_at: Optional[datetime]
    current_batch_id: Optional[int] = None
    delivery_attempts: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DoctosendCreate(DoctosendBase):
    pass

class DoctosendUpdate(BaseModel):
    doc_to_send_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_id: Optional[int] = None
    partner_id: Optional[int] = None
    channel_id: Optional[int] = None
    document_type_id: Optional[int] = None
    status: Optional[str] = None
    destination: Optional[str] = None
    is_automated: Optional[int] = None
    generated_at: Optional[datetime] = None
    printed_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    current_batch_id: Optional[int] = None
    delivery_attempts: Optional[int] = None

class Doctosend(DoctosendBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DriverBase(BaseModel):
    driver_id: Optional[int] = None
    company_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime]
    driver_status_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    driver_id: Optional[int] = None
    company_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    driver_status_id: Optional[int] = None
    notes: Optional[str] = None

class Driver(DriverBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DriverdocumentBase(BaseModel):
    driver_document_id: Optional[int] = None
    driver_id: Optional[int] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    is_primary: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DriverdocumentCreate(DriverdocumentBase):
    pass

class DriverdocumentUpdate(BaseModel):
    driver_document_id: Optional[int] = None
    driver_id: Optional[int] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    is_primary: Optional[int] = None

class Driverdocument(DriverdocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DriverstatusBase(BaseModel):
    driver_status_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class DriverstatusCreate(DriverstatusBase):
    pass

class DriverstatusUpdate(BaseModel):
    driver_status_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Driverstatus(DriverstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class EntityaddressBase(BaseModel):
    entity_address_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    address_id: Optional[int] = None
    is_primary: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class EntityaddressCreate(EntityaddressBase):
    pass

class EntityaddressUpdate(BaseModel):
    entity_address_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    address_id: Optional[int] = None
    is_primary: Optional[int] = None

class Entityaddress(EntityaddressBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class EntitydocumentBase(BaseModel):
    entity_document_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    document_id: Optional[int] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class EntitydocumentCreate(EntitydocumentBase):
    pass

class EntitydocumentUpdate(BaseModel):
    entity_document_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    document_id: Optional[int] = None
    is_active: Optional[int] = None

class Entitydocument(EntitydocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class EquipamentrentalBase(BaseModel):
    equipament_rental_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class EquipamentrentalCreate(EquipamentrentalBase):
    pass

class EquipamentrentalUpdate(BaseModel):
    equipament_rental_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None

class Equipamentrental(EquipamentrentalBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ExpensetypeBase(BaseModel):
    expense_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ExpensetypeCreate(ExpensetypeBase):
    pass

class ExpensetypeUpdate(BaseModel):
    expense_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Expensetype(ExpensetypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FinancialratioBase(BaseModel):
    ratio_id: Optional[int] = None
    company_id: Optional[int] = None
    ratio_code: Optional[str] = None
    ratio_name: Optional[str] = None
    description: Optional[str] = None
    formula: Optional[str] = None
    target_value: Optional[float] = None
    display_order: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class FinancialratioCreate(FinancialratioBase):
    pass

class FinancialratioUpdate(BaseModel):
    ratio_id: Optional[int] = None
    company_id: Optional[int] = None
    ratio_code: Optional[str] = None
    ratio_name: Optional[str] = None
    description: Optional[str] = None
    formula: Optional[str] = None
    target_value: Optional[float] = None
    display_order: Optional[int] = None
    active: Optional[int] = None

class Financialratio(FinancialratioBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FinancialratiovalueBase(BaseModel):
    value_id: Optional[int] = None
    ratio_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    ratio_value: Optional[float] = None
    calculation_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class FinancialratiovalueCreate(FinancialratiovalueBase):
    pass

class FinancialratiovalueUpdate(BaseModel):
    value_id: Optional[int] = None
    ratio_id: Optional[int] = None
    fiscal_period_id: Optional[int] = None
    ratio_value: Optional[float] = None
    calculation_date: Optional[datetime] = None

class Financialratiovalue(FinancialratiovalueBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FiscalperiodBase(BaseModel):
    fiscal_period_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    period_name: Optional[str] = None
    period_number: Optional[int] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_adjustment: Optional[int] = None
    is_closed: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class FiscalperiodCreate(FiscalperiodBase):
    pass

class FiscalperiodUpdate(BaseModel):
    fiscal_period_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    period_name: Optional[str] = None
    period_number: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_adjustment: Optional[int] = None
    is_closed: Optional[int] = None

class Fiscalperiod(FiscalperiodBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FiscalyearBase(BaseModel):
    fiscal_year_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    year_name: Optional[str] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_closed: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class FiscalyearCreate(FiscalyearBase):
    pass

class FiscalyearUpdate(BaseModel):
    fiscal_year_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    year_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_closed: Optional[int] = None

class Fiscalyear(FiscalyearBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class GenderBase(BaseModel):
    gender_id: Optional[int] = None
    name: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class GenderCreate(GenderBase):
    pass

class GenderUpdate(BaseModel):
    gender_id: Optional[int] = None
    name: Optional[str] = None

class Gender(GenderBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class GoodsreceiptBase(BaseModel):
    receipt_id: Optional[int] = None
    company_id: Optional[int] = None
    receipt_number: Optional[str] = None
    po_id: Optional[int] = None
    supplier_id: Optional[int] = None
    receipt_date: Optional[datetime]
    delivery_note_number: Optional[str] = None
    warehouse_id: Optional[int] = None
    received_by: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class GoodsreceiptCreate(GoodsreceiptBase):
    pass

class GoodsreceiptUpdate(BaseModel):
    receipt_id: Optional[int] = None
    company_id: Optional[int] = None
    receipt_number: Optional[str] = None
    po_id: Optional[int] = None
    supplier_id: Optional[int] = None
    receipt_date: Optional[datetime] = None
    delivery_note_number: Optional[str] = None
    warehouse_id: Optional[int] = None
    received_by: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Goodsreceipt(GoodsreceiptBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class GoodsreceiptitemBase(BaseModel):
    receipt_item_id: Optional[int] = None
    receipt_id: Optional[int] = None
    po_id: Optional[int] = None
    po_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_expected: Optional[float] = None
    quantity_received: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime]
    quality_check_status: Optional[str] = None
    quality_check_notes: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class GoodsreceiptitemCreate(GoodsreceiptitemBase):
    pass

class GoodsreceiptitemUpdate(BaseModel):
    receipt_item_id: Optional[int] = None
    receipt_id: Optional[int] = None
    po_id: Optional[int] = None
    po_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_expected: Optional[float] = None
    quantity_received: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    quality_check_status: Optional[str] = None
    quality_check_notes: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Goodsreceiptitem(GoodsreceiptitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class GroupbatchBase(BaseModel):
    group_batch_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    class_id: Optional[int] = None
    name: Optional[str] = None
    group_code: Optional[str] = None
    begin_code: Optional[str] = None
    final_code: Optional[str] = None
    is_periodic: Optional[int] = None
    amount_process: Optional[int] = None
    min_proc: Optional[int] = None
    max_proc: Optional[int] = None
    compare_admission: Optional[int] = None
    amount_redeem: Optional[int] = None
    by_service: Optional[int] = None
    death_count: Optional[int] = None
    current_death_count: Optional[int] = None
    death_threshold: Optional[int] = None
    last_billing_number: Optional[str] = None
    next_billing_number: Optional[str] = None
    last_issue_date: Optional[datetime]
    last_death_charge_date: Optional[datetime]
    pending_process: Optional[int] = None
    number_contracts: Optional[int] = None
    number_lifes: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class GroupbatchCreate(GroupbatchBase):
    pass

class GroupbatchUpdate(BaseModel):
    group_batch_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    class_id: Optional[int] = None
    name: Optional[str] = None
    group_code: Optional[str] = None
    begin_code: Optional[str] = None
    final_code: Optional[str] = None
    is_periodic: Optional[int] = None
    amount_process: Optional[int] = None
    min_proc: Optional[int] = None
    max_proc: Optional[int] = None
    compare_admission: Optional[int] = None
    amount_redeem: Optional[int] = None
    by_service: Optional[int] = None
    death_count: Optional[int] = None
    current_death_count: Optional[int] = None
    death_threshold: Optional[int] = None
    last_billing_number: Optional[str] = None
    next_billing_number: Optional[str] = None
    last_issue_date: Optional[datetime] = None
    last_death_charge_date: Optional[datetime] = None
    pending_process: Optional[int] = None
    number_contracts: Optional[int] = None
    number_lifes: Optional[int] = None

class Groupbatch(GroupbatchBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class IntegrationmappingBase(BaseModel):
    mapping_id: Optional[int] = None
    integration_id: Optional[int] = None
    entity_type: Optional[str] = None
    local_entity_id: Optional[str] = None
    remote_entity_id: Optional[str] = None
    mapping_direction: Optional[str] = None
    additional_data: Optional[str] = None
    last_sync_time: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class IntegrationmappingCreate(IntegrationmappingBase):
    pass

class IntegrationmappingUpdate(BaseModel):
    mapping_id: Optional[int] = None
    integration_id: Optional[int] = None
    entity_type: Optional[str] = None
    local_entity_id: Optional[str] = None
    remote_entity_id: Optional[str] = None
    mapping_direction: Optional[str] = None
    additional_data: Optional[str] = None
    last_sync_time: Optional[datetime] = None

class Integrationmapping(IntegrationmappingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class IntegrationsettingBase(BaseModel):
    integration_id: Optional[int] = None
    company_id: Optional[int] = None
    integration_name: Optional[str] = None
    integration_type: Optional[str] = None
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    api_username: Optional[str] = None
    api_password: Optional[str] = None
    oauth_token: Optional[str] = None
    token_expires_at: Optional[datetime]
    last_sync_time: Optional[datetime]
    sync_frequency: Optional[str] = None
    configuration_json: Optional[str] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class IntegrationsettingCreate(IntegrationsettingBase):
    pass

class IntegrationsettingUpdate(BaseModel):
    integration_id: Optional[int] = None
    company_id: Optional[int] = None
    integration_name: Optional[str] = None
    integration_type: Optional[str] = None
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    api_username: Optional[str] = None
    api_password: Optional[str] = None
    oauth_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    last_sync_time: Optional[datetime] = None
    sync_frequency: Optional[str] = None
    configuration_json: Optional[str] = None
    active: Optional[int] = None

class Integrationsetting(IntegrationsettingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class IntegrationsynclogBase(BaseModel):
    log_id: Optional[int] = None
    integration_id: Optional[int] = None
    sync_start_time: Optional[datetime]
    sync_end_time: Optional[datetime]
    status: Optional[str] = None
    records_processed: Optional[int] = None
    records_created: Optional[int] = None
    records_updated: Optional[int] = None
    records_failed: Optional[int] = None
    error_message: Optional[str] = None
    details: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class IntegrationsynclogCreate(IntegrationsynclogBase):
    pass

class IntegrationsynclogUpdate(BaseModel):
    log_id: Optional[int] = None
    integration_id: Optional[int] = None
    sync_start_time: Optional[datetime] = None
    sync_end_time: Optional[datetime] = None
    status: Optional[str] = None
    records_processed: Optional[int] = None
    records_created: Optional[int] = None
    records_updated: Optional[int] = None
    records_failed: Optional[int] = None
    error_message: Optional[str] = None
    details: Optional[str] = None

class Integrationsynclog(IntegrationsynclogBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class InventoryadjustmentBase(BaseModel):
    adjustment_id: Optional[int] = None
    company_id: Optional[int] = None
    adjustment_number: Optional[str] = None
    warehouse_id: Optional[int] = None
    adjustment_date: Optional[datetime]
    adjustment_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class InventoryadjustmentCreate(InventoryadjustmentBase):
    pass

class InventoryadjustmentUpdate(BaseModel):
    adjustment_id: Optional[int] = None
    company_id: Optional[int] = None
    adjustment_number: Optional[str] = None
    warehouse_id: Optional[int] = None
    adjustment_date: Optional[datetime] = None
    adjustment_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Inventoryadjustment(InventoryadjustmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class InventoryadjustmentitemBase(BaseModel):
    adjustment_item_id: Optional[int] = None
    adjustment_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity_before: Optional[float] = None
    quantity_after: Optional[float] = None
    adjustment_quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    reason_code: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class InventoryadjustmentitemCreate(InventoryadjustmentitemBase):
    pass

class InventoryadjustmentitemUpdate(BaseModel):
    adjustment_item_id: Optional[int] = None
    adjustment_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity_before: Optional[float] = None
    quantity_after: Optional[float] = None
    adjustment_quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    reason_code: Optional[str] = None
    notes: Optional[str] = None

class Inventoryadjustmentitem(InventoryadjustmentitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class JournalBase(BaseModel):
    journal_id: Optional[int] = None
    company_id: Optional[int] = None
    journal_type_id: Optional[int] = None
    journal_number: Optional[str] = None
    reference_number: Optional[str] = None
    journal_date: Optional[datetime]
    fiscal_period_id: Optional[int] = None
    description: Optional[str] = None
    currency: Optional[str] = None
    exchange_rate: Optional[float] = None
    total_amount: Optional[float] = None
    is_recurring: Optional[int] = None
    recurrence_pattern: Optional[str] = None
    next_recurrence_date: Optional[datetime]
    status: Optional[str] = None
    is_intercompany: Optional[int] = None
    related_company_id: Optional[int] = None
    posted_date: Optional[datetime]
    posted_by: Optional[int] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class JournalCreate(JournalBase):
    pass

class JournalUpdate(BaseModel):
    journal_id: Optional[int] = None
    company_id: Optional[int] = None
    journal_type_id: Optional[int] = None
    journal_number: Optional[str] = None
    reference_number: Optional[str] = None
    journal_date: Optional[datetime] = None
    fiscal_period_id: Optional[int] = None
    description: Optional[str] = None
    currency: Optional[str] = None
    exchange_rate: Optional[float] = None
    total_amount: Optional[float] = None
    is_recurring: Optional[int] = None
    recurrence_pattern: Optional[str] = None
    next_recurrence_date: Optional[datetime] = None
    status: Optional[str] = None
    is_intercompany: Optional[int] = None
    related_company_id: Optional[int] = None
    posted_date: Optional[datetime] = None
    posted_by: Optional[int] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Journal(JournalBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class JournalattachmentBase(BaseModel):
    attachment_id: Optional[int] = None
    journal_id: Optional[int] = None
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    description: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class JournalattachmentCreate(JournalattachmentBase):
    pass

class JournalattachmentUpdate(BaseModel):
    attachment_id: Optional[int] = None
    journal_id: Optional[int] = None
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    description: Optional[str] = None
    uploaded_by: Optional[int] = None

class Journalattachment(JournalattachmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class JournallineBase(BaseModel):
    journal_line_id: Optional[int] = None
    journal_id: Optional[int] = None
    line_number: Optional[int] = None
    account_id: Optional[int] = None
    description: Optional[str] = None
    debit_amount: Optional[float] = None
    credit_amount: Optional[float] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    contact_id: Optional[int] = None
    tax_code_id: Optional[int] = None
    tax_amount: Optional[float] = None
    reference: Optional[str] = None
    reconciled: Optional[int] = None
    reconciliation_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class JournallineCreate(JournallineBase):
    pass

class JournallineUpdate(BaseModel):
    journal_line_id: Optional[int] = None
    journal_id: Optional[int] = None
    line_number: Optional[int] = None
    account_id: Optional[int] = None
    description: Optional[str] = None
    debit_amount: Optional[float] = None
    credit_amount: Optional[float] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    contact_id: Optional[int] = None
    tax_code_id: Optional[int] = None
    tax_amount: Optional[float] = None
    reference: Optional[str] = None
    reconciled: Optional[int] = None
    reconciliation_date: Optional[datetime] = None

class Journalline(JournallineBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class JournaltypeBase(BaseModel):
    journal_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    auto_numbering: Optional[int] = None
    number_prefix: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class JournaltypeCreate(JournaltypeBase):
    pass

class JournaltypeUpdate(BaseModel):
    journal_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    auto_numbering: Optional[int] = None
    number_prefix: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Journaltype(JournaltypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class LogeventtypeBase(BaseModel):
    log_event_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_incident: Optional[int] = None
    requires_odometer: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class LogeventtypeCreate(LogeventtypeBase):
    pass

class LogeventtypeUpdate(BaseModel):
    log_event_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_incident: Optional[int] = None
    requires_odometer: Optional[int] = None

class Logeventtype(LogeventtypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MaintenanceBase(BaseModel):
    maintenance_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    service_type_id: Optional[int] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime]
    completion_date: Optional[datetime]
    cost: Optional[float] = None
    service_provider: Optional[str] = None
    maintenance_status_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    maintenance_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    service_type_id: Optional[int] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    cost: Optional[float] = None
    service_provider: Optional[str] = None
    maintenance_status_id: Optional[int] = None
    notes: Optional[str] = None

class Maintenance(MaintenanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MaintenancedocumentBase(BaseModel):
    maintenance_document_id: Optional[int] = None
    maintenance_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class MaintenancedocumentCreate(MaintenancedocumentBase):
    pass

class MaintenancedocumentUpdate(BaseModel):
    maintenance_document_id: Optional[int] = None
    maintenance_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None

class Maintenancedocument(MaintenancedocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MaintenancestatusBase(BaseModel):
    maintenance_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class MaintenancestatusCreate(MaintenancestatusBase):
    pass

class MaintenancestatusUpdate(BaseModel):
    maintenance_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Maintenancestatus(MaintenancestatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MedicalfowardBase(BaseModel):
    medical_foward_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    partner_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    observation: Optional[str] = None
    val_payment: Optional[float] = None
    val_aux: Optional[float] = None
    due_date: Optional[datetime]
    cashier_number: Optional[str] = None
    method_pay: Optional[str] = None
    obs_pay: Optional[str] = None
    ordpgrc_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class MedicalfowardCreate(MedicalfowardBase):
    pass

class MedicalfowardUpdate(BaseModel):
    medical_foward_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    partner_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    observation: Optional[str] = None
    val_payment: Optional[float] = None
    val_aux: Optional[float] = None
    due_date: Optional[datetime] = None
    cashier_number: Optional[str] = None
    method_pay: Optional[str] = None
    obs_pay: Optional[str] = None
    ordpgrc_id: Optional[int] = None

class Medicalfoward(MedicalfowardBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MembershipcardBase(BaseModel):
    membership_card_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    card_cod: Optional[str] = None
    vencimento: Optional[str] = None
    observacao: Optional[str] = None
    importado_at: Optional[datetime]
    exportado_at: Optional[datetime]
    retorno_at: Optional[datetime]
    entregue_at: Optional[datetime]
    valor: Optional[float] = None
    pago_at: Optional[datetime]
    numop: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class MembershipcardCreate(MembershipcardBase):
    pass

class MembershipcardUpdate(BaseModel):
    membership_card_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    card_cod: Optional[str] = None
    vencimento: Optional[str] = None
    observacao: Optional[str] = None
    importado_at: Optional[datetime] = None
    exportado_at: Optional[datetime] = None
    retorno_at: Optional[datetime] = None
    entregue_at: Optional[datetime] = None
    valor: Optional[float] = None
    pago_at: Optional[datetime] = None
    numop: Optional[str] = None

class Membershipcard(MembershipcardBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MessagetemplateBase(BaseModel):
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    channel_id: Optional[int] = None
    subject: Optional[str] = None
    message_text: Optional[str] = None
    active: Optional[int] = None

class MessagetemplateCreate(MessagetemplateBase):
    pass

class MessagetemplateUpdate(BaseModel):
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    channel_id: Optional[int] = None
    subject: Optional[str] = None
    message_text: Optional[str] = None
    active: Optional[int] = None

class Messagetemplate(MessagetemplateBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class OrdpgrcBase(BaseModel):
    ordpgrc_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_user_name: Optional[str] = None
    order_number: Optional[str] = None
    order_date: Optional[datetime]
    total_amount: Optional[float] = None
    number_receipt: Optional[int] = None
    closing_date: Optional[datetime]
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class OrdpgrcCreate(OrdpgrcBase):
    pass

class OrdpgrcUpdate(BaseModel):
    ordpgrc_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_user_name: Optional[str] = None
    order_number: Optional[str] = None
    order_date: Optional[datetime] = None
    total_amount: Optional[float] = None
    number_receipt: Optional[int] = None
    closing_date: Optional[datetime] = None
    status: Optional[str] = None

class Ordpgrc(OrdpgrcBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PartnerBase(BaseModel):
    partner_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    owner_id: Optional[int] = None
    partner_code: Optional[str] = None
    partner_name: Optional[str] = None
    legal_name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    tax_id: Optional[str] = None
    partner_type_id: Optional[int] = None
    is_customer: Optional[int] = None
    is_vendor: Optional[int] = None
    is_collector: Optional[int] = None
    is_employee: Optional[int] = None
    is_accredited: Optional[int] = None
    specialty_id: Optional[int] = None
    advantages: Optional[str] = None
    observation: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms: Optional[int] = None
    billing_address_id: Optional[int] = None
    shipping_address_id: Optional[int] = None
    document1_id: Optional[int] = None
    document2_id: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    primary_partner_person: Optional[str] = None
    notes: Optional[str] = None
    receivable_account_id: Optional[int] = None
    payable_account_id: Optional[int] = None
    currency: Optional[str] = None
    tax_code_id: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    is_customer_flag: Optional[int] = None
    is_vendor_flag: Optional[int] = None

class PartnerCreate(PartnerBase):
    pass

class PartnerUpdate(BaseModel):
    partner_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    owner_id: Optional[int] = None
    partner_code: Optional[str] = None
    partner_name: Optional[str] = None
    legal_name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    tax_id: Optional[str] = None
    partner_type_id: Optional[int] = None
    is_customer: Optional[int] = None
    is_vendor: Optional[int] = None
    is_collector: Optional[int] = None
    is_employee: Optional[int] = None
    is_accredited: Optional[int] = None
    specialty_id: Optional[int] = None
    advantages: Optional[str] = None
    observation: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms: Optional[int] = None
    billing_address_id: Optional[int] = None
    shipping_address_id: Optional[int] = None
    document1_id: Optional[int] = None
    document2_id: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    primary_partner_person: Optional[str] = None
    notes: Optional[str] = None
    receivable_account_id: Optional[int] = None
    payable_account_id: Optional[int] = None
    currency: Optional[str] = None
    tax_code_id: Optional[int] = None
    active: Optional[int] = None
    is_customer_flag: Optional[int] = None
    is_vendor_flag: Optional[int] = None

class Partner(PartnerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PartnerbankaccountBase(BaseModel):
    partner_bank_account_id: Optional[int] = None
    partner_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    is_default: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PartnerbankaccountCreate(PartnerbankaccountBase):
    pass

class PartnerbankaccountUpdate(BaseModel):
    partner_bank_account_id: Optional[int] = None
    partner_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    bank_address: Optional[str] = None
    account_holder: Optional[str] = None
    account_type: Optional[str] = None
    is_default: Optional[int] = None
    active: Optional[int] = None

class Partnerbankaccount(PartnerbankaccountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PartnertypeBase(BaseModel):
    partner_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PartnertypeCreate(PartnertypeBase):
    pass

class PartnertypeUpdate(BaseModel):
    partner_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Partnertype(PartnertypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentmethodBase(BaseModel):
    payment_method_id: Optional[int] = None
    company_id: Optional[int] = None
    method_code: Optional[str] = None
    method_name: Optional[str] = None
    description: Optional[str] = None
    is_electronic: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymentmethodCreate(PaymentmethodBase):
    pass

class PaymentmethodUpdate(BaseModel):
    payment_method_id: Optional[int] = None
    company_id: Optional[int] = None
    method_code: Optional[str] = None
    method_name: Optional[str] = None
    description: Optional[str] = None
    is_electronic: Optional[int] = None
    active: Optional[int] = None

class Paymentmethod(PaymentmethodBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentplanBase(BaseModel):
    payment_plan_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    plan_name: Optional[str] = None
    total_amount: Optional[float] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymentplanCreate(PaymentplanBase):
    pass

class PaymentplanUpdate(BaseModel):
    payment_plan_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    plan_name: Optional[str] = None
    total_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class Paymentplan(PaymentplanBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentplaninstallmentBase(BaseModel):
    payment_plan_installment_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    plan_id: Optional[int] = None
    due_date: Optional[datetime]
    amount: Optional[float] = None
    status: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_date: Optional[datetime]
    charge_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymentplaninstallmentCreate(PaymentplaninstallmentBase):
    pass

class PaymentplaninstallmentUpdate(BaseModel):
    payment_plan_installment_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    plan_id: Optional[int] = None
    due_date: Optional[datetime] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_date: Optional[datetime] = None
    charge_id: Optional[int] = None

class Paymentplaninstallment(PaymentplaninstallmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentreceiptBase(BaseModel):
    payment_receipt_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    status: Optional[str] = None
    billing_number: Optional[str] = None
    val_payment: Optional[float] = None
    val_aux: Optional[float] = None
    due_date: Optional[datetime]
    cashier_number: Optional[str] = None
    method_pay: Optional[str] = None
    obs_pay: Optional[str] = None
    ordpgrc_id: Optional[int] = None
    payment_status_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymentreceiptCreate(PaymentreceiptBase):
    pass

class PaymentreceiptUpdate(BaseModel):
    payment_receipt_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    status: Optional[str] = None
    billing_number: Optional[str] = None
    val_payment: Optional[float] = None
    val_aux: Optional[float] = None
    due_date: Optional[datetime] = None
    cashier_number: Optional[str] = None
    method_pay: Optional[str] = None
    obs_pay: Optional[str] = None
    ordpgrc_id: Optional[int] = None
    payment_status_id: Optional[int] = None

class Paymentreceipt(PaymentreceiptBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentstatusBase(BaseModel):
    payment_status_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymentstatusCreate(PaymentstatusBase):
    pass

class PaymentstatusUpdate(BaseModel):
    payment_status_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None

class Paymentstatus(PaymentstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymenttransactionBase(BaseModel):
    payment_transaction_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    charge_id: Optional[int] = None
    installment_id: Optional[int] = None
    amount: Optional[float] = None
    payment_date: Optional[datetime]
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PaymenttransactionCreate(PaymenttransactionBase):
    pass

class PaymenttransactionUpdate(BaseModel):
    payment_transaction_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    charge_id: Optional[int] = None
    installment_id: Optional[int] = None
    amount: Optional[float] = None
    payment_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Paymenttransaction(PaymenttransactionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PerformedserviceBase(BaseModel):
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    service_type_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PerformedserviceCreate(PerformedserviceBase):
    pass

class PerformedserviceUpdate(BaseModel):
    performed_service_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    service_type_id: Optional[int] = None

class Performedservice(PerformedserviceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    product_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    purchase_uom_id: Optional[int] = None
    sales_uom_id: Optional[int] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    hs_code: Optional[str] = None
    weight: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    weight_uom_id: Optional[int] = None
    dim_uom_id: Optional[int] = None
    is_active: Optional[int] = None
    is_sellable: Optional[int] = None
    is_purchasable: Optional[int] = None
    has_variations: Optional[int] = None
    min_purchase_qty: Optional[float] = None
    lead_time: Optional[int] = None
    shelf_life: Optional[int] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None
    is_deleted: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    purchase_uom_id: Optional[int] = None
    sales_uom_id: Optional[int] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    hs_code: Optional[str] = None
    weight: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    weight_uom_id: Optional[int] = None
    dim_uom_id: Optional[int] = None
    is_active: Optional[int] = None
    is_sellable: Optional[int] = None
    is_purchasable: Optional[int] = None
    has_variations: Optional[int] = None
    min_purchase_qty: Optional[float] = None
    lead_time: Optional[int] = None
    shelf_life: Optional[int] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None
    is_deleted: Optional[int] = None

class Product(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductcategoryBase(BaseModel):
    category_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    parent_category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductcategoryCreate(ProductcategoryBase):
    pass

class ProductcategoryUpdate(BaseModel):
    category_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    parent_category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_description: Optional[str] = None

class Productcategory(ProductcategoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductimageBase(BaseModel):
    image_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_primary: Optional[int] = None
    alt_text: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductimageCreate(ProductimageBase):
    pass

class ProductimageUpdate(BaseModel):
    image_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_primary: Optional[int] = None
    alt_text: Optional[str] = None

class Productimage(ProductimageBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductpricingBase(BaseModel):
    price_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    price_list_name: Optional[str] = None
    currency_code: Optional[str] = None
    cost_price: Optional[float] = None
    list_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    retail_price: Optional[float] = None
    minimum_price: Optional[float] = None
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductpricingCreate(ProductpricingBase):
    pass

class ProductpricingUpdate(BaseModel):
    price_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    price_list_name: Optional[str] = None
    currency_code: Optional[str] = None
    cost_price: Optional[float] = None
    list_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    retail_price: Optional[float] = None
    minimum_price: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    is_active: Optional[int] = None

class Productpricing(ProductpricingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductsupplierBase(BaseModel):
    product_supplier_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    supplier_id: Optional[int] = None
    supplier_product_code: Optional[str] = None
    supplier_product_name: Optional[str] = None
    is_preferred_supplier: Optional[int] = None
    min_order_qty: Optional[float] = None
    purchase_uom_id: Optional[int] = None
    lead_time: Optional[int] = None
    price: Optional[float] = None
    currency_code: Optional[str] = None
    last_purchase_date: Optional[datetime]
    last_purchase_price: Optional[float] = None
    supplier_rating: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductsupplierCreate(ProductsupplierBase):
    pass

class ProductsupplierUpdate(BaseModel):
    product_supplier_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    supplier_id: Optional[int] = None
    supplier_product_code: Optional[str] = None
    supplier_product_name: Optional[str] = None
    is_preferred_supplier: Optional[int] = None
    min_order_qty: Optional[float] = None
    purchase_uom_id: Optional[int] = None
    lead_time: Optional[int] = None
    price: Optional[float] = None
    currency_code: Optional[str] = None
    last_purchase_date: Optional[datetime] = None
    last_purchase_price: Optional[float] = None
    supplier_rating: Optional[int] = None
    notes: Optional[str] = None

class Productsupplier(ProductsupplierBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductvariationBase(BaseModel):
    variation_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    is_active: Optional[int] = None
    additional_cost: Optional[float] = None
    additional_price: Optional[float] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProductvariationCreate(ProductvariationBase):
    pass

class ProductvariationUpdate(BaseModel):
    variation_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    is_active: Optional[int] = None
    additional_cost: Optional[float] = None
    additional_price: Optional[float] = None

class Productvariation(ProductvariationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    project_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    budget: Optional[float] = None
    status: Optional[str] = None
    completion_percentage: Optional[float] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    company_id: Optional[int] = None
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    manager_name: Optional[str] = None
    cost_center_id: Optional[int] = None
    department_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    completion_percentage: Optional[float] = None
    active: Optional[int] = None

class Project(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProratedserviceBase(BaseModel):
    prorated_service_id: Optional[int] = None
    charge_id: Optional[int] = None
    service_funeral_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ProratedserviceCreate(ProratedserviceBase):
    pass

class ProratedserviceUpdate(BaseModel):
    prorated_service_id: Optional[int] = None
    charge_id: Optional[int] = None
    service_funeral_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None

class Proratedservice(ProratedserviceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PurchaseorderBase(BaseModel):
    po_id: Optional[int] = None
    company_id: Optional[int] = None
    po_number: Optional[str] = None
    supplier_id: Optional[int] = None
    quotation_id: Optional[int] = None
    po_date: Optional[datetime]
    expected_delivery_date: Optional[datetime]
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    status: Optional[str] = None
    approval_date: Optional[datetime]
    approved_by: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PurchaseorderCreate(PurchaseorderBase):
    pass

class PurchaseorderUpdate(BaseModel):
    po_id: Optional[int] = None
    company_id: Optional[int] = None
    po_number: Optional[str] = None
    supplier_id: Optional[int] = None
    quotation_id: Optional[int] = None
    po_date: Optional[datetime] = None
    expected_delivery_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    status: Optional[str] = None
    approval_date: Optional[datetime] = None
    approved_by: Optional[int] = None
    notes: Optional[str] = None

class Purchaseorder(PurchaseorderBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PurchaseorderitemBase(BaseModel):
    po_item_id: Optional[int] = None
    po_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    requisition_id: Optional[int] = None
    requisition_item_id: Optional[int] = None
    quotation_item_id: Optional[int] = None
    supplier_product_code: Optional[str] = None
    supplier_product_name: Optional[str] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    expected_delivery_date: Optional[datetime]
    quantity_received: Optional[float] = None
    quantity_returned: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PurchaseorderitemCreate(PurchaseorderitemBase):
    pass

class PurchaseorderitemUpdate(BaseModel):
    po_item_id: Optional[int] = None
    po_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    requisition_id: Optional[int] = None
    requisition_item_id: Optional[int] = None
    quotation_item_id: Optional[int] = None
    supplier_product_code: Optional[str] = None
    supplier_product_name: Optional[str] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    expected_delivery_date: Optional[datetime] = None
    quantity_received: Optional[float] = None
    quantity_returned: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Purchaseorderitem(PurchaseorderitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PurchaserequisitionBase(BaseModel):
    requisition_id: Optional[int] = None
    company_id: Optional[int] = None
    requisition_number: Optional[str] = None
    requester_id: Optional[int] = None
    department: Optional[str] = None
    request_date: Optional[datetime]
    required_date: Optional[datetime]
    warehouse_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    approved_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PurchaserequisitionCreate(PurchaserequisitionBase):
    pass

class PurchaserequisitionUpdate(BaseModel):
    requisition_id: Optional[int] = None
    company_id: Optional[int] = None
    requisition_number: Optional[str] = None
    requester_id: Optional[int] = None
    department: Optional[str] = None
    request_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    warehouse_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    approved_date: Optional[datetime] = None

class Purchaserequisition(PurchaserequisitionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PurchaserequisitionitemBase(BaseModel):
    req_item_id: Optional[int] = None
    requisition_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    estimated_unit_price: Optional[float] = None
    estimated_total_price: Optional[float] = None
    required_date: Optional[datetime]
    preferred_supplier_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class PurchaserequisitionitemCreate(PurchaserequisitionitemBase):
    pass

class PurchaserequisitionitemUpdate(BaseModel):
    req_item_id: Optional[int] = None
    requisition_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    estimated_unit_price: Optional[float] = None
    estimated_total_price: Optional[float] = None
    required_date: Optional[datetime] = None
    preferred_supplier_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Purchaserequisitionitem(PurchaserequisitionitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ReconciliationitemBase(BaseModel):
    item_id: Optional[int] = None
    reconciliation_id: Optional[int] = None
    journal_line_id: Optional[int] = None
    transaction_id: Optional[int] = None
    transaction_date: Optional[datetime]
    description: Optional[str] = None
    amount: Optional[float] = None
    is_matched: Optional[int] = None
    matched_date: Optional[datetime]
    matched_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReconciliationitemCreate(ReconciliationitemBase):
    pass

class ReconciliationitemUpdate(BaseModel):
    item_id: Optional[int] = None
    reconciliation_id: Optional[int] = None
    journal_line_id: Optional[int] = None
    transaction_id: Optional[int] = None
    transaction_date: Optional[datetime] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    is_matched: Optional[int] = None
    matched_date: Optional[datetime] = None
    matched_by: Optional[int] = None

class Reconciliationitem(ReconciliationitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class RegionBase(BaseModel):
    region_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class RegionCreate(RegionBase):
    pass

class RegionUpdate(BaseModel):
    region_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    sys_unit_id: Optional[int] = None

class Region(RegionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ReportdefinitionBase(BaseModel):
    report_id: Optional[int] = None
    company_id: Optional[int] = None
    report_code: Optional[str] = None
    report_name: Optional[str] = None
    report_type: Optional[str] = None
    description: Optional[str] = None
    report_query: Optional[str] = None
    parameters: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReportdefinitionCreate(ReportdefinitionBase):
    pass

class ReportdefinitionUpdate(BaseModel):
    report_id: Optional[int] = None
    company_id: Optional[int] = None
    report_code: Optional[str] = None
    report_name: Optional[str] = None
    report_type: Optional[str] = None
    description: Optional[str] = None
    report_query: Optional[str] = None
    parameters: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Reportdefinition(ReportdefinitionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class RequestforquotationBase(BaseModel):
    rfq_id: Optional[int] = None
    company_id: Optional[int] = None
    rfq_number: Optional[str] = None
    rfq_date: Optional[datetime]
    due_date: Optional[datetime]
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class RequestforquotationCreate(RequestforquotationBase):
    pass

class RequestforquotationUpdate(BaseModel):
    rfq_id: Optional[int] = None
    company_id: Optional[int] = None
    rfq_number: Optional[str] = None
    rfq_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Requestforquotation(RequestforquotationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class RfqitemBase(BaseModel):
    rfq_item_id: Optional[int] = None
    rfq_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    required_date: Optional[datetime]
    requisition_id: Optional[int] = None
    requisition_item_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class RfqitemCreate(RfqitemBase):
    pass

class RfqitemUpdate(BaseModel):
    rfq_item_id: Optional[int] = None
    rfq_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    required_date: Optional[datetime] = None
    requisition_id: Optional[int] = None
    requisition_item_id: Optional[int] = None
    notes: Optional[str] = None

class Rfqitem(RfqitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class RfqsupplierBase(BaseModel):
    rfq_supplier_id: Optional[int] = None
    rfq_id: Optional[int] = None
    supplier_id: Optional[int] = None
    sent_date: Optional[datetime]
    response_due_date: Optional[datetime]
    response_date: Optional[datetime]
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class RfqsupplierCreate(RfqsupplierBase):
    pass

class RfqsupplierUpdate(BaseModel):
    rfq_supplier_id: Optional[int] = None
    rfq_id: Optional[int] = None
    supplier_id: Optional[int] = None
    sent_date: Optional[datetime] = None
    response_due_date: Optional[datetime] = None
    response_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Rfqsupplier(RfqsupplierBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalesallocationBase(BaseModel):
    allocation_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity_allocated: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    allocation_date: Optional[datetime]
    allocated_by: Optional[int] = None
    is_active: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalesallocationCreate(SalesallocationBase):
    pass

class SalesallocationUpdate(BaseModel):
    allocation_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity_allocated: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    allocation_date: Optional[datetime] = None
    allocated_by: Optional[int] = None
    is_active: Optional[int] = None
    notes: Optional[str] = None

class Salesallocation(SalesallocationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalesbatchesBase(BaseModel):
    batch_id: Optional[int] = None
    company_id: Optional[int] = None
    name: Optional[str] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalesbatchesCreate(SalesbatchesBase):
    pass

class SalesbatchesUpdate(BaseModel):
    batch_id: Optional[int] = None
    company_id: Optional[int] = None
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class Salesbatches(SalesbatchesBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalescommissionBase(BaseModel):
    commission_id: Optional[int] = None
    company_id: Optional[int] = None
    contract_id: Optional[int] = None
    partner_id: Optional[int] = None
    percentage: Optional[float] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[datetime]
    paid_transaction_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalescommissionCreate(SalescommissionBase):
    pass

class SalescommissionUpdate(BaseModel):
    commission_id: Optional[int] = None
    company_id: Optional[int] = None
    contract_id: Optional[int] = None
    partner_id: Optional[int] = None
    percentage: Optional[float] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    paid_transaction_id: Optional[int] = None

class Salescommission(SalescommissionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalesdistributionBase(BaseModel):
    distribution_id: Optional[int] = None
    company_id: Optional[int] = None
    batch_id: Optional[int] = None
    partner_id: Optional[int] = None
    quantity: Optional[int] = None
    delivered_at: Optional[datetime]
    returned_at: Optional[datetime]
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalesdistributionCreate(SalesdistributionBase):
    pass

class SalesdistributionUpdate(BaseModel):
    distribution_id: Optional[int] = None
    company_id: Optional[int] = None
    batch_id: Optional[int] = None
    partner_id: Optional[int] = None
    quantity: Optional[int] = None
    delivered_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    status: Optional[str] = None

class Salesdistribution(SalesdistributionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalesorderBase(BaseModel):
    so_id: Optional[int] = None
    company_id: Optional[int] = None
    so_number: Optional[str] = None
    customer_id: Optional[int] = None
    order_date: Optional[datetime]
    expected_delivery_date: Optional[datetime]
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalesorderCreate(SalesorderBase):
    pass

class SalesorderUpdate(BaseModel):
    so_id: Optional[int] = None
    company_id: Optional[int] = None
    so_number: Optional[str] = None
    customer_id: Optional[int] = None
    order_date: Optional[datetime] = None
    expected_delivery_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Salesorder(SalesorderBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SalesorderitemBase(BaseModel):
    so_item_id: Optional[int] = None
    so_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    requested_delivery_date: Optional[datetime]
    quantity_allocated: Optional[float] = None
    quantity_shipped: Optional[float] = None
    quantity_returned: Optional[float] = None
    warehouse_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SalesorderitemCreate(SalesorderitemBase):
    pass

class SalesorderitemUpdate(BaseModel):
    so_item_id: Optional[int] = None
    so_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    requested_delivery_date: Optional[datetime] = None
    quantity_allocated: Optional[float] = None
    quantity_shipped: Optional[float] = None
    quantity_returned: Optional[float] = None
    warehouse_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Salesorderitem(SalesorderitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SchemaversionBase(BaseModel):
    schema_version_id: Optional[int] = None
    version: Optional[str] = None
    applied_at: Optional[datetime]
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SchemaversionCreate(SchemaversionBase):
    pass

class SchemaversionUpdate(BaseModel):
    schema_version_id: Optional[int] = None
    version: Optional[str] = None
    applied_at: Optional[datetime] = None
    description: Optional[str] = None

class Schemaversion(SchemaversionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SerialtrackingBase(BaseModel):
    serial_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    batch_id: Optional[int] = None
    purchase_date: Optional[datetime]
    purchase_order_id: Optional[int] = None
    purchase_order_line_id: Optional[int] = None
    sale_date: Optional[datetime]
    sales_order_id: Optional[int] = None
    sales_order_line_id: Optional[int] = None
    warranty_start_date: Optional[datetime]
    warranty_end_date: Optional[datetime]
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SerialtrackingCreate(SerialtrackingBase):
    pass

class SerialtrackingUpdate(BaseModel):
    serial_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    batch_id: Optional[int] = None
    purchase_date: Optional[datetime] = None
    purchase_order_id: Optional[int] = None
    purchase_order_line_id: Optional[int] = None
    sale_date: Optional[datetime] = None
    sales_order_id: Optional[int] = None
    sales_order_line_id: Optional[int] = None
    warranty_start_date: Optional[datetime] = None
    warranty_end_date: Optional[datetime] = None
    notes: Optional[str] = None

class Serialtracking(SerialtrackingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ServicefuneralBase(BaseModel):
    service_funeral_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    declarant_id: Optional[int] = None
    deceased_id: Optional[int] = None
    office_users_id: Optional[int] = None
    process_number: Optional[str] = None
    occurr_at: Optional[datetime]
    category: Optional[str] = None
    kinship: Optional[str] = None
    death_at: Optional[datetime]
    death_time: Optional[str] = None
    death_address_id: Optional[int] = None
    payment_at: Optional[datetime]
    burial_date: Optional[datetime]
    burial_time: Optional[str] = None
    cemetery: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_in_date: Optional[datetime]
    group_batch_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ServicefuneralCreate(ServicefuneralBase):
    pass

class ServicefuneralUpdate(BaseModel):
    service_funeral_id: Optional[int] = None
    contract_version_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    performed_service_id: Optional[int] = None
    declarant_id: Optional[int] = None
    deceased_id: Optional[int] = None
    office_users_id: Optional[int] = None
    process_number: Optional[str] = None
    occurr_at: Optional[datetime] = None
    category: Optional[str] = None
    kinship: Optional[str] = None
    death_at: Optional[datetime] = None
    death_time: Optional[str] = None
    death_address_id: Optional[int] = None
    payment_at: Optional[datetime] = None
    burial_date: Optional[datetime] = None
    burial_time: Optional[str] = None
    cemetery: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_in_date: Optional[datetime] = None
    group_batch_id: Optional[int] = None

class Servicefuneral(ServicefuneralBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ServicetypeBase(BaseModel):
    service_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    route: Optional[str] = None
    industry: Optional[str] = None
    is_billable: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ServicetypeCreate(ServicetypeBase):
    pass

class ServicetypeUpdate(BaseModel):
    service_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    route: Optional[str] = None
    industry: Optional[str] = None
    is_billable: Optional[int] = None

class Servicetype(ServicetypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ShipmentBase(BaseModel):
    shipment_id: Optional[int] = None
    company_id: Optional[int] = None
    shipment_number: Optional[str] = None
    so_id: Optional[int] = None
    customer_id: Optional[int] = None
    shipping_date: Optional[datetime]
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    shipping_method: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_by: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    shipment_id: Optional[int] = None
    company_id: Optional[int] = None
    shipment_number: Optional[str] = None
    so_id: Optional[int] = None
    customer_id: Optional[int] = None
    shipping_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    warehouse_id: Optional[int] = None
    shipping_method: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_by: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Shipment(ShipmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ShipmentitemBase(BaseModel):
    shipment_item_id: Optional[int] = None
    shipment_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    allocation_id: Optional[int] = None
    quantity_shipped: Optional[float] = None
    uom_id: Optional[int] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ShipmentitemCreate(ShipmentitemBase):
    pass

class ShipmentitemUpdate(BaseModel):
    shipment_item_id: Optional[int] = None
    shipment_id: Optional[int] = None
    so_id: Optional[int] = None
    so_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    allocation_id: Optional[int] = None
    quantity_shipped: Optional[float] = None
    uom_id: Optional[int] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    notes: Optional[str] = None

class Shipmentitem(ShipmentitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SpecialtyBase(BaseModel):
    specialty_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SpecialtyCreate(SpecialtyBase):
    pass

class SpecialtyUpdate(BaseModel):
    specialty_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Specialty(SpecialtyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StateBase(BaseModel):
    state_id: Optional[int] = None
    name: Optional[str] = None
    uf: Optional[str] = None
    codigo_ibge: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StateCreate(StateBase):
    pass

class StateUpdate(BaseModel):
    state_id: Optional[int] = None
    name: Optional[str] = None
    uf: Optional[str] = None
    codigo_ibge: Optional[str] = None

class State(StateBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StatemachinetransitionsBase(BaseModel):
    state_machine_transitions_id: Optional[int] = None
    contract_status_id_from: Optional[int] = None
    contract_status_id_to: Optional[int] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    unit_id: Optional[int] = None

class StatemachinetransitionsCreate(StatemachinetransitionsBase):
    pass

class StatemachinetransitionsUpdate(BaseModel):
    state_machine_transitions_id: Optional[int] = None
    contract_status_id_from: Optional[int] = None
    contract_status_id_to: Optional[int] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    unit_id: Optional[int] = None

class Statemachinetransitions(StatemachinetransitionsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StatusBase(BaseModel):
    status_id: Optional[int] = None
    status_code: Optional[str] = None
    status_name: Optional[str] = None
    description: Optional[str] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StatusCreate(StatusBase):
    pass

class StatusUpdate(BaseModel):
    status_id: Optional[int] = None
    status_code: Optional[str] = None
    status_name: Optional[str] = None
    description: Optional[str] = None
    generate_charge: Optional[int] = None
    allows_service: Optional[int] = None
    charge_after: Optional[int] = None
    kanban: Optional[int] = None
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: Optional[int] = None
    initial_state: Optional[int] = None
    allow_edition: Optional[int] = None
    allow_deletion: Optional[int] = None

class Status(StatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StatusreasonBase(BaseModel):
    status_reason_id: Optional[int] = None
    reason: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    unit_id: Optional[int] = None

class StatusreasonCreate(StatusreasonBase):
    pass

class StatusreasonUpdate(BaseModel):
    status_reason_id: Optional[int] = None
    reason: Optional[str] = None
    description: Optional[str] = None
    unit_id: Optional[int] = None

class Statusreason(StatusreasonBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StockcountBase(BaseModel):
    count_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    count_name: Optional[str] = None
    count_date: Optional[datetime]
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StockcountCreate(StockcountBase):
    pass

class StockcountUpdate(BaseModel):
    count_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    count_name: Optional[str] = None
    count_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Stockcount(StockcountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StockcountitemBase(BaseModel):
    count_item_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    count_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    location_id: Optional[int] = None
    expected_qty: Optional[float] = None
    counted_qty: Optional[float] = None
    difference: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[datetime]
    notes: Optional[str] = None
    counted_by: Optional[int] = None
    counted_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StockcountitemCreate(StockcountitemBase):
    pass

class StockcountitemUpdate(BaseModel):
    count_item_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    count_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    location_id: Optional[int] = None
    expected_qty: Optional[float] = None
    counted_qty: Optional[float] = None
    difference: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None
    counted_by: Optional[int] = None
    counted_at: Optional[datetime] = None

class Stockcountitem(StockcountitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StocklevelBase(BaseModel):
    stock_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    qty_on_hand: Optional[float] = None
    qty_reserved: Optional[float] = None
    qty_available: Optional[float] = None
    qty_on_order: Optional[float] = None
    min_stock_level: Optional[float] = None
    max_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    last_count_date: Optional[datetime]
    last_received_date: Optional[datetime]
    last_issued_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StocklevelCreate(StocklevelBase):
    pass

class StocklevelUpdate(BaseModel):
    stock_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    qty_on_hand: Optional[float] = None
    qty_reserved: Optional[float] = None
    qty_available: Optional[float] = None
    qty_on_order: Optional[float] = None
    min_stock_level: Optional[float] = None
    max_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    last_count_date: Optional[datetime] = None
    last_received_date: Optional[datetime] = None
    last_issued_date: Optional[datetime] = None

class Stocklevel(StocklevelBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StockmovementBase(BaseModel):
    movement_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    movement_type_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    from_warehouse_id: Optional[int] = None
    from_location_id: Optional[int] = None
    to_warehouse_id: Optional[int] = None
    to_location_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    reference_line_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[datetime]
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    movement_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StockmovementCreate(StockmovementBase):
    pass

class StockmovementUpdate(BaseModel):
    movement_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    movement_type_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    from_warehouse_id: Optional[int] = None
    from_location_id: Optional[int] = None
    to_warehouse_id: Optional[int] = None
    to_location_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    reference_line_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    movement_date: Optional[datetime] = None

class Stockmovement(StockmovementBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StockmovementtypeBase(BaseModel):
    movement_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    affects_qty_on_hand: Optional[int] = None
    direction: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StockmovementtypeCreate(StockmovementtypeBase):
    pass

class StockmovementtypeUpdate(BaseModel):
    movement_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    affects_qty_on_hand: Optional[int] = None
    direction: Optional[str] = None
    description: Optional[str] = None

class Stockmovementtype(StockmovementtypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StockreservationBase(BaseModel):
    reservation_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    reservation_type: Optional[str] = None
    reference_id: Optional[int] = None
    reference_line_id: Optional[int] = None
    expiry_date: Optional[datetime]
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StockreservationCreate(StockreservationBase):
    pass

class StockreservationUpdate(BaseModel):
    reservation_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    reservation_type: Optional[str] = None
    reference_id: Optional[int] = None
    reference_line_id: Optional[int] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class Stockreservation(StockreservationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StoragelocationBase(BaseModel):
    location_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_code: Optional[str] = None
    location_name: Optional[str] = None
    section: Optional[str] = None
    aisle: Optional[str] = None
    shelf: Optional[str] = None
    bin: Optional[str] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class StoragelocationCreate(StoragelocationBase):
    pass

class StoragelocationUpdate(BaseModel):
    location_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    location_code: Optional[str] = None
    location_name: Optional[str] = None
    section: Optional[str] = None
    aisle: Optional[str] = None
    shelf: Optional[str] = None
    bin: Optional[str] = None
    is_active: Optional[int] = None

class Storagelocation(StoragelocationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SubsidiaryBase(BaseModel):
    subsidiary_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SubsidiaryCreate(SubsidiaryBase):
    pass

class SubsidiaryUpdate(BaseModel):
    subsidiary_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    status: Optional[str] = None

class Subsidiary(SubsidiaryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SupplierBase(BaseModel):
    supplier_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_code: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    is_active: Optional[int] = None
    supplier_rating: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    supplier_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_code: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    is_active: Optional[int] = None
    supplier_rating: Optional[int] = None
    notes: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SupplierquotationBase(BaseModel):
    quotation_id: Optional[int] = None
    rfq_supplier_id: Optional[int] = None
    quotation_number: Optional[str] = None
    quotation_date: Optional[datetime]
    valid_until: Optional[datetime]
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    delivery_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SupplierquotationCreate(SupplierquotationBase):
    pass

class SupplierquotationUpdate(BaseModel):
    quotation_id: Optional[int] = None
    rfq_supplier_id: Optional[int] = None
    quotation_number: Optional[str] = None
    quotation_date: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    currency_code: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    delivery_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Supplierquotation(SupplierquotationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SupplierquotationitemBase(BaseModel):
    quotation_item_id: Optional[int] = None
    quotation_id: Optional[int] = None
    rfq_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    lead_time: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SupplierquotationitemCreate(SupplierquotationitemBase):
    pass

class SupplierquotationitemUpdate(BaseModel):
    quotation_item_id: Optional[int] = None
    quotation_id: Optional[int] = None
    rfq_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    total_price: Optional[float] = None
    lead_time: Optional[int] = None
    notes: Optional[str] = None

class Supplierquotationitem(SupplierquotationitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SupplierreturnBase(BaseModel):
    return_id: Optional[int] = None
    company_id: Optional[int] = None
    return_number: Optional[str] = None
    supplier_id: Optional[int] = None
    po_id: Optional[int] = None
    receipt_id: Optional[int] = None
    return_date: Optional[datetime]
    warehouse_id: Optional[int] = None
    return_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SupplierreturnCreate(SupplierreturnBase):
    pass

class SupplierreturnUpdate(BaseModel):
    return_id: Optional[int] = None
    company_id: Optional[int] = None
    return_number: Optional[str] = None
    supplier_id: Optional[int] = None
    po_id: Optional[int] = None
    receipt_id: Optional[int] = None
    return_date: Optional[datetime] = None
    warehouse_id: Optional[int] = None
    return_reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Supplierreturn(SupplierreturnBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SupplierreturnitemBase(BaseModel):
    return_item_id: Optional[int] = None
    return_id: Optional[int] = None
    receipt_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_returned: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    return_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SupplierreturnitemCreate(SupplierreturnitemBase):
    pass

class SupplierreturnitemUpdate(BaseModel):
    return_item_id: Optional[int] = None
    return_id: Optional[int] = None
    receipt_item_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    quantity_returned: Optional[float] = None
    uom_id: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    location_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    return_reason: Optional[str] = None
    notes: Optional[str] = None

class Supplierreturnitem(SupplierreturnitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysauditlogBase(BaseModel):
    audit_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    action_type: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    action_time: Optional[datetime]
    created_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    updated_at: Optional[datetime]

class SysauditlogCreate(SysauditlogBase):
    pass

class SysauditlogUpdate(BaseModel):
    audit_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    action_type: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    action_time: Optional[datetime] = None

class Sysauditlog(SysauditlogBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysgroupBase(BaseModel):
    sys_group_id: Optional[int] = None
    name: Optional[str] = None
    uuid: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysgroupCreate(SysgroupBase):
    pass

class SysgroupUpdate(BaseModel):
    sys_group_id: Optional[int] = None
    name: Optional[str] = None
    uuid: Optional[str] = None

class Sysgroup(SysgroupBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysgroupprogramBase(BaseModel):
    sys_group_program_id: Optional[int] = None
    sys_group_id: Optional[int] = None
    sys_program_id: Optional[int] = None
    actions: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysgroupprogramCreate(SysgroupprogramBase):
    pass

class SysgroupprogramUpdate(BaseModel):
    sys_group_program_id: Optional[int] = None
    sys_group_id: Optional[int] = None
    sys_program_id: Optional[int] = None
    actions: Optional[str] = None

class Sysgroupprogram(SysgroupprogramBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SyspreferenceBase(BaseModel):
    sys_preference_id: Optional[str] = None
    preference: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SyspreferenceCreate(SyspreferenceBase):
    pass

class SyspreferenceUpdate(BaseModel):
    sys_preference_id: Optional[str] = None
    preference: Optional[str] = None

class Syspreference(SyspreferenceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysprogramBase(BaseModel):
    sys_program_id: Optional[int] = None
    name: Optional[str] = None
    controller: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None
    actions: Optional[str] = None

class SysprogramCreate(SysprogramBase):
    pass

class SysprogramUpdate(BaseModel):
    sys_program_id: Optional[int] = None
    name: Optional[str] = None
    controller: Optional[str] = None
    actions: Optional[str] = None

class Sysprogram(SysprogramBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SyssettingBase(BaseModel):
    setting_id: Optional[int] = None
    company_id: Optional[int] = None
    setting_key: Optional[str] = None
    setting_value: Optional[str] = None
    data_type: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SyssettingCreate(SyssettingBase):
    pass

class SyssettingUpdate(BaseModel):
    setting_id: Optional[int] = None
    company_id: Optional[int] = None
    setting_key: Optional[str] = None
    setting_value: Optional[str] = None
    data_type: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None

class Syssetting(SyssettingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysunitBase(BaseModel):
    sys_unit_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    status_id: Optional[int] = None
    name: Optional[str] = None
    connection_name: Optional[str] = None
    code: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysunitCreate(SysunitBase):
    pass

class SysunitUpdate(BaseModel):
    sys_unit_id: Optional[int] = None
    subsidiary_id: Optional[int] = None
    status_id: Optional[int] = None
    name: Optional[str] = None
    connection_name: Optional[str] = None
    code: Optional[str] = None

class Sysunit(SysunitBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysuserBase(BaseModel):
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None
    password_salt: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    frontpage_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    active: Optional[int] = None
    accepted_term_policy_at: Optional[datetime]
    accepted_term_policy: Optional[int] = None
    two_factor_enabled: Optional[int] = None
    two_factor_type: Optional[str] = None
    two_factor_secret: Optional[str] = None
    is_admin: Optional[int] = None
    last_login: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysuserCreate(SysuserBase):
    pass

class SysuserUpdate(BaseModel):
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    login: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None
    password_salt: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    frontpage_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    active: Optional[int] = None
    accepted_term_policy_at: Optional[datetime] = None
    accepted_term_policy: Optional[int] = None
    two_factor_enabled: Optional[int] = None
    two_factor_type: Optional[str] = None
    two_factor_secret: Optional[str] = None
    is_admin: Optional[int] = None
    last_login: Optional[datetime] = None

class Sysuser(SysuserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysusergroupBase(BaseModel):
    sys_user_group_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_group_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysusergroupCreate(SysusergroupBase):
    pass

class SysusergroupUpdate(BaseModel):
    sys_user_group_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_group_id: Optional[int] = None

class Sysusergroup(SysusergroupBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysuserprogramBase(BaseModel):
    sys_user_program_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_program_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysuserprogramCreate(SysuserprogramBase):
    pass

class SysuserprogramUpdate(BaseModel):
    sys_user_program_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_program_id: Optional[int] = None

class Sysuserprogram(SysuserprogramBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SysuserunitBase(BaseModel):
    sys_user_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SysuserunitCreate(SysuserunitBase):
    pass

class SysuserunitUpdate(BaseModel):
    sys_user_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    sys_unit_id: Optional[int] = None

class Sysuserunit(SysuserunitBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TaxcodeBase(BaseModel):
    tax_code_id: Optional[int] = None
    company_id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    rate: Optional[float] = None
    is_recoverable: Optional[int] = None
    liability_account_id: Optional[int] = None
    receivable_account_id: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TaxcodeCreate(TaxcodeBase):
    pass

class TaxcodeUpdate(BaseModel):
    tax_code_id: Optional[int] = None
    company_id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    rate: Optional[float] = None
    is_recoverable: Optional[int] = None
    liability_account_id: Optional[int] = None
    receivable_account_id: Optional[int] = None
    active: Optional[int] = None

class Taxcode(TaxcodeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TransactionBase(BaseModel):
    transaction_id: Optional[int] = None
    company_id: Optional[int] = None
    transaction_type_id: Optional[int] = None
    transaction_number: Optional[str] = None
    transaction_date: Optional[datetime]
    from_account_id: Optional[int] = None
    from_contact_id: Optional[int] = None
    to_account_id: Optional[int] = None
    to_contact_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    currency: Optional[str] = None
    exchange_rate: Optional[float] = None
    amount: Optional[float] = None
    reference_number: Optional[str] = None
    description: Optional[str] = None
    memo: Optional[str] = None
    filename: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    status: Optional[str] = None
    journal_id: Optional[int] = None
    is_reconciled_from: Optional[int] = None
    reconciliation_date_from: Optional[datetime]
    is_reconciled_to: Optional[int] = None
    reconciliation_date_to: Optional[datetime]
    error_message: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    transaction_id: Optional[int] = None
    company_id: Optional[int] = None
    transaction_type_id: Optional[int] = None
    transaction_number: Optional[str] = None
    transaction_date: Optional[datetime] = None
    from_account_id: Optional[int] = None
    from_contact_id: Optional[int] = None
    to_account_id: Optional[int] = None
    to_contact_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    currency: Optional[str] = None
    exchange_rate: Optional[float] = None
    amount: Optional[float] = None
    reference_number: Optional[str] = None
    description: Optional[str] = None
    memo: Optional[str] = None
    filename: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    status: Optional[str] = None
    journal_id: Optional[int] = None
    is_reconciled_from: Optional[int] = None
    reconciliation_date_from: Optional[datetime] = None
    is_reconciled_to: Optional[int] = None
    reconciliation_date_to: Optional[datetime] = None
    error_message: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TransactionallocationBase(BaseModel):
    allocation_id: Optional[int] = None
    transaction_id: Optional[int] = None
    invoice_id: Optional[int] = None
    original_amount: Optional[float] = None
    allocated_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TransactionallocationCreate(TransactionallocationBase):
    pass

class TransactionallocationUpdate(BaseModel):
    allocation_id: Optional[int] = None
    transaction_id: Optional[int] = None
    invoice_id: Optional[int] = None
    original_amount: Optional[float] = None
    allocated_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    description: Optional[str] = None

class Transactionallocation(TransactionallocationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TransactiontypeBase(BaseModel):
    transaction_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TransactiontypeCreate(TransactiontypeBase):
    pass

class TransactiontypeUpdate(BaseModel):
    transaction_type_id: Optional[int] = None
    company_id: Optional[int] = None
    type_code: Optional[str] = None
    type_name: Optional[str] = None
    description: Optional[str] = None
    is_system: Optional[int] = None
    active: Optional[int] = None

class Transactiontype(TransactiontypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TripBase(BaseModel):
    trip_id: Optional[str] = None
    company_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[int] = None
    vehicle_request_id: Optional[str] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    start_location: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    trip_status_id: Optional[int] = None
    start_odometer: Optional[int] = None
    end_odometer: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    trip_id: Optional[str] = None
    company_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[int] = None
    vehicle_request_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    start_location: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    trip_status_id: Optional[int] = None
    start_odometer: Optional[int] = None
    end_odometer: Optional[int] = None
    notes: Optional[str] = None

class Trip(TripBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TripdocumentBase(BaseModel):
    trip_document_id: Optional[int] = None
    trip_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TripdocumentCreate(TripdocumentBase):
    pass

class TripdocumentUpdate(BaseModel):
    trip_document_id: Optional[int] = None
    trip_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None

class Tripdocument(TripdocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TripstatusBase(BaseModel):
    trip_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TripstatusCreate(TripstatusBase):
    pass

class TripstatusUpdate(BaseModel):
    trip_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Tripstatus(TripstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UnitsofmeasurementBase(BaseModel):
    uom_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    uom_code: Optional[str] = None
    uom_name: Optional[str] = None
    uom_description: Optional[str] = None
    uom_type: Optional[str] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class UnitsofmeasurementCreate(UnitsofmeasurementBase):
    pass

class UnitsofmeasurementUpdate(BaseModel):
    uom_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    uom_code: Optional[str] = None
    uom_name: Optional[str] = None
    uom_description: Optional[str] = None
    uom_type: Optional[str] = None
    is_active: Optional[int] = None

class Unitsofmeasurement(UnitsofmeasurementBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UsercompanyaccessBase(BaseModel):
    user_company_access_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    can_view: Optional[int] = None
    can_edit: Optional[int] = None
    can_approve: Optional[int] = None
    can_admin: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class UsercompanyaccessCreate(UsercompanyaccessBase):
    pass

class UsercompanyaccessUpdate(BaseModel):
    user_company_access_id: Optional[int] = None
    company_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    can_view: Optional[int] = None
    can_edit: Optional[int] = None
    can_approve: Optional[int] = None
    can_admin: Optional[int] = None

class Usercompanyaccess(UsercompanyaccessBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ValidationruleBase(BaseModel):
    rule_id: Optional[int] = None
    company_id: Optional[int] = None
    rule_name: Optional[str] = None
    entity_type: Optional[str] = None
    condition_sql: Optional[str] = None
    error_message: Optional[str] = None
    severity: Optional[str] = None
    active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ValidationruleCreate(ValidationruleBase):
    pass

class ValidationruleUpdate(BaseModel):
    rule_id: Optional[int] = None
    company_id: Optional[int] = None
    rule_name: Optional[str] = None
    entity_type: Optional[str] = None
    condition_sql: Optional[str] = None
    error_message: Optional[str] = None
    severity: Optional[str] = None
    active: Optional[int] = None

class Validationrule(ValidationruleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VariationattributeBase(BaseModel):
    var_attr_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    variation_id: Optional[int] = None
    attribute_type_id: Optional[int] = None
    attribute_value_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VariationattributeCreate(VariationattributeBase):
    pass

class VariationattributeUpdate(BaseModel):
    var_attr_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    variation_id: Optional[int] = None
    attribute_type_id: Optional[int] = None
    attribute_value_id: Optional[int] = None

class Variationattribute(VariationattributeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicleBase(BaseModel):
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    plate: Optional[str] = None
    model: Optional[str] = None
    vehicle_type_id: Optional[int] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    vehicle_status_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    plate: Optional[str] = None
    model: Optional[str] = None
    vehicle_type_id: Optional[int] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    vehicle_status_id: Optional[int] = None
    notes: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicledailylogBase(BaseModel):
    vehicle_daily_log_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    driver_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    log_event_type_id: Optional[int] = None
    log_timestamp: Optional[datetime]
    odometer_reading: Optional[int] = None
    location_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    attached_document_id: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicledailylogCreate(VehicledailylogBase):
    pass

class VehicledailylogUpdate(BaseModel):
    vehicle_daily_log_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    company_id: Optional[int] = None
    driver_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    log_event_type_id: Optional[int] = None
    log_timestamp: Optional[datetime] = None
    odometer_reading: Optional[int] = None
    location_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    attached_document_id: Optional[int] = None

class Vehicledailylog(VehicledailylogBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicledocumentBase(BaseModel):
    vehicle_document_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    is_primary: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicledocumentCreate(VehicledocumentBase):
    pass

class VehicledocumentUpdate(BaseModel):
    vehicle_document_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    document_id: Optional[int] = None
    company_id: Optional[int] = None
    description: Optional[str] = None
    is_primary: Optional[int] = None

class Vehicledocument(VehicledocumentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicleexpenseBase(BaseModel):
    vehicle_expense_id: Optional[int] = None
    company_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    expense_type_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    expense_date: Optional[datetime]
    amount: Optional[float] = None
    currency_code: Optional[str] = None
    description: Optional[str] = None
    receipt_document_id: Optional[int] = None
    vehicle_expense_status_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicleexpenseCreate(VehicleexpenseBase):
    pass

class VehicleexpenseUpdate(BaseModel):
    vehicle_expense_id: Optional[int] = None
    company_id: Optional[int] = None
    vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    expense_type_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    expense_date: Optional[datetime] = None
    amount: Optional[float] = None
    currency_code: Optional[str] = None
    description: Optional[str] = None
    receipt_document_id: Optional[int] = None
    vehicle_expense_status_id: Optional[int] = None
    notes: Optional[str] = None

class Vehicleexpense(VehicleexpenseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicleexpensestatusBase(BaseModel):
    vehicle_expense_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicleexpensestatusCreate(VehicleexpensestatusBase):
    pass

class VehicleexpensestatusUpdate(BaseModel):
    vehicle_expense_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Vehicleexpensestatus(VehicleexpensestatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehiclerequestBase(BaseModel):
    vehicle_request_id: Optional[str] = None
    company_id: Optional[int] = None
    requester_id: Optional[int] = None
    requested_vehicle_type_id: Optional[int] = None
    vehicle_request_type_id: Optional[int] = None
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    destination: Optional[str] = None
    purpose: Optional[str] = None
    number_of_passengers: Optional[int] = None
    vehicle_request_status_id: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime]
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehiclerequestCreate(VehiclerequestBase):
    pass

class VehiclerequestUpdate(BaseModel):
    vehicle_request_id: Optional[str] = None
    company_id: Optional[int] = None
    requester_id: Optional[int] = None
    requested_vehicle_type_id: Optional[int] = None
    vehicle_request_type_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    number_of_passengers: Optional[int] = None
    vehicle_request_status_id: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    notes: Optional[str] = None

class Vehiclerequest(VehiclerequestBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehiclerequeststatusBase(BaseModel):
    vehicle_request_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehiclerequeststatusCreate(VehiclerequeststatusBase):
    pass

class VehiclerequeststatusUpdate(BaseModel):
    vehicle_request_status_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Vehiclerequeststatus(VehiclerequeststatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehiclerequesttypeBase(BaseModel):
    vehicle_request_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehiclerequesttypeCreate(VehiclerequesttypeBase):
    pass

class VehiclerequesttypeUpdate(BaseModel):
    vehicle_request_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Vehiclerequesttype(VehiclerequesttypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehiclestatusBase(BaseModel):
    vehicle_status_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehiclestatusCreate(VehiclestatusBase):
    pass

class VehiclestatusUpdate(BaseModel):
    vehicle_status_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Vehiclestatus(VehiclestatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VehicletypeBase(BaseModel):
    vehicle_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class VehicletypeCreate(VehicletypeBase):
    pass

class VehicletypeUpdate(BaseModel):
    vehicle_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class Vehicletype(VehicletypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewaccountsreceivableagingBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    contact_id: Optional[int] = None
    contact_name: Optional[str] = None
    days_1_30: Optional[float] = None
    days_31_60: Optional[float] = None
    days_61_90: Optional[float] = None
    days_90_plus: Optional[float] = None
    max_days_outstanding: Optional[int] = None
    outstanding_items: Optional[int] = None
    total_outstanding: Optional[float] = None

class ViewaccountsreceivableagingCreate(ViewaccountsreceivableagingBase):
    pass

class ViewaccountsreceivableagingUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    contact_id: Optional[int] = None
    contact_name: Optional[str] = None
    days_1_30: Optional[float] = None
    days_31_60: Optional[float] = None
    days_61_90: Optional[float] = None
    days_90_plus: Optional[float] = None
    max_days_outstanding: Optional[int] = None
    outstanding_items: Optional[int] = None
    total_outstanding: Optional[float] = None

class Viewaccountsreceivableaging(ViewaccountsreceivableagingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewbalancesheetBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    balance_amount: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    nature_total: Optional[float] = None
    period_end_date: Optional[datetime]
    period_name: Optional[str] = None
    running_total: Optional[float] = None
    total_assets: Optional[float] = None
    total_equity: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_liabilities_equity: Optional[float] = None
    year_name: Optional[str] = None

class ViewbalancesheetCreate(ViewbalancesheetBase):
    pass

class ViewbalancesheetUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    balance_amount: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    nature_total: Optional[float] = None
    period_end_date: Optional[datetime] = None
    period_name: Optional[str] = None
    running_total: Optional[float] = None
    total_assets: Optional[float] = None
    total_equity: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_liabilities_equity: Optional[float] = None
    year_name: Optional[str] = None

class Viewbalancesheet(ViewbalancesheetBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewbudgetvsactualBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    actual_amount: Optional[float] = None
    budget_amount: Optional[float] = None
    budget_name: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    period_name: Optional[str] = None
    variance: Optional[float] = None
    variance_percentage: Optional[float] = None
    year_name: Optional[str] = None

class ViewbudgetvsactualCreate(ViewbudgetvsactualBase):
    pass

class ViewbudgetvsactualUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    actual_amount: Optional[float] = None
    budget_amount: Optional[float] = None
    budget_name: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    period_name: Optional[str] = None
    variance: Optional[float] = None
    variance_percentage: Optional[float] = None
    year_name: Optional[str] = None

class Viewbudgetvsactual(ViewbudgetvsactualBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewcashflowBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    cash_inflow: Optional[float] = None
    cash_outflow: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    journal_date: Optional[datetime]
    net_cash_flow: Optional[float] = None
    period_name: Optional[str] = None
    transaction_count: Optional[int] = None
    year_name: Optional[str] = None

class ViewcashflowCreate(ViewcashflowBase):
    pass

class ViewcashflowUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    cash_inflow: Optional[float] = None
    cash_outflow: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    journal_date: Optional[datetime] = None
    net_cash_flow: Optional[float] = None
    period_name: Optional[str] = None
    transaction_count: Optional[int] = None
    year_name: Optional[str] = None

class Viewcashflow(ViewcashflowBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewconsolidatedfinancialsBase(BaseModel):
    amount: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    parent_company_id: Optional[int] = None
    parent_company_name: Optional[str] = None
    period_name: Optional[str] = None
    year_name: Optional[str] = None

class ViewconsolidatedfinancialsCreate(ViewconsolidatedfinancialsBase):
    pass

class ViewconsolidatedfinancialsUpdate(BaseModel):
    amount: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    parent_company_id: Optional[int] = None
    parent_company_name: Optional[str] = None
    period_name: Optional[str] = None
    year_name: Optional[str] = None

class Viewconsolidatedfinancials(ViewconsolidatedfinancialsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewgeneralledgerBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_nature: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    contact_id: Optional[int] = None
    contact_name: Optional[str] = None
    cost_center_code: Optional[str] = None
    cost_center_id: Optional[int] = None
    cost_center_name: Optional[str] = None
    created_at: Optional[datetime]
    created_by: Optional[str] = None
    credit_amount: Optional[float] = None
    debit_amount: Optional[float] = None
    department_code: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    journal_date: Optional[datetime]
    journal_description: Optional[str] = None
    journal_id: Optional[int] = None
    journal_line_id: Optional[int] = None
    journal_number: Optional[str] = None
    journal_type: Optional[str] = None
    line_description: Optional[str] = None
    line_number: Optional[int] = None
    period_name: Optional[str] = None
    project_code: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = None
    year_name: Optional[str] = None

class ViewgeneralledgerCreate(ViewgeneralledgerBase):
    pass

class ViewgeneralledgerUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_nature: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    contact_id: Optional[int] = None
    contact_name: Optional[str] = None
    cost_center_code: Optional[str] = None
    cost_center_id: Optional[int] = None
    cost_center_name: Optional[str] = None
    credit_amount: Optional[float] = None
    debit_amount: Optional[float] = None
    department_code: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    journal_date: Optional[datetime] = None
    journal_description: Optional[str] = None
    journal_id: Optional[int] = None
    journal_line_id: Optional[int] = None
    journal_number: Optional[str] = None
    journal_type: Optional[str] = None
    line_description: Optional[str] = None
    line_number: Optional[int] = None
    period_name: Optional[str] = None
    project_code: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = None
    year_name: Optional[str] = None

class Viewgeneralledger(ViewgeneralledgerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewincomestatementBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    nature_total: Optional[float] = None
    net_amount: Optional[float] = None
    net_income: Optional[float] = None
    period_end_date: Optional[datetime]
    period_name: Optional[str] = None
    period_start_date: Optional[datetime]
    running_total: Optional[float] = None
    total_expense: Optional[float] = None
    total_revenue: Optional[float] = None
    year_name: Optional[str] = None

class ViewincomestatementCreate(ViewincomestatementBase):
    pass

class ViewincomestatementUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    nature_total: Optional[float] = None
    net_amount: Optional[float] = None
    net_income: Optional[float] = None
    period_end_date: Optional[datetime] = None
    period_name: Optional[str] = None
    period_start_date: Optional[datetime] = None
    running_total: Optional[float] = None
    total_expense: Optional[float] = None
    total_revenue: Optional[float] = None
    year_name: Optional[str] = None

class Viewincomestatement(ViewincomestatementBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ViewtrialbalanceBase(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    closing_balance: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    credit_total: Optional[float] = None
    debit_total: Optional[float] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    net_balance: Optional[float] = None
    opening_balance: Optional[float] = None
    period_name: Optional[str] = None
    year_name: Optional[str] = None

class ViewtrialbalanceCreate(ViewtrialbalanceBase):
    pass

class ViewtrialbalanceUpdate(BaseModel):
    account_code: Optional[str] = None
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_type_id: Optional[int] = None
    closing_balance: Optional[float] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    credit_total: Optional[float] = None
    debit_total: Optional[float] = None
    fiscal_period_id: Optional[int] = None
    fiscal_year_id: Optional[int] = None
    nature: Optional[str] = None
    net_balance: Optional[float] = None
    opening_balance: Optional[float] = None
    period_name: Optional[str] = None
    year_name: Optional[str] = None

class Viewtrialbalance(ViewtrialbalanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwbatchexpiryBase(BaseModel):
    batch_id: Optional[int] = None
    batch_number: Optional[str] = None
    cost_price: Optional[float] = None
    current_quantity: Optional[float] = None
    days_until_expiry: Optional[int] = None
    expiry_date: Optional[datetime]
    expiry_status: Optional[str] = None
    manufacture_date: Optional[datetime]
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    supplier_name: Optional[str] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None

class VwbatchexpiryCreate(VwbatchexpiryBase):
    pass

class VwbatchexpiryUpdate(BaseModel):
    batch_id: Optional[int] = None
    batch_number: Optional[str] = None
    cost_price: Optional[float] = None
    current_quantity: Optional[float] = None
    days_until_expiry: Optional[int] = None
    expiry_date: Optional[datetime] = None
    expiry_status: Optional[str] = None
    manufacture_date: Optional[datetime] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    supplier_name: Optional[str] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None

class Vwbatchexpiry(VwbatchexpiryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwcurrentinventoryBase(BaseModel):
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    location_code: Optional[str] = None
    max_stock_level: Optional[float] = None
    min_stock_level: Optional[float] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    qty_available: Optional[float] = None
    qty_on_hand: Optional[float] = None
    qty_on_order: Optional[float] = None
    qty_reserved: Optional[float] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class VwcurrentinventoryCreate(VwcurrentinventoryBase):
    pass

class VwcurrentinventoryUpdate(BaseModel):
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    location_code: Optional[str] = None
    max_stock_level: Optional[float] = None
    min_stock_level: Optional[float] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    qty_available: Optional[float] = None
    qty_on_hand: Optional[float] = None
    qty_on_order: Optional[float] = None
    qty_reserved: Optional[float] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class Vwcurrentinventory(VwcurrentinventoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwinventoryagingBase(BaseModel):
    age_bucket: Optional[str] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    days_in_inventory: Optional[int] = None
    last_receipt_date: Optional[datetime]
    location_code: Optional[str] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_on_hand: Optional[float] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class VwinventoryagingCreate(VwinventoryagingBase):
    pass

class VwinventoryagingUpdate(BaseModel):
    age_bucket: Optional[str] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    days_in_inventory: Optional[int] = None
    last_receipt_date: Optional[datetime] = None
    location_code: Optional[str] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_on_hand: Optional[float] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class Vwinventoryaging(VwinventoryagingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwinventoryvaluationBase(BaseModel):
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    currency_code: Optional[str] = None
    location_code: Optional[str] = None
    location_id: Optional[int] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_on_hand: Optional[float] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class VwinventoryvaluationCreate(VwinventoryvaluationBase):
    pass

class VwinventoryvaluationUpdate(BaseModel):
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    currency_code: Optional[str] = None
    location_code: Optional[str] = None
    location_id: Optional[int] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_on_hand: Optional[float] = None
    total_value: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class Vwinventoryvaluation(VwinventoryvaluationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwproductperformanceBase(BaseModel):
    available_stock: Optional[float] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    current_stock: Optional[float] = None
    daily_velocity: Optional[float] = None
    days_of_inventory: Optional[float] = None
    gross_profit: Optional[float] = None
    incoming_stock: Optional[float] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    profit_margin: Optional[float] = None
    qty_sold_30days: Optional[float] = None
    qty_sold_90days: Optional[float] = None
    retail_price: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None

class VwproductperformanceCreate(VwproductperformanceBase):
    pass

class VwproductperformanceUpdate(BaseModel):
    available_stock: Optional[float] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    cost_price: Optional[float] = None
    current_stock: Optional[float] = None
    daily_velocity: Optional[float] = None
    days_of_inventory: Optional[float] = None
    gross_profit: Optional[float] = None
    incoming_stock: Optional[float] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    profit_margin: Optional[float] = None
    qty_sold_30days: Optional[float] = None
    qty_sold_90days: Optional[float] = None
    retail_price: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None

class Vwproductperformance(VwproductperformanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwpurchaseorderstatusBase(BaseModel):
    currency_code: Optional[str] = None
    days_until_delivery: Optional[int] = None
    delivery_status: Optional[str] = None
    discount_amount: Optional[float] = None
    expected_delivery_date: Optional[datetime]
    po_date: Optional[datetime]
    po_id: Optional[int] = None
    po_number: Optional[str] = None
    po_status: Optional[str] = None
    shipping_amount: Optional[float] = None
    subtotal: Optional[float] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    total_line_items: Optional[int] = None
    total_ordered_qty: Optional[float] = None
    total_pending_qty: Optional[float] = None
    total_received_qty: Optional[float] = None
    total_returned_qty: Optional[float] = None
    warehouse_name: Optional[str] = None

class VwpurchaseorderstatusCreate(VwpurchaseorderstatusBase):
    pass

class VwpurchaseorderstatusUpdate(BaseModel):
    currency_code: Optional[str] = None
    days_until_delivery: Optional[int] = None
    delivery_status: Optional[str] = None
    discount_amount: Optional[float] = None
    expected_delivery_date: Optional[datetime] = None
    po_date: Optional[datetime] = None
    po_id: Optional[int] = None
    po_number: Optional[str] = None
    po_status: Optional[str] = None
    shipping_amount: Optional[float] = None
    subtotal: Optional[float] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    total_line_items: Optional[int] = None
    total_ordered_qty: Optional[float] = None
    total_pending_qty: Optional[float] = None
    total_received_qty: Optional[float] = None
    total_returned_qty: Optional[float] = None
    warehouse_name: Optional[str] = None

class Vwpurchaseorderstatus(VwpurchaseorderstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwreorderrecommendationBase(BaseModel):
    lead_time: Optional[int] = None
    min_order_qty: Optional[float] = None
    min_stock_level: Optional[float] = None
    needs_reorder: Optional[int] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_price: Optional[float] = None
    total_qty_available: Optional[float] = None
    total_qty_on_hand: Optional[float] = None
    total_qty_on_order: Optional[float] = None
    total_qty_reserved: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class VwreorderrecommendationCreate(VwreorderrecommendationBase):
    pass

class VwreorderrecommendationUpdate(BaseModel):
    lead_time: Optional[int] = None
    min_order_qty: Optional[float] = None
    min_stock_level: Optional[float] = None
    needs_reorder: Optional[int] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    reorder_point: Optional[float] = None
    reorder_qty: Optional[float] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_price: Optional[float] = None
    total_qty_available: Optional[float] = None
    total_qty_on_hand: Optional[float] = None
    total_qty_on_order: Optional[float] = None
    total_qty_reserved: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class Vwreorderrecommendation(VwreorderrecommendationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwsalesorderstatusBase(BaseModel):
    currency_code: Optional[str] = None
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    days_until_delivery: Optional[int] = None
    delivery_status: Optional[str] = None
    discount_amount: Optional[float] = None
    expected_delivery_date: Optional[datetime]
    order_date: Optional[datetime]
    shipping_amount: Optional[float] = None
    so_id: Optional[int] = None
    so_number: Optional[str] = None
    so_status: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_allocated_qty: Optional[float] = None
    total_amount: Optional[float] = None
    total_line_items: Optional[int] = None
    total_ordered_qty: Optional[float] = None
    total_pending_qty: Optional[float] = None
    total_returned_qty: Optional[float] = None
    total_shipped_qty: Optional[float] = None
    warehouse_name: Optional[str] = None

class VwsalesorderstatusCreate(VwsalesorderstatusBase):
    pass

class VwsalesorderstatusUpdate(BaseModel):
    currency_code: Optional[str] = None
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    days_until_delivery: Optional[int] = None
    delivery_status: Optional[str] = None
    discount_amount: Optional[float] = None
    expected_delivery_date: Optional[datetime] = None
    order_date: Optional[datetime] = None
    shipping_amount: Optional[float] = None
    so_id: Optional[int] = None
    so_number: Optional[str] = None
    so_status: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_allocated_qty: Optional[float] = None
    total_amount: Optional[float] = None
    total_line_items: Optional[int] = None
    total_ordered_qty: Optional[float] = None
    total_pending_qty: Optional[float] = None
    total_returned_qty: Optional[float] = None
    total_shipped_qty: Optional[float] = None
    warehouse_name: Optional[str] = None

class Vwsalesorderstatus(VwsalesorderstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwstockaccuracyBase(BaseModel):
    category_name: Optional[str] = None
    count_date: Optional[datetime]
    count_id: Optional[int] = None
    count_name: Optional[str] = None
    count_status: Optional[str] = None
    counted_qty: Optional[float] = None
    difference: Optional[float] = None
    discrepancy_percentage: Optional[float] = None
    expected_qty: Optional[float] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    uom_code: Optional[str] = None
    variance_type: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class VwstockaccuracyCreate(VwstockaccuracyBase):
    pass

class VwstockaccuracyUpdate(BaseModel):
    category_name: Optional[str] = None
    count_date: Optional[datetime] = None
    count_id: Optional[int] = None
    count_name: Optional[str] = None
    count_status: Optional[str] = None
    counted_qty: Optional[float] = None
    difference: Optional[float] = None
    discrepancy_percentage: Optional[float] = None
    expected_qty: Optional[float] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    uom_code: Optional[str] = None
    variance_type: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None
    warehouse_name: Optional[str] = None

class Vwstockaccuracy(VwstockaccuracyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwstockmovementBase(BaseModel):
    batch_number: Optional[str] = None
    direction: Optional[str] = None
    from_location: Optional[str] = None
    from_warehouse: Optional[str] = None
    movement_date: Optional[datetime]
    movement_id: Optional[int] = None
    movement_type: Optional[str] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    quantity: Optional[float] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    serial_number: Optional[str] = None
    to_location: Optional[str] = None
    to_warehouse: Optional[str] = None
    total_cost: Optional[float] = None
    unit_cost: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None

class VwstockmovementCreate(VwstockmovementBase):
    pass

class VwstockmovementUpdate(BaseModel):
    batch_number: Optional[str] = None
    direction: Optional[str] = None
    from_location: Optional[str] = None
    from_warehouse: Optional[str] = None
    movement_date: Optional[datetime] = None
    movement_id: Optional[int] = None
    movement_type: Optional[str] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    quantity: Optional[float] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    serial_number: Optional[str] = None
    to_location: Optional[str] = None
    to_warehouse: Optional[str] = None
    total_cost: Optional[float] = None
    unit_cost: Optional[float] = None
    uom_code: Optional[str] = None
    variation_code: Optional[str] = None
    variation_name: Optional[str] = None

class Vwstockmovement(VwstockmovementBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwstockturnoverBase(BaseModel):
    avg_inventory: Optional[float] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    days_since_last_sale: Optional[int] = None
    last_sale_date: Optional[datetime]
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_sold_30days: Optional[float] = None
    turnover_rate_30days: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None

class VwstockturnoverCreate(VwstockturnoverBase):
    pass

class VwstockturnoverUpdate(BaseModel):
    avg_inventory: Optional[float] = None
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    days_since_last_sale: Optional[int] = None
    last_sale_date: Optional[datetime] = None
    product_code: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    qty_sold_30days: Optional[float] = None
    turnover_rate_30days: Optional[float] = None
    variation_code: Optional[str] = None
    variation_id: Optional[int] = None
    variation_name: Optional[str] = None

class Vwstockturnover(VwstockturnoverBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwsupplychainkpiBase(BaseModel):
    active_products: Optional[int] = None
    adjustments_today: Optional[int] = None
    open_po_value: Optional[float] = None
    open_purchase_orders: Optional[int] = None
    open_sales_orders: Optional[int] = None
    open_so_value: Optional[float] = None
    open_transfers: Optional[int] = None
    products_to_reorder: Optional[int] = None
    receipts_today: Optional[int] = None
    report_date: Optional[datetime]
    shipments_today: Optional[int] = None
    total_inventory_qty: Optional[float] = None
    total_inventory_value: Optional[float] = None

class VwsupplychainkpiCreate(VwsupplychainkpiBase):
    pass

class VwsupplychainkpiUpdate(BaseModel):
    active_products: Optional[int] = None
    adjustments_today: Optional[int] = None
    open_po_value: Optional[float] = None
    open_purchase_orders: Optional[int] = None
    open_sales_orders: Optional[int] = None
    open_so_value: Optional[float] = None
    open_transfers: Optional[int] = None
    products_to_reorder: Optional[int] = None
    receipts_today: Optional[int] = None
    report_date: Optional[datetime] = None
    shipments_today: Optional[int] = None
    total_inventory_qty: Optional[float] = None
    total_inventory_value: Optional[float] = None

class Vwsupplychainkpi(VwsupplychainkpiBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwwarehousetransferstatusBase(BaseModel):
    from_warehouse: Optional[str] = None
    status_description: Optional[str] = None
    to_warehouse: Optional[str] = None
    total_line_items: Optional[int] = None
    total_pending_qty: Optional[float] = None
    total_received_qty: Optional[float] = None
    total_sent_qty: Optional[float] = None
    total_transfer_qty: Optional[float] = None
    transfer_date: Optional[datetime]
    transfer_id: Optional[int] = None
    transfer_number: Optional[str] = None
    transfer_status: Optional[str] = None

class VwwarehousetransferstatusCreate(VwwarehousetransferstatusBase):
    pass

class VwwarehousetransferstatusUpdate(BaseModel):
    from_warehouse: Optional[str] = None
    status_description: Optional[str] = None
    to_warehouse: Optional[str] = None
    total_line_items: Optional[int] = None
    total_pending_qty: Optional[float] = None
    total_received_qty: Optional[float] = None
    total_sent_qty: Optional[float] = None
    total_transfer_qty: Optional[float] = None
    transfer_date: Optional[datetime] = None
    transfer_id: Optional[int] = None
    transfer_number: Optional[str] = None
    transfer_status: Optional[str] = None

class Vwwarehousetransferstatus(VwwarehousetransferstatusBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class VwwarehouseutilizationBase(BaseModel):
    empty_locations: Optional[int] = None
    location_utilization_percentage: Optional[float] = None
    occupied_locations: Optional[int] = None
    total_items: Optional[float] = None
    total_locations: Optional[int] = None
    total_volume_used: Optional[float] = None
    unique_products: Optional[int] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class VwwarehouseutilizationCreate(VwwarehouseutilizationBase):
    pass

class VwwarehouseutilizationUpdate(BaseModel):
    empty_locations: Optional[int] = None
    location_utilization_percentage: Optional[float] = None
    occupied_locations: Optional[int] = None
    total_items: Optional[float] = None
    total_locations: Optional[int] = None
    total_volume_used: Optional[float] = None
    unique_products: Optional[int] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

class Vwwarehouseutilization(VwwarehouseutilizationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class WarehouseBase(BaseModel):
    warehouse_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    warehouse_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    warehouse_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    warehouse_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[int] = None

class Warehouse(WarehouseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class WarehousetransferBase(BaseModel):
    transfer_id: Optional[int] = None
    company_id: Optional[int] = None
    transfer_number: Optional[str] = None
    from_warehouse_id: Optional[int] = None
    to_warehouse_id: Optional[int] = None
    transfer_date: Optional[datetime]
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class WarehousetransferCreate(WarehousetransferBase):
    pass

class WarehousetransferUpdate(BaseModel):
    transfer_id: Optional[int] = None
    company_id: Optional[int] = None
    transfer_number: Optional[str] = None
    from_warehouse_id: Optional[int] = None
    to_warehouse_id: Optional[int] = None
    transfer_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None

class Warehousetransfer(WarehousetransferBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class WarehousetransferitemBase(BaseModel):
    transfer_item_id: Optional[int] = None
    transfer_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    from_location_id: Optional[int] = None
    to_location_id: Optional[int] = None
    quantity: Optional[float] = None
    quantity_sent: Optional[float] = None
    quantity_received: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class WarehousetransferitemCreate(WarehousetransferitemBase):
    pass

class WarehousetransferitemUpdate(BaseModel):
    transfer_item_id: Optional[int] = None
    transfer_id: Optional[int] = None
    product_id: Optional[int] = None
    variation_id: Optional[int] = None
    from_location_id: Optional[int] = None
    to_location_id: Optional[int] = None
    quantity: Optional[float] = None
    quantity_sent: Optional[float] = None
    quantity_received: Optional[float] = None
    uom_id: Optional[int] = None
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Warehousetransferitem(WarehousetransferitemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
