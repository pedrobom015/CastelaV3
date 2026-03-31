from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_count", tags=["stock_count"])

@router.get("/", response_model=List[schemas_module.Stockcount])
def read_stock_count(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_count.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stockcount)
def read_stock_count_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcount not found")
    return obj

@router.post("/", response_model=schemas_module.Stockcount, status_code=status.HTTP_201_CREATED)
def create_stock_count(obj_in: schemas_module.StockcountCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_count.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stockcount)
def update_stock_count(id: int, obj_in: schemas_module.StockcountUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcount not found")
    return crud_module.crud_stock_count.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stockcount)
def delete_stock_count(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcount not found")
    return crud_module.crud_stock_count.remove(db=db, id=id)