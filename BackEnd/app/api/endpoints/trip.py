from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/trip", tags=["trip"])

@router.get("/", response_model=List[schemas_module.Trip])
def read_trip(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_trip.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Trip)
def read_trip_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Trip not found")
    return obj

@router.post("/", response_model=schemas_module.Trip, status_code=status.HTTP_201_CREATED)
def create_trip(obj_in: schemas_module.TripCreate, db: Session = Depends(get_db)):
    return crud_module.crud_trip.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Trip)
def update_trip(id: int, obj_in: schemas_module.TripUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Trip not found")
    return crud_module.crud_trip.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Trip)
def delete_trip(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Trip not found")
    return crud_module.crud_trip.remove(db=db, id=id)