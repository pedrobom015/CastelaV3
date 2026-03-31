from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_current_inventory", tags=["vw_current_inventory"])

@router.get("/", response_model=List[schemas_module.Vwcurrentinventory])
def read_vw_current_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_current_inventory.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwcurrentinventory)
def read_vw_current_inventory_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_current_inventory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwcurrentinventory not found")
    return obj

@router.post("/", response_model=schemas_module.Vwcurrentinventory, status_code=status.HTTP_201_CREATED)
def create_vw_current_inventory(obj_in: schemas_module.VwcurrentinventoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_current_inventory.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwcurrentinventory)
def update_vw_current_inventory(id: int, obj_in: schemas_module.VwcurrentinventoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_current_inventory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwcurrentinventory not found")
    return crud_module.crud_vw_current_inventory.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwcurrentinventory)
def delete_vw_current_inventory(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_current_inventory.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwcurrentinventory not found")
    return crud_module.crud_vw_current_inventory.remove(db=db, id=id)