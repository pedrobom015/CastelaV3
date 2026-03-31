from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_series", tags=["reservation_series"])

@router.get("/", response_model=List[schemas.ReservationSeries])
def read_reservation_series(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationSeries).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationSeries)
def read_reservation_series_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationSeries).filter(models.ReservationSeries.series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    return obj

@router.post("/", response_model=schemas.ReservationSeries, status_code=status.HTTP_201_CREATED)
def create_reservation_series(obj_in: schemas.ReservationSeriesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationSeries(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationSeries)
def update_reservation_series(id: int, obj_in: schemas.ReservationSeriesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationSeries).filter(models.ReservationSeries.series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationSeries)
def delete_reservation_series(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationSeries).filter(models.ReservationSeries.series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationSeries not found")
    db.delete(obj)
    db.commit()
    return obj
