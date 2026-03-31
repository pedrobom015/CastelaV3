# Auto-generated models for missing tables
# Generated from Dump_ERP_Castela.sql
# Total: 51 tables

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from app.models.base import Base, AuditMixin



class Accessories(Base, AuditMixin):
    __tablename__ = "accessories"

    accessory_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    quantity_available = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class AccountActivation(Base, AuditMixin):
    __tablename__ = "account_activation"

    account_activation_id = Column(Integer, nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    activation_code = Column(String(30), nullable=False)
    created_at = Column(DateTime, nullable=False)


class AnnouncementGroups(Base, AuditMixin):
    __tablename__ = "announcement_groups"

    announcement_id = Column(Integer, nullable=False)
    group_id = Column(Integer, nullable=False)


class AnnouncementResources(Base, AuditMixin):
    __tablename__ = "announcement_resources"

    announcement_id = Column(Integer, nullable=False)
    resource_id = Column(Integer, nullable=False)


class Announcements(Base, AuditMixin):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, nullable=False)
    announcement_text = Column(String(255), nullable=False)
    priority = Column(Integer, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class BlackoutInstances(Base, AuditMixin):
    __tablename__ = "blackout_instances"

    blackout_instance_id = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    blackout_series_id = Column(Integer, ForeignKey("blackout_series.blackout_series_id"), nullable=False)


class BlackoutSeries(Base, AuditMixin):
    __tablename__ = "blackout_series"

    blackout_series_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)
    title = Column(String(85), nullable=False)
    description = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)


class BlackoutSeriesResources(Base, AuditMixin):
    __tablename__ = "blackout_series_resources"

    blackout_series_id = Column(Integer, ForeignKey("blackout_series.blackout_series_id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)


class CreditLog(Base, AuditMixin):
    __tablename__ = "credit_log"

    credit_log_id = Column(Integer, nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    credit_amount = Column(Float, nullable=False)
    credit_type = Column(String(20), nullable=True)
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False)


class CustomAttributeEntities(Base, AuditMixin):
    __tablename__ = "custom_attribute_entities"

    attribute_id = Column(Integer, nullable=False)
    entity_id = Column(Integer, nullable=False)


class CustomAttributeValues(Base, AuditMixin):
    __tablename__ = "custom_attribute_values"

    attribute_id = Column(Integer, nullable=False)
    entity_id = Column(Integer, nullable=False)
    entity_type = Column(String(50), nullable=False)
    value = Column(String(255), nullable=True)


class CustomAttributes(Base, AuditMixin):
    __tablename__ = "custom_attributes"

    attribute_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    required = Column(Integer, nullable=False)
    possible_values = Column(String(255), nullable=True)
    sort_order = Column(Integer, nullable=True)
    category = Column(String(50), nullable=True)
    regex_validation = Column(String(200), nullable=True)
    is_private = Column(Integer, nullable=True)
    is_multi = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class CustomTimeBlocks(Base, AuditMixin):
    __tablename__ = "custom_time_blocks"

    custom_block_id = Column(Integer, nullable=False)
    schedule_id = Column(Integer, nullable=False)
    start_time = Column(String(255), nullable=False)
    end_time = Column(String(255), nullable=False)
    day_of_week = Column(Integer, nullable=True)
    date = Column(Date, nullable=True)
    all_day = Column(Integer, nullable=False)


class Dbversion(Base, AuditMixin):
    __tablename__ = "dbversion"

    version_id = Column(Integer, nullable=False)
    major = Column(Integer, nullable=False)
    minor = Column(Integer, nullable=False)
    revision = Column(Integer, nullable=False)
    build = Column(Integer, nullable=False)
    completed = Column(DateTime, nullable=False)


class GroupResourcePermissions(Base, AuditMixin):
    __tablename__ = "group_resource_permissions"

    sys_group_id = Column(Integer, ForeignKey("sys_group.sys_group_id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)


class Layouts(Base, AuditMixin):
    __tablename__ = "layouts"

    layout_id = Column(Integer, nullable=False)
    timezone = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class PaymentConfiguration(Base, AuditMixin):
    __tablename__ = "payment_configuration"

    payment_configuration_id = Column(Integer, nullable=False)
    is_enabled = Column(Integer, nullable=False)
    payment_type = Column(String(50), nullable=True)
    currency = Column(String(3), nullable=True)
    tax_id = Column(String(20), nullable=True)


class PaymentGatewaySettings(Base, AuditMixin):
    __tablename__ = "payment_gateway_settings"

    payment_gateway_setting_id = Column(Integer, nullable=False)
    gateway_type = Column(String(50), nullable=False)
    setting_key = Column(String(100), nullable=False)
    setting_value = Column(String(255), nullable=True)
    is_encrypted = Column(Integer, nullable=True)


class PaymentTransactionLog(Base, AuditMixin):
    __tablename__ = "payment_transaction_log"

    payment_transaction_log_id = Column(Integer, nullable=False)
    transaction_id = Column(String(50), nullable=False)
    series_id = Column(Integer, nullable=False)
    transaction_date = Column(DateTime, nullable=False)
    transaction_type = Column(String(20), nullable=True)
    transaction_status = Column(String(20), nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String(3), nullable=True)
    gateway_type = Column(String(50), nullable=True)
    gateway_transaction_id = Column(String(100), nullable=True)
    raw_response = Column(String(255), nullable=True)


class PeakTimes(Base, AuditMixin):
    __tablename__ = "peak_times"

    peak_time_id = Column(Integer, nullable=False)
    schedule_id = Column(Integer, nullable=False)
    start_time = Column(String(255), nullable=False)
    end_time = Column(String(255), nullable=False)
    day_of_week = Column(Integer, nullable=True)
    all_day = Column(Integer, nullable=False)


class Quotas(Base, AuditMixin):
    __tablename__ = "quotas"

    quota_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=True)
    units = Column(String(25), nullable=True)
    group_id = Column(Integer, nullable=True)
    resource_id = Column(Integer, nullable=True)
    schedule_id = Column(Integer, nullable=True)


class RefundTransactionLog(Base, AuditMixin):
    __tablename__ = "refund_transaction_log"

    refund_transaction_log_id = Column(Integer, nullable=False)
    refund_id = Column(String(50), nullable=False)
    payment_transaction_log_id = Column(Integer, nullable=False)
    refund_date = Column(DateTime, nullable=False)
    refund_amount = Column(Float, nullable=True)
    refund_reason = Column(String(255), nullable=True)


class Reminders(Base, AuditMixin):
    __tablename__ = "reminders"

    reminder_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    address = Column(String(255), nullable=False)
    message = Column(String(255), nullable=False)
    send_time = Column(DateTime, nullable=False)
    ref_number = Column(String(255), nullable=False)
    reminder_type = Column(String(20), nullable=False)


class ReservationAccessories(Base, AuditMixin):
    __tablename__ = "reservation_accessories"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)
    accessory_id = Column(Integer, ForeignKey("accessories.accessory_id"), nullable=False)
    quantity = Column(Integer, nullable=False)


class ReservationColorRules(Base, AuditMixin):
    __tablename__ = "reservation_color_rules"

    reservation_color_rule_id = Column(Integer, nullable=False)
    schedule_id = Column(Integer, nullable=True)
    resource_id = Column(Integer, nullable=True)
    rule_type = Column(String(30), nullable=False)
    color = Column(String(7), nullable=True)
    background_color = Column(String(7), nullable=True)


class ReservationFiles(Base, AuditMixin):
    __tablename__ = "reservation_files"

    file_id = Column(Integer, nullable=False)
    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)
    file_name = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=True)
    uploaded_at = Column(DateTime, nullable=False)


