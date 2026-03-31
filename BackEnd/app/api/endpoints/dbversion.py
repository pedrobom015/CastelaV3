from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/dbversion", tags=["dbversion"])

@router.get("/", response_model=List[schemas.Dbversion])
def read_dbversion(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Dbversion).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Dbversion)
def read_dbversion_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Dbversion).filter(models.Dbversion.version_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dbversion not found")
    return obj

@router.post("/", response_model=schemas.Dbversion, status_code=status.HTTP_201_CREATED)
def create_dbversion(obj_in: schemas.DbversionCreate, db: Session = Depends(get_db)):
    db_obj = models.Dbversion(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Dbversion)
def update_dbversion(id: int, obj_in: schemas.DbversionUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Dbversion).filter(models.Dbversion.version_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dbversion not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Dbversion)
def delete_dbversion(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Dbversion).filter(models.Dbversion.version_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dbversion not found")
    db.delete(obj)
    db.commit()
    return obj
