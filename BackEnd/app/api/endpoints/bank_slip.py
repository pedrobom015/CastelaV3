from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/bank_slip", tags=["bank_slip"])

@router.get("/", response_model=List[schemas_module.Bankslip])
def read_bank_slip(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_bank_slip.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Bankslip)
def read_bank_slip_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_slip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankslip not found")
    return obj

@router.post("/", response_model=schemas_module.Bankslip, status_code=status.HTTP_201_CREATED)
def create_bank_slip(obj_in: schemas_module.BankslipCreate, db: Session = Depends(get_db)):
    return crud_module.crud_bank_slip.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Bankslip)
def update_bank_slip(id: int, obj_in: schemas_module.BankslipUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_slip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankslip not found")
    return crud_module.crud_bank_slip.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Bankslip)
def delete_bank_slip(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_bank_slip.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bankslip not found")
    return crud_module.crud_bank_slip.remove(db=db, id=id)