class ReservationGuests(Base, AuditMixin):
    __tablename__ = "reservation_guests"

    reservation_instance_id = Column(Integer, ForeignKey("reservation_instances.reservation_instance_id"), nullable=False)
    email = Column(String(85), nullable=False)
    full_name = Column(String(85), nullable=True)


class ReservationInstances(Base, AuditMixin):
    __tablename__ = "reservation_instances"

    reservation_instance_id = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reference_number = Column(String(50), nullable=False)
    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class ReservationReminders(Base, AuditMixin):
    __tablename__ = "reservation_reminders"

    reservation_reminder_id = Column(Integer, nullable=False)
    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)
    minutes_prior = Column(Integer, nullable=False)
    reminder_type = Column(String(20), nullable=False)


class ReservationResources(Base, AuditMixin):
    __tablename__ = "reservation_resources"

    series_id = Column(Integer, ForeignKey("reservation_series.series_id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    resource_level_id = Column(Integer, nullable=False)


class ReservationSeries(Base, AuditMixin):
    __tablename__ = "reservation_series"

    series_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)
    title = Column(String(85), nullable=False)
    description = Column(String(255), nullable=True)
    allow_participation = Column(Integer, nullable=False)
    allow_anon_participation = Column(Integer, nullable=False)
    type_id = Column(Integer, ForeignKey("reservation_types.type_id"), nullable=False)
    status_id = Column(Integer, ForeignKey("reservation_statuses.status_id"), nullable=False)
    repeat_type = Column(String(10), nullable=True)
    repeat_options = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class ReservationStatuses(Base, AuditMixin):
    __tablename__ = "reservation_statuses"

    status_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=False)


class ReservationTypes(Base, AuditMixin):
    __tablename__ = "reservation_types"

    type_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=False)


