from app.crud.base import CRUDBase

from app.models.domain_erp import (
    Account,
    Accountdailybalance,
    Accountingcode,
    Accountperiodbalance,
    Accounttype,
    Addendum,
    Address,
    Addresstype,
    Ageaddendum,
    Apierror,
    Attributetype,
    Attributevalue,
    Auditlog,
    Auditlogarchive,
    Bankaccount,
    Bankreconciliation,
    Bankslip,
    Batchchk,
    Batchdetail,
    Batchtracking,
    Beneficiary,
    Billingcycle,
    Billingrule,
    Billingruleapplication,
    Brand,
    Budget,
    Budgetitem,
    Budgetperiod,
    Category,
    Cepcache,
    Charge,
    City,
    Communicationchannel,
    Company,
    Contact,
    Contactbankaccount,
    Contacttype,
    Contract,
    Contractaccess,
    Contractactive,
    Contractaddendum,
    Contractbilling,
    Contractcharge,
    Contractconfigbilling,
    Contractcovers,
    Contractevents,
    Contractpool,
    Contractstatus,
    Contractstatushistory,
    Contractvalidation,
    Contractversion,
    Costcenter,
    Currency,
    Customer,
    Customerreturn,
    Customerreturnitem,
    Deathevent,
    Department,
    Doctosend,
    Document,
    Documentbatch,
    Documentbatchitem,
    Documentevent,
    Documenttype,
    Driver,
    Driverdocument,
    Driverstatus,
    Entityaddress,
    Entitydocument,
    Equipamentrental,
    Expensetype,
    Financialratio,
    Financialratiovalue,
    Fiscalperiod,
    Fiscalyear,
    Gender,
    Goodsreceipt,
    Goodsreceiptitem,
    Groupbatch,
    Integrationmapping,
    Integrationsetting,
    Integrationsynclog,
    Inventoryadjustment,
    Inventoryadjustmentitem,
    Journal,
    Journalattachment,
    Journalline,
    Journaltype,
    Logeventtype,
    Maintenance,
    Maintenancedocument,
    Maintenancestatus,
    Medicalfoward,
    Membershipcard,
    Messagetemplate,
    Ordpgrc,
    Partner,
    Partnerbankaccount,
    Partnertype,
    Paymentmethod,
    Paymentplan,
    Paymentplaninstallment,
    Paymentreceipt,
    Paymentstatus,
    Paymenttransaction,
    Performedservice,
    Product,
    Productcategory,
    Productimage,
    Productpricing,
    Productsupplier,
    Productvariation,
    Project,
    Proratedservice,
    Purchaseorder,
    Purchaseorderitem,
    Purchaserequisition,
    Purchaserequisitionitem,
    Reconciliationitem,
    Region,
    Reportdefinition,
    Requestforquotation,
    Rfqitem,
    Rfqsupplier,
    Salesallocation,
    Salesbatches,
    Salescommission,
    Salesdistribution,
    Salesorder,
    Salesorderitem,
    Schemaversion,
    Serialtracking,
    Servicefuneral,
    Servicetype,
    Shipment,
    Shipmentitem,
    Specialty,
    State,
    Statemachinetransitions,
    Status,
    Statusreason,
    Stockcount,
    Stockcountitem,
    Stocklevel,
    Stockmovement,
    Stockmovementtype,
    Stockreservation,
    Storagelocation,
    Subsidiary,
    Supplier,
    Supplierquotation,
    Supplierquotationitem,
    Supplierreturn,
    Supplierreturnitem,
    Sysauditlog,
    Sysgroup,
    Sysgroupprogram,
    Syspreference,
    Sysprogram,
    Syssetting,
    Sysunit,
    Sysuser,
    Sysusergroup,
    Sysuserprogram,
    Sysuserunit,
    Taxcode,
    Transaction,
    Transactionallocation,
    Transactiontype,
    Trip,
    Tripdocument,
    Tripstatus,
    Unitsofmeasurement,
    Usercompanyaccess,
    Validationrule,
    Variationattribute,
    Vehicle,
    Vehicledailylog,
    Vehicledocument,
    Vehicleexpense,
    Vehicleexpensestatus,
    Vehiclerequest,
    Vehiclerequeststatus,
    Vehiclerequesttype,
    Vehiclestatus,
    Vehicletype,
    Viewaccountsreceivableaging,
    Viewbalancesheet,
    Viewbudgetvsactual,
    Viewcashflow,
    Viewconsolidatedfinancials,
    Viewgeneralledger,
    Viewincomestatement,
    Viewtrialbalance,
    Vwbatchexpiry,
    Vwcurrentinventory,
    Vwinventoryaging,
    Vwinventoryvaluation,
    Vwproductperformance,
    Vwpurchaseorderstatus,
    Vwreorderrecommendation,
    Vwsalesorderstatus,
    Vwstockaccuracy,
    Vwstockmovement,
    Vwstockturnover,
    Vwsupplychainkpi,
    Vwwarehousetransferstatus,
    Vwwarehouseutilization,
    Warehouse,
    Warehousetransfer,
    Warehousetransferitem
)

