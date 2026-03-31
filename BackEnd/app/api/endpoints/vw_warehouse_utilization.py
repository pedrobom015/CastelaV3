from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_warehouse_utilization", tags=["vw_warehouse_utilization"])

@router.get("/", response_model=List[schemas_module.Vwwarehouseutilization])
def read_vw_warehouse_utilization(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_warehouse_utilization.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwwarehouseutilization)
def read_vw_warehouse_utilization_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_utilization.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehouseutilization not found")
    return obj

@router.post("/", response_model=schemas_module.Vwwarehouseutilization, status_code=status.HTTP_201_CREATED)
def create_vw_warehouse_utilization(obj_in: schemas_module.VwwarehouseutilizationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_warehouse_utilization.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwwarehouseutilization)
def update_vw_warehouse_utilization(id: int, obj_in: schemas_module.VwwarehouseutilizationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_utilization.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehouseutilization not found")
    return crud_module.crud_vw_warehouse_utilization.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwwarehouseutilization)
def delete_vw_warehouse_utilization(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_utilization.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehouseutilization not found")
    return crud_module.crud_vw_warehouse_utilization.remove(db=db, id=id)