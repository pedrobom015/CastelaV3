from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_billing", tags=["contract_billing"])

@router.get("/", response_model=List[schemas_module.Contractbilling])
def read_contract_billing(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_billing.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractbilling)
def read_contract_billing_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractbilling not found")
    return obj

@router.post("/", response_model=schemas_module.Contractbilling, status_code=status.HTTP_201_CREATED)
def create_contract_billing(obj_in: schemas_module.ContractbillingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_billing.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractbilling)
def update_contract_billing(id: int, obj_in: schemas_module.ContractbillingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractbilling not found")
    return crud_module.crud_contract_billing.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractbilling)
def delete_contract_billing(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractbilling not found")
    return crud_module.crud_contract_billing.remove(db=db, id=id)