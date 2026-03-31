from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/payment_transaction", tags=["payment_transaction"])

@router.get("/", response_model=List[schemas_module.Paymenttransaction])
def read_payment_transaction(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_payment_transaction.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Paymenttransaction)
def read_payment_transaction_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymenttransaction not found")
    return obj

@router.post("/", response_model=schemas_module.Paymenttransaction, status_code=status.HTTP_201_CREATED)
def create_payment_transaction(obj_in: schemas_module.PaymenttransactionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_payment_transaction.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Paymenttransaction)
def update_payment_transaction(id: int, obj_in: schemas_module.PaymenttransactionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymenttransaction not found")
    return crud_module.crud_payment_transaction.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Paymenttransaction)
def delete_payment_transaction(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymenttransaction not found")
    return crud_module.crud_payment_transaction.remove(db=db, id=id)