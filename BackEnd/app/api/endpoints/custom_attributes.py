from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/custom_attributes", tags=["custom_attributes"])

@router.get("/", response_model=List[schemas.CustomAttributes])
def read_custom_attributes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.CustomAttributes).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.CustomAttributes)
def read_custom_attributes_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributes).filter(models.CustomAttributes.attribute_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributes not found")
    return obj

@router.post("/", response_model=schemas.CustomAttributes, status_code=status.HTTP_201_CREATED)
def create_custom_attributes(obj_in: schemas.CustomAttributesCreate, db: Session = Depends(get_db)):
    db_obj = models.CustomAttributes(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.CustomAttributes)
def update_custom_attributes(id: int, obj_in: schemas.CustomAttributesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributes).filter(models.CustomAttributes.attribute_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributes not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.CustomAttributes)
def delete_custom_attributes(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributes).filter(models.CustomAttributes.attribute_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributes not found")
    db.delete(obj)
    db.commit()
    return obj
