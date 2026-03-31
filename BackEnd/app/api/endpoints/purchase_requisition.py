from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/purchase_requisition", tags=["purchase_requisition"])

@router.get("/", response_model=List[schemas_module.Purchaserequisition])
def read_purchase_requisition(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_purchase_requisition.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Purchaserequisition)
def read_purchase_requisition_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_purchase_requisition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Purchaserequisition not found")
    return obj

@router.post("/", response_model=schemas_module.Purchaserequisition, status_code=status.HTTP_201_CREATED)
def create_purchase_requisition(obj_in: schemas_module.PurchaserequisitionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_purchase_requisition.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Purchaserequisition)
def update_purchase_requisition(id: int, obj_in: schemas_module.PurchaserequisitionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_purchase_requisition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Purchaserequisition not found")
    return crud_module.crud_purchase_requisition.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Purchaserequisition)
def delete_purchase_requisition(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_purchase_requisition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Purchaserequisition not found")
    return crud_module.crud_purchase_requisition.remove(db=db, id=id)