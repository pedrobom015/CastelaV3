from crud_base import CRUDBase
from models import Gender, DocumentType, AddressType, PaymentStatus, State, City, TableMapping, FieldMapping
from schemas import (
    GenderCreate, GenderUpdate,
    DocTypeCreate, DocTypeUpdate,
    AddressTypeCreate, AddressTypeUpdate,
    PaymentStatusCreate, PaymentStatusUpdate,
    StateCreate, StateUpdate,
    CityCreate, CityUpdate,
    TableMappingCreate, TableMappingUpdate,
    FieldMappingCreate, FieldMappingUpdate
)

crud_gender = CRUDBase[Gender, GenderCreate, GenderUpdate](Gender)
crud_document_type = CRUDBase[DocumentType, DocTypeCreate, DocTypeUpdate](DocumentType)
crud_address_type = CRUDBase[AddressType, AddressTypeCreate, AddressTypeUpdate](AddressType)
crud_payment_status = CRUDBase[PaymentStatus, PaymentStatusCreate, PaymentStatusUpdate](PaymentStatus)
crud_state = CRUDBase[State, StateCreate, StateUpdate](State)
crud_city = CRUDBase[City, CityCreate, CityUpdate](City)
crud_table_mapping = CRUDBase[TableMapping, TableMappingCreate, TableMappingUpdate](TableMapping)
crud_field_mapping = CRUDBase[FieldMapping, FieldMappingCreate, FieldMappingUpdate](FieldMapping)
