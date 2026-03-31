from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/warehouse", tags=["warehouse"])

@router.get("/", response_model=List[schemas_module.Warehouse])
def read_warehouse(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_warehouse.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Warehouse)
def read_warehouse_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return obj

@router.post("/", response_model=schemas_module.Warehouse, status_code=status.HTTP_201_CREATED)
def create_warehouse(obj_in: schemas_module.WarehouseCreate, db: Session = Depends(get_db)):
    return crud_module.crud_warehouse.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Warehouse)
def update_warehouse(id: int, obj_in: schemas_module.WarehouseUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return crud_module.crud_warehouse.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Warehouse)
def delete_warehouse(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return crud_module.crud_warehouse.remove(db=db, id=id)