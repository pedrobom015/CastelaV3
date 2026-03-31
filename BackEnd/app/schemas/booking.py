from pydantic import BaseModel, ConfigDict
from datetime import datetime, time
from typing import Optional


class LayoutBase(BaseModel):
    layout_id: Optional[int] = None
    timezone: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class LayoutCreate(LayoutBase):
    pass


class LayoutUpdate(BaseModel):
    layout_id: Optional[int] = None
    timezone: Optional[str] = None


class Layout(LayoutBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TimeBlockBase(BaseModel):
    block_id: Optional[int] = None
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: Optional[int] = None
    layout_id: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    day_of_week: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class TimeBlockCreate(TimeBlockBase):
    pass


class TimeBlockUpdate(BaseModel):
    block_id: Optional[int] = None
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: Optional[int] = None
    layout_id: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    day_of_week: Optional[int] = None


class TimeBlock(TimeBlockBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ScheduleBase(BaseModel):
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


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    schedule_id: Optional[int] = None
    name: Optional[str] = None
    is_default: Optional[int] = None
    weekday_start: Optional[int] = None
    days_visible: Optional[int] = None
    layout_id: Optional[int] = None
    sys_unit_id: Optional[int] = None


class Schedule(ScheduleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ResourceTypeBase(BaseModel):
    resource_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ResourceTypeCreate(ResourceTypeBase):
    pass


class ResourceTypeUpdate(BaseModel):
    resource_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class ResourceType(ResourceTypeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ResourceBase(BaseModel):
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


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
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


class Resource(ResourceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationTypeBase(BaseModel):
    type_id: Optional[int] = None
    label: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationTypeCreate(ReservationTypeBase):
    pass


class ReservationTypeUpdate(BaseModel):
    type_id: Optional[int] = None
    label: Optional[str] = None


class ReservationType(ReservationTypeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationStatusBase(BaseModel):
    status_id: Optional[int] = None
    label: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationStatusCreate(ReservationStatusBase):
    pass


class ReservationStatusUpdate(BaseModel):
    status_id: Optional[int] = None
    label: Optional[str] = None


class ReservationStatus(ReservationStatusBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationSeriesBase(BaseModel):
    series_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    allow_participation: Optional[int] = None
    allow_anon_participation: Optional[int] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None
    owner_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationSeriesCreate(ReservationSeriesBase):
    pass


class ReservationSeriesUpdate(BaseModel):
    series_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    allow_participation: Optional[int] = None
    allow_anon_participation: Optional[int] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None


class ReservationSeries(ReservationSeriesBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationInstanceBase(BaseModel):
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


class ReservationInstanceCreate(ReservationInstanceBase):
    pass


class ReservationInstanceUpdate(BaseModel):
    reservation_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    reference_number: Optional[str] = None


class ReservationInstance(ReservationInstanceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationUserBase(BaseModel):
    reservation_instance_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    reservation_user_level: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationUserCreate(ReservationUserBase):
    pass


class ReservationUserUpdate(BaseModel):
    reservation_instance_id: Optional[int] = None
    sys_user_id: Optional[int] = None
    reservation_user_level: Optional[int] = None


class ReservationUser(ReservationUserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationResourceBase(BaseModel):
    series_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_level_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationResourceCreate(ReservationResourceBase):
    pass


class ReservationResourceUpdate(BaseModel):
    series_id: Optional[int] = None
    resource_id: Optional[int] = None
    resource_level_id: Optional[int] = None


class ReservationResource(ReservationResourceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class AccessoryBase(BaseModel):
    accessory_id: Optional[int] = None
    name: Optional[str] = None
    quantity_available: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class AccessoryCreate(AccessoryBase):
    pass


class AccessoryUpdate(BaseModel):
    accessory_id: Optional[int] = None
    name: Optional[str] = None
    quantity_available: Optional[int] = None


class Accessory(AccessoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReservationAccessoryBase(BaseModel):
    series_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class ReservationAccessoryCreate(ReservationAccessoryBase):
    pass


class ReservationAccessoryUpdate(BaseModel):
    series_id: Optional[int] = None
    accessory_id: Optional[int] = None
    quantity: Optional[int] = None


class ReservationAccessory(ReservationAccessoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BlackoutSeriesBase(BaseModel):
    blackout_series_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class BlackoutSeriesCreate(BlackoutSeriesBase):
    pass


class BlackoutSeriesUpdate(BaseModel):
    blackout_series_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None


class BlackoutSeries(BlackoutSeriesBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BlackoutInstanceBase(BaseModel):
    blackout_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    blackout_series_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class BlackoutInstanceCreate(BlackoutInstanceBase):
    pass


class BlackoutInstanceUpdate(BaseModel):
    blackout_instance_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BlackoutInstance(BlackoutInstanceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CustomAttributeBase(BaseModel):
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


class CustomAttributeCreate(CustomAttributeBase):
    pass


class CustomAttributeUpdate(BaseModel):
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


class CustomAttribute(CustomAttributeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class UserResourcePermissionBase(BaseModel):
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    permission_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    deleted_by: Optional[int] = None


class UserResourcePermissionCreate(UserResourcePermissionBase):
    pass


class UserResourcePermissionUpdate(BaseModel):
    sys_user_id: Optional[int] = None
    resource_id: Optional[int] = None
    permission_id: Optional[int] = None


class UserResourcePermission(UserResourcePermissionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
