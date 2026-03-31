from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Date, Time, DECIMAL
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


class Layout(Base, AuditMixin):
    """Definição de layout de horários"""
    __tablename__ = "layouts"

    layout_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timezone = Column(String(50), nullable=False, default="America/Sao_Paulo")

    schedules = relationship("Schedule", back_populates="layout")
    time_blocks = relationship("TimeBlock", back_populates="layout")


class TimeBlock(Base, AuditMixin):
    """Blocos de horário disponíveis"""
    __tablename__ = "time_blocks"

    block_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    label = Column(String(85), nullable=True)
    end_label = Column(String(85), nullable=True)
    availability_code = Column(Integer, nullable=False, default=1)
    layout_id = Column(Integer, ForeignKey("layouts.layout_id"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    day_of_week = Column(Integer, nullable=True)

    layout = relationship("Layout", back_populates="time_blocks")


class Schedule(Base, AuditMixin):
    """Grade de horários"""
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(85), nullable=False)
    is_default = Column(Integer, nullable=False, default=0)
    weekday_start = Column(Integer, nullable=False, default=0)
    days_visible = Column(Integer, nullable=False, default=7)
    layout_id = Column(Integer, ForeignKey("layouts.layout_id"), nullable=False)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)

    layout = relationship("Layout", back_populates="schedules")
    resources = relationship("Resource", back_populates="schedule")


class ResourceType(Base, AuditMixin):
    """Tipos de recurso (sala, veículo, equipamento)"""
    __tablename__ = "resource_types"

    resource_type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)

    resources = relationship("Resource", back_populates="resource_type")


class Resource(Base, AuditMixin):
    """Itens agendáveis (salas, veículos, equipamentos)"""
    __tablename__ = "resources"

    resource_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(85), nullable=False)
    location = Column(String(85), nullable=True)
    contact_info = Column(String(85), nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Integer, nullable=False, default=1)
    min_duration = Column(Integer, nullable=True)
    min_increment = Column(Integer, nullable=True)
    max_duration = Column(Integer, nullable=True)
    unit_cost = Column(DECIMAL(10, 2), nullable=True)
    auto_assign = Column(Integer, nullable=False, default=1)
    requires_approval = Column(Integer, nullable=False, default=0)
    allow_multiday_reservations = Column(Integer, nullable=False, default=1)
    max_participants = Column(Integer, nullable=True)
    min_notice_time = Column(Integer, nullable=True)
    max_notice_time = Column(Integer, nullable=True)
    image_name = Column(String(50), nullable=True)
    schedule_id = Column(Integer, ForeignKey("schedules.schedule_id"), nullable=False)
    resource_type_id = Column(Integer, ForeignKey("resource_types.resource_type_id"), nullable=True)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)

    schedule = relationship("Schedule", back_populates="resources")
    resource_type = relationship("ResourceType", back_populates="resources")
    reservation_resources = relationship("ReservationResource", back_populates="resource")


class ReservationType(Base):
    """Tipos de reserva"""
    __tablename__ = "reservation_types"

    type_id = Column(Integer, primary_key=True, index=True)
    label = Column(String(85), nullable=False)

    series = relationship("ReservationSeries", back_populates="reservation_type")


class ReservationStatus(Base):
    """Status de reserva"""
    __tablename__ = "reservation_statuses"

    status_id = Column(Integer, primary_key=True, index=True)
    label = Column(String(85), nullable=False)

    series = relationship("ReservationSeries", back_populates="status")


class ReservationSeries(Base, AuditMixin):
    """Cabeçalho da reserva (série)"""
    __tablename__ = "reservation_series"

    series_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)
    allow_participation = Column(Integer, nullable=False, default=0)
    allow_anon_participation = Column(Integer, nullable=False, default=0)
    type_id = Column(Integer, ForeignKey("reservation_types.type_id"), nullable=False)
    status_id = Column(Integer, ForeignKey("reservation_statuses.status_id"), nullable=False)
    repeat_type = Column(String(10), nullable=True)
    repeat_options = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)

    reservation_type = relationship("ReservationType", back_populates="series")
    status = relationship("ReservationStatus", back_populates="series")
    owner = relationship("SysUser")
    instances = relationship("ReservationInstance", back_populates="series", cascade="all, delete-orphan")
    resources = relationship("ReservationResource", back_populates="series")
    accessories = relationship("ReservationAccessory", back_populates="series")


class ReservationInstance(Base, AuditMixin):
    """Ocorrências da reserva"""
    __tablename__ = "reservation_instances"

    reservation_instance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reference_number = Column(String(50), nullable=False)
    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)

    series = relationship("ReservationSeries", back_populates="instances")
    users = relationship("ReservationUser", back_populates="instance")


class ReservationUser(Base):
    """Participantes da reserva"""
    __tablename__ = "reservation_users"

    reservation_instance_id = Column(Integer, ForeignKey("reservation_instances.reservation_instance_id"), primary_key=True)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), primary_key=True)
    reservation_user_level = Column(Integer, nullable=False)

    instance = relationship("ReservationInstance", back_populates="users")
    user = relationship("SysUser")


class ReservationResource(Base):
    """Recursos utilizados na reserva"""
    __tablename__ = "reservation_resources"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), primary_key=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), primary_key=True)
    resource_level_id = Column(Integer, nullable=False)

    series = relationship("ReservationSeries", back_populates="resources")
    resource = relationship("Resource", back_populates="reservation_resources")


class Accessory(Base, AuditMixin):
    """Acessórios/extras"""
    __tablename__ = "accessories"

    accessory_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(85), nullable=False)
    quantity_available = Column(Integer, nullable=False, default=0)


class ReservationAccessory(Base):
    """Acessórios incluídos na reserva"""
    __tablename__ = "reservation_accessories"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), primary_key=True)
    accessory_id = Column(Integer, ForeignKey("accessories.accessory_id"), primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)

    series = relationship("ReservationSeries", back_populates="accessories")
    accessory = relationship("Accessory")


class BlackoutSeries(Base, AuditMixin):
    """Série de bloqueios de horário"""
    __tablename__ = "blackout_series"

    blackout_series_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)

    owner = relationship("SysUser")
    instances = relationship("BlackoutInstance", back_populates="series", cascade="all, delete-orphan")


class BlackoutInstance(Base):
    """Ocorrências de bloqueio"""
    __tablename__ = "blackout_instances"

    blackout_instance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    blackout_series_id = Column(Integer, ForeignKey("blackout_series.blackout_series_id"), nullable=False)

    series = relationship("BlackoutSeries", back_populates="instances")


class CustomAttribute(Base, AuditMixin):
    """Campos personalizados"""
    __tablename__ = "custom_attributes"

    attribute_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    required = Column(Integer, nullable=False, default=0)
    possible_values = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=True, default=0)
    category = Column(String(50), nullable=True)
    regex_validation = Column(String(200), nullable=True)
    is_private = Column(Integer, nullable=False, default=0)
    is_multi = Column(Integer, nullable=False, default=0)


class UserResourcePermission(Base):
    """Permissão de usuário para recurso"""
    __tablename__ = "user_resource_permissions"

    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), primary_key=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), primary_key=True)
    permission_id = Column(Integer, nullable=False, default=1)

    user = relationship("SysUser")
    resource = relationship("Resource")
