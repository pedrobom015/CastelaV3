from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/stock_movement_type", tags=["stock_movement_type"])

@router.get("/", response_model=List[schemas_module.Stockmovementtype])
def read_stock_movement_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_stock_movement_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Stockmovementtype)
def read_stock_movement_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovementtype not found")
    return obj

@router.post("/", response_model=schemas_module.Stockmovementtype, status_code=status.HTTP_201_CREATED)
def create_stock_movement_type(obj_in: schemas_module.StockmovementtypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_stock_movement_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Stockmovementtype)
def update_stock_movement_type(id: int, obj_in: schemas_module.StockmovementtypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovementtype not found")
    return crud_module.crud_stock_movement_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Stockmovementtype)
def delete_stock_movement_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_stock_movement_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Stockmovementtype not found")
    return crud_module.crud_stock_movement_type.remove(db=db, id=id)