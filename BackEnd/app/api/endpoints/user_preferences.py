from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/user_preferences", tags=["user_preferences"])

@router.get("/", response_model=List[schemas.UserPreferences])
def read_user_preferences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.UserPreferences).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.UserPreferences)
def read_user_preferences_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserPreferences).filter(models.UserPreferences.preference_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserPreferences not found")
    return obj

@router.post("/", response_model=schemas.UserPreferences, status_code=status.HTTP_201_CREATED)
def create_user_preferences(obj_in: schemas.UserPreferencesCreate, db: Session = Depends(get_db)):
    db_obj = models.UserPreferences(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.UserPreferences)
def update_user_preferences(id: int, obj_in: schemas.UserPreferencesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.UserPreferences).filter(models.UserPreferences.preference_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserPreferences not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.UserPreferences)
def delete_user_preferences(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserPreferences).filter(models.UserPreferences.preference_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserPreferences not found")
    db.delete(obj)
    db.commit()
    return obj
