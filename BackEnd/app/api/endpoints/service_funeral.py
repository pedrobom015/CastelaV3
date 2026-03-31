from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/service_funeral", tags=["service_funeral"])

@router.get("/", response_model=List[schemas_module.Servicefuneral])
def read_service_funeral(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_service_funeral.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Servicefuneral)
def read_service_funeral_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_service_funeral.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Servicefuneral not found")
    return obj

@router.post("/", response_model=schemas_module.Servicefuneral, status_code=status.HTTP_201_CREATED)
def create_service_funeral(obj_in: schemas_module.ServicefuneralCreate, db: Session = Depends(get_db)):
    return crud_module.crud_service_funeral.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Servicefuneral)
def update_service_funeral(id: int, obj_in: schemas_module.ServicefuneralUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_service_funeral.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Servicefuneral not found")
    return crud_module.crud_service_funeral.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Servicefuneral)
def delete_service_funeral(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_service_funeral.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Servicefuneral not found")
    return crud_module.crud_service_funeral.remove(db=db, id=id)