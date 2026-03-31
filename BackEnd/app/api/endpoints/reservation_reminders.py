from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_reminders", tags=["reservation_reminders"])

@router.get("/", response_model=List[schemas.ReservationReminders])
def read_reservation_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationReminders).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationReminders)
def read_reservation_reminders_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationReminders).filter(models.ReservationReminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationReminders not found")
    return obj

@router.post("/", response_model=schemas.ReservationReminders, status_code=status.HTTP_201_CREATED)
def create_reservation_reminders(obj_in: schemas.ReservationRemindersCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationReminders(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationReminders)
def update_reservation_reminders(id: int, obj_in: schemas.ReservationRemindersUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationReminders).filter(models.ReservationReminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationReminders not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationReminders)
def delete_reservation_reminders(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationReminders).filter(models.ReservationReminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationReminders not found")
    db.delete(obj)
    db.commit()
    return obj
