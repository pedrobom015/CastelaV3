from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sales_batches", tags=["sales_batches"])

@router.get("/", response_model=List[schemas_module.Salesbatches])
def read_sales_batches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sales_batches.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Salesbatches)
def read_sales_batches_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_batches.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesbatches not found")
    return obj

@router.post("/", response_model=schemas_module.Salesbatches, status_code=status.HTTP_201_CREATED)
def create_sales_batches(obj_in: schemas_module.SalesbatchesCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sales_batches.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Salesbatches)
def update_sales_batches(id: int, obj_in: schemas_module.SalesbatchesUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_batches.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesbatches not found")
    return crud_module.crud_sales_batches.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Salesbatches)
def delete_sales_batches(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_batches.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesbatches not found")
    return crud_module.crud_sales_batches.remove(db=db, id=id)