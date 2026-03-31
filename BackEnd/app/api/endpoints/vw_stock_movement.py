from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_stock_movement", tags=["vw_stock_movement"])

@router.get("/", response_model=List[schemas_module.Vwstockmovement])
def read_vw_stock_movement(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_stock_movement.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwstockmovement)
def read_vw_stock_movement_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockmovement not found")
    return obj

@router.post("/", response_model=schemas_module.Vwstockmovement, status_code=status.HTTP_201_CREATED)
def create_vw_stock_movement(obj_in: schemas_module.VwstockmovementCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_stock_movement.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwstockmovement)
def update_vw_stock_movement(id: int, obj_in: schemas_module.VwstockmovementUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockmovement not found")
    return crud_module.crud_vw_stock_movement.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwstockmovement)
def delete_vw_stock_movement(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_movement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockmovement not found")
    return crud_module.crud_vw_stock_movement.remove(db=db, id=id)