from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_accounts_receivable_aging", tags=["view_accounts_receivable_aging"])

@router.get("/", response_model=List[schemas_module.Viewaccountsreceivableaging])
def read_view_accounts_receivable_aging(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_accounts_receivable_aging.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewaccountsreceivableaging)
def read_view_accounts_receivable_aging_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_accounts_receivable_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewaccountsreceivableaging not found")
    return obj

@router.post("/", response_model=schemas_module.Viewaccountsreceivableaging, status_code=status.HTTP_201_CREATED)
def create_view_accounts_receivable_aging(obj_in: schemas_module.ViewaccountsreceivableagingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_accounts_receivable_aging.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewaccountsreceivableaging)
def update_view_accounts_receivable_aging(id: int, obj_in: schemas_module.ViewaccountsreceivableagingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_accounts_receivable_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewaccountsreceivableaging not found")
    return crud_module.crud_view_accounts_receivable_aging.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewaccountsreceivableaging)
def delete_view_accounts_receivable_aging(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_accounts_receivable_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewaccountsreceivableaging not found")
    return crud_module.crud_view_accounts_receivable_aging.remove(db=db, id=id)