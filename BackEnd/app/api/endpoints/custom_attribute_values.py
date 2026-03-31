from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/custom_attribute_values", tags=["custom_attribute_values"])

@router.get("/", response_model=List[schemas.CustomAttributeValues])
def read_custom_attribute_values(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.CustomAttributeValues).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.CustomAttributeValues)
def read_custom_attribute_values_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeValues).filter(models.CustomAttributeValues.attribute_value_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeValues not found")
    return obj

@router.post("/", response_model=schemas.CustomAttributeValues, status_code=status.HTTP_201_CREATED)
def create_custom_attribute_values(obj_in: schemas.CustomAttributeValuesCreate, db: Session = Depends(get_db)):
    db_obj = models.CustomAttributeValues(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.CustomAttributeValues)
def update_custom_attribute_values(id: int, obj_in: schemas.CustomAttributeValuesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeValues).filter(models.CustomAttributeValues.attribute_value_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeValues not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.CustomAttributeValues)
def delete_custom_attribute_values(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeValues).filter(models.CustomAttributeValues.attribute_value_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeValues not found")
    db.delete(obj)
    db.commit()
    return obj
