from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

class AuditMixin:
    """Mixin for common audit columns used in almost all tables."""
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)

class Gender(Base, AuditMixin):
    __tablename__ = "gender"
    
    gender_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)


class DocumentType(Base, AuditMixin):
    __tablename__ = "document_type"
    
    document_type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    description = Column(String(100), nullable=False)


class AddressType(Base, AuditMixin):
    __tablename__ = "address_type"
    
    address_type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)


class PaymentStatus(Base, AuditMixin):
    __tablename__ = "payment_status"
    
    payment_status_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    code = Column(String(2), nullable=False)
    kanban = Column(Boolean, default=False)
    color = Column(String(100), nullable=True)
    kanban_order = Column(Integer, nullable=True)
    final_state = Column(Boolean, default=False)
    initial_state = Column(Boolean, default=False)
    allow_edition = Column(Boolean, default=True)
    allow_deletion = Column(Boolean, default=True)


class State(Base, AuditMixin):
    __tablename__ = "state"
    
    state_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    uf = Column(String(2), nullable=False)
    codigo_ibge = Column(String(10), nullable=True)

    # Relationships
    cities = relationship("City", back_populates="state")


class City(Base, AuditMixin):
    __tablename__ = "city"
    
    city_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state_id = Column(Integer, ForeignKey("state.state_id"), nullable=False)
    name = Column(String(100), nullable=False)
    codigo_ibge = Column(String(10), nullable=True)

    # Relationships
    state = relationship("State", back_populates="cities")


class SysUser(Base, AuditMixin):
    """Usuário do sistema para autenticação"""
    __tablename__ = "sys_user"
    
    sys_user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)


class TableMapping(Base, AuditMixin):
    """Mapeamento de tabelas DBF para MySQL"""
    __tablename__ = "table_mapping"
    
    table_mapping_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    table_name_new = Column(String(100), nullable=False, unique=True, index=True)
    table_name_old = Column(String(100), nullable=True)
    module = Column(String(50), nullable=True, index=True)
    description = Column(String(500), nullable=True)
    context = Column(String, nullable=True)
    record_count_approx = Column(Integer, nullable=True)
    is_active = Column(Integer, default=1)
    migration_status = Column(String(20), default='pending', index=True)


class FieldMapping(Base, AuditMixin):
    """Mapeamento de campos DBF para MySQL"""
    __tablename__ = "field_mapping"
    
    field_mapping_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    table_name_new = Column(String(100), nullable=False, index=True)
    field_name_new = Column(String(100), nullable=False)
    field_type_new = Column(String(50), nullable=True)
    field_size_new = Column(Integer, nullable=True)
    field_precision_new = Column(Integer, nullable=True)
    nullable_new = Column(Integer, default=1)
    default_value_new = Column(String(255), nullable=True)
    table_name_old = Column(String(100), nullable=True, index=True)
    field_name_old = Column(String(100), nullable=True)
    field_type_old = Column(String(50), nullable=True)
    field_size_old = Column(Integer, nullable=True)
    description = Column(String(500), nullable=True)
    context = Column(String, nullable=True)
    mapping_notes = Column(String, nullable=True)
    is_mapped = Column(Integer, default=0, index=True)
