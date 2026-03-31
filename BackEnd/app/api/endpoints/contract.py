from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract", tags=["contract"])

@router.get("/", response_model=List[schemas_module.Contract])
def read_contract(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contract)
def read_contract_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contract not found")
    return obj

@router.post("/", response_model=schemas_module.Contract, status_code=status.HTTP_201_CREATED)
def create_contract(obj_in: schemas_module.ContractCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contract)
def update_contract(id: int, obj_in: schemas_module.ContractUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contract not found")
    return crud_module.crud_contract.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contract)
def delete_contract(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contract not found")
    return crud_module.crud_contract.remove(db=db, id=id)