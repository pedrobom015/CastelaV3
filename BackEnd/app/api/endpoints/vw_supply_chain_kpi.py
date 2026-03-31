from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_supply_chain_kpi", tags=["vw_supply_chain_kpi"])

@router.get("/", response_model=List[schemas_module.Vwsupplychainkpi])
def read_vw_supply_chain_kpi(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_supply_chain_kpi.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwsupplychainkpi)
def read_vw_supply_chain_kpi_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_supply_chain_kpi.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwsupplychainkpi not found")
    return obj

@router.post("/", response_model=schemas_module.Vwsupplychainkpi, status_code=status.HTTP_201_CREATED)
def create_vw_supply_chain_kpi(obj_in: schemas_module.VwsupplychainkpiCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_supply_chain_kpi.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwsupplychainkpi)
def update_vw_supply_chain_kpi(id: int, obj_in: schemas_module.VwsupplychainkpiUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_supply_chain_kpi.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwsupplychainkpi not found")
    return crud_module.crud_vw_supply_chain_kpi.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwsupplychainkpi)
def delete_vw_supply_chain_kpi(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_supply_chain_kpi.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwsupplychainkpi not found")
    return crud_module.crud_vw_supply_chain_kpi.remove(db=db, id=id)