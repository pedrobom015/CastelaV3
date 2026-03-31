from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/billing_cycle", tags=["billing_cycle"])

@router.get("/", response_model=List[schemas_module.Billingcycle])
def read_billing_cycle(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_billing_cycle.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Billingcycle)
def read_billing_cycle_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_cycle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingcycle not found")
    return obj

@router.post("/", response_model=schemas_module.Billingcycle, status_code=status.HTTP_201_CREATED)
def create_billing_cycle(obj_in: schemas_module.BillingcycleCreate, db: Session = Depends(get_db)):
    return crud_module.crud_billing_cycle.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Billingcycle)
def update_billing_cycle(id: int, obj_in: schemas_module.BillingcycleUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_cycle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingcycle not found")
    return crud_module.crud_billing_cycle.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Billingcycle)
def delete_billing_cycle(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_cycle.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingcycle not found")
    return crud_module.crud_billing_cycle.remove(db=db, id=id)