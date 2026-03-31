from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/payment_status", tags=["payment_status"])

@router.get("/", response_model=List[schemas_module.Paymentstatus])
def read_payment_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_payment_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Paymentstatus)
def read_payment_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentstatus not found")
    return obj

@router.post("/", response_model=schemas_module.Paymentstatus, status_code=status.HTTP_201_CREATED)
def create_payment_status(obj_in: schemas_module.PaymentstatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_payment_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Paymentstatus)
def update_payment_status(id: int, obj_in: schemas_module.PaymentstatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentstatus not found")
    return crud_module.crud_payment_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Paymentstatus)
def delete_payment_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_payment_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Paymentstatus not found")
    return crud_module.crud_payment_status.remove(db=db, id=id)