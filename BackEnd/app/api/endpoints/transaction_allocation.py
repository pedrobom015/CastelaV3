from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/transaction_allocation", tags=["transaction_allocation"])

@router.get("/", response_model=List[schemas_module.Transactionallocation])
def read_transaction_allocation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_transaction_allocation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Transactionallocation)
def read_transaction_allocation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction_allocation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transactionallocation not found")
    return obj

@router.post("/", response_model=schemas_module.Transactionallocation, status_code=status.HTTP_201_CREATED)
def create_transaction_allocation(obj_in: schemas_module.TransactionallocationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_transaction_allocation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Transactionallocation)
def update_transaction_allocation(id: int, obj_in: schemas_module.TransactionallocationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction_allocation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transactionallocation not found")
    return crud_module.crud_transaction_allocation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Transactionallocation)
def delete_transaction_allocation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_transaction_allocation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Transactionallocation not found")
    return crud_module.crud_transaction_allocation.remove(db=db, id=id)