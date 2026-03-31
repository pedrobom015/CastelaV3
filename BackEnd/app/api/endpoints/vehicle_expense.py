from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle_expense", tags=["vehicle_expense"])

@router.get("/", response_model=List[schemas_module.Vehicleexpense])
def read_vehicle_expense(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_expense.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehicleexpense)
def read_vehicle_expense_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpense not found")
    return obj

@router.post("/", response_model=schemas_module.Vehicleexpense, status_code=status.HTTP_201_CREATED)
def create_vehicle_expense(obj_in: schemas_module.VehicleexpenseCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_expense.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehicleexpense)
def update_vehicle_expense(id: int, obj_in: schemas_module.VehicleexpenseUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpense not found")
    return crud_module.crud_vehicle_expense.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehicleexpense)
def delete_vehicle_expense(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_expense.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicleexpense not found")
    return crud_module.crud_vehicle_expense.remove(db=db, id=id)