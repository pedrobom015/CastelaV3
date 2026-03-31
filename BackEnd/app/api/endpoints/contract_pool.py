from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_pool", tags=["contract_pool"])

@router.get("/", response_model=List[schemas_module.Contractpool])
def read_contract_pool(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_pool.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractpool)
def read_contract_pool_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_pool.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractpool not found")
    return obj

@router.post("/", response_model=schemas_module.Contractpool, status_code=status.HTTP_201_CREATED)
def create_contract_pool(obj_in: schemas_module.ContractpoolCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_pool.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractpool)
def update_contract_pool(id: int, obj_in: schemas_module.ContractpoolUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_pool.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractpool not found")
    return crud_module.crud_contract_pool.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractpool)
def delete_contract_pool(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_pool.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractpool not found")
    return crud_module.crud_contract_pool.remove(db=db, id=id)