class ReservationUsers(Base, AuditMixin):
    __tablename__ = "reservation_users"

    reservation_instance_id = Column(Integer, ForeignKey("reservation_instances.reservation_instance_id"), nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    reservation_user_level = Column(Integer, nullable=False)


class ReservationWaitlistRequests(Base, AuditMixin):
    __tablename__ = "reservation_waitlist_requests"

    waitlist_request_id = Column(Integer, nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("schedules.schedule_id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)


class ResourceAccessories(Base, AuditMixin):
    __tablename__ = "resource_accessories"

    resource_id = Column(Integer, nullable=False)
    accessory_id = Column(Integer, nullable=False)
    quantity_required = Column(Integer, nullable=True)


class ResourceGroupAssignment(Base, AuditMixin):
    __tablename__ = "resource_group_assignment"

    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    resource_group_id = Column(Integer, ForeignKey("resource_groups.resource_group_id"), nullable=False)


class ResourceGroups(Base, AuditMixin):
    __tablename__ = "resource_groups"

    resource_group_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    description = Column(String(255), nullable=True)
    parent_id = Column(Integer, ForeignKey("resource_groups.resource_group_id"), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class ResourceImages(Base, AuditMixin):
    __tablename__ = "resource_images"

    resource_image_id = Column(Integer, nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    file_name = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, nullable=True)


class ResourceStatusReasons(Base, AuditMixin):
    __tablename__ = "resource_status_reasons"

    resource_status_reason_id = Column(Integer, nullable=False)
    description = Column(String(255), nullable=False)


class ResourceTypeAssignment(Base, AuditMixin):
    __tablename__ = "resource_type_assignment"

    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    resource_type_id = Column(Integer, ForeignKey("resource_types.resource_type_id"), nullable=False)


class ResourceTypes(Base, AuditMixin):
    __tablename__ = "resource_types"

    resource_type_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class Resources(Base, AuditMixin):
    __tablename__ = "resources"

    resource_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    location = Column(String(85), nullable=True)
    contact_info = Column(String(85), nullable=True)
    description = Column(String(255), nullable=True)
    notes = Column(String(255), nullable=True)
    is_active = Column(Integer, nullable=False)
    min_duration = Column(Integer, nullable=True)
    min_increment = Column(Integer, nullable=True)
    max_duration = Column(Integer, nullable=True)
    unit_cost = Column(Float, nullable=True)
    auto_assign = Column(Integer, nullable=False)
    requires_approval = Column(Integer, nullable=False)
    allow_multiday_reservations = Column(Integer, nullable=False)
    max_participants = Column(Integer, nullable=True)
    min_notice_time = Column(Integer, nullable=True)
    max_notice_time = Column(Integer, nullable=True)
    image_name = Column(String(50), nullable=True)
    schedule_id = Column(Integer, ForeignKey("schedules.schedule_id"), nullable=False)
    resource_type_id = Column(Integer, ForeignKey("resource_types.resource_type_id"), nullable=True)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class SavedReports(Base, AuditMixin):
    __tablename__ = "saved_reports"

    saved_report_id = Column(Integer, nullable=False)
    report_name = Column(String(50), nullable=True)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    created_at = Column(DateTime, nullable=False)
    report_details = Column(String(500), nullable=False)


class Schedules(Base, AuditMixin):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, nullable=False)
    name = Column(String(85), nullable=False)
    is_default = Column(Integer, nullable=False)
    weekday_start = Column(Integer, nullable=False)
    days_visible = Column(Integer, nullable=False)
    layout_id = Column(Integer, ForeignKey("layouts.layout_id"), nullable=False)
    sys_unit_id = Column(Integer, ForeignKey("sys_unit.sys_unit_id"), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class TermsOfService(Base, AuditMixin):
    __tablename__ = "terms_of_service"

    terms_of_service_id = Column(Integer, nullable=False)
    terms_text = Column(String(255), nullable=False)
    terms_type = Column(String(20), nullable=True)
    effective_date = Column(DateTime, nullable=False)


class TimeBlocks(Base, AuditMixin):
    __tablename__ = "time_blocks"

    block_id = Column(Integer, nullable=False)
    label = Column(String(85), nullable=True)
    end_label = Column(String(85), nullable=True)
    availability_code = Column(Integer, nullable=False)
    layout_id = Column(Integer, ForeignKey("layouts.layout_id"), nullable=False)
    start_time = Column(String(255), nullable=False)
    end_time = Column(String(255), nullable=False)
    day_of_week = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)


class UserEmailPreferences(Base, AuditMixin):
    __tablename__ = "user_email_preferences"

    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    event_category = Column(String(45), nullable=False)
    event_type = Column(String(45), nullable=False)


class UserPreferences(Base, AuditMixin):
    __tablename__ = "user_preferences"

    user_preferences_id = Column(Integer, nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    name = Column(String(100), nullable=False)
    value = Column(String(100), nullable=True)


class UserResourcePermissions(Base, AuditMixin):
    __tablename__ = "user_resource_permissions"

    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    permission_id = Column(Integer, nullable=False)


class UserSession(Base, AuditMixin):
    __tablename__ = "user_session"

    user_session_id = Column(Integer, nullable=False)
    sys_user_id = Column(Integer, ForeignKey("sys_user.sys_user_id"), nullable=False)
    session_token = Column(String(100), nullable=False)
    user_session_value = Column(String(255), nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=True)

