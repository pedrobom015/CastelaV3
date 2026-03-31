from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_active", tags=["contract_active"])

@router.get("/", response_model=List[schemas_module.Contractactive])
def read_contract_active(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_active.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractactive)
def read_contract_active_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_active.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractactive not found")
    return obj

@router.post("/", response_model=schemas_module.Contractactive, status_code=status.HTTP_201_CREATED)
def create_contract_active(obj_in: schemas_module.ContractactiveCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_active.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractactive)
def update_contract_active(id: int, obj_in: schemas_module.ContractactiveUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_active.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractactive not found")
    return crud_module.crud_contract_active.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractactive)
def delete_contract_active(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_active.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractactive not found")
    return crud_module.crud_contract_active.remove(db=db, id=id)