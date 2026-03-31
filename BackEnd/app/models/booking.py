from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Date, Time, DECIMAL
from sqlalchemy.orm import relationship
from app.models.base import Base, AuditMixin


class Layout(Base, AuditMixin):
    __tablename__ = "layout"

    layout_id = Column(Integer, nullable=False)
    timezone = Column(String(50), nullable=False, default="America/Sao_Paulo")


class TimeBlock(Base, AuditMixin):
    __tablename__ = "time_block"

    block_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=True)
    end_label = Column(String(85), nullable=True)
    availability_code = Column(Integer, nullable=False, default=1)
    layout_id = Column(Integer, ForeignKey("layout.layout_id"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    day_of_week = Column(Integer, nullable=True)


class Schedule(Base, AuditMixin):
    __tablename__ = "schedule"

    schedule_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    is_default = Column(Integer, nullable=False, default=0)
    weekday_start = Column(Integer, nullable=False, default=0)
    days_visible = Column(Integer, nullable=False, default=7)
    layout_id = Column(Integer, ForeignKey("layout.layout_id"), nullable=False)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)


class ResourceType(Base, AuditMixin):
    __tablename__ = "resource_type"

    resource_type_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)


class Resource(Base, AuditMixin):
    __tablename__ = "resource"

    resource_id = Column(Integer, nullable=False)
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
    schedule_id = Column(Integer, ForeignKey("schedule.schedule_id"), nullable=False)
    resource_type_id = Column(Integer, ForeignKey("resource_type.resource_type_id"), nullable=True)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)


class ReservationType(Base, AuditMixin):
    __tablename__ = "reservation_type"

    type_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=False)


class ReservationStatus(Base, AuditMixin):
    __tablename__ = "reservation_status"

    status_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=False)


class ReservationSeries(Base, AuditMixin):
    __tablename__ = "reservation_series"

    series_id = Column(Integer, nullable=False)
    title = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)
    allow_participation = Column(Integer, nullable=False, default=0)
    allow_anon_participation = Column(Integer, nullable=False, default=0)
    type_id = Column(Integer, ForeignKey("reservation_type.type_id"), nullable=False)
    status_id = Column(Integer, ForeignKey("reservation_status.status_id"), nullable=False)
    repeat_type = Column(String(10), nullable=True)
    repeat_options = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)


class ReservationInstance(Base, AuditMixin):
    __tablename__ = "reservation_instance"

    reservation_instance_id = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reference_number = Column(String(50), nullable=False)
    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)


class ReservationUser(Base, AuditMixin):
    __tablename__ = "reservation_user"

    reservation_instance_id = Column(Integer, ForeignKey("reservation_instance.reservation_instance_id"), primary_key=True)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), primary_key=True)
    reservation_user_level = Column(Integer, nullable=False)


class ReservationResource(Base, AuditMixin):
    __tablename__ = "reservation_resource"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), primary_key=True)
    resource_id = Column(Integer, ForeignKey("resource.resource_id"), primary_key=True)
    resource_level_id = Column(Integer, nullable=False)


class Accessory(Base, AuditMixin):
    __tablename__ = "accessory"

    accessory_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    quantity_available = Column(Integer, nullable=False, default=0)


class ReservationAccessory(Base, AuditMixin):
    __tablename__ = "reservation_accessory"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), primary_key=True)
    accessory_id = Column(Integer, ForeignKey("accessory.accessory_id"), primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)


class BlackoutSeries(Base, AuditMixin):
    __tablename__ = "blackout_series"

    blackout_series_id = Column(Integer, nullable=False)
    title = Column(String(85), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)


class BlackoutInstance(Base, AuditMixin):
    __tablename__ = "blackout_instance"

    blackout_instance_id = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    blackout_series_id = Column(Integer, ForeignKey("blackout_series.blackout_series_id"), nullable=False)


class CustomAttribute(Base, AuditMixin):
    __tablename__ = "custom_attribute"

    attribute_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    required = Column(Integer, nullable=False, default=0)
    possible_values = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=True, default=0)
    category = Column(String(50), nullable=True)
    regex_validation = Column(String(200), nullable=True)
    is_private = Column(Integer, nullable=False, default=0)
    is_multi = Column(Integer, nullable=False, default=0)


class UserResourcePermission(Base, AuditMixin):
    __tablename__ = "user_resource_permission"

    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), primary_key=True)
    resource_id = Column(Integer, ForeignKey("resource.resource_id"), primary_key=True)
    permission_id = Column(Integer, nullable=False, default=1)
