from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_accessories", tags=["reservation_accessories"])

@router.get("/", response_model=List[schemas.ReservationAccessories])
def read_reservation_accessories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationAccessories).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationAccessories)
def read_reservation_accessories_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationAccessories).filter(models.ReservationAccessories.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessories not found")
    return obj

@router.post("/", response_model=schemas.ReservationAccessories, status_code=status.HTTP_201_CREATED)
def create_reservation_accessories(obj_in: schemas.ReservationAccessoriesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationAccessories(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationAccessories)
def update_reservation_accessories(id: int, obj_in: schemas.ReservationAccessoriesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationAccessories).filter(models.ReservationAccessories.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessories not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationAccessories)
def delete_reservation_accessories(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationAccessories).filter(models.ReservationAccessories.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationAccessories not found")
    db.delete(obj)
    db.commit()
    return obj
