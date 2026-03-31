from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/payment_method", tags=["payment_method"])

@router.get("/", response_model=List[schemas_module.Paymentmethod])
def read_payment_method(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_payment_method.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Paymentmethod)
def read_payment_method_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_method.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentmethod not found")
    return obj

@router.post("/", response_model=schemas_module.Paymentmethod, status_code=status.HTTP_201_CREATED)
def create_payment_method(obj_in: schemas_module.PaymentmethodCreate, db: Session = Depends(get_db)):
    return crud_module.crud_payment_method.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Paymentmethod)
def update_payment_method(id: int, obj_in: schemas_module.PaymentmethodUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_method.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentmethod not found")
    return crud_module.crud_payment_method.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Paymentmethod)
def delete_payment_method(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_method.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentmethod not found")
    return crud_module.crud_payment_method.remove(db=db, id=id)