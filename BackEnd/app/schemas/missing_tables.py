# Auto-generated schemas for missing tables
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional




class AccessoriesBase(BaseModel):
    accessory_id: Optional[int] = None
    name: Optional[str] = None
    quantity_available: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AccessoriesCreate(AccessoriesBase):
    pass

class AccessoriesUpdate(BaseModel):
    accessory_id: Optional[int] = None
    name: Optional[str] = None
    quantity_available: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class Accessories(AccessoriesBase):
    model_config = ConfigDict(from_attributes=True)


class AccountActivationBase(BaseModel):
    account_activation_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    activation_code: Optional[str] = None
    created_at: Optional[datetime] = None

class AccountActivationCreate(AccountActivationBase):
    pass

class AccountActivationUpdate(BaseModel):
    account_activation_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    activation_code: Optional[str] = None
    created_at: Optional[datetime] = None

class AccountActivation(AccountActivationBase):
    model_config = ConfigDict(from_attributes=True)


class AnnouncementGroupsBase(BaseModel):
    announcement_id: Optional[int] = None
    group_id: Optional[int] = None

class AnnouncementGroupsCreate(AnnouncementGroupsBase):
    pass

class AnnouncementGroupsUpdate(BaseModel):
    announcement_id: Optional[int] = None
    group_id: Optional[int] = None

class AnnouncementGroups(AnnouncementGroupsBase):
    model_config = ConfigDict(from_attributes=True)


class AnnouncementResourcesBase(BaseModel):
    announcement_id: Optional[int] = None
    resource_id: Optional[int] = None

class AnnouncementResourcesCreate(AnnouncementResourcesBase):
    pass

class AnnouncementResourcesUpdate(BaseModel):
    announcement_id: Optional[int] = None
    resource_id: Optional[int] = None

class AnnouncementResources(AnnouncementResourcesBase):
    model_config = ConfigDict(from_attributes=True)


class AnnouncementsBase(BaseModel):
    announcement_id: Optional[int] = None
    announcement_text: Optional[str] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class AnnouncementsCreate(AnnouncementsBase):
    pass

class AnnouncementsUpdate(BaseModel):
    announcement_id: Optional[int] = None
    announcement_text: Optional[str] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class Announcements(AnnouncementsBase):
    model_config = ConfigDict(from_attributes=True)


class BlackoutInstancesBase(BaseModel):
    blackout_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    blackout_series_id: Optional[int] = None

class BlackoutInstancesCreate(BlackoutInstancesBase):
    pass

class BlackoutInstancesUpdate(BaseModel):
    blackout_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    blackout_series_id: Optional[int] = None

class BlackoutInstances(BlackoutInstancesBase):
    model_config = ConfigDict(from_attributes=True)


class BlackoutSeriesBase(BaseModel):
    blackout_series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[int] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

class BlackoutSeriesCreate(BlackoutSeriesBase):
    pass

class BlackoutSeriesUpdate(BaseModel):
    blackout_series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[int] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

class BlackoutSeries(BlackoutSeriesBase):
    model_config = ConfigDict(from_attributes=True)


class BlackoutSeriesResourcesBase(BaseModel):
    blackout_series_id: Optional[int] = None
    resource_id: Optional[int] = None

class BlackoutSeriesResourcesCreate(BlackoutSeriesResourcesBase):
    pass

class BlackoutSeriesResourcesUpdate(BaseModel):
    blackout_series_id: Optional[int] = None
    resource_id: Optional[int] = None

class BlackoutSeriesResources(BlackoutSeriesResourcesBase):
    model_config = ConfigDict(from_attributes=True)


class CreditLogBase(BaseModel):
    credit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    credit_amount: Optional[float] = None
    credit_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_at: Optional[datetime] = None

class CreditLogCreate(CreditLogBase):
    pass

class CreditLogUpdate(BaseModel):
    credit_log_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    credit_amount: Optional[float] = None
    credit_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_at: Optional[datetime] = None

class CreditLog(CreditLogBase):
    model_config = ConfigDict(from_attributes=True)


class CustomAttributeEntitiesBase(BaseModel):
    attribute_id: Optional[int] = None
    entity_id: Optional[int] = None

