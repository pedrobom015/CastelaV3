from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle_type", tags=["vehicle_type"])

@router.get("/", response_model=List[schemas_module.Vehicletype])
def read_vehicle_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehicletype)
def read_vehicle_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicletype not found")
    return obj

@router.post("/", response_model=schemas_module.Vehicletype, status_code=status.HTTP_201_CREATED)
def create_vehicle_type(obj_in: schemas_module.VehicletypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehicletype)
def update_vehicle_type(id: int, obj_in: schemas_module.VehicletypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicletype not found")
    return crud_module.crud_vehicle_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehicletype)
def delete_vehicle_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicletype not found")
    return crud_module.crud_vehicle_type.remove(db=db, id=id)