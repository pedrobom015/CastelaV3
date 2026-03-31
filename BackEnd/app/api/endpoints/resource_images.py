from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_images", tags=["resource_images"])

@router.get("/", response_model=List[schemas.ResourceImages])
def read_resource_images(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceImages).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceImages)
def read_resource_images_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceImages).filter(models.ResourceImages.image_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceImages not found")
    return obj

@router.post("/", response_model=schemas.ResourceImages, status_code=status.HTTP_201_CREATED)
def create_resource_images(obj_in: schemas.ResourceImagesCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceImages(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceImages)
def update_resource_images(id: int, obj_in: schemas.ResourceImagesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceImages).filter(models.ResourceImages.image_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceImages not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceImages)
def delete_resource_images(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceImages).filter(models.ResourceImages.image_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceImages not found")
    db.delete(obj)
    db.commit()
    return obj
