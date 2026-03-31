from pydantic import BaseModel, ConfigDict
from datetime import datetime, date, time
from typing import Optional, List


# -- LAYOUT --
class LayoutBase(BaseModel):
    timezone: str = "America/Sao_Paulo"


class LayoutCreate(LayoutBase):
    pass


class LayoutUpdate(BaseModel):
    timezone: Optional[str] = None


class Layout(LayoutBase):
    layout_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- TIME BLOCK --
class TimeBlockBase(BaseModel):
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: int = 1
    layout_id: int
    start_time: time
    end_time: time
    day_of_week: Optional[int] = None


class TimeBlockCreate(TimeBlockBase):
    pass


class TimeBlockUpdate(BaseModel):
    label: Optional[str] = None
    end_label: Optional[str] = None
    availability_code: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    day_of_week: Optional[int] = None


class TimeBlock(TimeBlockBase):
    block_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- SCHEDULE --
class ScheduleBase(BaseModel):
    name: str
    is_default: int = 0
    weekday_start: int = 0
    days_visible: int = 7
    layout_id: int
    sys_unit_id: Optional[int] = None


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    is_default: Optional[int] = None
    weekday_start: Optional[int] = None
    days_visible: Optional[int] = None
    layout_id: Optional[int] = None
    sys_unit_id: Optional[int] = None


class Schedule(ScheduleBase):
    schedule_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESOURCE TYPE --
class ResourceTypeBase(BaseModel):
    name: str
    description: Optional[str] = None


class ResourceTypeCreate(ResourceTypeBase):
    pass


class ResourceTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ResourceType(ResourceTypeBase):
    resource_type_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESOURCE --
class ResourceBase(BaseModel):
    name: str
    location: Optional[str] = None
    contact_info: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_active: int = 1
    min_duration: Optional[int] = None
    min_increment: Optional[int] = None
    max_duration: Optional[int] = None
    unit_cost: Optional[float] = None
    auto_assign: int = 1
    requires_approval: int = 0
    allow_multiday_reservations: int = 1
    max_participants: Optional[int] = None
    min_notice_time: Optional[int] = None
    max_notice_time: Optional[int] = None
    image_name: Optional[str] = None
    schedule_id: int
    resource_type_id: Optional[int] = None
    sys_unit_id: Optional[int] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
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
    resource_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION TYPE --
class ReservationTypeBase(BaseModel):
    label: str


class ReservationTypeCreate(ReservationTypeBase):
    type_id: int


class ReservationType(ReservationTypeBase):
    type_id: int

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION STATUS --
class ReservationStatusBase(BaseModel):
    label: str


class ReservationStatusCreate(ReservationStatusBase):
    status_id: int


class ReservationStatus(ReservationStatusBase):
    status_id: int

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION SERIES --
class ReservationSeriesBase(BaseModel):
    title: str
    description: Optional[str] = None
    allow_participation: int = 0
    allow_anon_participation: int = 0
    type_id: int = 1
    status_id: int = 1
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None
    owner_id: int


class ReservationSeriesCreate(ReservationSeriesBase):
    pass


class ReservationSeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    allow_participation: Optional[int] = None
    allow_anon_participation: Optional[int] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    repeat_type: Optional[str] = None
    repeat_options: Optional[str] = None


class ReservationSeries(ReservationSeriesBase):
    series_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION INSTANCE --
class ReservationInstanceBase(BaseModel):
    start_date: datetime
    end_date: datetime
    reference_number: str
    series_id: int


class ReservationInstanceCreate(ReservationInstanceBase):
    pass


class ReservationInstanceUpdate(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    reference_number: Optional[str] = None


class ReservationInstance(ReservationInstanceBase):
    reservation_instance_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION USER --
class ReservationUserBase(BaseModel):
    reservation_instance_id: int
    sys_user_id: int
    reservation_user_level: int


class ReservationUserCreate(ReservationUserBase):
    pass


class ReservationUser(ReservationUserBase):
    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION RESOURCE --
class ReservationResourceBase(BaseModel):
    series_id: int
    resource_id: int
    resource_level_id: int


class ReservationResourceCreate(ReservationResourceBase):
    pass


class ReservationResource(ReservationResourceBase):
    model_config = ConfigDict(from_attributes=True)


# -- ACCESSORY --
class AccessoryBase(BaseModel):
    name: str
    quantity_available: int = 0


class AccessoryCreate(AccessoryBase):
    pass


class AccessoryUpdate(BaseModel):
    name: Optional[str] = None
    quantity_available: Optional[int] = None


class Accessory(AccessoryBase):
    accessory_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- RESERVATION ACCESSORY --
class ReservationAccessoryBase(BaseModel):
    series_id: int
    accessory_id: int
    quantity: int = 1


class ReservationAccessoryCreate(ReservationAccessoryBase):
    pass


class ReservationAccessory(ReservationAccessoryBase):
    model_config = ConfigDict(from_attributes=True)


# -- BLACKOUT SERIES --
class BlackoutSeriesBase(BaseModel):
    title: str
    description: Optional[str] = None
    owner_id: int


class BlackoutSeriesCreate(BlackoutSeriesBase):
    pass


class BlackoutSeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class BlackoutSeries(BlackoutSeriesBase):
    blackout_series_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- BLACKOUT INSTANCE --
class BlackoutInstanceBase(BaseModel):
    start_date: datetime
    end_date: datetime
    blackout_series_id: int


class BlackoutInstanceCreate(BlackoutInstanceBase):
    pass


class BlackoutInstance(BlackoutInstanceBase):
    blackout_instance_id: int

    model_config = ConfigDict(from_attributes=True)


# -- CUSTOM ATTRIBUTE --
class CustomAttributeBase(BaseModel):
    name: str
    type: str
    required: int = 0
    possible_values: Optional[str] = None
    sort_order: Optional[int] = None
    category: Optional[str] = None
    regex_validation: Optional[str] = None
    is_private: int = 0
    is_multi: int = 0


class CustomAttributeCreate(CustomAttributeBase):
    pass


class CustomAttributeUpdate(BaseModel):
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
    attribute_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -- USER RESOURCE PERMISSION --
class UserResourcePermissionBase(BaseModel):
    sys_user_id: int
    resource_id: int
    permission_id: int = 1


class UserResourcePermissionCreate(UserResourcePermissionBase):
    pass


class UserResourcePermission(UserResourcePermissionBase):
    model_config = ConfigDict(from_attributes=True)


# -- COMPLETE RESERVATION (for listing) --
class ReservationWithDetails(BaseModel):
    series_id: int
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    reference_number: str
    status_id: int
    status_label: Optional[str] = None
    owner_name: Optional[str] = None
    resources: List[str] = []
    participants: List[str] = []

    model_config = ConfigDict(from_attributes=True)
