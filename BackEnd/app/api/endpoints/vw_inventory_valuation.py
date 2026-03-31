from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_inventory_valuation", tags=["vw_inventory_valuation"])

@router.get("/", response_model=List[schemas_module.Vwinventoryvaluation])
def read_vw_inventory_valuation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_inventory_valuation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwinventoryvaluation)
def read_vw_inventory_valuation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_valuation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryvaluation not found")
    return obj

@router.post("/", response_model=schemas_module.Vwinventoryvaluation, status_code=status.HTTP_201_CREATED)
def create_vw_inventory_valuation(obj_in: schemas_module.VwinventoryvaluationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_inventory_valuation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwinventoryvaluation)
def update_vw_inventory_valuation(id: int, obj_in: schemas_module.VwinventoryvaluationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_valuation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryvaluation not found")
    return crud_module.crud_vw_inventory_valuation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwinventoryvaluation)
def delete_vw_inventory_valuation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_valuation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryvaluation not found")
    return crud_module.crud_vw_inventory_valuation.remove(db=db, id=id)