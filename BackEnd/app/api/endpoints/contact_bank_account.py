from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contact_bank_account", tags=["contact_bank_account"])

@router.get("/", response_model=List[schemas_module.Contactbankaccount])
def read_contact_bank_account(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contact_bank_account.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contactbankaccount)
def read_contact_bank_account_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact_bank_account.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contactbankaccount not found")
    return obj

@router.post("/", response_model=schemas_module.Contactbankaccount, status_code=status.HTTP_201_CREATED)
def create_contact_bank_account(obj_in: schemas_module.ContactbankaccountCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contact_bank_account.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contactbankaccount)
def update_contact_bank_account(id: int, obj_in: schemas_module.ContactbankaccountUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact_bank_account.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contactbankaccount not found")
    return crud_module.crud_contact_bank_account.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contactbankaccount)
def delete_contact_bank_account(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact_bank_account.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contactbankaccount not found")
    return crud_module.crud_contact_bank_account.remove(db=db, id=id)