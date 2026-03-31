from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/customer", tags=["customer"])

@router.get("/", response_model=List[schemas_module.Customer])
def read_customer(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_customer.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Customer)
def read_customer_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return obj

@router.post("/", response_model=schemas_module.Customer, status_code=status.HTTP_201_CREATED)
def create_customer(obj_in: schemas_module.CustomerCreate, db: Session = Depends(get_db)):
    return crud_module.crud_customer.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Customer)
def update_customer(id: int, obj_in: schemas_module.CustomerUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud_module.crud_customer.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Customer)
def delete_customer(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud_module.crud_customer.remove(db=db, id=id)