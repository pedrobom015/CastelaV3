from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.get("/", response_model=List[schemas.Schedules])
def read_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Schedules).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Schedules)
def read_schedules_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Schedules).filter(models.Schedules.schedule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Schedules not found")
    return obj

@router.post("/", response_model=schemas.Schedules, status_code=status.HTTP_201_CREATED)
def create_schedules(obj_in: schemas.SchedulesCreate, db: Session = Depends(get_db)):
    db_obj = models.Schedules(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Schedules)
def update_schedules(id: int, obj_in: schemas.SchedulesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Schedules).filter(models.Schedules.schedule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Schedules not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Schedules)
def delete_schedules(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Schedules).filter(models.Schedules.schedule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Schedules not found")
    db.delete(obj)
    db.commit()
    return obj
