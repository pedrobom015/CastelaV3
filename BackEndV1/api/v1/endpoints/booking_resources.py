from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from crud_booking import (
    crud_resource, crud_resource_type, crud_schedule,
    crud_layout, crud_time_block, crud_accessory
)
from schemas_booking import (
    Resource, ResourceCreate, ResourceUpdate,
    ResourceType, ResourceTypeCreate, ResourceTypeUpdate,
    Schedule, ScheduleCreate, ScheduleUpdate,
    Layout, LayoutCreate, LayoutUpdate,
    TimeBlock, TimeBlockCreate, TimeBlockUpdate,
    Accessory, AccessoryCreate, AccessoryUpdate
)

router = APIRouter(prefix="/booking", tags=["Booking - Resources"])


# ==================== RESOURCES ====================

@router.get("/resources/", response_model=List[Resource])
def list_resources(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[int] = None,
    schedule_id: Optional[int] = None,
    resource_type_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lista todos os recursos com filtros opcionais."""
    query = db.query(crud_resource.model)
    if is_active is not None:
        query = query.filter(crud_resource.model.is_active == is_active)
    if schedule_id is not None:
        query = query.filter(crud_resource.model.schedule_id == schedule_id)
    if resource_type_id is not None:
        query = query.filter(crud_resource.model.resource_type_id == resource_type_id)
    return query.offset(skip).limit(limit).all()


@router.get("/resources/all", response_model=List[Resource])
def list_all_resources(db: Session = Depends(get_db)):
    """Lista todos os recursos sem paginação (para dropdowns)."""
    return crud_resource.get_multi(db, skip=0, limit=10000)


@router.get("/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Retorna um recurso específico."""
    resource = crud_resource.get(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail=f"Recurso {resource_id} não encontrado")
    return resource


@router.post("/resources/", response_model=Resource, status_code=201)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    """Cria um novo recurso."""
    return crud_resource.create(db, obj_in=resource)


@router.put("/resources/{resource_id}", response_model=Resource)
def update_resource(resource_id: int, resource: ResourceUpdate, db: Session = Depends(get_db)):
    """Atualiza um recurso."""
    existing = crud_resource.get(db, resource_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Recurso {resource_id} não encontrado")
    return crud_resource.update(db, db_obj=existing, obj_in=resource)


@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    """Remove um recurso (soft delete)."""
    existing = crud_resource.get(db, resource_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Recurso {resource_id} não encontrado")
    crud_resource.remove(db, id=resource_id)
    return {"message": f"Recurso {resource_id} removido", "deleted": True}


# ==================== RESOURCE TYPES ====================

@router.get("/resource-types/", response_model=List[ResourceType])
def list_resource_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista tipos de recurso."""
    return crud_resource_type.get_multi(db, skip=skip, limit=limit)


@router.get("/resource-types/all", response_model=List[ResourceType])
def list_all_resource_types(db: Session = Depends(get_db)):
    """Lista todos os tipos de recurso."""
    return crud_resource_type.get_multi(db, skip=0, limit=10000)


@router.get("/resource-types/{resource_type_id}", response_model=ResourceType)
def get_resource_type(resource_type_id: int, db: Session = Depends(get_db)):
    """Retorna um tipo de recurso."""
    resource_type = crud_resource_type.get(db, resource_type_id)
    if not resource_type:
        raise HTTPException(status_code=404, detail=f"Tipo de recurso {resource_type_id} não encontrado")
    return resource_type


@router.post("/resource-types/", response_model=ResourceType, status_code=201)
def create_resource_type(resource_type: ResourceTypeCreate, db: Session = Depends(get_db)):
    """Cria um novo tipo de recurso."""
    return crud_resource_type.create(db, obj_in=resource_type)


@router.put("/resource-types/{resource_type_id}", response_model=ResourceType)
def update_resource_type(resource_type_id: int, resource_type: ResourceTypeUpdate, db: Session = Depends(get_db)):
    """Atualiza um tipo de recurso."""
    existing = crud_resource_type.get(db, resource_type_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Tipo de recurso {resource_type_id} não encontrado")
    return crud_resource_type.update(db, db_obj=existing, obj_in=resource_type)


@router.delete("/resource-types/{resource_type_id}")
def delete_resource_type(resource_type_id: int, db: Session = Depends(get_db)):
    """Remove um tipo de recurso."""
    existing = crud_resource_type.get(db, resource_type_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Tipo de recurso {resource_type_id} não encontrado")
    crud_resource_type.remove(db, id=resource_type_id)
    return {"message": f"Tipo de recurso {resource_type_id} removido", "deleted": True}


# ==================== SCHEDULES ====================

@router.get("/schedules/", response_model=List[Schedule])
def list_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista grades de horário."""
    return crud_schedule.get_multi(db, skip=skip, limit=limit)


@router.get("/schedules/all", response_model=List[Schedule])
def list_all_schedules(db: Session = Depends(get_db)):
    """Lista todas as grades de horário."""
    return crud_schedule.get_multi(db, skip=0, limit=10000)


@router.get("/schedules/{schedule_id}", response_model=Schedule)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Retorna uma grade de horário."""
    schedule = crud_schedule.get(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail=f"Schedule {schedule_id} não encontrado")
    return schedule


@router.post("/schedules/", response_model=Schedule, status_code=201)
def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    """Cria uma nova grade de horário."""
    return crud_schedule.create(db, obj_in=schedule)


@router.put("/schedules/{schedule_id}", response_model=Schedule)
def update_schedule(schedule_id: int, schedule: ScheduleUpdate, db: Session = Depends(get_db)):
    """Atualiza uma grade de horário."""
    existing = crud_schedule.get(db, schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Schedule {schedule_id} não encontrado")
    return crud_schedule.update(db, db_obj=existing, obj_in=schedule)


@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Remove uma grade de horário."""
    existing = crud_schedule.get(db, schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Schedule {schedule_id} não encontrado")
    crud_schedule.remove(db, id=schedule_id)
    return {"message": f"Schedule {schedule_id} removido", "deleted": True}


# ==================== LAYOUTS ====================

@router.get("/layouts/", response_model=List[Layout])
def list_layouts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista layouts de horário."""
    return crud_layout.get_multi(db, skip=skip, limit=limit)


@router.get("/layouts/all", response_model=List[Layout])
def list_all_layouts(db: Session = Depends(get_db)):
    """Lista todos os layouts."""
    return crud_layout.get_multi(db, skip=0, limit=10000)


@router.post("/layouts/", response_model=Layout, status_code=201)
def create_layout(layout: LayoutCreate, db: Session = Depends(get_db)):
    """Cria um novo layout."""
    return crud_layout.create(db, obj_in=layout)


# ==================== TIME BLOCKS ====================

@router.get("/time-blocks/", response_model=List[TimeBlock])
def list_time_blocks(
    layout_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista blocos de horário."""
    query = db.query(crud_time_block.model)
    if layout_id:
        query = query.filter(crud_time_block.model.layout_id == layout_id)
    return query.offset(skip).limit(limit).all()


@router.post("/time-blocks/", response_model=TimeBlock, status_code=201)
def create_time_block(time_block: TimeBlockCreate, db: Session = Depends(get_db)):
    """Cria um novo bloco de horário."""
    return crud_time_block.create(db, obj_in=time_block)


# ==================== ACCESSORIES ====================

@router.get("/accessories/", response_model=List[Accessory])
def list_accessories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista acessórios."""
    return crud_accessory.get_multi(db, skip=skip, limit=limit)


@router.get("/accessories/all", response_model=List[Accessory])
def list_all_accessories(db: Session = Depends(get_db)):
    """Lista todos os acessórios."""
    return crud_accessory.get_multi(db, skip=0, limit=10000)


@router.post("/accessories/", response_model=Accessory, status_code=201)
def create_accessory(accessory: AccessoryCreate, db: Session = Depends(get_db)):
    """Cria um novo acessório."""
    return crud_accessory.create(db, obj_in=accessory)


@router.put("/accessories/{accessory_id}", response_model=Accessory)
def update_accessory(accessory_id: int, accessory: AccessoryUpdate, db: Session = Depends(get_db)):
    """Atualiza um acessório."""
    existing = crud_accessory.get(db, accessory_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Acessório {accessory_id} não encontrado")
    return crud_accessory.update(db, db_obj=existing, obj_in=accessory)


@router.delete("/accessories/{accessory_id}")
def delete_accessory(accessory_id: int, db: Session = Depends(get_db)):
    """Remove um acessório."""
    existing = crud_accessory.get(db, accessory_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Acessório {accessory_id} não encontrado")
    crud_accessory.remove(db, id=accessory_id)
    return {"message": f"Acessório {accessory_id} removido", "deleted": True}
