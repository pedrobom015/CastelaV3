from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product", tags=["product"])

@router.get("/", response_model=List[schemas_module.Product])
def read_product(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Product)
def read_product_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return obj

@router.post("/", response_model=schemas_module.Product, status_code=status.HTTP_201_CREATED)
def create_product(obj_in: schemas_module.ProductCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Product)
def update_product(id: int, obj_in: schemas_module.ProductUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud_module.crud_product.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Product)
def delete_product(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud_module.crud_product.remove(db=db, id=id)