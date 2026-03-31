from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_validation", tags=["contract_validation"])

@router.get("/", response_model=List[schemas_module.Contractvalidation])
def read_contract_validation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_validation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractvalidation)
def read_contract_validation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_validation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractvalidation not found")
    return obj

@router.post("/", response_model=schemas_module.Contractvalidation, status_code=status.HTTP_201_CREATED)
def create_contract_validation(obj_in: schemas_module.ContractvalidationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_validation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractvalidation)
def update_contract_validation(id: int, obj_in: schemas_module.ContractvalidationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_validation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractvalidation not found")
    return crud_module.crud_contract_validation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractvalidation)
def delete_contract_validation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_validation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractvalidation not found")
    return crud_module.crud_contract_validation.remove(db=db, id=id)