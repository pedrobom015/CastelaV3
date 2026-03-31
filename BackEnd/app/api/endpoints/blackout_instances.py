from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/blackout_instances", tags=["blackout_instances"])

@router.get("/", response_model=List[schemas.BlackoutInstances])
def read_blackout_instances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.BlackoutInstances).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.BlackoutInstances)
def read_blackout_instances_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutInstances).filter(models.BlackoutInstances.blackout_instance_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstances not found")
    return obj

@router.post("/", response_model=schemas.BlackoutInstances, status_code=status.HTTP_201_CREATED)
def create_blackout_instances(obj_in: schemas.BlackoutInstancesCreate, db: Session = Depends(get_db)):
    db_obj = models.BlackoutInstances(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.BlackoutInstances)
def update_blackout_instances(id: int, obj_in: schemas.BlackoutInstancesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutInstances).filter(models.BlackoutInstances.blackout_instance_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstances not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.BlackoutInstances)
def delete_blackout_instances(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.BlackoutInstances).filter(models.BlackoutInstances.blackout_instance_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="BlackoutInstances not found")
    db.delete(obj)
    db.commit()
    return obj
