from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/custom_attribute_entities", tags=["custom_attribute_entities"])

@router.get("/", response_model=List[schemas.CustomAttributeEntities])
def read_custom_attribute_entities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.CustomAttributeEntities).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.CustomAttributeEntities)
def read_custom_attribute_entities_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeEntities).filter(models.CustomAttributeEntities.entity_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeEntities not found")
    return obj

@router.post("/", response_model=schemas.CustomAttributeEntities, status_code=status.HTTP_201_CREATED)
def create_custom_attribute_entities(obj_in: schemas.CustomAttributeEntitiesCreate, db: Session = Depends(get_db)):
    db_obj = models.CustomAttributeEntities(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.CustomAttributeEntities)
def update_custom_attribute_entities(id: int, obj_in: schemas.CustomAttributeEntitiesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeEntities).filter(models.CustomAttributeEntities.entity_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeEntities not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.CustomAttributeEntities)
def delete_custom_attribute_entities(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomAttributeEntities).filter(models.CustomAttributeEntities.entity_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomAttributeEntities not found")
    db.delete(obj)
    db.commit()
    return obj
