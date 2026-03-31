from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/transaction", tags=["transaction"])

@router.get("/", response_model=List[schemas_module.Transaction])
def read_transaction(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_transaction.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Transaction)
def read_transaction_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return obj

@router.post("/", response_model=schemas_module.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(obj_in: schemas_module.TransactionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_transaction.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Transaction)
def update_transaction(id: int, obj_in: schemas_module.TransactionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return crud_module.crud_transaction.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Transaction)
def delete_transaction(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return crud_module.crud_transaction.remove(db=db, id=id)