class CustomAttributeEntitiesCreate(CustomAttributeEntitiesBase):
    pass

class CustomAttributeEntitiesUpdate(BaseModel):
    attribute_id: Optional[int] = None
    entity_id: Optional[int] = None

class CustomAttributeEntities(CustomAttributeEntitiesBase):
    model_config = ConfigDict(from_attributes=True)


class CustomAttributeValuesBase(BaseModel):
    attribute_id: Optional[int] = None
    entity_id: Optional[int] = None
    entity_type: Optional[str] = None
    value: Optional[str] = None

class CustomAttributeValuesCreate(CustomAttributeValuesBase):
    pass

class CustomAttributeValuesUpdate(BaseModel):
    attribute_id: Optional[int] = None
    entity_id: Optional[int] = None
    entity_type: Optional[str] = None
    value: Optional[str] = None

class CustomAttributeValues(CustomAttributeValuesBase):
    model_config = ConfigDict(from_attributes=True)


class CustomAttributesBase(BaseModel):
    attribute_id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    required: Optional[int] = None
    possible_values: Optional[str] = None
    sort_order: Optional[int] = None
    category: Optional[str] = None
    regex_validation: Optional[str] = None
    is_private: Optional[int] = None
    is_multi: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CustomAttributesCreate(CustomAttributesBase):
    pass

class CustomAttributesUpdate(BaseModel):
    attribute_id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    required: Optional[int] = None
    possible_values: Optional[str] = None
    sort_order: Optional[int] = None
    category: Optional[str] = None
    regex_validation: Optional[str] = None
    is_private: Optional[int] = None
    is_multi: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class CustomAttributes(CustomAttributesBase):
    model_config = ConfigDict(from_attributes=True)


class CustomTimeBlocksBase(BaseModel):
    custom_block_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    date: Optional[date] = None
    all_day: Optional[int] = None

class CustomTimeBlocksCreate(CustomTimeBlocksBase):
    pass

class CustomTimeBlocksUpdate(BaseModel):
    custom_block_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    date: Optional[date] = None
    all_day: Optional[int] = None

class CustomTimeBlocks(CustomTimeBlocksBase):
    model_config = ConfigDict(from_attributes=True)


class DbversionBase(BaseModel):
    version_id: Optional[int] = None
    major: Optional[int] = None
    minor: Optional[int] = None
    revision: Optional[int] = None
    build: Optional[int] = None
    completed: Optional[datetime] = None

class DbversionCreate(DbversionBase):
    pass

class DbversionUpdate(BaseModel):
    version_id: Optional[int] = None
    major: Optional[int] = None
    minor: Optional[int] = None
    revision: Optional[int] = None
    build: Optional[int] = None
    completed: Optional[datetime] = None

class Dbversion(DbversionBase):
    model_config = ConfigDict(from_attributes=True)


class GroupResourcePermissionsBase(BaseModel):
    sys_group_id: Optional[int] = None
    resource_id: Optional[int] = None

class GroupResourcePermissionsCreate(GroupResourcePermissionsBase):
    pass

class GroupResourcePermissionsUpdate(BaseModel):
    sys_group_id: Optional[int] = None
    resource_id: Optional[int] = None

class GroupResourcePermissions(GroupResourcePermissionsBase):
    model_config = ConfigDict(from_attributes=True)


class LayoutsBase(BaseModel):
    layout_id: Optional[int] = None
    timezone: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class LayoutsCreate(LayoutsBase):
    pass

class LayoutsUpdate(BaseModel):
    layout_id: Optional[int] = None
    timezone: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class Layouts(LayoutsBase):
    model_config = ConfigDict(from_attributes=True)


class PaymentConfigurationBase(BaseModel):
    payment_configuration_id: Optional[int] = None
    is_enabled: Optional[int] = None
    payment_type: Optional[str] = None
    currency: Optional[str] = None
    tax_id: Optional[str] = None

class PaymentConfigurationCreate(PaymentConfigurationBase):
    pass

class PaymentConfigurationUpdate(BaseModel):
    payment_configuration_id: Optional[int] = None
    is_enabled: Optional[int] = None
    payment_type: Optional[str] = None
    currency: Optional[str] = None
    tax_id: Optional[str] = None

