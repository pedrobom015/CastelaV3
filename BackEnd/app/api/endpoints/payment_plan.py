from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/payment_plan", tags=["payment_plan"])

@router.get("/", response_model=List[schemas_module.Paymentplan])
def read_payment_plan(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_payment_plan.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Paymentplan)
def read_payment_plan_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplan not found")
    return obj

@router.post("/", response_model=schemas_module.Paymentplan, status_code=status.HTTP_201_CREATED)
def create_payment_plan(obj_in: schemas_module.PaymentplanCreate, db: Session = Depends(get_db)):
    return crud_module.crud_payment_plan.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Paymentplan)
def update_payment_plan(id: int, obj_in: schemas_module.PaymentplanUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplan not found")
    return crud_module.crud_payment_plan.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Paymentplan)
def delete_payment_plan(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_plan.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentplan not found")
    return crud_module.crud_payment_plan.remove(db=db, id=id)