from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/payment_plan_installment", tags=["payment_plan_installment"])

@router.get("/", response_model=List[schemas_module.Paymentplaninstallment])
def read_payment_plan_installment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_payment_plan_installment.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Paymentplaninstallment)
def read_payment_plan_installment_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan_installment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplaninstallment not found")
    return obj

@router.post("/", response_model=schemas_module.Paymentplaninstallment, status_code=status.HTTP_201_CREATED)
def create_payment_plan_installment(obj_in: schemas_module.PaymentplaninstallmentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_payment_plan_installment.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Paymentplaninstallment)
def update_payment_plan_installment(id: int, obj_in: schemas_module.PaymentplaninstallmentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan_installment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplaninstallment not found")
    return crud_module.crud_payment_plan_installment.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Paymentplaninstallment)
def delete_payment_plan_installment(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan_installment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplaninstallment not found")
    return crud_module.crud_payment_plan_installment.remove(db=db, id=id)