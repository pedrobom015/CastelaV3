from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/rfq_supplier", tags=["rfq_supplier"])

@router.get("/", response_model=List[schemas_module.Rfqsupplier])
def read_rfq_supplier(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_rfq_supplier.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Rfqsupplier)
def read_rfq_supplier_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqsupplier not found")
    return obj

@router.post("/", response_model=schemas_module.Rfqsupplier, status_code=status.HTTP_201_CREATED)
def create_rfq_supplier(obj_in: schemas_module.RfqsupplierCreate, db: Session = Depends(get_db)):
    return crud_module.crud_rfq_supplier.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Rfqsupplier)
def update_rfq_supplier(id: int, obj_in: schemas_module.RfqsupplierUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqsupplier not found")
    return crud_module.crud_rfq_supplier.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Rfqsupplier)
def delete_rfq_supplier(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqsupplier not found")
    return crud_module.crud_rfq_supplier.remove(db=db, id=id)