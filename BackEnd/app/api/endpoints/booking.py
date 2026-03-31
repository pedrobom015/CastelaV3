from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.booking as crud_module
import app.schemas.booking as schemas_module

router = APIRouter(prefix="/booking", tags=["booking"])

router_layout = APIRouter(prefix="/layout", tags=["booking-layout"])
router_time_block = APIRouter(prefix="/time-block", tags=["booking-time-block"])
router_schedule = APIRouter(prefix="/schedule", tags=["booking-schedule"])
router_resource_type = APIRouter(prefix="/resource-type", tags=["booking-resource-type"])
router_resource = APIRouter(prefix="/resource", tags=["booking-resource"])
router_reservation_type = APIRouter(prefix="/reservation-type", tags=["booking-reservation-type"])
router_reservation_status = APIRouter(prefix="/reservation-status", tags=["booking-reservation-status"])
router_reservation_series = APIRouter(prefix="/reservation-series", tags=["booking-reservation-series"])
router_reservation_instance = APIRouter(prefix="/reservation-instance", tags=["booking-reservation-instance"])
router_reservation_user = APIRouter(prefix="/reservation-user", tags=["booking-reservation-user"])
router_reservation_resource = APIRouter(prefix="/reservation-resource", tags=["booking-reservation-resource"])
router_accessory = APIRouter(prefix="/accessory", tags=["booking-accessory"])
router_reservation_accessory = APIRouter(prefix="/reservation-accessory", tags=["booking-reservation-accessory"])
router_blackout_series = APIRouter(prefix="/blackout-series", tags=["booking-blackout-series"])
router_blackout_instance = APIRouter(prefix="/blackout-instance", tags=["booking-blackout-instance"])
router_custom_attribute = APIRouter(prefix="/custom-attribute", tags=["booking-custom-attribute"])
router_user_resource_permission = APIRouter(prefix="/user-resource-permission", tags=["booking-user-resource-permission"])

router.include_router(router_layout)
router.include_router(router_time_block)
router.include_router(router_schedule)
router.include_router(router_resource_type)
router.include_router(router_resource)
router.include_router(router_reservation_type)
router.include_router(router_reservation_status)
router.include_router(router_reservation_series)
router.include_router(router_reservation_instance)
router.include_router(router_reservation_user)
router.include_router(router_reservation_resource)
router.include_router(router_accessory)
router.include_router(router_reservation_accessory)
router.include_router(router_blackout_series)
router.include_router(router_blackout_instance)
router.include_router(router_custom_attribute)
router.include_router(router_user_resource_permission)


