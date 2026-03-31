from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_types", tags=["resource_types"])

@router.get("/", response_model=List[schemas.ResourceTypes])
def read_resource_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceTypes).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceTypes)
def read_resource_types_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypes).filter(models.ResourceTypes.type_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypes not found")
    return obj

@router.post("/", response_model=schemas.ResourceTypes, status_code=status.HTTP_201_CREATED)
def create_resource_types(obj_in: schemas.ResourceTypesCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceTypes(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceTypes)
def update_resource_types(id: int, obj_in: schemas.ResourceTypesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypes).filter(models.ResourceTypes.type_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypes not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceTypes)
def delete_resource_types(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypes).filter(models.ResourceTypes.type_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypes not found")
    db.delete(obj)
    db.commit()
    return obj
