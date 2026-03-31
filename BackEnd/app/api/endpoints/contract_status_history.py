from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_status_history", tags=["contract_status_history"])

@router.get("/", response_model=List[schemas_module.Contractstatushistory])
def read_contract_status_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_status_history.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractstatushistory)
def read_contract_status_history_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status_history.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatushistory not found")
    return obj

@router.post("/", response_model=schemas_module.Contractstatushistory, status_code=status.HTTP_201_CREATED)
def create_contract_status_history(obj_in: schemas_module.ContractstatushistoryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_status_history.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractstatushistory)
def update_contract_status_history(id: int, obj_in: schemas_module.ContractstatushistoryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status_history.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatushistory not found")
    return crud_module.crud_contract_status_history.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractstatushistory)
def delete_contract_status_history(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_status_history.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractstatushistory not found")
    return crud_module.crud_contract_status_history.remove(db=db, id=id)