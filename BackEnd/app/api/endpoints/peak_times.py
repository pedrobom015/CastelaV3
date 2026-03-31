from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/peak_times", tags=["peak_times"])

@router.get("/", response_model=List[schemas.PeakTimes])
def read_peak_times(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.PeakTimes).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.PeakTimes)
def read_peak_times_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PeakTimes).filter(models.PeakTimes.peak_time_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PeakTimes not found")
    return obj

@router.post("/", response_model=schemas.PeakTimes, status_code=status.HTTP_201_CREATED)
def create_peak_times(obj_in: schemas.PeakTimesCreate, db: Session = Depends(get_db)):
    db_obj = models.PeakTimes(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.PeakTimes)
def update_peak_times(id: int, obj_in: schemas.PeakTimesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.PeakTimes).filter(models.PeakTimes.peak_time_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PeakTimes not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.PeakTimes)
def delete_peak_times(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PeakTimes).filter(models.PeakTimes.peak_time_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PeakTimes not found")
    db.delete(obj)
    db.commit()
    return obj
