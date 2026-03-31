from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/fiscal_period", tags=["fiscal_period"])

@router.get("/", response_model=List[schemas_module.Fiscalperiod])
def read_fiscal_period(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_fiscal_period.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Fiscalperiod)
def read_fiscal_period_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalperiod not found")
    return obj

@router.post("/", response_model=schemas_module.Fiscalperiod, status_code=status.HTTP_201_CREATED)
def create_fiscal_period(obj_in: schemas_module.FiscalperiodCreate, db: Session = Depends(get_db)):
    return crud_module.crud_fiscal_period.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Fiscalperiod)
def update_fiscal_period(id: int, obj_in: schemas_module.FiscalperiodUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalperiod not found")
    return crud_module.crud_fiscal_period.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Fiscalperiod)
def delete_fiscal_period(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_period.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalperiod not found")
    return crud_module.crud_fiscal_period.remove(db=db, id=id)