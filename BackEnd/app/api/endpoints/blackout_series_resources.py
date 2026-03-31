from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/blackout_series_resources", tags=["blackout_series_resources"])

@router.get("/", response_model=List[schemas.BlackoutSeriesResources])
def read_blackout_series_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.BlackoutSeriesResources).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.BlackoutSeriesResources)
def read_blackout_series_resources_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutSeriesResources).filter(models.BlackoutSeriesResources.blackout_series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeriesResources not found")
    return obj

@router.post("/", response_model=schemas.BlackoutSeriesResources, status_code=status.HTTP_201_CREATED)
def create_blackout_series_resources(obj_in: schemas.BlackoutSeriesResourcesCreate, db: Session = Depends(get_db)):
    db_obj = models.BlackoutSeriesResources(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.BlackoutSeriesResources)
def update_blackout_series_resources(id: int, obj_in: schemas.BlackoutSeriesResourcesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutSeriesResources).filter(models.BlackoutSeriesResources.blackout_series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeriesResources not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.BlackoutSeriesResources)
def delete_blackout_series_resources(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutSeriesResources).filter(models.BlackoutSeriesResources.blackout_series_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutSeriesResources not found")
    db.delete(obj)
    db.commit()
    return obj