class PaymentConfiguration(PaymentConfigurationBase):
    model_config = ConfigDict(from_attributes=True)


class PaymentGatewaySettingsBase(BaseModel):
    payment_gateway_setting_id: Optional[int] = None
    gateway_type: Optional[str] = None
    setting_key: Optional[str] = None
    setting_value: Optional[str] = None
    is_encrypted: Optional[int] = None

class PaymentGatewaySettingsCreate(PaymentGatewaySettingsBase):
    pass

class PaymentGatewaySettingsUpdate(BaseModel):
    payment_gateway_setting_id: Optional[int] = None
    gateway_type: Optional[str] = None
    setting_key: Optional[str] = None
    setting_value: Optional[str] = None
    is_encrypted: Optional[int] = None

class PaymentGatewaySettings(PaymentGatewaySettingsBase):
    model_config = ConfigDict(from_attributes=True)


class PaymentTransactionLogBase(BaseModel):
    payment_transaction_log_id: Optional[int] = None
    transaction_id: Optional[str] = None
    series_id: Optional[int] = None
    transaction_date: Optional[datetime] = None
    transaction_type: Optional[str] = None
    transaction_status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    gateway_type: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    raw_response: Optional[str] = None

class PaymentTransactionLogCreate(PaymentTransactionLogBase):
    pass

class PaymentTransactionLogUpdate(BaseModel):
    payment_transaction_log_id: Optional[int] = None
    transaction_id: Optional[str] = None
    series_id: Optional[int] = None
    transaction_date: Optional[datetime] = None
    transaction_type: Optional[str] = None
    transaction_status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    gateway_type: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    raw_response: Optional[str] = None

class PaymentTransactionLog(PaymentTransactionLogBase):
    model_config = ConfigDict(from_attributes=True)


class PeakTimesBase(BaseModel):
    peak_time_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    all_day: Optional[int] = None

class PeakTimesCreate(PeakTimesBase):
    pass

class PeakTimesUpdate(BaseModel):
    peak_time_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    all_day: Optional[int] = None

class PeakTimes(PeakTimesBase):
    model_config = ConfigDict(from_attributes=True)


class QuotasBase(BaseModel):
    quota_id: Optional[int] = None
    quantity: Optional[int] = None
    duration: Optional[int] = None
    units: Optional[str] = None
    group_id: Optional[int] = None
    resource_id: Optional[int] = None
    schedule_id: Optional[int] = None

class QuotasCreate(QuotasBase):
    pass

class QuotasUpdate(BaseModel):
    quota_id: Optional[int] = None
    quantity: Optional[int] = None
    duration: Optional[int] = None
    units: Optional[str] = None
    group_id: Optional[int] = None
    resource_id: Optional[int] = None
    schedule_id: Optional[int] = None

class Quotas(QuotasBase):
    model_config = ConfigDict(from_attributes=True)


class RefundTransactionLogBase(BaseModel):
    refund_transaction_log_id: Optional[int] = None
    refund_id: Optional[str] = None
    payment_transaction_log_id: Optional[int] = None
    refund_date: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refund_reason: Optional[str] = None

class RefundTransactionLogCreate(RefundTransactionLogBase):
    pass

class RefundTransactionLogUpdate(BaseModel):
    refund_transaction_log_id: Optional[int] = None
    refund_id: Optional[str] = None
    payment_transaction_log_id: Optional[int] = None
    refund_date: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refund_reason: Optional[str] = None

class RefundTransactionLog(RefundTransactionLogBase):
    model_config = ConfigDict(from_attributes=True)


class RemindersBase(BaseModel):
    reminder_id: Optional[int] = None
    user_id: Optional[int] = None
    address: Optional[str] = None
    message: Optional[str] = None
    send_time: Optional[datetime] = None
    ref_number: Optional[str] = None
    reminder_type: Optional[str] = None

class RemindersCreate(RemindersBase):
    pass

class RemindersUpdate(BaseModel):
    reminder_id: Optional[int] = None
    user_id: Optional[int] = None
    address: Optional[str] = None
    message: Optional[str] = None
    send_time: Optional[datetime] = None
    ref_number: Optional[str] = None
    reminder_type: Optional[str] = None

