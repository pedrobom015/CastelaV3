from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_level", tags=["stock_level"])

@router.get("/", response_model=List[schemas_module.Stocklevel])
def read_stock_level(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_level.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stocklevel)
def read_stock_level_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_level.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stocklevel not found")
    return obj

@router.post("/", response_model=schemas_module.Stocklevel, status_code=status.HTTP_201_CREATED)
def create_stock_level(obj_in: schemas_module.StocklevelCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_level.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stocklevel)
def update_stock_level(id: int, obj_in: schemas_module.StocklevelUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_level.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stocklevel not found")
    return crud_module.crud_stock_level.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stocklevel)
def delete_stock_level(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_level.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stocklevel not found")
    return crud_module.crud_stock_level.remove(db=db, id=id)