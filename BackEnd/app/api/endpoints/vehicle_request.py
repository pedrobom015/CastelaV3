from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle_request", tags=["vehicle_request"])

@router.get("/", response_model=List[schemas_module.Vehiclerequest])
def read_vehicle_request(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_request.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehiclerequest)
def read_vehicle_request_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_request.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehiclerequest not found")
    return obj

@router.post("/", response_model=schemas_module.Vehiclerequest, status_code=status.HTTP_201_CREATED)
def create_vehicle_request(obj_in: schemas_module.VehiclerequestCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_request.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehiclerequest)
def update_vehicle_request(id: int, obj_in: schemas_module.VehiclerequestUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_request.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehiclerequest not found")
    return crud_module.crud_vehicle_request.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehiclerequest)
def delete_vehicle_request(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_request.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehiclerequest not found")
    return crud_module.crud_vehicle_request.remove(db=db, id=id)