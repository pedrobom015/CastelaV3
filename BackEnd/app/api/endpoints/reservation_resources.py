from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_resources", tags=["reservation_resources"])

@router.get("/", response_model=List[schemas.ReservationResources])
def read_reservation_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationResources).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationResources)
def read_reservation_resources_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationResources).filter(models.ReservationResources.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResources not found")
    return obj

@router.post("/", response_model=schemas.ReservationResources, status_code=status.HTTP_201_CREATED)
def create_reservation_resources(obj_in: schemas.ReservationResourcesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationResources(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationResources)
def update_reservation_resources(id: int, obj_in: schemas.ReservationResourcesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationResources).filter(models.ReservationResources.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResources not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationResources)
def delete_reservation_resources(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationResources).filter(models.ReservationResources.reservation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationResources not found")
    db.delete(obj)
    db.commit()
    return obj
