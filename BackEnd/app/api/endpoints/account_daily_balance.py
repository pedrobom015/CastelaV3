from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/account_daily_balance", tags=["account_daily_balance"])

@router.get("/", response_model=List[schemas_module.Accountdailybalance])
def read_account_daily_balance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_account_daily_balance.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Accountdailybalance)
def read_account_daily_balance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_daily_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountdailybalance not found")
    return obj

@router.post("/", response_model=schemas_module.Accountdailybalance, status_code=status.HTTP_201_CREATED)
def create_account_daily_balance(obj_in: schemas_module.AccountdailybalanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_account_daily_balance.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Accountdailybalance)
def update_account_daily_balance(id: int, obj_in: schemas_module.AccountdailybalanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_daily_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountdailybalance not found")
    return crud_module.crud_account_daily_balance.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Accountdailybalance)
def delete_account_daily_balance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_account_daily_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountdailybalance not found")
    return crud_module.crud_account_daily_balance.remove(db=db, id=id)