from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/layouts", tags=["layouts"])

@router.get("/", response_model=List[schemas.Layouts])
def read_layouts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Layouts).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Layouts)
def read_layouts_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Layouts).filter(models.Layouts.layout_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Layouts not found")
    return obj

@router.post("/", response_model=schemas.Layouts, status_code=status.HTTP_201_CREATED)
def create_layouts(obj_in: schemas.LayoutsCreate, db: Session = Depends(get_db)):
    db_obj = models.Layouts(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Layouts)
def update_layouts(id: int, obj_in: schemas.LayoutsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Layouts).filter(models.Layouts.layout_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Layouts not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Layouts)
def delete_layouts(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Layouts).filter(models.Layouts.layout_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Layouts not found")
    db.delete(obj)
    db.commit()
    return obj
