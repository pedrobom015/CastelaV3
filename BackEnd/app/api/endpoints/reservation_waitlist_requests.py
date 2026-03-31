from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_waitlist_requests", tags=["reservation_waitlist_requests"])

@router.get("/", response_model=List[schemas.ReservationWaitlistRequests])
def read_reservation_waitlist_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationWaitlistRequests).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationWaitlistRequests)
def read_reservation_waitlist_requests_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationWaitlistRequests).filter(models.ReservationWaitlistRequests.request_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationWaitlistRequests not found")
    return obj

@router.post("/", response_model=schemas.ReservationWaitlistRequests, status_code=status.HTTP_201_CREATED)
def create_reservation_waitlist_requests(obj_in: schemas.ReservationWaitlistRequestsCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationWaitlistRequests(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationWaitlistRequests)
def update_reservation_waitlist_requests(id: int, obj_in: schemas.ReservationWaitlistRequestsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationWaitlistRequests).filter(models.ReservationWaitlistRequests.request_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationWaitlistRequests not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationWaitlistRequests)
def delete_reservation_waitlist_requests(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationWaitlistRequests).filter(models.ReservationWaitlistRequests.request_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationWaitlistRequests not found")
    db.delete(obj)
    db.commit()
    return obj
