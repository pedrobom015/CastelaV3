from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# -- GENDER --
class GenderBase(BaseModel):
    name: str

class GenderCreate(GenderBase):
    pass

class GenderUpdate(GenderBase):
    name: Optional[str] = None

class Gender(GenderBase):
    gender_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# -- DOCUMENT TYPE --
class DocTypeBase(BaseModel):
    description: str

class DocTypeCreate(DocTypeBase):
    pass

class DocTypeUpdate(DocTypeBase):
    description: Optional[str] = None

class DocType(DocTypeBase):
    document_type_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# -- ADDRESS TYPE --
class AddressTypeBase(BaseModel):
    name: str

class AddressTypeCreate(AddressTypeBase):
    pass

class AddressTypeUpdate(AddressTypeBase):
    name: Optional[str] = None

class AddressType(AddressTypeBase):
    address_type_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# -- PAYMENT STATUS --
class PaymentStatusBase(BaseModel):
    name: str
    code: str
    kanban: bool = False
    color: Optional[str] = None
    kanban_order: Optional[int] = None
    final_state: bool = False
    initial_state: bool = False
    allow_edition: bool = True
    allow_deletion: bool = True

class PaymentStatusCreate(PaymentStatusBase):
    pass

class PaymentStatusUpdate(PaymentStatusBase):
    name: Optional[str] = None
    code: Optional[str] = None

class PaymentStatus(PaymentStatusBase):
    payment_status_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# -- STATE --
class StateBase(BaseModel):
    name: str
    uf: str
    codigo_ibge: Optional[str] = None

class StateCreate(StateBase):
    pass

class StateUpdate(StateBase):
    name: Optional[str] = None
    uf: Optional[str] = None

class State(StateBase):
    state_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# -- CITY --
class CityBase(BaseModel):
    state_id: int
    name: str
    codigo_ibge: Optional[str] = None

class CityCreate(CityBase):
    pass

class CityUpdate(CityBase):
    name: Optional[str] = None
    state_id: Optional[int] = None

class City(CityBase):
    city_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- SYS USER (Authentication) --
class SysUserBase(BaseModel):
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class SysUserCreate(SysUserBase):
    password: str


class SysUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class SysUserResponse(SysUserBase):
    sys_user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- Authentication --
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[SysUserResponse] = None


class CurrentUser(BaseModel):
    sys_user_id: int
    username: str
    email: str
    is_superuser: bool


# -- TABLE MAPPING --
class TableMappingBase(BaseModel):
    table_name_new: str
    table_name_old: Optional[str] = None
    module: Optional[str] = None
    description: Optional[str] = None
    context: Optional[str] = None
    record_count_approx: Optional[int] = None
    is_active: int = 1
    migration_status: str = 'pending'

class TableMappingCreate(TableMappingBase):
    pass

class TableMappingUpdate(BaseModel):
    table_name_new: Optional[str] = None
    table_name_old: Optional[str] = None
    module: Optional[str] = None
    description: Optional[str] = None
    context: Optional[str] = None
    record_count_approx: Optional[int] = None
    is_active: Optional[int] = None
    migration_status: Optional[str] = None

class TableMapping(TableMappingBase):
    table_mapping_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- FIELD MAPPING --
class FieldMappingBase(BaseModel):
    table_name_new: str
    field_name_new: str
    field_type_new: Optional[str] = None
    field_size_new: Optional[int] = None
    field_precision_new: Optional[int] = None
    nullable_new: int = 1
    default_value_new: Optional[str] = None
    table_name_old: Optional[str] = None
    field_name_old: Optional[str] = None
    field_type_old: Optional[str] = None
    field_size_old: Optional[int] = None
    description: Optional[str] = None
    context: Optional[str] = None
    mapping_notes: Optional[str] = None
    is_mapped: int = 0

class FieldMappingCreate(FieldMappingBase):
    pass

class FieldMappingUpdate(BaseModel):
    table_name_new: Optional[str] = None
    field_name_new: Optional[str] = None
    field_type_new: Optional[str] = None
    field_size_new: Optional[int] = None
    field_precision_new: Optional[int] = None
    nullable_new: Optional[int] = None
    default_value_new: Optional[str] = None
    table_name_old: Optional[str] = None
    field_name_old: Optional[str] = None
    field_type_old: Optional[str] = None
    field_size_old: Optional[int] = None
    description: Optional[str] = None
    context: Optional[str] = None
    mapping_notes: Optional[str] = None
    is_mapped: Optional[int] = None

class FieldMapping(FieldMappingBase):
    field_mapping_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- VIEW: Field Mapping with Table Info --
class FieldMappingWithTable(BaseModel):
    field_mapping_id: int
    table_name_new: str
    field_name_new: str
    field_type_new: Optional[str] = None
    field_size_new: Optional[int] = None
    field_precision_new: Optional[int] = None
    nullable_new: int = 1
    default_value_new: Optional[str] = None
    table_name_old: Optional[str] = None
    field_name_old: Optional[str] = None
    field_type_old: Optional[str] = None
    field_size_old: Optional[int] = None
    description: Optional[str] = None
    context: Optional[str] = None
    mapping_notes: Optional[str] = None
    is_mapped: int = 0
    module: Optional[str] = None
    table_migration_status: Optional[str] = None
    table_description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
