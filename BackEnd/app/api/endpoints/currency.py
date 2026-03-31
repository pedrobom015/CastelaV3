from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/currency", tags=["currency"])

@router.get("/", response_model=List[schemas_module.Currency])
def read_currency(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_currency.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Currency)
def read_currency_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_currency.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Currency not found")
    return obj

@router.post("/", response_model=schemas_module.Currency, status_code=status.HTTP_201_CREATED)
def create_currency(obj_in: schemas_module.CurrencyCreate, db: Session = Depends(get_db)):
    return crud_module.crud_currency.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Currency)
def update_currency(id: int, obj_in: schemas_module.CurrencyUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_currency.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Currency not found")
    return crud_module.crud_currency.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Currency)
def delete_currency(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_currency.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Currency not found")
    return crud_module.crud_currency.remove(db=db, id=id)