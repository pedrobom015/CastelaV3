from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_budget_vs_actual", tags=["view_budget_vs_actual"])

@router.get("/", response_model=List[schemas_module.Viewbudgetvsactual])
def read_view_budget_vs_actual(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_budget_vs_actual.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewbudgetvsactual)
def read_view_budget_vs_actual_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_budget_vs_actual.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbudgetvsactual not found")
    return obj

@router.post("/", response_model=schemas_module.Viewbudgetvsactual, status_code=status.HTTP_201_CREATED)
def create_view_budget_vs_actual(obj_in: schemas_module.ViewbudgetvsactualCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_budget_vs_actual.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewbudgetvsactual)
def update_view_budget_vs_actual(id: int, obj_in: schemas_module.ViewbudgetvsactualUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_budget_vs_actual.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbudgetvsactual not found")
    return crud_module.crud_view_budget_vs_actual.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewbudgetvsactual)
def delete_view_budget_vs_actual(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_budget_vs_actual.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbudgetvsactual not found")
    return crud_module.crud_view_budget_vs_actual.remove(db=db, id=id)