from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_count_item", tags=["stock_count_item"])

@router.get("/", response_model=List[schemas_module.Stockcountitem])
def read_stock_count_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_count_item.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stockcountitem)
def read_stock_count_item_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcountitem not found")
    return obj

@router.post("/", response_model=schemas_module.Stockcountitem, status_code=status.HTTP_201_CREATED)
def create_stock_count_item(obj_in: schemas_module.StockcountitemCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_count_item.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stockcountitem)
def update_stock_count_item(id: int, obj_in: schemas_module.StockcountitemUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcountitem not found")
    return crud_module.crud_stock_count_item.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stockcountitem)
def delete_stock_count_item(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_count_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockcountitem not found")
    return crud_module.crud_stock_count_item.remove(db=db, id=id)