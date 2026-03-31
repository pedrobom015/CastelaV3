from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product_category", tags=["product_category"])

@router.get("/", response_model=List[schemas_module.Productcategory])
def read_product_category(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product_category.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Productcategory)
def read_product_category_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productcategory not found")
    return obj

@router.post("/", response_model=schemas_module.Productcategory, status_code=status.HTTP_201_CREATED)
def create_product_category(obj_in: schemas_module.ProductcategoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product_category.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Productcategory)
def update_product_category(id: int, obj_in: schemas_module.ProductcategoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productcategory not found")
    return crud_module.crud_product_category.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Productcategory)
def delete_product_category(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productcategory not found")
    return crud_module.crud_product_category.remove(db=db, id=id)