@router_layout.get("/", response_model=List[schemas_module.Layout])
def read_layout(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_layout.get_multi(db, skip=skip, limit=limit)


@router_layout.get("/{id}", response_model=schemas_module.Layout)
def read_layout_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_layout.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Layout not found")
    return obj


@router_layout.post("/", response_model=schemas_module.Layout, status_code=status.HTTP_201_CREATED)
def create_layout(obj_in: schemas_module.LayoutCreate, db: Session = Depends(get_db)):
    return crud_module.crud_layout.create(db=db, obj_in=obj_in)


@router_layout.put("/{id}", response_model=schemas_module.Layout)
def update_layout(id: int, obj_in: schemas_module.LayoutUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_layout.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Layout not found")
    return crud_module.crud_layout.update(db=db, db_obj=obj, obj_in=obj_in)


@router_layout.delete("/{id}", response_model=schemas_module.Layout)
def delete_layout(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_layout.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Layout not found")
    return crud_module.crud_layout.remove(db=db, id=id)


@router_time_block.get("/", response_model=List[schemas_module.TimeBlock])
def read_time_block(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_time_block.get_multi(db, skip=skip, limit=limit)


@router_time_block.get("/{id}", response_model=schemas_module.TimeBlock)
def read_time_block_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_time_block.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlock not found")
    return obj


@router_time_block.post("/", response_model=schemas_module.TimeBlock, status_code=status.HTTP_201_CREATED)
def create_time_block(obj_in: schemas_module.TimeBlockCreate, db: Session = Depends(get_db)):
    return crud_module.crud_time_block.create(db=db, obj_in=obj_in)


@router_time_block.put("/{id}", response_model=schemas_module.TimeBlock)
def update_time_block(id: int, obj_in: schemas_module.TimeBlockUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_time_block.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlock not found")
    return crud_module.crud_time_block.update(db=db, db_obj=obj, obj_in=obj_in)


@router_time_block.delete("/{id}", response_model=schemas_module.TimeBlock)
def delete_time_block(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_time_block.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlock not found")
    return crud_module.crud_time_block.remove(db=db, id=id)


@router_schedule.get("/", response_model=List[schemas_module.Schedule])
def read_schedule(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_schedule.get_multi(db, skip=skip, limit=limit)


@router_schedule.get("/{id}", response_model=schemas_module.Schedule)
def read_schedule_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_schedule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return obj


@router_schedule.post("/", response_model=schemas_module.Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule(obj_in: schemas_module.ScheduleCreate, db: Session = Depends(get_db)):
    return crud_module.crud_schedule.create(db=db, obj_in=obj_in)


@router_schedule.put("/{id}", response_model=schemas_module.Schedule)
def update_schedule(id: int, obj_in: schemas_module.ScheduleUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_schedule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return crud_module.crud_schedule.update(db=db, db_obj=obj, obj_in=obj_in)


@router_schedule.delete("/{id}", response_model=schemas_module.Schedule)
def delete_schedule(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_schedule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return crud_module.crud_schedule.remove(db=db, id=id)


@router_resource_type.get("/", response_model=List[schemas_module.ResourceType])
def read_resource_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_resource_type.get_multi(db, skip=skip, limit=limit)


@router_resource_type.get("/{id}", response_model=schemas_module.ResourceType)
def read_resource_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceType not found")
    return obj


@router_resource_type.post("/", response_model=schemas_module.ResourceType, status_code=status.HTTP_201_CREATED)
def create_resource_type(obj_in: schemas_module.ResourceTypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_resource_type.create(db=db, obj_in=obj_in)


@router_resource_type.put("/{id}", response_model=schemas_module.ResourceType)
def update_resource_type(id: int, obj_in: schemas_module.ResourceTypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceType not found")
    return crud_module.crud_resource_type.update(db=db, db_obj=obj, obj_in=obj_in)


@router_resource_type.delete("/{id}", response_model=schemas_module.ResourceType)
def delete_resource_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceType not found")
    return crud_module.crud_resource_type.remove(db=db, id=id)


@router_resource.get("/", response_model=List[schemas_module.Resource])
def read_resource(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_resource.get_multi(db, skip=skip, limit=limit)


@router_resource.get("/{id}", response_model=schemas_module.Resource)
def read_resource_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    return obj


@router_resource.post("/", response_model=schemas_module.Resource, status_code=status.HTTP_201_CREATED)
def create_resource(obj_in: schemas_module.ResourceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_resource.create(db=db, obj_in=obj_in)


@router_resource.put("/{id}", response_model=schemas_module.Resource)
def update_resource(id: int, obj_in: schemas_module.ResourceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud_module.crud_resource.update(db=db, db_obj=obj, obj_in=obj_in)


@router_resource.delete("/{id}", response_model=schemas_module.Resource)
def delete_resource(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud_module.crud_resource.remove(db=db, id=id)


@router_reservation_type.get("/", response_model=List[schemas_module.ReservationType])
def read_reservation_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_type.get_multi(db, skip=skip, limit=limit)


@router_reservation_type.get("/{id}", response_model=schemas_module.ReservationType)
def read_reservation_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationType not found")
    return obj


@router_reservation_type.post("/", response_model=schemas_module.ReservationType, status_code=status.HTTP_201_CREATED)
def create_reservation_type(obj_in: schemas_module.ReservationTypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_type.create(db=db, obj_in=obj_in)


@router_reservation_type.put("/{id}", response_model=schemas_module.ReservationType)
def update_reservation_type(id: int, obj_in: schemas_module.ReservationTypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationType not found")
    return crud_module.crud_reservation_type.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_type.delete("/{id}", response_model=schemas_module.ReservationType)
def delete_reservation_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationType not found")
    return crud_module.crud_reservation_type.remove(db=db, id=id)


@router_reservation_status.get("/", response_model=List[schemas_module.ReservationStatus])
def read_reservation_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_status.get_multi(db, skip=skip, limit=limit)


@router_reservation_status.get("/{id}", response_model=schemas_module.ReservationStatus)
def read_reservation_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatus not found")
    return obj


@router_reservation_status.post("/", response_model=schemas_module.ReservationStatus, status_code=status.HTTP_201_CREATED)
def create_reservation_status(obj_in: schemas_module.ReservationStatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_status.create(db=db, obj_in=obj_in)


@router_reservation_status.put("/{id}", response_model=schemas_module.ReservationStatus)
def update_reservation_status(id: int, obj_in: schemas_module.ReservationStatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatus not found")
    return crud_module.crud_reservation_status.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_status.delete("/{id}", response_model=schemas_module.ReservationStatus)
def delete_reservation_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatus not found")
    return crud_module.crud_reservation_status.remove(db=db, id=id)


@router_reservation_series.get("/", response_model=List[schemas_module.ReservationSeries])
def read_reservation_series(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_series.get_multi(db, skip=skip, limit=limit)


@router_reservation_series.get("/{id}", response_model=schemas_module.ReservationSeries)
def read_reservation_series_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    return obj


@router_reservation_series.post("/", response_model=schemas_module.ReservationSeries, status_code=status.HTTP_201_CREATED)
def create_reservation_series(obj_in: schemas_module.ReservationSeriesCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_series.create(db=db, obj_in=obj_in)


@router_reservation_series.put("/{id}", response_model=schemas_module.ReservationSeries)
def update_reservation_series(id: int, obj_in: schemas_module.ReservationSeriesUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    return crud_module.crud_reservation_series.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_series.delete("/{id}", response_model=schemas_module.ReservationSeries)
def delete_reservation_series(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    return crud_module.crud_reservation_series.remove(db=db, id=id)


@router_reservation_instance.get("/", response_model=List[schemas_module.ReservationInstance])
def read_reservation_instance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_instance.get_multi(db, skip=skip, limit=limit)


@router_reservation_instance.get("/{id}", response_model=schemas_module.ReservationInstance)
def read_reservation_instance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstance not found")
    return obj


@router_reservation_instance.post("/", response_model=schemas_module.ReservationInstance, status_code=status.HTTP_201_CREATED)
def create_reservation_instance(obj_in: schemas_module.ReservationInstanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_instance.create(db=db, obj_in=obj_in)


@router_reservation_instance.put("/{id}", response_model=schemas_module.ReservationInstance)
def update_reservation_instance(id: int, obj_in: schemas_module.ReservationInstanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstance not found")
    return crud_module.crud_reservation_instance.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_instance.delete("/{id}", response_model=schemas_module.ReservationInstance)
def delete_reservation_instance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstance not found")
    return crud_module.crud_reservation_instance.remove(db=db, id=id)


@router_reservation_user.get("/", response_model=List[schemas_module.ReservationUser])
def read_reservation_user(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_user.get_multi(db, skip=skip, limit=limit)


@router_reservation_user.get("/{id}", response_model=schemas_module.ReservationUser)
def read_reservation_user_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_user.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUser not found")
    return obj


@router_reservation_user.post("/", response_model=schemas_module.ReservationUser, status_code=status.HTTP_201_CREATED)
def create_reservation_user(obj_in: schemas_module.ReservationUserCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_user.create(db=db, obj_in=obj_in)


@router_reservation_user.put("/{id}", response_model=schemas_module.ReservationUser)
def update_reservation_user(id: int, obj_in: schemas_module.ReservationUserUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_user.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUser not found")
    return crud_module.crud_reservation_user.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_user.delete("/{id}", response_model=schemas_module.ReservationUser)
def delete_reservation_user(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_user.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUser not found")
    return crud_module.crud_reservation_user.remove(db=db, id=id)


@router_reservation_resource.get("/", response_model=List[schemas_module.ReservationResource])
def read_reservation_resource(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_resource.get_multi(db, skip=skip, limit=limit)


@router_reservation_resource.get("/{id}", response_model=schemas_module.ReservationResource)
def read_reservation_resource_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResource not found")
    return obj


@router_reservation_resource.post("/", response_model=schemas_module.ReservationResource, status_code=status.HTTP_201_CREATED)
def create_reservation_resource(obj_in: schemas_module.ReservationResourceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_resource.create(db=db, obj_in=obj_in)


@router_reservation_resource.put("/{id}", response_model=schemas_module.ReservationResource)
def update_reservation_resource(id: int, obj_in: schemas_module.ReservationResourceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResource not found")
    return crud_module.crud_reservation_resource.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_resource.delete("/{id}", response_model=schemas_module.ReservationResource)
def delete_reservation_resource(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_resource.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResource not found")
    return crud_module.crud_reservation_resource.remove(db=db, id=id)


@router_accessory.get("/", response_model=List[schemas_module.Accessory])
def read_accessory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_accessory.get_multi(db, skip=skip, limit=limit)


@router_accessory.get("/{id}", response_model=schemas_module.Accessory)
def read_accessory_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accessory not found")
    return obj


@router_accessory.post("/", response_model=schemas_module.Accessory, status_code=status.HTTP_201_CREATED)
def create_accessory(obj_in: schemas_module.AccessoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_accessory.create(db=db, obj_in=obj_in)


@router_accessory.put("/{id}", response_model=schemas_module.Accessory)
def update_accessory(id: int, obj_in: schemas_module.AccessoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accessory not found")
    return crud_module.crud_accessory.update(db=db, db_obj=obj, obj_in=obj_in)


@router_accessory.delete("/{id}", response_model=schemas_module.Accessory)
def delete_accessory(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accessory not found")
    return crud_module.crud_accessory.remove(db=db, id=id)


@router_reservation_accessory.get("/", response_model=List[schemas_module.ReservationAccessory])
def read_reservation_accessory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_accessory.get_multi(db, skip=skip, limit=limit)


@router_reservation_accessory.get("/{id}", response_model=schemas_module.ReservationAccessory)
def read_reservation_accessory_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessory not found")
    return obj


@router_reservation_accessory.post("/", response_model=schemas_module.ReservationAccessory, status_code=status.HTTP_201_CREATED)
def create_reservation_accessory(obj_in: schemas_module.ReservationAccessoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_reservation_accessory.create(db=db, obj_in=obj_in)


@router_reservation_accessory.put("/{id}", response_model=schemas_module.ReservationAccessory)
def update_reservation_accessory(id: int, obj_in: schemas_module.ReservationAccessoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessory not found")
    return crud_module.crud_reservation_accessory.update(db=db, db_obj=obj, obj_in=obj_in)


@router_reservation_accessory.delete("/{id}", response_model=schemas_module.ReservationAccessory)
def delete_reservation_accessory(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_reservation_accessory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessory not found")
    return crud_module.crud_reservation_accessory.remove(db=db, id=id)


@router_blackout_series.get("/", response_model=List[schemas_module.BlackoutSeries])
def read_blackout_series(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_blackout_series.get_multi(db, skip=skip, limit=limit)


@router_blackout_series.get("/{id}", response_model=schemas_module.BlackoutSeries)
def read_blackout_series_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeries not found")
    return obj


@router_blackout_series.post("/", response_model=schemas_module.BlackoutSeries, status_code=status.HTTP_201_CREATED)
def create_blackout_series(obj_in: schemas_module.BlackoutSeriesCreate, db: Session = Depends(get_db)):
    return crud_module.crud_blackout_series.create(db=db, obj_in=obj_in)


@router_blackout_series.put("/{id}", response_model=schemas_module.BlackoutSeries)
def update_blackout_series(id: int, obj_in: schemas_module.BlackoutSeriesUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeries not found")
    return crud_module.crud_blackout_series.update(db=db, db_obj=obj, obj_in=obj_in)


@router_blackout_series.delete("/{id}", response_model=schemas_module.BlackoutSeries)
def delete_blackout_series(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_series.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeries not found")
    return crud_module.crud_blackout_series.remove(db=db, id=id)


@router_blackout_instance.get("/", response_model=List[schemas_module.BlackoutInstance])
def read_blackout_instance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_blackout_instance.get_multi(db, skip=skip, limit=limit)


@router_blackout_instance.get("/{id}", response_model=schemas_module.BlackoutInstance)
def read_blackout_instance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstance not found")
    return obj


@router_blackout_instance.post("/", response_model=schemas_module.BlackoutInstance, status_code=status.HTTP_201_CREATED)
def create_blackout_instance(obj_in: schemas_module.BlackoutInstanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_blackout_instance.create(db=db, obj_in=obj_in)


@router_blackout_instance.put("/{id}", response_model=schemas_module.BlackoutInstance)
def update_blackout_instance(id: int, obj_in: schemas_module.BlackoutInstanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstance not found")
    return crud_module.crud_blackout_instance.update(db=db, db_obj=obj, obj_in=obj_in)


@router_blackout_instance.delete("/{id}", response_model=schemas_module.BlackoutInstance)
def delete_blackout_instance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_blackout_instance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstance not found")
    return crud_module.crud_blackout_instance.remove(db=db, id=id)


@router_custom_attribute.get("/", response_model=List[schemas_module.CustomAttribute])
def read_custom_attribute(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_custom_attribute.get_multi(db, skip=skip, limit=limit)


@router_custom_attribute.get("/{id}", response_model=schemas_module.CustomAttribute)
def read_custom_attribute_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_custom_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttribute not found")
    return obj


@router_custom_attribute.post("/", response_model=schemas_module.CustomAttribute, status_code=status.HTTP_201_CREATED)
def create_custom_attribute(obj_in: schemas_module.CustomAttributeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_custom_attribute.create(db=db, obj_in=obj_in)


@router_custom_attribute.put("/{id}", response_model=schemas_module.CustomAttribute)
def update_custom_attribute(id: int, obj_in: schemas_module.CustomAttributeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_custom_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttribute not found")
    return crud_module.crud_custom_attribute.update(db=db, db_obj=obj, obj_in=obj_in)


@router_custom_attribute.delete("/{id}", response_model=schemas_module.CustomAttribute)
def delete_custom_attribute(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_custom_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttribute not found")
    return crud_module.crud_custom_attribute.remove(db=db, id=id)


@router_user_resource_permission.get("/", response_model=List[schemas_module.UserResourcePermission])
def read_user_resource_permission(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_user_resource_permission.get_multi(db, skip=skip, limit=limit)


@router_user_resource_permission.get("/{id}", response_model=schemas_module.UserResourcePermission)
def read_user_resource_permission_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_resource_permission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermission not found")
    return obj


@router_user_resource_permission.post("/", response_model=schemas_module.UserResourcePermission, status_code=status.HTTP_201_CREATED)
def create_user_resource_permission(obj_in: schemas_module.UserResourcePermissionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_user_resource_permission.create(db=db, obj_in=obj_in)


@router_user_resource_permission.put("/{id}", response_model=schemas_module.UserResourcePermission)
def update_user_resource_permission(id: int, obj_in: schemas_module.UserResourcePermissionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_resource_permission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermission not found")
    return crud_module.crud_user_resource_permission.update(db=db, db_obj=obj, obj_in=obj_in)


@router_user_resource_permission.delete("/{id}", response_model=schemas_module.UserResourcePermission)
def delete_user_resource_permission(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_resource_permission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermission not found")
    return crud_module.crud_user_resource_permission.remove(db=db, id=id)
