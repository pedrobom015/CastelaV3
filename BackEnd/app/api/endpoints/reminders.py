from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("/", response_model=List[schemas.Reminders])
def read_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Reminders).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Reminders)
def read_reminders_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Reminders).filter(models.Reminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Reminders not found")
    return obj

@router.post("/", response_model=schemas.Reminders, status_code=status.HTTP_201_CREATED)
def create_reminders(obj_in: schemas.RemindersCreate, db: Session = Depends(get_db)):
    db_obj = models.Reminders(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Reminders)
def update_reminders(id: int, obj_in: schemas.RemindersUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Reminders).filter(models.Reminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Reminders not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Reminders)
def delete_reminders(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Reminders).filter(models.Reminders.reminder_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Reminders not found")
    db.delete(obj)
    db.commit()
    return obj
