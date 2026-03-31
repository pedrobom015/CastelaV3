from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/accounting_code", tags=["accounting_code"])

@router.get("/", response_model=List[schemas_module.Accountingcode])
def read_accounting_code(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_accounting_code.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Accountingcode)
def read_accounting_code_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_accounting_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountingcode not found")
    return obj

@router.post("/", response_model=schemas_module.Accountingcode, status_code=status.HTTP_201_CREATED)
def create_accounting_code(obj_in: schemas_module.AccountingcodeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_accounting_code.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Accountingcode)
def update_accounting_code(id: int, obj_in: schemas_module.AccountingcodeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_accounting_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountingcode not found")
    return crud_module.crud_accounting_code.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Accountingcode)
def delete_accounting_code(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_accounting_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Accountingcode not found")
    return crud_module.crud_accounting_code.remove(db=db, id=id)