from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_instances", tags=["reservation_instances"])

@router.get("/", response_model=List[schemas.ReservationInstances])
def read_reservation_instances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationInstances).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationInstances)
def read_reservation_instances_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationInstances).filter(models.ReservationInstances.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstances not found")
    return obj

@router.post("/", response_model=schemas.ReservationInstances, status_code=status.HTTP_201_CREATED)
def create_reservation_instances(obj_in: schemas.ReservationInstancesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationInstances(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationInstances)
def update_reservation_instances(id: int, obj_in: schemas.ReservationInstancesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationInstances).filter(models.ReservationInstances.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstances not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationInstances)
def delete_reservation_instances(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationInstances).filter(models.ReservationInstances.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationInstances not found")
    db.delete(obj)
    db.commit()
    return obj
