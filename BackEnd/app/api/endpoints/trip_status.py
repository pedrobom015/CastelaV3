from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/trip_status", tags=["trip_status"])

@router.get("/", response_model=List[schemas_module.Tripstatus])
def read_trip_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_trip_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Tripstatus)
def read_trip_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripstatus not found")
    return obj

@router.post("/", response_model=schemas_module.Tripstatus, status_code=status.HTTP_201_CREATED)
def create_trip_status(obj_in: schemas_module.TripstatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_trip_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Tripstatus)
def update_trip_status(id: int, obj_in: schemas_module.TripstatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripstatus not found")
    return crud_module.crud_trip_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Tripstatus)
def delete_trip_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripstatus not found")
    return crud_module.crud_trip_status.remove(db=db, id=id)