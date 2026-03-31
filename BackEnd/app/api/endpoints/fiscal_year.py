from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/fiscal_year", tags=["fiscal_year"])

@router.get("/", response_model=List[schemas_module.Fiscalyear])
def read_fiscal_year(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_fiscal_year.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Fiscalyear)
def read_fiscal_year_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_year.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalyear not found")
    return obj

@router.post("/", response_model=schemas_module.Fiscalyear, status_code=status.HTTP_201_CREATED)
def create_fiscal_year(obj_in: schemas_module.FiscalyearCreate, db: Session = Depends(get_db)):
    return crud_module.crud_fiscal_year.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Fiscalyear)
def update_fiscal_year(id: int, obj_in: schemas_module.FiscalyearUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_year.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalyear not found")
    return crud_module.crud_fiscal_year.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Fiscalyear)
def delete_fiscal_year(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_fiscal_year.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Fiscalyear not found")
    return crud_module.crud_fiscal_year.remove(db=db, id=id)