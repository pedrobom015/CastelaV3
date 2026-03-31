from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_events", tags=["contract_events"])

@router.get("/", response_model=List[schemas_module.Contractevents])
def read_contract_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_events.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractevents)
def read_contract_events_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_events.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractevents not found")
    return obj

@router.post("/", response_model=schemas_module.Contractevents, status_code=status.HTTP_201_CREATED)
def create_contract_events(obj_in: schemas_module.ContracteventsCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_events.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractevents)
def update_contract_events(id: int, obj_in: schemas_module.ContracteventsUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_events.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractevents not found")
    return crud_module.crud_contract_events.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractevents)
def delete_contract_events(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_events.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractevents not found")
    return crud_module.crud_contract_events.remove(db=db, id=id)