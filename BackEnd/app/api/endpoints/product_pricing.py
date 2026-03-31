from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product_pricing", tags=["product_pricing"])

@router.get("/", response_model=List[schemas_module.Productpricing])
def read_product_pricing(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product_pricing.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Productpricing)
def read_product_pricing_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_pricing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productpricing not found")
    return obj

@router.post("/", response_model=schemas_module.Productpricing, status_code=status.HTTP_201_CREATED)
def create_product_pricing(obj_in: schemas_module.ProductpricingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product_pricing.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Productpricing)
def update_product_pricing(id: int, obj_in: schemas_module.ProductpricingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_pricing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productpricing not found")
    return crud_module.crud_product_pricing.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Productpricing)
def delete_product_pricing(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_pricing.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productpricing not found")
    return crud_module.crud_product_pricing.remove(db=db, id=id)