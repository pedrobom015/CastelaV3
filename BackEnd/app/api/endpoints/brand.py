from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/brand", tags=["brand"])

@router.get("/", response_model=List[schemas_module.Brand])
def read_brand(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_brand.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Brand)
def read_brand_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_brand.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Brand not found")
    return obj

@router.post("/", response_model=schemas_module.Brand, status_code=status.HTTP_201_CREATED)
def create_brand(obj_in: schemas_module.BrandCreate, db: Session = Depends(get_db)):
    return crud_module.crud_brand.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Brand)
def update_brand(id: int, obj_in: schemas_module.BrandUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_brand.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Brand not found")
    return crud_module.crud_brand.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Brand)
def delete_brand(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_brand.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Brand not found")
    return crud_module.crud_brand.remove(db=db, id=id)