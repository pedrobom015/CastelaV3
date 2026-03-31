from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("/", response_model=List[schemas_module.Maintenance])
def read_maintenance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Maintenance)
def read_maintenance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return obj

@router.post("/", response_model=schemas_module.Maintenance, status_code=status.HTTP_201_CREATED)
def create_maintenance(obj_in: schemas_module.MaintenanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Maintenance)
def update_maintenance(id: int, obj_in: schemas_module.MaintenanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return crud_module.crud_maintenance.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Maintenance)
def delete_maintenance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return crud_module.crud_maintenance.remove(db=db, id=id)