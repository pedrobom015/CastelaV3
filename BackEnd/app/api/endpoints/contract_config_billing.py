from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_config_billing", tags=["contract_config_billing"])

@router.get("/", response_model=List[schemas_module.Contractconfigbilling])
def read_contract_config_billing(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_config_billing.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractconfigbilling)
def read_contract_config_billing_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_config_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractconfigbilling not found")
    return obj

@router.post("/", response_model=schemas_module.Contractconfigbilling, status_code=status.HTTP_201_CREATED)
def create_contract_config_billing(obj_in: schemas_module.ContractconfigbillingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_config_billing.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractconfigbilling)
def update_contract_config_billing(id: int, obj_in: schemas_module.ContractconfigbillingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_config_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractconfigbilling not found")
    return crud_module.crud_contract_config_billing.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractconfigbilling)
def delete_contract_config_billing(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_config_billing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractconfigbilling not found")
    return crud_module.crud_contract_config_billing.remove(db=db, id=id)