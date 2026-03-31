from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sales_order_item", tags=["sales_order_item"])

@router.get("/", response_model=List[schemas_module.Salesorderitem])
def read_sales_order_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sales_order_item.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Salesorderitem)
def read_sales_order_item_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorderitem not found")
    return obj

@router.post("/", response_model=schemas_module.Salesorderitem, status_code=status.HTTP_201_CREATED)
def create_sales_order_item(obj_in: schemas_module.SalesorderitemCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sales_order_item.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Salesorderitem)
def update_sales_order_item(id: int, obj_in: schemas_module.SalesorderitemUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorderitem not found")
    return crud_module.crud_sales_order_item.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Salesorderitem)
def delete_sales_order_item(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_order_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesorderitem not found")
    return crud_module.crud_sales_order_item.remove(db=db, id=id)