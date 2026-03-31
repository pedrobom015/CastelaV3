from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/financial_ratio", tags=["financial_ratio"])

@router.get("/", response_model=List[schemas_module.Financialratio])
def read_financial_ratio(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_financial_ratio.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Financialratio)
def read_financial_ratio_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratio not found")
    return obj

@router.post("/", response_model=schemas_module.Financialratio, status_code=status.HTTP_201_CREATED)
def create_financial_ratio(obj_in: schemas_module.FinancialratioCreate, db: Session = Depends(get_db)):
    return crud_module.crud_financial_ratio.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Financialratio)
def update_financial_ratio(id: int, obj_in: schemas_module.FinancialratioUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratio not found")
    return crud_module.crud_financial_ratio.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Financialratio)
def delete_financial_ratio(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_financial_ratio.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Financialratio not found")
    return crud_module.crud_financial_ratio.remove(db=db, id=id)