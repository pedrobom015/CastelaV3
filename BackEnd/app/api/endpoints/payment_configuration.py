from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/payment_configuration", tags=["payment_configuration"])

@router.get("/", response_model=List[schemas.PaymentConfiguration])
def read_payment_configuration(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.PaymentConfiguration).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.PaymentConfiguration)
def read_payment_configuration_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentConfiguration).filter(models.PaymentConfiguration.config_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentConfiguration not found")
    return obj

@router.post("/", response_model=schemas.PaymentConfiguration, status_code=status.HTTP_201_CREATED)
def create_payment_configuration(obj_in: schemas.PaymentConfigurationCreate, db: Session = Depends(get_db)):
    db_obj = models.PaymentConfiguration(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.PaymentConfiguration)
def update_payment_configuration(id: int, obj_in: schemas.PaymentConfigurationUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentConfiguration).filter(models.PaymentConfiguration.config_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentConfiguration not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.PaymentConfiguration)
def delete_payment_configuration(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentConfiguration).filter(models.PaymentConfiguration.config_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentConfiguration not found")
    db.delete(obj)
    db.commit()
    return obj
