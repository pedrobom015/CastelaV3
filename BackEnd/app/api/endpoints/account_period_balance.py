from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/account_period_balance", tags=["account_period_balance"])

@router.get("/", response_model=List[schemas_module.Accountperiodbalance])
def read_account_period_balance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_account_period_balance.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Accountperiodbalance)
def read_account_period_balance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_period_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountperiodbalance not found")
    return obj

@router.post("/", response_model=schemas_module.Accountperiodbalance, status_code=status.HTTP_201_CREATED)
def create_account_period_balance(obj_in: schemas_module.AccountperiodbalanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_account_period_balance.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Accountperiodbalance)
def update_account_period_balance(id: int, obj_in: schemas_module.AccountperiodbalanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_period_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountperiodbalance not found")
    return crud_module.crud_account_period_balance.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Accountperiodbalance)
def delete_account_period_balance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_period_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountperiodbalance not found")
    return crud_module.crud_account_period_balance.remove(db=db, id=id)