from app.schemas.domain_erp import (
    AccountCreate, AccountUpdate,
    AccountdailybalanceCreate, AccountdailybalanceUpdate,
    AccountingcodeCreate, AccountingcodeUpdate,
    AccountperiodbalanceCreate, AccountperiodbalanceUpdate,
    AccounttypeCreate, AccounttypeUpdate,
    AddendumCreate, AddendumUpdate,
    AddressCreate, AddressUpdate,
    AddresstypeCreate, AddresstypeUpdate,
    AgeaddendumCreate, AgeaddendumUpdate,
    ApierrorCreate, ApierrorUpdate,
    AttributetypeCreate, AttributetypeUpdate,
    AttributevalueCreate, AttributevalueUpdate,
    AuditlogCreate, AuditlogUpdate,
    AuditlogarchiveCreate, AuditlogarchiveUpdate,
    BankaccountCreate, BankaccountUpdate,
    BankreconciliationCreate, BankreconciliationUpdate,
    BankslipCreate, BankslipUpdate,
    BatchchkCreate, BatchchkUpdate,
    BatchdetailCreate, BatchdetailUpdate,
    BatchtrackingCreate, BatchtrackingUpdate,
    BeneficiaryCreate, BeneficiaryUpdate,
    BillingcycleCreate, BillingcycleUpdate,
    BillingruleCreate, BillingruleUpdate,
    BillingruleapplicationCreate, BillingruleapplicationUpdate,
    BrandCreate, BrandUpdate,
    BudgetCreate, BudgetUpdate,
    BudgetitemCreate, BudgetitemUpdate,
    BudgetperiodCreate, BudgetperiodUpdate,
    CategoryCreate, CategoryUpdate,
    CepcacheCreate, CepcacheUpdate,
    ChargeCreate, ChargeUpdate,
    CityCreate, CityUpdate,
    CommunicationchannelCreate, CommunicationchannelUpdate,
    CompanyCreate, CompanyUpdate,
    ContactCreate, ContactUpdate,
    ContactbankaccountCreate, ContactbankaccountUpdate,
    ContacttypeCreate, ContacttypeUpdate,
    ContractCreate, ContractUpdate,
    ContractaccessCreate, ContractaccessUpdate,
    ContractactiveCreate, ContractactiveUpdate,
    ContractaddendumCreate, ContractaddendumUpdate,
    ContractbillingCreate, ContractbillingUpdate,
    ContractchargeCreate, ContractchargeUpdate,
    ContractconfigbillingCreate, ContractconfigbillingUpdate,
    ContractcoversCreate, ContractcoversUpdate,
    ContracteventsCreate, ContracteventsUpdate,
    ContractpoolCreate, ContractpoolUpdate,
    ContractstatusCreate, ContractstatusUpdate,
    ContractstatushistoryCreate, ContractstatushistoryUpdate,
    ContractvalidationCreate, ContractvalidationUpdate,
    ContractversionCreate, ContractversionUpdate,
    CostcenterCreate, CostcenterUpdate,
    CurrencyCreate, CurrencyUpdate,
    CustomerCreate, CustomerUpdate,
    CustomerreturnCreate, CustomerreturnUpdate,
    CustomerreturnitemCreate, CustomerreturnitemUpdate,
    DeatheventCreate, DeatheventUpdate,
    DepartmentCreate, DepartmentUpdate,
    DoctosendCreate, DoctosendUpdate,
    DocumentCreate, DocumentUpdate,
    DocumentbatchCreate, DocumentbatchUpdate,
    DocumentbatchitemCreate, DocumentbatchitemUpdate,
    DocumenteventCreate, DocumenteventUpdate,
    DocumenttypeCreate, DocumenttypeUpdate,
    DriverCreate, DriverUpdate,
    DriverdocumentCreate, DriverdocumentUpdate,
    DriverstatusCreate, DriverstatusUpdate,
    EntityaddressCreate, EntityaddressUpdate,
    EntitydocumentCreate, EntitydocumentUpdate,
    EquipamentrentalCreate, EquipamentrentalUpdate,
    ExpensetypeCreate, ExpensetypeUpdate,
    FinancialratioCreate, FinancialratioUpdate,
    FinancialratiovalueCreate, FinancialratiovalueUpdate,
    FiscalperiodCreate, FiscalperiodUpdate,
    FiscalyearCreate, FiscalyearUpdate,
    GenderCreate, GenderUpdate,
    GoodsreceiptCreate, GoodsreceiptUpdate,
    GoodsreceiptitemCreate, GoodsreceiptitemUpdate,
    GroupbatchCreate, GroupbatchUpdate,
    IntegrationmappingCreate, IntegrationmappingUpdate,
    IntegrationsettingCreate, IntegrationsettingUpdate,
    IntegrationsynclogCreate, IntegrationsynclogUpdate,
    InventoryadjustmentCreate, InventoryadjustmentUpdate,
    InventoryadjustmentitemCreate, InventoryadjustmentitemUpdate,
    JournalCreate, JournalUpdate,
    JournalattachmentCreate, JournalattachmentUpdate,
    JournallineCreate, JournallineUpdate,
    JournaltypeCreate, JournaltypeUpdate,
    LogeventtypeCreate, LogeventtypeUpdate,
    MaintenanceCreate, MaintenanceUpdate,
    MaintenancedocumentCreate, MaintenancedocumentUpdate,
    MaintenancestatusCreate, MaintenancestatusUpdate,
    MedicalfowardCreate, MedicalfowardUpdate,
    MembershipcardCreate, MembershipcardUpdate,
    MessagetemplateCreate, MessagetemplateUpdate,
    OrdpgrcCreate, OrdpgrcUpdate,
    PartnerCreate, PartnerUpdate,
    PartnerbankaccountCreate, PartnerbankaccountUpdate,
    PartnertypeCreate, PartnertypeUpdate,
    PaymentmethodCreate, PaymentmethodUpdate,
    PaymentplanCreate, PaymentplanUpdate,
    PaymentplaninstallmentCreate, PaymentplaninstallmentUpdate,
    PaymentreceiptCreate, PaymentreceiptUpdate,
    PaymentstatusCreate, PaymentstatusUpdate,
    PaymenttransactionCreate, PaymenttransactionUpdate,
    PerformedserviceCreate, PerformedserviceUpdate,
    ProductCreate, ProductUpdate,
    ProductcategoryCreate, ProductcategoryUpdate,
    ProductimageCreate, ProductimageUpdate,
    ProductpricingCreate, ProductpricingUpdate,
    ProductsupplierCreate, ProductsupplierUpdate,
    ProductvariationCreate, ProductvariationUpdate,
    ProjectCreate, ProjectUpdate,
    ProratedserviceCreate, ProratedserviceUpdate,
    PurchaseorderCreate, PurchaseorderUpdate,
    PurchaseorderitemCreate, PurchaseorderitemUpdate,
    PurchaserequisitionCreate, PurchaserequisitionUpdate,
    PurchaserequisitionitemCreate, PurchaserequisitionitemUpdate,
    ReconciliationitemCreate, ReconciliationitemUpdate,
    RegionCreate, RegionUpdate,
    ReportdefinitionCreate, ReportdefinitionUpdate,
    RequestforquotationCreate, RequestforquotationUpdate,
    RfqitemCreate, RfqitemUpdate,
    RfqsupplierCreate, RfqsupplierUpdate,
    SalesallocationCreate, SalesallocationUpdate,
    SalesbatchesCreate, SalesbatchesUpdate,
    SalescommissionCreate, SalescommissionUpdate,
    SalesdistributionCreate, SalesdistributionUpdate,
    SalesorderCreate, SalesorderUpdate,
    SalesorderitemCreate, SalesorderitemUpdate,
    SchemaversionCreate, SchemaversionUpdate,
    SerialtrackingCreate, SerialtrackingUpdate,
    ServicefuneralCreate, ServicefuneralUpdate,
    ServicetypeCreate, ServicetypeUpdate,
    ShipmentCreate, ShipmentUpdate,
    ShipmentitemCreate, ShipmentitemUpdate,
    SpecialtyCreate, SpecialtyUpdate,
    StateCreate, StateUpdate,
    StatemachinetransitionsCreate, StatemachinetransitionsUpdate,
    StatusCreate, StatusUpdate,
    StatusreasonCreate, StatusreasonUpdate,
    StockcountCreate, StockcountUpdate,
    StockcountitemCreate, StockcountitemUpdate,
    StocklevelCreate, StocklevelUpdate,
    StockmovementCreate, StockmovementUpdate,
    StockmovementtypeCreate, StockmovementtypeUpdate,
    StockreservationCreate, StockreservationUpdate,
    StoragelocationCreate, StoragelocationUpdate,
    SubsidiaryCreate, SubsidiaryUpdate,
    SupplierCreate, SupplierUpdate,
    SupplierquotationCreate, SupplierquotationUpdate,
    SupplierquotationitemCreate, SupplierquotationitemUpdate,
    SupplierreturnCreate, SupplierreturnUpdate,
    SupplierreturnitemCreate, SupplierreturnitemUpdate,
    SysauditlogCreate, SysauditlogUpdate,
    SysgroupCreate, SysgroupUpdate,
    SysgroupprogramCreate, SysgroupprogramUpdate,
    SyspreferenceCreate, SyspreferenceUpdate,
    SysprogramCreate, SysprogramUpdate,
    SyssettingCreate, SyssettingUpdate,
    SysunitCreate, SysunitUpdate,
    SysuserCreate, SysuserUpdate,
    SysusergroupCreate, SysusergroupUpdate,
    SysuserprogramCreate, SysuserprogramUpdate,
    SysuserunitCreate, SysuserunitUpdate,
    TaxcodeCreate, TaxcodeUpdate,
    TransactionCreate, TransactionUpdate,
    TransactionallocationCreate, TransactionallocationUpdate,
    TransactiontypeCreate, TransactiontypeUpdate,
    TripCreate, TripUpdate,
    TripdocumentCreate, TripdocumentUpdate,
    TripstatusCreate, TripstatusUpdate,
    UnitsofmeasurementCreate, UnitsofmeasurementUpdate,
    UsercompanyaccessCreate, UsercompanyaccessUpdate,
    ValidationruleCreate, ValidationruleUpdate,
    VariationattributeCreate, VariationattributeUpdate,
    VehicleCreate, VehicleUpdate,
    VehicledailylogCreate, VehicledailylogUpdate,
    VehicledocumentCreate, VehicledocumentUpdate,
    VehicleexpenseCreate, VehicleexpenseUpdate,
    VehicleexpensestatusCreate, VehicleexpensestatusUpdate,
    VehiclerequestCreate, VehiclerequestUpdate,
    VehiclerequeststatusCreate, VehiclerequeststatusUpdate,
    VehiclerequesttypeCreate, VehiclerequesttypeUpdate,
    VehiclestatusCreate, VehiclestatusUpdate,
    VehicletypeCreate, VehicletypeUpdate,
    ViewaccountsreceivableagingCreate, ViewaccountsreceivableagingUpdate,
    ViewbalancesheetCreate, ViewbalancesheetUpdate,
    ViewbudgetvsactualCreate, ViewbudgetvsactualUpdate,
    ViewcashflowCreate, ViewcashflowUpdate,
    ViewconsolidatedfinancialsCreate, ViewconsolidatedfinancialsUpdate,
    ViewgeneralledgerCreate, ViewgeneralledgerUpdate,
    ViewincomestatementCreate, ViewincomestatementUpdate,
    ViewtrialbalanceCreate, ViewtrialbalanceUpdate,
    VwbatchexpiryCreate, VwbatchexpiryUpdate,
    VwcurrentinventoryCreate, VwcurrentinventoryUpdate,
    VwinventoryagingCreate, VwinventoryagingUpdate,
    VwinventoryvaluationCreate, VwinventoryvaluationUpdate,
    VwproductperformanceCreate, VwproductperformanceUpdate,
    VwpurchaseorderstatusCreate, VwpurchaseorderstatusUpdate,
    VwreorderrecommendationCreate, VwreorderrecommendationUpdate,
    VwsalesorderstatusCreate, VwsalesorderstatusUpdate,
    VwstockaccuracyCreate, VwstockaccuracyUpdate,
    VwstockmovementCreate, VwstockmovementUpdate,
    VwstockturnoverCreate, VwstockturnoverUpdate,
    VwsupplychainkpiCreate, VwsupplychainkpiUpdate,
    VwwarehousetransferstatusCreate, VwwarehousetransferstatusUpdate,
    VwwarehouseutilizationCreate, VwwarehouseutilizationUpdate,
    WarehouseCreate, WarehouseUpdate,
    WarehousetransferCreate, WarehousetransferUpdate,
    WarehousetransferitemCreate, WarehousetransferitemUpdate
)

