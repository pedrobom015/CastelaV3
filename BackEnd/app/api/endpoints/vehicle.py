from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle", tags=["vehicle"])

@router.get("/", response_model=List[schemas_module.Vehicle])
def read_vehicle(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehicle)
def read_vehicle_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return obj

@router.post("/", response_model=schemas_module.Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(obj_in: schemas_module.VehicleCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehicle)
def update_vehicle(id: int, obj_in: schemas_module.VehicleUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return crud_module.crud_vehicle.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehicle)
def delete_vehicle(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return crud_module.crud_vehicle.remove(db=db, id=id)