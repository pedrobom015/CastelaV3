from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sales_order", tags=["sales_order"])

@router.get("/", response_model=List[schemas_module.Salesorder])
def read_sales_order(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sales_order.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Salesorder)
def read_sales_order_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorder not found")
    return obj

@router.post("/", response_model=schemas_module.Salesorder, status_code=status.HTTP_201_CREATED)
def create_sales_order(obj_in: schemas_module.SalesorderCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sales_order.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Salesorder)
def update_sales_order(id: int, obj_in: schemas_module.SalesorderUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorder not found")
    return crud_module.crud_sales_order.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Salesorder)
def delete_sales_order(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorder not found")
    return crud_module.crud_sales_order.remove(db=db, id=id)