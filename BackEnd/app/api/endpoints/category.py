from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/category", tags=["category"])

@router.get("/", response_model=List[schemas_module.Category])
def read_category(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_category.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Category)
def read_category_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return obj

@router.post("/", response_model=schemas_module.Category, status_code=status.HTTP_201_CREATED)
def create_category(obj_in: schemas_module.CategoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_category.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Category)
def update_category(id: int, obj_in: schemas_module.CategoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud_module.crud_category.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Category)
def delete_category(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_category.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud_module.crud_category.remove(db=db, id=id)