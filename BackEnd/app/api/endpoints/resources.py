from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/", response_model=List[schemas.Resources])
def read_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Resources).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Resources)
def read_resources_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Resources).filter(models.Resources.resource_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Resources not found")
    return obj

@router.post("/", response_model=schemas.Resources, status_code=status.HTTP_201_CREATED)
def create_resources(obj_in: schemas.ResourcesCreate, db: Session = Depends(get_db)):
    db_obj = models.Resources(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Resources)
def update_resources(id: int, obj_in: schemas.ResourcesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Resources).filter(models.Resources.resource_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Resources not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Resources)
def delete_resources(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Resources).filter(models.Resources.resource_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Resources not found")
    db.delete(obj)
    db.commit()
    return obj
