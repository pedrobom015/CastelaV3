from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/product_image", tags=["product_image"])

@router.get("/", response_model=List[schemas_module.Productimage])
def read_product_image(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_product_image.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Productimage)
def read_product_image_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_image.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productimage not found")
    return obj

@router.post("/", response_model=schemas_module.Productimage, status_code=status.HTTP_201_CREATED)
def create_product_image(obj_in: schemas_module.ProductimageCreate, db: Session = Depends(get_db)):
    return crud_module.crud_product_image.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Productimage)
def update_product_image(id: int, obj_in: schemas_module.ProductimageUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_image.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productimage not found")
    return crud_module.crud_product_image.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Productimage)
def delete_product_image(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_product_image.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Productimage not found")
    return crud_module.crud_product_image.remove(db=db, id=id)