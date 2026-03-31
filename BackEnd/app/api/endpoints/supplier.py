from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/supplier", tags=["supplier"])

@router.get("/", response_model=List[schemas_module.Supplier])
def read_supplier(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_supplier.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Supplier)
def read_supplier_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return obj

@router.post("/", response_model=schemas_module.Supplier, status_code=status.HTTP_201_CREATED)
def create_supplier(obj_in: schemas_module.SupplierCreate, db: Session = Depends(get_db)):
    return crud_module.crud_supplier.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Supplier)
def update_supplier(id: int, obj_in: schemas_module.SupplierUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return crud_module.crud_supplier.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Supplier)
def delete_supplier(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return crud_module.crud_supplier.remove(db=db, id=id)