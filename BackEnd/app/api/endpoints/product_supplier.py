from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product_supplier", tags=["product_supplier"])

@router.get("/", response_model=List[schemas_module.Productsupplier])
def read_product_supplier(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product_supplier.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Productsupplier)
def read_product_supplier_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productsupplier not found")
    return obj

@router.post("/", response_model=schemas_module.Productsupplier, status_code=status.HTTP_201_CREATED)
def create_product_supplier(obj_in: schemas_module.ProductsupplierCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product_supplier.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Productsupplier)
def update_product_supplier(id: int, obj_in: schemas_module.ProductsupplierUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productsupplier not found")
    return crud_module.crud_product_supplier.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Productsupplier)
def delete_product_supplier(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_supplier.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productsupplier not found")
    return crud_module.crud_product_supplier.remove(db=db, id=id)