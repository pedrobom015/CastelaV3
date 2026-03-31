from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_accessories", tags=["resource_accessories"])

@router.get("/", response_model=List[schemas.ResourceAccessories])
def read_resource_accessories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceAccessories).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceAccessories)
def read_resource_accessories_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceAccessories).filter(models.ResourceAccessories.accessory_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceAccessories not found")
    return obj

@router.post("/", response_model=schemas.ResourceAccessories, status_code=status.HTTP_201_CREATED)
def create_resource_accessories(obj_in: schemas.ResourceAccessoriesCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceAccessories(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceAccessories)
def update_resource_accessories(id: int, obj_in: schemas.ResourceAccessoriesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceAccessories).filter(models.ResourceAccessories.accessory_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceAccessories not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceAccessories)
def delete_resource_accessories(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceAccessories).filter(models.ResourceAccessories.accessory_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceAccessories not found")
    db.delete(obj)
    db.commit()
    return obj
