from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/financial_ratio_value", tags=["financial_ratio_value"])

@router.get("/", response_model=List[schemas_module.Financialratiovalue])
def read_financial_ratio_value(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_financial_ratio_value.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Financialratiovalue)
def read_financial_ratio_value_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio_value.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratiovalue not found")
    return obj

@router.post("/", response_model=schemas_module.Financialratiovalue, status_code=status.HTTP_201_CREATED)
def create_financial_ratio_value(obj_in: schemas_module.FinancialratiovalueCreate, db: Session = Depends(get_db)):
    return crud_module.crud_financial_ratio_value.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Financialratiovalue)
def update_financial_ratio_value(id: int, obj_in: schemas_module.FinancialratiovalueUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio_value.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratiovalue not found")
    return crud_module.crud_financial_ratio_value.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Financialratiovalue)
def delete_financial_ratio_value(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio_value.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratiovalue not found")
    return crud_module.crud_financial_ratio_value.remove(db=db, id=id)