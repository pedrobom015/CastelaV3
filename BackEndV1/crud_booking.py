from crud_base import CRUDBase
from models_booking import (
    Layout, TimeBlock, Schedule, ResourceType, Resource,
    ReservationType, ReservationStatus, ReservationSeries,
    ReservationInstance, ReservationUser, ReservationResource,
    Accessory, ReservationAccessory, BlackoutSeries, BlackoutInstance,
    CustomAttribute, UserResourcePermission
)
from schemas_booking import (
    LayoutCreate, LayoutUpdate,
    TimeBlockCreate, TimeBlockUpdate,
    ScheduleCreate, ScheduleUpdate,
    ResourceTypeCreate, ResourceTypeUpdate,
    ResourceCreate, ResourceUpdate,
    ReservationSeriesCreate, ReservationSeriesUpdate,
    ReservationInstanceCreate, ReservationInstanceUpdate,
    ReservationUserCreate,
    ReservationResourceCreate,
    AccessoryCreate, AccessoryUpdate,
    ReservationAccessoryCreate,
    BlackoutSeriesCreate, BlackoutSeriesUpdate,
    BlackoutInstanceCreate,
    CustomAttributeCreate, CustomAttributeUpdate,
    UserResourcePermissionCreate
)


crud_layout = CRUDBase[Layout, LayoutCreate, LayoutUpdate](Layout)
crud_time_block = CRUDBase[TimeBlock, TimeBlockCreate, TimeBlockUpdate](TimeBlock)
crud_schedule = CRUDBase[Schedule, ScheduleCreate, ScheduleUpdate](Schedule)
crud_resource_type = CRUDBase[ResourceType, ResourceTypeCreate, ResourceTypeUpdate](ResourceType)
crud_resource = CRUDBase[Resource, ResourceCreate, ResourceUpdate](Resource)
crud_reservation_series = CRUDBase[ReservationSeries, ReservationSeriesCreate, ReservationSeriesUpdate](ReservationSeries)
crud_reservation_instance = CRUDBase[ReservationInstance, ReservationInstanceCreate, ReservationInstanceUpdate](ReservationInstance)
crud_accessory = CRUDBase[Accessory, AccessoryCreate, AccessoryUpdate](Accessory)
crud_blackout_series = CRUDBase[BlackoutSeries, BlackoutSeriesCreate, BlackoutSeriesUpdate](BlackoutSeries)
crud_blackout_instance = CRUDBase[BlackoutInstance, BlackoutInstanceCreate, BlackoutInstanceUpdate](BlackoutInstance)
crud_custom_attribute = CRUDBase[CustomAttribute, CustomAttributeCreate, CustomAttributeUpdate](CustomAttribute)
