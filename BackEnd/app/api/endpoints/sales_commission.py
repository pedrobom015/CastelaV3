from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sales_commission", tags=["sales_commission"])

@router.get("/", response_model=List[schemas_module.Salescommission])
def read_sales_commission(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sales_commission.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Salescommission)
def read_sales_commission_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_commission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salescommission not found")
    return obj

@router.post("/", response_model=schemas_module.Salescommission, status_code=status.HTTP_201_CREATED)
def create_sales_commission(obj_in: schemas_module.SalescommissionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sales_commission.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Salescommission)
def update_sales_commission(id: int, obj_in: schemas_module.SalescommissionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_commission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salescommission not found")
    return crud_module.crud_sales_commission.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Salescommission)
def delete_sales_commission(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_commission.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salescommission not found")
    return crud_module.crud_sales_commission.remove(db=db, id=id)