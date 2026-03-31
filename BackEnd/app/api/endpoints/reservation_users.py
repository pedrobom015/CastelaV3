from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_users", tags=["reservation_users"])

@router.get("/", response_model=List[schemas.ReservationUsers])
def read_reservation_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationUsers).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationUsers)
def read_reservation_users_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationUsers).filter(models.ReservationUsers.user_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUsers not found")
    return obj

@router.post("/", response_model=schemas.ReservationUsers, status_code=status.HTTP_201_CREATED)
def create_reservation_users(obj_in: schemas.ReservationUsersCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationUsers(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationUsers)
def update_reservation_users(id: int, obj_in: schemas.ReservationUsersUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationUsers).filter(models.ReservationUsers.user_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUsers not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationUsers)
def delete_reservation_users(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationUsers).filter(models.ReservationUsers.user_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationUsers not found")
    db.delete(obj)
    db.commit()
    return obj
