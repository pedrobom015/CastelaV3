from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/variation_attribute", tags=["variation_attribute"])

@router.get("/", response_model=List[schemas_module.Variationattribute])
def read_variation_attribute(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_variation_attribute.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Variationattribute)
def read_variation_attribute_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_variation_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Variationattribute not found")
    return obj

@router.post("/", response_model=schemas_module.Variationattribute, status_code=status.HTTP_201_CREATED)
def create_variation_attribute(obj_in: schemas_module.VariationattributeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_variation_attribute.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Variationattribute)
def update_variation_attribute(id: int, obj_in: schemas_module.VariationattributeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_variation_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Variationattribute not found")
    return crud_module.crud_variation_attribute.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Variationattribute)
def delete_variation_attribute(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_variation_attribute.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Variationattribute not found")
    return crud_module.crud_variation_attribute.remove(db=db, id=id)