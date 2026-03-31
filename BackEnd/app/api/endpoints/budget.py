from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/budget", tags=["budget"])

@router.get("/", response_model=List[schemas_module.Budget])
def read_budget(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_budget.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Budget)
def read_budget_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budget not found")
    return obj

@router.post("/", response_model=schemas_module.Budget, status_code=status.HTTP_201_CREATED)
def create_budget(obj_in: schemas_module.BudgetCreate, db: Session = Depends(get_db)):
    return crud_module.crud_budget.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Budget)
def update_budget(id: int, obj_in: schemas_module.BudgetUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budget not found")
    return crud_module.crud_budget.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Budget)
def delete_budget(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budget not found")
    return crud_module.crud_budget.remove(db=db, id=id)