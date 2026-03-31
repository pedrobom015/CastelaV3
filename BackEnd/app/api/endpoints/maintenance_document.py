from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/maintenance_document", tags=["maintenance_document"])

@router.get("/", response_model=List[schemas_module.Maintenancedocument])
def read_maintenance_document(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance_document.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Maintenancedocument)
def read_maintenance_document_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancedocument not found")
    return obj

@router.post("/", response_model=schemas_module.Maintenancedocument, status_code=status.HTTP_201_CREATED)
def create_maintenance_document(obj_in: schemas_module.MaintenancedocumentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_maintenance_document.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Maintenancedocument)
def update_maintenance_document(id: int, obj_in: schemas_module.MaintenancedocumentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancedocument not found")
    return crud_module.crud_maintenance_document.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Maintenancedocument)
def delete_maintenance_document(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_maintenance_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenancedocument not found")
    return crud_module.crud_maintenance_document.remove(db=db, id=id)