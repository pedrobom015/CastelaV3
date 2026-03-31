from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product_variation", tags=["product_variation"])

@router.get("/", response_model=List[schemas_module.Productvariation])
def read_product_variation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product_variation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Productvariation)
def read_product_variation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_variation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productvariation not found")
    return obj

@router.post("/", response_model=schemas_module.Productvariation, status_code=status.HTTP_201_CREATED)
def create_product_variation(obj_in: schemas_module.ProductvariationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product_variation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Productvariation)
def update_product_variation(id: int, obj_in: schemas_module.ProductvariationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_variation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productvariation not found")
    return crud_module.crud_product_variation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Productvariation)
def delete_product_variation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_variation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productvariation not found")
    return crud_module.crud_product_variation.remove(db=db, id=id)