crud_account = CRUDBase[Account, AccountCreate, AccountUpdate](Account)
crud_accounting_code = CRUDBase[Accountingcode, AccountingcodeCreate, AccountingcodeUpdate](Accountingcode)
crud_account_daily_balance = CRUDBase[Accountdailybalance, AccountdailybalanceCreate, AccountdailybalanceUpdate](Accountdailybalance)
crud_account_period_balance = CRUDBase[Accountperiodbalance, AccountperiodbalanceCreate, AccountperiodbalanceUpdate](Accountperiodbalance)
crud_account_type = CRUDBase[Accounttype, AccounttypeCreate, AccounttypeUpdate](Accounttype)
crud_addendum = CRUDBase[Addendum, AddendumCreate, AddendumUpdate](Addendum)
crud_address = CRUDBase[Address, AddressCreate, AddressUpdate](Address)
crud_address_type = CRUDBase[Addresstype, AddresstypeCreate, AddresstypeUpdate](Addresstype)
crud_age_addendum = CRUDBase[Ageaddendum, AgeaddendumCreate, AgeaddendumUpdate](Ageaddendum)
crud_api_error = CRUDBase[Apierror, ApierrorCreate, ApierrorUpdate](Apierror)
crud_attribute_type = CRUDBase[Attributetype, AttributetypeCreate, AttributetypeUpdate](Attributetype)
crud_attribute_value = CRUDBase[Attributevalue, AttributevalueCreate, AttributevalueUpdate](Attributevalue)
crud_audit_log = CRUDBase[Auditlog, AuditlogCreate, AuditlogUpdate](Auditlog)
crud_audit_log_archive = CRUDBase[Auditlogarchive, AuditlogarchiveCreate, AuditlogarchiveUpdate](Auditlogarchive)
crud_bank_account = CRUDBase[Bankaccount, BankaccountCreate, BankaccountUpdate](Bankaccount)
crud_bank_reconciliation = CRUDBase[Bankreconciliation, BankreconciliationCreate, BankreconciliationUpdate](Bankreconciliation)
crud_bank_slip = CRUDBase[Bankslip, BankslipCreate, BankslipUpdate](Bankslip)
crud_batch_chk = CRUDBase[Batchchk, BatchchkCreate, BatchchkUpdate](Batchchk)
crud_batch_detail = CRUDBase[Batchdetail, BatchdetailCreate, BatchdetailUpdate](Batchdetail)
crud_batch_tracking = CRUDBase[Batchtracking, BatchtrackingCreate, BatchtrackingUpdate](Batchtracking)
crud_beneficiary = CRUDBase[Beneficiary, BeneficiaryCreate, BeneficiaryUpdate](Beneficiary)
crud_billing_cycle = CRUDBase[Billingcycle, BillingcycleCreate, BillingcycleUpdate](Billingcycle)
crud_billing_rule = CRUDBase[Billingrule, BillingruleCreate, BillingruleUpdate](Billingrule)
crud_billing_rule_application = CRUDBase[Billingruleapplication, BillingruleapplicationCreate, BillingruleapplicationUpdate](Billingruleapplication)
crud_brand = CRUDBase[Brand, BrandCreate, BrandUpdate](Brand)
crud_budget = CRUDBase[Budget, BudgetCreate, BudgetUpdate](Budget)
crud_budget_item = CRUDBase[Budgetitem, BudgetitemCreate, BudgetitemUpdate](Budgetitem)
crud_budget_period = CRUDBase[Budgetperiod, BudgetperiodCreate, BudgetperiodUpdate](Budgetperiod)
crud_category = CRUDBase[Category, CategoryCreate, CategoryUpdate](Category)
crud_cep_cache = CRUDBase[Cepcache, CepcacheCreate, CepcacheUpdate](Cepcache)
crud_charge = CRUDBase[Charge, ChargeCreate, ChargeUpdate](Charge)
crud_city = CRUDBase[City, CityCreate, CityUpdate](City)
crud_communication_channel = CRUDBase[Communicationchannel, CommunicationchannelCreate, CommunicationchannelUpdate](Communicationchannel)
crud_company = CRUDBase[Company, CompanyCreate, CompanyUpdate](Company)
crud_contact = CRUDBase[Contact, ContactCreate, ContactUpdate](Contact)
crud_contact_bank_account = CRUDBase[Contactbankaccount, ContactbankaccountCreate, ContactbankaccountUpdate](Contactbankaccount)
crud_contact_type = CRUDBase[Contacttype, ContacttypeCreate, ContacttypeUpdate](Contacttype)
crud_contract = CRUDBase[Contract, ContractCreate, ContractUpdate](Contract)
crud_contract_access = CRUDBase[Contractaccess, ContractaccessCreate, ContractaccessUpdate](Contractaccess)
crud_contract_active = CRUDBase[Contractactive, ContractactiveCreate, ContractactiveUpdate](Contractactive)
crud_contract_addendum = CRUDBase[Contractaddendum, ContractaddendumCreate, ContractaddendumUpdate](Contractaddendum)
crud_contract_billing = CRUDBase[Contractbilling, ContractbillingCreate, ContractbillingUpdate](Contractbilling)
crud_contract_charge = CRUDBase[Contractcharge, ContractchargeCreate, ContractchargeUpdate](Contractcharge)
crud_contract_config_billing = CRUDBase[Contractconfigbilling, ContractconfigbillingCreate, ContractconfigbillingUpdate](Contractconfigbilling)
crud_contract_covers = CRUDBase[Contractcovers, ContractcoversCreate, ContractcoversUpdate](Contractcovers)
crud_contract_events = CRUDBase[Contractevents, ContracteventsCreate, ContracteventsUpdate](Contractevents)
crud_contract_pool = CRUDBase[Contractpool, ContractpoolCreate, ContractpoolUpdate](Contractpool)
crud_contract_status = CRUDBase[Contractstatus, ContractstatusCreate, ContractstatusUpdate](Contractstatus)
crud_contract_status_history = CRUDBase[Contractstatushistory, ContractstatushistoryCreate, ContractstatushistoryUpdate](Contractstatushistory)
crud_contract_validation = CRUDBase[Contractvalidation, ContractvalidationCreate, ContractvalidationUpdate](Contractvalidation)
crud_contract_version = CRUDBase[Contractversion, ContractversionCreate, ContractversionUpdate](Contractversion)
crud_cost_center = CRUDBase[Costcenter, CostcenterCreate, CostcenterUpdate](Costcenter)
crud_currency = CRUDBase[Currency, CurrencyCreate, CurrencyUpdate](Currency)
crud_customer = CRUDBase[Customer, CustomerCreate, CustomerUpdate](Customer)
crud_customer_return = CRUDBase[Customerreturn, CustomerreturnCreate, CustomerreturnUpdate](Customerreturn)
crud_customer_return_item = CRUDBase[Customerreturnitem, CustomerreturnitemCreate, CustomerreturnitemUpdate](Customerreturnitem)
crud_death_event = CRUDBase[Deathevent, DeatheventCreate, DeatheventUpdate](Deathevent)
crud_department = CRUDBase[Department, DepartmentCreate, DepartmentUpdate](Department)
crud_document = CRUDBase[Document, DocumentCreate, DocumentUpdate](Document)
crud_document_batch = CRUDBase[Documentbatch, DocumentbatchCreate, DocumentbatchUpdate](Documentbatch)
crud_document_batch_item = CRUDBase[Documentbatchitem, DocumentbatchitemCreate, DocumentbatchitemUpdate](Documentbatchitem)
crud_document_event = CRUDBase[Documentevent, DocumenteventCreate, DocumenteventUpdate](Documentevent)
crud_document_type = CRUDBase[Documenttype, DocumenttypeCreate, DocumenttypeUpdate](Documenttype)
crud_doc_to_send = CRUDBase[Doctosend, DoctosendCreate, DoctosendUpdate](Doctosend)
crud_driver = CRUDBase[Driver, DriverCreate, DriverUpdate](Driver)
crud_driver_document = CRUDBase[Driverdocument, DriverdocumentCreate, DriverdocumentUpdate](Driverdocument)
crud_driver_status = CRUDBase[Driverstatus, DriverstatusCreate, DriverstatusUpdate](Driverstatus)
crud_entity_address = CRUDBase[Entityaddress, EntityaddressCreate, EntityaddressUpdate](Entityaddress)
crud_entity_document = CRUDBase[Entitydocument, EntitydocumentCreate, EntitydocumentUpdate](Entitydocument)
crud_equipament_rental = CRUDBase[Equipamentrental, EquipamentrentalCreate, EquipamentrentalUpdate](Equipamentrental)
crud_expense_type = CRUDBase[Expensetype, ExpensetypeCreate, ExpensetypeUpdate](Expensetype)
crud_financial_ratio = CRUDBase[Financialratio, FinancialratioCreate, FinancialratioUpdate](Financialratio)
crud_financial_ratio_value = CRUDBase[Financialratiovalue, FinancialratiovalueCreate, FinancialratiovalueUpdate](Financialratiovalue)
crud_fiscal_period = CRUDBase[Fiscalperiod, FiscalperiodCreate, FiscalperiodUpdate](Fiscalperiod)
crud_fiscal_year = CRUDBase[Fiscalyear, FiscalyearCreate, FiscalyearUpdate](Fiscalyear)
crud_gender = CRUDBase[Gender, GenderCreate, GenderUpdate](Gender)
crud_goods_receipt = CRUDBase[Goodsreceipt, GoodsreceiptCreate, GoodsreceiptUpdate](Goodsreceipt)
crud_goods_receipt_item = CRUDBase[Goodsreceiptitem, GoodsreceiptitemCreate, GoodsreceiptitemUpdate](Goodsreceiptitem)
crud_group_batch = CRUDBase[Groupbatch, GroupbatchCreate, GroupbatchUpdate](Groupbatch)
crud_integration_mapping = CRUDBase[Integrationmapping, IntegrationmappingCreate, IntegrationmappingUpdate](Integrationmapping)
crud_integration_setting = CRUDBase[Integrationsetting, IntegrationsettingCreate, IntegrationsettingUpdate](Integrationsetting)
crud_integration_sync_log = CRUDBase[Integrationsynclog, IntegrationsynclogCreate, IntegrationsynclogUpdate](Integrationsynclog)
crud_inventory_adjustment = CRUDBase[Inventoryadjustment, InventoryadjustmentCreate, InventoryadjustmentUpdate](Inventoryadjustment)
crud_inventory_adjustment_item = CRUDBase[Inventoryadjustmentitem, InventoryadjustmentitemCreate, InventoryadjustmentitemUpdate](Inventoryadjustmentitem)
crud_journal = CRUDBase[Journal, JournalCreate, JournalUpdate](Journal)
crud_journal_attachment = CRUDBase[Journalattachment, JournalattachmentCreate, JournalattachmentUpdate](Journalattachment)
crud_journal_line = CRUDBase[Journalline, JournallineCreate, JournallineUpdate](Journalline)
crud_journal_type = CRUDBase[Journaltype, JournaltypeCreate, JournaltypeUpdate](Journaltype)
crud_log_event_type = CRUDBase[Logeventtype, LogeventtypeCreate, LogeventtypeUpdate](Logeventtype)
crud_maintenance = CRUDBase[Maintenance, MaintenanceCreate, MaintenanceUpdate](Maintenance)
crud_maintenance_document = CRUDBase[Maintenancedocument, MaintenancedocumentCreate, MaintenancedocumentUpdate](Maintenancedocument)
crud_maintenance_status = CRUDBase[Maintenancestatus, MaintenancestatusCreate, MaintenancestatusUpdate](Maintenancestatus)
crud_medical_foward = CRUDBase[Medicalfoward, MedicalfowardCreate, MedicalfowardUpdate](Medicalfoward)
crud_membership_card = CRUDBase[Membershipcard, MembershipcardCreate, MembershipcardUpdate](Membershipcard)
crud_message_template = CRUDBase[Messagetemplate, MessagetemplateCreate, MessagetemplateUpdate](Messagetemplate)
crud_ordpgrc = CRUDBase[Ordpgrc, OrdpgrcCreate, OrdpgrcUpdate](Ordpgrc)
crud_partner = CRUDBase[Partner, PartnerCreate, PartnerUpdate](Partner)
crud_partner_bank_account = CRUDBase[Partnerbankaccount, PartnerbankaccountCreate, PartnerbankaccountUpdate](Partnerbankaccount)
crud_partner_type = CRUDBase[Partnertype, PartnertypeCreate, PartnertypeUpdate](Partnertype)
crud_payment_method = CRUDBase[Paymentmethod, PaymentmethodCreate, PaymentmethodUpdate](Paymentmethod)
crud_payment_plan = CRUDBase[Paymentplan, PaymentplanCreate, PaymentplanUpdate](Paymentplan)
crud_payment_plan_installment = CRUDBase[Paymentplaninstallment, PaymentplaninstallmentCreate, PaymentplaninstallmentUpdate](Paymentplaninstallment)
crud_payment_receipt = CRUDBase[Paymentreceipt, PaymentreceiptCreate, PaymentreceiptUpdate](Paymentreceipt)
crud_payment_status = CRUDBase[Paymentstatus, PaymentstatusCreate, PaymentstatusUpdate](Paymentstatus)
crud_payment_transaction = CRUDBase[Paymenttransaction, PaymenttransactionCreate, PaymenttransactionUpdate](Paymenttransaction)
crud_performed_service = CRUDBase[Performedservice, PerformedserviceCreate, PerformedserviceUpdate](Performedservice)
crud_product = CRUDBase[Product, ProductCreate, ProductUpdate](Product)
crud_product_category = CRUDBase[Productcategory, ProductcategoryCreate, ProductcategoryUpdate](Productcategory)
crud_product_image = CRUDBase[Productimage, ProductimageCreate, ProductimageUpdate](Productimage)
crud_product_pricing = CRUDBase[Productpricing, ProductpricingCreate, ProductpricingUpdate](Productpricing)
crud_product_supplier = CRUDBase[Productsupplier, ProductsupplierCreate, ProductsupplierUpdate](Productsupplier)
crud_product_variation = CRUDBase[Productvariation, ProductvariationCreate, ProductvariationUpdate](Productvariation)
crud_project = CRUDBase[Project, ProjectCreate, ProjectUpdate](Project)
crud_prorated_service = CRUDBase[Proratedservice, ProratedserviceCreate, ProratedserviceUpdate](Proratedservice)
crud_purchase_order = CRUDBase[Purchaseorder, PurchaseorderCreate, PurchaseorderUpdate](Purchaseorder)
crud_purchase_order_item = CRUDBase[Purchaseorderitem, PurchaseorderitemCreate, PurchaseorderitemUpdate](Purchaseorderitem)
crud_purchase_requisition = CRUDBase[Purchaserequisition, PurchaserequisitionCreate, PurchaserequisitionUpdate](Purchaserequisition)
crud_purchase_requisition_item = CRUDBase[Purchaserequisitionitem, PurchaserequisitionitemCreate, PurchaserequisitionitemUpdate](Purchaserequisitionitem)
crud_reconciliation_item = CRUDBase[Reconciliationitem, ReconciliationitemCreate, ReconciliationitemUpdate](Reconciliationitem)
crud_region = CRUDBase[Region, RegionCreate, RegionUpdate](Region)
crud_report_definition = CRUDBase[Reportdefinition, ReportdefinitionCreate, ReportdefinitionUpdate](Reportdefinition)
crud_request_for_quotation = CRUDBase[Requestforquotation, RequestforquotationCreate, RequestforquotationUpdate](Requestforquotation)
crud_rfq_item = CRUDBase[Rfqitem, RfqitemCreate, RfqitemUpdate](Rfqitem)
crud_rfq_supplier = CRUDBase[Rfqsupplier, RfqsupplierCreate, RfqsupplierUpdate](Rfqsupplier)
crud_sales_allocation = CRUDBase[Salesallocation, SalesallocationCreate, SalesallocationUpdate](Salesallocation)
crud_sales_batches = CRUDBase[Salesbatches, SalesbatchesCreate, SalesbatchesUpdate](Salesbatches)
crud_sales_commission = CRUDBase[Salescommission, SalescommissionCreate, SalescommissionUpdate](Salescommission)
crud_sales_distribution = CRUDBase[Salesdistribution, SalesdistributionCreate, SalesdistributionUpdate](Salesdistribution)
crud_sales_order = CRUDBase[Salesorder, SalesorderCreate, SalesorderUpdate](Salesorder)
crud_sales_order_item = CRUDBase[Salesorderitem, SalesorderitemCreate, SalesorderitemUpdate](Salesorderitem)
crud_schema_version = CRUDBase[Schemaversion, SchemaversionCreate, SchemaversionUpdate](Schemaversion)
crud_serial_tracking = CRUDBase[Serialtracking, SerialtrackingCreate, SerialtrackingUpdate](Serialtracking)
crud_service_funeral = CRUDBase[Servicefuneral, ServicefuneralCreate, ServicefuneralUpdate](Servicefuneral)
crud_service_type = CRUDBase[Servicetype, ServicetypeCreate, ServicetypeUpdate](Servicetype)
crud_shipment = CRUDBase[Shipment, ShipmentCreate, ShipmentUpdate](Shipment)
crud_shipment_item = CRUDBase[Shipmentitem, ShipmentitemCreate, ShipmentitemUpdate](Shipmentitem)
crud_specialty = CRUDBase[Specialty, SpecialtyCreate, SpecialtyUpdate](Specialty)
crud_state = CRUDBase[State, StateCreate, StateUpdate](State)
crud_state_machine_transitions = CRUDBase[Statemachinetransitions, StatemachinetransitionsCreate, StatemachinetransitionsUpdate](Statemachinetransitions)
crud_status = CRUDBase[Status, StatusCreate, StatusUpdate](Status)
crud_status_reason = CRUDBase[Statusreason, StatusreasonCreate, StatusreasonUpdate](Statusreason)
crud_stock_count = CRUDBase[Stockcount, StockcountCreate, StockcountUpdate](Stockcount)
crud_stock_count_item = CRUDBase[Stockcountitem, StockcountitemCreate, StockcountitemUpdate](Stockcountitem)
crud_stock_level = CRUDBase[Stocklevel, StocklevelCreate, StocklevelUpdate](Stocklevel)
crud_stock_movement = CRUDBase[Stockmovement, StockmovementCreate, StockmovementUpdate](Stockmovement)
crud_stock_movement_type = CRUDBase[Stockmovementtype, StockmovementtypeCreate, StockmovementtypeUpdate](Stockmovementtype)
crud_stock_reservation = CRUDBase[Stockreservation, StockreservationCreate, StockreservationUpdate](Stockreservation)
crud_storage_location = CRUDBase[Storagelocation, StoragelocationCreate, StoragelocationUpdate](Storagelocation)
crud_subsidiary = CRUDBase[Subsidiary, SubsidiaryCreate, SubsidiaryUpdate](Subsidiary)
crud_supplier = CRUDBase[Supplier, SupplierCreate, SupplierUpdate](Supplier)
crud_supplier_quotation = CRUDBase[Supplierquotation, SupplierquotationCreate, SupplierquotationUpdate](Supplierquotation)
crud_supplier_quotation_item = CRUDBase[Supplierquotationitem, SupplierquotationitemCreate, SupplierquotationitemUpdate](Supplierquotationitem)
crud_supplier_return = CRUDBase[Supplierreturn, SupplierreturnCreate, SupplierreturnUpdate](Supplierreturn)
crud_supplier_return_item = CRUDBase[Supplierreturnitem, SupplierreturnitemCreate, SupplierreturnitemUpdate](Supplierreturnitem)
crud_sys_audit_log = CRUDBase[Sysauditlog, SysauditlogCreate, SysauditlogUpdate](Sysauditlog)
crud_sys_group = CRUDBase[Sysgroup, SysgroupCreate, SysgroupUpdate](Sysgroup)
crud_sys_group_program = CRUDBase[Sysgroupprogram, SysgroupprogramCreate, SysgroupprogramUpdate](Sysgroupprogram)
crud_sys_preference = CRUDBase[Syspreference, SyspreferenceCreate, SyspreferenceUpdate](Syspreference)
crud_sys_program = CRUDBase[Sysprogram, SysprogramCreate, SysprogramUpdate](Sysprogram)
crud_sys_setting = CRUDBase[Syssetting, SyssettingCreate, SyssettingUpdate](Syssetting)
crud_sys_unit = CRUDBase[Sysunit, SysunitCreate, SysunitUpdate](Sysunit)
crud_sys_user = CRUDBase[Sysuser, SysuserCreate, SysuserUpdate](Sysuser)
crud_sys_user_group = CRUDBase[Sysusergroup, SysusergroupCreate, SysusergroupUpdate](Sysusergroup)
crud_sys_user_program = CRUDBase[Sysuserprogram, SysuserprogramCreate, SysuserprogramUpdate](Sysuserprogram)
crud_sys_user_unit = CRUDBase[Sysuserunit, SysuserunitCreate, SysuserunitUpdate](Sysuserunit)
crud_tax_code = CRUDBase[Taxcode, TaxcodeCreate, TaxcodeUpdate](Taxcode)
crud_transaction = CRUDBase[Transaction, TransactionCreate, TransactionUpdate](Transaction)
crud_transaction_allocation = CRUDBase[Transactionallocation, TransactionallocationCreate, TransactionallocationUpdate](Transactionallocation)
crud_transaction_type = CRUDBase[Transactiontype, TransactiontypeCreate, TransactiontypeUpdate](Transactiontype)
crud_trip = CRUDBase[Trip, TripCreate, TripUpdate](Trip)
crud_trip_document = CRUDBase[Tripdocument, TripdocumentCreate, TripdocumentUpdate](Tripdocument)
crud_trip_status = CRUDBase[Tripstatus, TripstatusCreate, TripstatusUpdate](Tripstatus)
crud_units_of_measurement = CRUDBase[Unitsofmeasurement, UnitsofmeasurementCreate, UnitsofmeasurementUpdate](Unitsofmeasurement)
crud_user_company_access = CRUDBase[Usercompanyaccess, UsercompanyaccessCreate, UsercompanyaccessUpdate](Usercompanyaccess)
crud_validation_rule = CRUDBase[Validationrule, ValidationruleCreate, ValidationruleUpdate](Validationrule)
crud_variation_attribute = CRUDBase[Variationattribute, VariationattributeCreate, VariationattributeUpdate](Variationattribute)
crud_vehicle = CRUDBase[Vehicle, VehicleCreate, VehicleUpdate](Vehicle)
crud_vehicle_daily_log = CRUDBase[Vehicledailylog, VehicledailylogCreate, VehicledailylogUpdate](Vehicledailylog)
crud_vehicle_document = CRUDBase[Vehicledocument, VehicledocumentCreate, VehicledocumentUpdate](Vehicledocument)
crud_vehicle_expense = CRUDBase[Vehicleexpense, VehicleexpenseCreate, VehicleexpenseUpdate](Vehicleexpense)
crud_vehicle_expense_status = CRUDBase[Vehicleexpensestatus, VehicleexpensestatusCreate, VehicleexpensestatusUpdate](Vehicleexpensestatus)
crud_vehicle_request = CRUDBase[Vehiclerequest, VehiclerequestCreate, VehiclerequestUpdate](Vehiclerequest)
crud_vehicle_request_status = CRUDBase[Vehiclerequeststatus, VehiclerequeststatusCreate, VehiclerequeststatusUpdate](Vehiclerequeststatus)
crud_vehicle_request_type = CRUDBase[Vehiclerequesttype, VehiclerequesttypeCreate, VehiclerequesttypeUpdate](Vehiclerequesttype)
crud_vehicle_status = CRUDBase[Vehiclestatus, VehiclestatusCreate, VehiclestatusUpdate](Vehiclestatus)
crud_vehicle_type = CRUDBase[Vehicletype, VehicletypeCreate, VehicletypeUpdate](Vehicletype)
crud_view_accounts_receivable_aging = CRUDBase[Viewaccountsreceivableaging, ViewaccountsreceivableagingCreate, ViewaccountsreceivableagingUpdate](Viewaccountsreceivableaging)
crud_view_balance_sheet = CRUDBase[Viewbalancesheet, ViewbalancesheetCreate, ViewbalancesheetUpdate](Viewbalancesheet)
crud_view_budget_vs_actual = CRUDBase[Viewbudgetvsactual, ViewbudgetvsactualCreate, ViewbudgetvsactualUpdate](Viewbudgetvsactual)
crud_view_cash_flow = CRUDBase[Viewcashflow, ViewcashflowCreate, ViewcashflowUpdate](Viewcashflow)
crud_view_consolidated_financials = CRUDBase[Viewconsolidatedfinancials, ViewconsolidatedfinancialsCreate, ViewconsolidatedfinancialsUpdate](Viewconsolidatedfinancials)
crud_view_general_ledger = CRUDBase[Viewgeneralledger, ViewgeneralledgerCreate, ViewgeneralledgerUpdate](Viewgeneralledger)
crud_view_income_statement = CRUDBase[Viewincomestatement, ViewincomestatementCreate, ViewincomestatementUpdate](Viewincomestatement)
crud_view_trial_balance = CRUDBase[Viewtrialbalance, ViewtrialbalanceCreate, ViewtrialbalanceUpdate](Viewtrialbalance)
crud_vw_batch_expiry = CRUDBase[Vwbatchexpiry, VwbatchexpiryCreate, VwbatchexpiryUpdate](Vwbatchexpiry)
crud_vw_current_inventory = CRUDBase[Vwcurrentinventory, VwcurrentinventoryCreate, VwcurrentinventoryUpdate](Vwcurrentinventory)
crud_vw_inventory_aging = CRUDBase[Vwinventoryaging, VwinventoryagingCreate, VwinventoryagingUpdate](Vwinventoryaging)
crud_vw_inventory_valuation = CRUDBase[Vwinventoryvaluation, VwinventoryvaluationCreate, VwinventoryvaluationUpdate](Vwinventoryvaluation)
crud_vw_product_performance = CRUDBase[Vwproductperformance, VwproductperformanceCreate, VwproductperformanceUpdate](Vwproductperformance)
crud_vw_purchase_order_status = CRUDBase[Vwpurchaseorderstatus, VwpurchaseorderstatusCreate, VwpurchaseorderstatusUpdate](Vwpurchaseorderstatus)
crud_vw_reorder_recommendation = CRUDBase[Vwreorderrecommendation, VwreorderrecommendationCreate, VwreorderrecommendationUpdate](Vwreorderrecommendation)
crud_vw_sales_order_status = CRUDBase[Vwsalesorderstatus, VwsalesorderstatusCreate, VwsalesorderstatusUpdate](Vwsalesorderstatus)
crud_vw_stock_accuracy = CRUDBase[Vwstockaccuracy, VwstockaccuracyCreate, VwstockaccuracyUpdate](Vwstockaccuracy)
crud_vw_stock_movement = CRUDBase[Vwstockmovement, VwstockmovementCreate, VwstockmovementUpdate](Vwstockmovement)
crud_vw_stock_turnover = CRUDBase[Vwstockturnover, VwstockturnoverCreate, VwstockturnoverUpdate](Vwstockturnover)
crud_vw_supply_chain_kpi = CRUDBase[Vwsupplychainkpi, VwsupplychainkpiCreate, VwsupplychainkpiUpdate](Vwsupplychainkpi)
crud_vw_warehouse_transfer_status = CRUDBase[Vwwarehousetransferstatus, VwwarehousetransferstatusCreate, VwwarehousetransferstatusUpdate](Vwwarehousetransferstatus)
crud_vw_warehouse_utilization = CRUDBase[Vwwarehouseutilization, VwwarehouseutilizationCreate, VwwarehouseutilizationUpdate](Vwwarehouseutilization)
crud_warehouse = CRUDBase[Warehouse, WarehouseCreate, WarehouseUpdate](Warehouse)
crud_warehouse_transfer = CRUDBase[Warehousetransfer, WarehousetransferCreate, WarehousetransferUpdate](Warehousetransfer)
crud_warehouse_transfer_item = CRUDBase[Warehousetransferitem, WarehousetransferitemCreate, WarehousetransferitemUpdate](Warehousetransferitem)