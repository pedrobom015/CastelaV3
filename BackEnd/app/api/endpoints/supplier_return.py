from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/supplier_return", tags=["supplier_return"])

@router.get("/", response_model=List[schemas_module.Supplierreturn])
def read_supplier_return(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_supplier_return.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Supplierreturn)
def read_supplier_return_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierreturn not found")
    return obj

@router.post("/", response_model=schemas_module.Supplierreturn, status_code=status.HTTP_201_CREATED)
def create_supplier_return(obj_in: schemas_module.SupplierreturnCreate, db: Session = Depends(get_db)):
    return crud_module.crud_supplier_return.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Supplierreturn)
def update_supplier_return(id: int, obj_in: schemas_module.SupplierreturnUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierreturn not found")
    return crud_module.crud_supplier_return.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Supplierreturn)
def delete_supplier_return(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier_return.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplierreturn not found")
    return crud_module.crud_supplier_return.remove(db=db, id=id)