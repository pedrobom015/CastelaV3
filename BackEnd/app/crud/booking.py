from app.crud.base import CRUDBase

from app.models.booking import (
    Layout,
    TimeBlock,
    Schedule,
    ResourceType,
    Resource,
    ReservationType,
    ReservationStatus,
    ReservationSeries,
    ReservationInstance,
    ReservationUser,
    ReservationResource,
    Accessory,
    ReservationAccessory,
    BlackoutSeries,
    BlackoutInstance,
    CustomAttribute,
    UserResourcePermission
)

from app.schemas.booking import (
    LayoutCreate, LayoutUpdate,
    TimeBlockCreate, TimeBlockUpdate,
    ScheduleCreate, ScheduleUpdate,
    ResourceTypeCreate, ResourceTypeUpdate,
    ResourceCreate, ResourceUpdate,
    ReservationTypeCreate, ReservationTypeUpdate,
    ReservationStatusCreate, ReservationStatusUpdate,
    ReservationSeriesCreate, ReservationSeriesUpdate,
    ReservationInstanceCreate, ReservationInstanceUpdate,
    ReservationUserCreate, ReservationUserUpdate,
    ReservationResourceCreate, ReservationResourceUpdate,
    AccessoryCreate, AccessoryUpdate,
    ReservationAccessoryCreate, ReservationAccessoryUpdate,
    BlackoutSeriesCreate, BlackoutSeriesUpdate,
    BlackoutInstanceCreate, BlackoutInstanceUpdate,
    CustomAttributeCreate, CustomAttributeUpdate,
    UserResourcePermissionCreate, UserResourcePermissionUpdate
)

crud_layout = CRUDBase[Layout, LayoutCreate, LayoutUpdate](Layout)
crud_time_block = CRUDBase[TimeBlock, TimeBlockCreate, TimeBlockUpdate](TimeBlock)
crud_schedule = CRUDBase[Schedule, ScheduleCreate, ScheduleUpdate](Schedule)
crud_resource_type = CRUDBase[ResourceType, ResourceTypeCreate, ResourceTypeUpdate](ResourceType)
crud_resource = CRUDBase[Resource, ResourceCreate, ResourceUpdate](Resource)
crud_reservation_type = CRUDBase[ReservationType, ReservationTypeCreate, ReservationTypeUpdate](ReservationType)
crud_reservation_status = CRUDBase[ReservationStatus, ReservationStatusCreate, ReservationStatusUpdate](ReservationStatus)
crud_reservation_series = CRUDBase[ReservationSeries, ReservationSeriesCreate, ReservationSeriesUpdate](ReservationSeries)
crud_reservation_instance = CRUDBase[ReservationInstance, ReservationInstanceCreate, ReservationInstanceUpdate](ReservationInstance)
crud_reservation_user = CRUDBase[ReservationUser, ReservationUserCreate, ReservationUserUpdate](ReservationUser)
crud_reservation_resource = CRUDBase[ReservationResource, ReservationResourceCreate, ReservationResourceUpdate](ReservationResource)
crud_accessory = CRUDBase[Accessory, AccessoryCreate, AccessoryUpdate](Accessory)
crud_reservation_accessory = CRUDBase[ReservationAccessory, ReservationAccessoryCreate, ReservationAccessoryUpdate](ReservationAccessory)
crud_blackout_series = CRUDBase[BlackoutSeries, BlackoutSeriesCreate, BlackoutSeriesUpdate](BlackoutSeries)
crud_blackout_instance = CRUDBase[BlackoutInstance, BlackoutInstanceCreate, BlackoutInstanceUpdate](BlackoutInstance)
crud_custom_attribute = CRUDBase[CustomAttribute, CustomAttributeCreate, CustomAttributeUpdate](CustomAttribute)
crud_user_resource_permission = CRUDBase[UserResourcePermission, UserResourcePermissionCreate, UserResourcePermissionUpdate](UserResourcePermission)
