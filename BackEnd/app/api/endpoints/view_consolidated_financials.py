from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_consolidated_financials", tags=["view_consolidated_financials"])

@router.get("/", response_model=List[schemas_module.Viewconsolidatedfinancials])
def read_view_consolidated_financials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_consolidated_financials.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewconsolidatedfinancials)
def read_view_consolidated_financials_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_consolidated_financials.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewconsolidatedfinancials not found")
    return obj

@router.post("/", response_model=schemas_module.Viewconsolidatedfinancials, status_code=status.HTTP_201_CREATED)
def create_view_consolidated_financials(obj_in: schemas_module.ViewconsolidatedfinancialsCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_consolidated_financials.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewconsolidatedfinancials)
def update_view_consolidated_financials(id: int, obj_in: schemas_module.ViewconsolidatedfinancialsUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_consolidated_financials.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewconsolidatedfinancials not found")
    return crud_module.crud_view_consolidated_financials.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewconsolidatedfinancials)
def delete_view_consolidated_financials(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_consolidated_financials.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewconsolidatedfinancials not found")
    return crud_module.crud_view_consolidated_financials.remove(db=db, id=id)