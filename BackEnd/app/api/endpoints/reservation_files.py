from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_files", tags=["reservation_files"])

@router.get("/", response_model=List[schemas.ReservationFiles])
def read_reservation_files(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationFiles).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationFiles)
def read_reservation_files_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationFiles).filter(models.ReservationFiles.file_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationFiles not found")
    return obj

@router.post("/", response_model=schemas.ReservationFiles, status_code=status.HTTP_201_CREATED)
def create_reservation_files(obj_in: schemas.ReservationFilesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationFiles(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationFiles)
def update_reservation_files(id: int, obj_in: schemas.ReservationFilesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationFiles).filter(models.ReservationFiles.file_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationFiles not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationFiles)
def delete_reservation_files(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationFiles).filter(models.ReservationFiles.file_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationFiles not found")
    db.delete(obj)
    db.commit()
    return obj
