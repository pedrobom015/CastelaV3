from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/inventory_adjustment", tags=["inventory_adjustment"])

@router.get("/", response_model=List[schemas_module.Inventoryadjustment])
def read_inventory_adjustment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_inventory_adjustment.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Inventoryadjustment)
def read_inventory_adjustment_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_inventory_adjustment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Inventoryadjustment not found")
    return obj

@router.post("/", response_model=schemas_module.Inventoryadjustment, status_code=status.HTTP_201_CREATED)
def create_inventory_adjustment(obj_in: schemas_module.InventoryadjustmentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_inventory_adjustment.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Inventoryadjustment)
def update_inventory_adjustment(id: int, obj_in: schemas_module.InventoryadjustmentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_inventory_adjustment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Inventoryadjustment not found")
    return crud_module.crud_inventory_adjustment.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Inventoryadjustment)
def delete_inventory_adjustment(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_inventory_adjustment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Inventoryadjustment not found")
    return crud_module.crud_inventory_adjustment.remove(db=db, id=id)