from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_status", tags=["contract_status"])

@router.get("/", response_model=List[schemas_module.Contractstatus])
def read_contract_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractstatus)
def read_contract_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatus not found")
    return obj

@router.post("/", response_model=schemas_module.Contractstatus, status_code=status.HTTP_201_CREATED)
def create_contract_status(obj_in: schemas_module.ContractstatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractstatus)
def update_contract_status(id: int, obj_in: schemas_module.ContractstatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatus not found")
    return crud_module.crud_contract_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractstatus)
def delete_contract_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatus not found")
    return crud_module.crud_contract_status.remove(db=db, id=id)