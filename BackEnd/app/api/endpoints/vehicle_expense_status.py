from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle_expense_status", tags=["vehicle_expense_status"])

@router.get("/", response_model=List[schemas_module.Vehicleexpensestatus])
def read_vehicle_expense_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_expense_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehicleexpensestatus)
def read_vehicle_expense_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpensestatus not found")
    return obj

@router.post("/", response_model=schemas_module.Vehicleexpensestatus, status_code=status.HTTP_201_CREATED)
def create_vehicle_expense_status(obj_in: schemas_module.VehicleexpensestatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_expense_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehicleexpensestatus)
def update_vehicle_expense_status(id: int, obj_in: schemas_module.VehicleexpensestatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpensestatus not found")
    return crud_module.crud_vehicle_expense_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehicleexpensestatus)
def delete_vehicle_expense_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpensestatus not found")
    return crud_module.crud_vehicle_expense_status.remove(db=db, id=id)