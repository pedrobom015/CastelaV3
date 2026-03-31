from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_guests", tags=["reservation_guests"])

@router.get("/", response_model=List[schemas.ReservationGuests])
def read_reservation_guests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationGuests).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationGuests)
def read_reservation_guests_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationGuests).filter(models.ReservationGuests.guest_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationGuests not found")
    return obj

@router.post("/", response_model=schemas.ReservationGuests, status_code=status.HTTP_201_CREATED)
def create_reservation_guests(obj_in: schemas.ReservationGuestsCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationGuests(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationGuests)
def update_reservation_guests(id: int, obj_in: schemas.ReservationGuestsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationGuests).filter(models.ReservationGuests.guest_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationGuests not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationGuests)
def delete_reservation_guests(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationGuests).filter(models.ReservationGuests.guest_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationGuests not found")
    db.delete(obj)
    db.commit()
    return obj
