from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/budget_period", tags=["budget_period"])

@router.get("/", response_model=List[schemas_module.Budgetperiod])
def read_budget_period(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_budget_period.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Budgetperiod)
def read_budget_period_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetperiod not found")
    return obj

@router.post("/", response_model=schemas_module.Budgetperiod, status_code=status.HTTP_201_CREATED)
def create_budget_period(obj_in: schemas_module.BudgetperiodCreate, db: Session = Depends(get_db)):
    return crud_module.crud_budget_period.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Budgetperiod)
def update_budget_period(id: int, obj_in: schemas_module.BudgetperiodUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetperiod not found")
    return crud_module.crud_budget_period.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Budgetperiod)
def delete_budget_period(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetperiod not found")
    return crud_module.crud_budget_period.remove(db=db, id=id)