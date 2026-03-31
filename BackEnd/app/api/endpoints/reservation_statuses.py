from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_statuses", tags=["reservation_statuses"])

@router.get("/", response_model=List[schemas.ReservationStatuses])
def read_reservation_statuses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationStatuses).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationStatuses)
def read_reservation_statuses_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationStatuses).filter(models.ReservationStatuses.status_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatuses not found")
    return obj

@router.post("/", response_model=schemas.ReservationStatuses, status_code=status.HTTP_201_CREATED)
def create_reservation_statuses(obj_in: schemas.ReservationStatusesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationStatuses(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationStatuses)
def update_reservation_statuses(id: int, obj_in: schemas.ReservationStatusesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationStatuses).filter(models.ReservationStatuses.status_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatuses not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationStatuses)
def delete_reservation_statuses(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationStatuses).filter(models.ReservationStatuses.status_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationStatuses not found")
    db.delete(obj)
    db.commit()
    return obj