class Reminders(RemindersBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationAccessoriesBase(BaseModel):
    series_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity: Optional[int] = None

class ReservationAccessoriesCreate(ReservationAccessoriesBase):
    pass

class ReservationAccessoriesUpdate(BaseModel):
    series_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity: Optional[int] = None

class ReservationAccessories(ReservationAccessoriesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationColorRulesBase(BaseModel):
    reservation_color_rule_id: Optional[int] = None
    schedule_id: Optional[int] = None
    resource_id: Optional[int] = None
    rule_type: Optional[str] = None
    color: Optional[str] = None
    background_color: Optional[str] = None

class ReservationColorRulesCreate(ReservationColorRulesBase):
    pass

class ReservationColorRulesUpdate(BaseModel):
    reservation_color_rule_id: Optional[int] = None
    schedule_id: Optional[int] = None
    resource_id: Optional[int] = None
    rule_type: Optional[str] = None
    color: Optional[str] = None
    background_color: Optional[str] = None

class ReservationColorRules(ReservationColorRulesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationFilesBase(BaseModel):
    file_id: Optional[int] = None
    series_id: Optional[int] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    uploaded_at: Optional[datetime] = None

class ReservationFilesCreate(ReservationFilesBase):
    pass

class ReservationFilesUpdate(BaseModel):
    file_id: Optional[int] = None
    series_id: Optional[int] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    uploaded_at: Optional[datetime] = None

class ReservationFiles(ReservationFilesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationGuestsBase(BaseModel):
    reservation_instance_id: Optional[int] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

class ReservationGuestsCreate(ReservationGuestsBase):
    pass

class ReservationGuestsUpdate(BaseModel):
    reservation_instance_id: Optional[int] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

class ReservationGuests(ReservationGuestsBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationInstancesBase(BaseModel):
    reservation_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReservationInstancesCreate(ReservationInstancesBase):
    pass

class ReservationInstancesUpdate(BaseModel):
    reservation_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReservationInstances(ReservationInstancesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationRemindersBase(BaseModel):
    reservation_reminder_id: Optional[int] = None
    series_id: Optional[int] = None
    minutes_prior: Optional[int] = None
    reminder_type: Optional[str] = None

class ReservationRemindersCreate(ReservationRemindersBase):
    pass

class ReservationRemindersUpdate(BaseModel):
    reservation_reminder_id: Optional[int] = None
    series_id: Optional[int] = None
    minutes_prior: Optional[int] = None
    reminder_type: Optional[str] = None

class ReservationReminders(ReservationRemindersBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationResourcesBase(BaseModel):
    series_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_level_id: Optional[int] = None

class ReservationResourcesCreate(ReservationResourcesBase):
    pass

class ReservationResourcesUpdate(BaseModel):
    series_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_level_id: Optional[int] = None

class ReservationResources(ReservationResourcesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationSeriesBase(BaseModel):
    series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    allow_participation: Optional[int] = None
    allow_anon_participation: Optional[int] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None
    owner_id: Optional[int] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReservationSeriesCreate(ReservationSeriesBase):
    pass

class ReservationSeriesUpdate(BaseModel):
    series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    allow_participation: Optional[int] = None
    allow_anon_participation: Optional[int] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None
    owner_id: Optional[int] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ReservationSeries(ReservationSeriesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationStatusesBase(BaseModel):
    status_id: Optional[int] = None
    label: Optional[str] = None

class ReservationStatusesCreate(ReservationStatusesBase):
    pass

class ReservationStatusesUpdate(BaseModel):
    status_id: Optional[int] = None
    label: Optional[str] = None

class ReservationStatuses(ReservationStatusesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationTypesBase(BaseModel):
    type_id: Optional[int] = None
    label: Optional[str] = None

class ReservationTypesCreate(ReservationTypesBase):
    pass

class ReservationTypesUpdate(BaseModel):
    type_id: Optional[int] = None
    label: Optional[str] = None

class ReservationTypes(ReservationTypesBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationUsersBase(BaseModel):
    reservation_instance_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    reservation_user_level: Optional[int] = None

class ReservationUsersCreate(ReservationUsersBase):
    pass

class ReservationUsersUpdate(BaseModel):
    reservation_instance_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    reservation_user_level: Optional[int] = None

class ReservationUsers(ReservationUsersBase):
    model_config = ConfigDict(from_attributes=True)


class ReservationWaitlistRequestsBase(BaseModel):
    waitlist_request_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

class ReservationWaitlistRequestsCreate(ReservationWaitlistRequestsBase):
    pass

class ReservationWaitlistRequestsUpdate(BaseModel):
    waitlist_request_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    schedule_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

class ReservationWaitlistRequests(ReservationWaitlistRequestsBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceAccessoriesBase(BaseModel):
    resource_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity_required: Optional[int] = None

class ResourceAccessoriesCreate(ResourceAccessoriesBase):
    pass

class ResourceAccessoriesUpdate(BaseModel):
    resource_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity_required: Optional[int] = None

class ResourceAccessories(ResourceAccessoriesBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceGroupAssignmentBase(BaseModel):
    resource_id: Optional[int] = None
    resource_group_id: Optional[int] = None

class ResourceGroupAssignmentCreate(ResourceGroupAssignmentBase):
    pass

class ResourceGroupAssignmentUpdate(BaseModel):
    resource_id: Optional[int] = None
    resource_group_id: Optional[int] = None

class ResourceGroupAssignment(ResourceGroupAssignmentBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceGroupsBase(BaseModel):
    resource_group_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ResourceGroupsCreate(ResourceGroupsBase):
    pass

class ResourceGroupsUpdate(BaseModel):
    resource_group_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ResourceGroups(ResourceGroupsBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceImagesBase(BaseModel):
    resource_image_id: Optional[int] = None
    resource_id: Optional[int] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    created_at: Optional[datetime] = None

class ResourceImagesCreate(ResourceImagesBase):
    pass

class ResourceImagesUpdate(BaseModel):
    resource_image_id: Optional[int] = None
    resource_id: Optional[int] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    created_at: Optional[datetime] = None

class ResourceImages(ResourceImagesBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceStatusReasonsBase(BaseModel):
    resource_status_reason_id: Optional[int] = None
    description: Optional[str] = None

class ResourceStatusReasonsCreate(ResourceStatusReasonsBase):
    pass

class ResourceStatusReasonsUpdate(BaseModel):
    resource_status_reason_id: Optional[int] = None
    description: Optional[str] = None

class ResourceStatusReasons(ResourceStatusReasonsBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceTypeAssignmentBase(BaseModel):
    resource_id: Optional[int] = None
    resource_type_id: Optional[int] = None

class ResourceTypeAssignmentCreate(ResourceTypeAssignmentBase):
    pass

class ResourceTypeAssignmentUpdate(BaseModel):
    resource_id: Optional[int] = None
    resource_type_id: Optional[int] = None

class ResourceTypeAssignment(ResourceTypeAssignmentBase):
    model_config = ConfigDict(from_attributes=True)


class ResourceTypesBase(BaseModel):
    resource_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ResourceTypesCreate(ResourceTypesBase):
    pass

class ResourceTypesUpdate(BaseModel):
    resource_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ResourceTypes(ResourceTypesBase):
    model_config = ConfigDict(from_attributes=True)


class ResourcesBase(BaseModel):
    resource_id: Optional[int] = None
    name: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[int] = None
    min_duration: Optional[int] = None
    min_increment: Optional[int] = None
    max_duration: Optional[int] = None
    unit_cost: Optional[float] = None
    auto_assign: Optional[int] = None
    requires_approval: Optional[int] = None
    allow_multiday_reservations: Optional[int] = None
    max_participants: Optional[int] = None
    min_notice_time: Optional[int] = None
    max_notice_time: Optional[int] = None
    image_name: Optional[str] = None
    schedule_id: Optional[int] = None
    resource_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class ResourcesCreate(ResourcesBase):
    pass

class ResourcesUpdate(BaseModel):
    resource_id: Optional[int] = None
    name: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[int] = None
    min_duration: Optional[int] = None
    min_increment: Optional[int] = None
    max_duration: Optional[int] = None
    unit_cost: Optional[float] = None
    auto_assign: Optional[int] = None
    requires_approval: Optional[int] = None
    allow_multiday_reservations: Optional[int] = None
    max_participants: Optional[int] = None
    min_notice_time: Optional[int] = None
    max_notice_time: Optional[int] = None
    image_name: Optional[str] = None
    schedule_id: Optional[int] = None
    resource_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class Resources(ResourcesBase):
    model_config = ConfigDict(from_attributes=True)


class SavedReportsBase(BaseModel):
    saved_report_id: Optional[int] = None
    report_name: Optional[str] = None
    sys_user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    report_details: Optional[str] = None

class SavedReportsCreate(SavedReportsBase):
    pass

class SavedReportsUpdate(BaseModel):
    saved_report_id: Optional[int] = None
    report_name: Optional[str] = None
    sys_user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    report_details: Optional[str] = None

class SavedReports(SavedReportsBase):
    model_config = ConfigDict(from_attributes=True)


class SchedulesBase(BaseModel):
    schedule_id: Optional[int] = None
    name: Optional[str] = None
    is_default: Optional[int] = None
    weekday_start: Optional[int] = None
    days_visible: Optional[int] = None
    layout_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class SchedulesCreate(SchedulesBase):
    pass

class SchedulesUpdate(BaseModel):
    schedule_id: Optional[int] = None
    name: Optional[str] = None
    is_default: Optional[int] = None
    weekday_start: Optional[int] = None
    days_visible: Optional[int] = None
    layout_id: Optional[int] = None
    sys_unit_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class Schedules(SchedulesBase):
    model_config = ConfigDict(from_attributes=True)


class TermsOfServiceBase(BaseModel):
    terms_of_service_id: Optional[int] = None
    terms_text: Optional[str] = None
    terms_type: Optional[str] = None
    effective_date: Optional[datetime] = None

class TermsOfServiceCreate(TermsOfServiceBase):
    pass

class TermsOfServiceUpdate(BaseModel):
    terms_of_service_id: Optional[int] = None
    terms_text: Optional[str] = None
    terms_type: Optional[str] = None
    effective_date: Optional[datetime] = None

class TermsOfService(TermsOfServiceBase):
    model_config = ConfigDict(from_attributes=True)


class TimeBlocksBase(BaseModel):
    block_id: Optional[int] = None
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: Optional[int] = None
    layout_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TimeBlocksCreate(TimeBlocksBase):
    pass

class TimeBlocksUpdate(BaseModel):
    block_id: Optional[int] = None
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: Optional[int] = None
    layout_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None

class TimeBlocks(TimeBlocksBase):
    model_config = ConfigDict(from_attributes=True)


class UserEmailPreferencesBase(BaseModel):
    sys_user_id: Optional[int] = None
    event_category: Optional[str] = None
    event_type: Optional[str] = None

class UserEmailPreferencesCreate(UserEmailPreferencesBase):
    pass

class UserEmailPreferencesUpdate(BaseModel):
    sys_user_id: Optional[int] = None
    event_category: Optional[str] = None
    event_type: Optional[str] = None

class UserEmailPreferences(UserEmailPreferencesBase):
    model_config = ConfigDict(from_attributes=True)


class UserPreferencesBase(BaseModel):
    user_preferences_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    value: Optional[str] = None

class UserPreferencesCreate(UserPreferencesBase):
    pass

class UserPreferencesUpdate(BaseModel):
    user_preferences_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    name: Optional[str] = None
    value: Optional[str] = None

class UserPreferences(UserPreferencesBase):
    model_config = ConfigDict(from_attributes=True)


class UserResourcePermissionsBase(BaseModel):
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    permission_id: Optional[int] = None

class UserResourcePermissionsCreate(UserResourcePermissionsBase):
    pass

class UserResourcePermissionsUpdate(BaseModel):
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    permission_id: Optional[int] = None

class UserResourcePermissions(UserResourcePermissionsBase):
    model_config = ConfigDict(from_attributes=True)


class UserSessionBase(BaseModel):
    user_session_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    session_token: Optional[str] = None
    user_session_value: Optional[str] = None
    expiry_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

class UserSessionCreate(UserSessionBase):
    pass

class UserSessionUpdate(BaseModel):
    user_session_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    session_token: Optional[str] = None
    user_session_value: Optional[str] = None
    expiry_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

class UserSession(UserSessionBase):
    model_config = ConfigDict(from_attributes=True)
