from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/payment_transaction_log", tags=["payment_transaction_log"])

@router.get("/", response_model=List[schemas.PaymentTransactionLog])
def read_payment_transaction_log(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.PaymentTransactionLog).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.PaymentTransactionLog)
def read_payment_transaction_log_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentTransactionLog).filter(models.PaymentTransactionLog.transaction_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentTransactionLog not found")
    return obj

@router.post("/", response_model=schemas.PaymentTransactionLog, status_code=status.HTTP_201_CREATED)
def create_payment_transaction_log(obj_in: schemas.PaymentTransactionLogCreate, db: Session = Depends(get_db)):
    db_obj = models.PaymentTransactionLog(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.PaymentTransactionLog)
def update_payment_transaction_log(id: int, obj_in: schemas.PaymentTransactionLogUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentTransactionLog).filter(models.PaymentTransactionLog.transaction_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentTransactionLog not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.PaymentTransactionLog)
def delete_payment_transaction_log(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.PaymentTransactionLog).filter(models.PaymentTransactionLog.transaction_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="PaymentTransactionLog not found")
    db.delete(obj)
    db.commit()
    return obj
