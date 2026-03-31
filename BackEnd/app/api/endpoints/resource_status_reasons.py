from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_status_reasons", tags=["resource_status_reasons"])

@router.get("/", response_model=List[schemas.ResourceStatusReasons])
def read_resource_status_reasons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceStatusReasons).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceStatusReasons)
def read_resource_status_reasons_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceStatusReasons).filter(models.ResourceStatusReasons.reason_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceStatusReasons not found")
    return obj

@router.post("/", response_model=schemas.ResourceStatusReasons, status_code=status.HTTP_201_CREATED)
def create_resource_status_reasons(obj_in: schemas.ResourceStatusReasonsCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceStatusReasons(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceStatusReasons)
def update_resource_status_reasons(id: int, obj_in: schemas.ResourceStatusReasonsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceStatusReasons).filter(models.ResourceStatusReasons.reason_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceStatusReasons not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceStatusReasons)
def delete_resource_status_reasons(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceStatusReasons).filter(models.ResourceStatusReasons.reason_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceStatusReasons not found")
    db.delete(obj)
    db.commit()
    return obj
