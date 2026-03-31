from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_stock_accuracy", tags=["vw_stock_accuracy"])

@router.get("/", response_model=List[schemas_module.Vwstockaccuracy])
def read_vw_stock_accuracy(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_stock_accuracy.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwstockaccuracy)
def read_vw_stock_accuracy_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_accuracy.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockaccuracy not found")
    return obj

@router.post("/", response_model=schemas_module.Vwstockaccuracy, status_code=status.HTTP_201_CREATED)
def create_vw_stock_accuracy(obj_in: schemas_module.VwstockaccuracyCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_stock_accuracy.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwstockaccuracy)
def update_vw_stock_accuracy(id: int, obj_in: schemas_module.VwstockaccuracyUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_accuracy.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockaccuracy not found")
    return crud_module.crud_vw_stock_accuracy.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwstockaccuracy)
def delete_vw_stock_accuracy(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_stock_accuracy.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwstockaccuracy not found")
    return crud_module.crud_vw_stock_accuracy.remove(db=db, id=id)