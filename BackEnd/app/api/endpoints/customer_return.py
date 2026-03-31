from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/customer_return", tags=["customer_return"])

@router.get("/", response_model=List[schemas_module.Customerreturn])
def read_customer_return(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_customer_return.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Customerreturn)
def read_customer_return_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customerreturn not found")
    return obj

@router.post("/", response_model=schemas_module.Customerreturn, status_code=status.HTTP_201_CREATED)
def create_customer_return(obj_in: schemas_module.CustomerreturnCreate, db: Session = Depends(get_db)):
    return crud_module.crud_customer_return.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Customerreturn)
def update_customer_return(id: int, obj_in: schemas_module.CustomerreturnUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customerreturn not found")
    return crud_module.crud_customer_return.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Customerreturn)
def delete_customer_return(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_customer_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customerreturn not found")
    return crud_module.crud_customer_return.remove(db=db, id=id)