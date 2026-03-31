from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_cash_flow", tags=["view_cash_flow"])

@router.get("/", response_model=List[schemas_module.Viewcashflow])
def read_view_cash_flow(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_cash_flow.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewcashflow)
def read_view_cash_flow_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_cash_flow.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewcashflow not found")
    return obj

@router.post("/", response_model=schemas_module.Viewcashflow, status_code=status.HTTP_201_CREATED)
def create_view_cash_flow(obj_in: schemas_module.ViewcashflowCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_cash_flow.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewcashflow)
def update_view_cash_flow(id: int, obj_in: schemas_module.ViewcashflowUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_cash_flow.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewcashflow not found")
    return crud_module.crud_view_cash_flow.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewcashflow)
def delete_view_cash_flow(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_cash_flow.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewcashflow not found")
    return crud_module.crud_view_cash_flow.remove(db=db, id=id)