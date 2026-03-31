from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/maintenance_status", tags=["maintenance_status"])

@router.get("/", response_model=List[schemas_module.Maintenancestatus])
def read_maintenance_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Maintenancestatus)
def read_maintenance_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancestatus not found")
    return obj

@router.post("/", response_model=schemas_module.Maintenancestatus, status_code=status.HTTP_201_CREATED)
def create_maintenance_status(obj_in: schemas_module.MaintenancestatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Maintenancestatus)
def update_maintenance_status(id: int, obj_in: schemas_module.MaintenancestatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancestatus not found")
    return crud_module.crud_maintenance_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Maintenancestatus)
def delete_maintenance_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancestatus not found")
    return crud_module.crud_maintenance_status.remove(db=db, id=id)