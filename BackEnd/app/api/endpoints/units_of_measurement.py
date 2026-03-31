from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/units_of_measurement", tags=["units_of_measurement"])

@router.get("/", response_model=List[schemas_module.Unitsofmeasurement])
def read_units_of_measurement(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_units_of_measurement.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Unitsofmeasurement)
def read_units_of_measurement_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_units_of_measurement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Unitsofmeasurement not found")
    return obj

@router.post("/", response_model=schemas_module.Unitsofmeasurement, status_code=status.HTTP_201_CREATED)
def create_units_of_measurement(obj_in: schemas_module.UnitsofmeasurementCreate, db: Session = Depends(get_db)):
    return crud_module.crud_units_of_measurement.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Unitsofmeasurement)
def update_units_of_measurement(id: int, obj_in: schemas_module.UnitsofmeasurementUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_units_of_measurement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Unitsofmeasurement not found")
    return crud_module.crud_units_of_measurement.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Unitsofmeasurement)
def delete_units_of_measurement(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_units_of_measurement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Unitsofmeasurement not found")
    return crud_module.crud_units_of_measurement.remove(db=db, id=id)