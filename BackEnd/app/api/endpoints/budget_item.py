from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/budget_item", tags=["budget_item"])

@router.get("/", response_model=List[schemas_module.Budgetitem])
def read_budget_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_budget_item.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Budgetitem)
def read_budget_item_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetitem not found")
    return obj

@router.post("/", response_model=schemas_module.Budgetitem, status_code=status.HTTP_201_CREATED)
def create_budget_item(obj_in: schemas_module.BudgetitemCreate, db: Session = Depends(get_db)):
    return crud_module.crud_budget_item.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Budgetitem)
def update_budget_item(id: int, obj_in: schemas_module.BudgetitemUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetitem not found")
    return crud_module.crud_budget_item.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Budgetitem)
def delete_budget_item(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_budget_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Budgetitem not found")
    return crud_module.crud_budget_item.remove(db=db, id=id)