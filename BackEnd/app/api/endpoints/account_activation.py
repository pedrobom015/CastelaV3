from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/account_activation", tags=["account_activation"])

@router.get("/", response_model=List[schemas.AccountActivation])
def read_account_activation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AccountActivation).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.AccountActivation)
def read_account_activation_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AccountActivation).filter(models.AccountActivation.account_activation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AccountActivation not found")
    return obj

@router.post("/", response_model=schemas.AccountActivation, status_code=status.HTTP_201_CREATED)
def create_account_activation(obj_in: schemas.AccountActivationCreate, db: Session = Depends(get_db)):
    db_obj = models.AccountActivation(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.AccountActivation)
def update_account_activation(id: int, obj_in: schemas.AccountActivationUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.AccountActivation).filter(models.AccountActivation.account_activation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AccountActivation not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.AccountActivation)
def delete_account_activation(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AccountActivation).filter(models.AccountActivation.account_activation_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AccountActivation not found")
    db.delete(obj)
    db.commit()
    return obj
