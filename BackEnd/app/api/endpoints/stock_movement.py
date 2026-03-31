from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_movement", tags=["stock_movement"])

@router.get("/", response_model=List[schemas_module.Stockmovement])
def read_stock_movement(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_movement.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stockmovement)
def read_stock_movement_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovement not found")
    return obj

@router.post("/", response_model=schemas_module.Stockmovement, status_code=status.HTTP_201_CREATED)
def create_stock_movement(obj_in: schemas_module.StockmovementCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_movement.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stockmovement)
def update_stock_movement(id: int, obj_in: schemas_module.StockmovementUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovement not found")
    return crud_module.crud_stock_movement.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stockmovement)
def delete_stock_movement(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovement not found")
    return crud_module.crud_stock_movement.remove(db=db, id=id)