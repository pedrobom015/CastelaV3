from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/supplier_quotation", tags=["supplier_quotation"])

@router.get("/", response_model=List[schemas_module.Supplierquotation])
def read_supplier_quotation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_supplier_quotation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Supplierquotation)
def read_supplier_quotation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierquotation not found")
    return obj

@router.post("/", response_model=schemas_module.Supplierquotation, status_code=status.HTTP_201_CREATED)
def create_supplier_quotation(obj_in: schemas_module.SupplierquotationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_supplier_quotation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Supplierquotation)
def update_supplier_quotation(id: int, obj_in: schemas_module.SupplierquotationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierquotation not found")
    return crud_module.crud_supplier_quotation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Supplierquotation)
def delete_supplier_quotation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierquotation not found")
    return crud_module.crud_supplier_quotation.remove(db=db, id=id)