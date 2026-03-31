from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_reservation", tags=["stock_reservation"])

@router.get("/", response_model=List[schemas_module.Stockreservation])
def read_stock_reservation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_reservation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stockreservation)
def read_stock_reservation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_reservation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockreservation not found")
    return obj

@router.post("/", response_model=schemas_module.Stockreservation, status_code=status.HTTP_201_CREATED)
def create_stock_reservation(obj_in: schemas_module.StockreservationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_reservation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stockreservation)
def update_stock_reservation(id: int, obj_in: schemas_module.StockreservationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_reservation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockreservation not found")
    return crud_module.crud_stock_reservation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stockreservation)
def delete_stock_reservation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_reservation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockreservation not found")
    return crud_module.crud_stock_reservation.remove(db=db, id=id)