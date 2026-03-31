from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/bank_reconciliation", tags=["bank_reconciliation"])

@router.get("/", response_model=List[schemas_module.Bankreconciliation])
def read_bank_reconciliation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_bank_reconciliation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Bankreconciliation)
def read_bank_reconciliation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_reconciliation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankreconciliation not found")
    return obj

@router.post("/", response_model=schemas_module.Bankreconciliation, status_code=status.HTTP_201_CREATED)
def create_bank_reconciliation(obj_in: schemas_module.BankreconciliationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_bank_reconciliation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Bankreconciliation)
def update_bank_reconciliation(id: int, obj_in: schemas_module.BankreconciliationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_reconciliation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankreconciliation not found")
    return crud_module.crud_bank_reconciliation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Bankreconciliation)
def delete_bank_reconciliation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_reconciliation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankreconciliation not found")
    return crud_module.crud_bank_reconciliation.remove(db=db, id=id)