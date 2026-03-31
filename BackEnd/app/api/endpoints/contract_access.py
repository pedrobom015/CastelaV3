from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_access", tags=["contract_access"])

@router.get("/", response_model=List[schemas_module.Contractaccess])
def read_contract_access(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_access.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractaccess)
def read_contract_access_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractaccess not found")
    return obj

@router.post("/", response_model=schemas_module.Contractaccess, status_code=status.HTTP_201_CREATED)
def create_contract_access(obj_in: schemas_module.ContractaccessCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_access.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractaccess)
def update_contract_access(id: int, obj_in: schemas_module.ContractaccessUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractaccess not found")
    return crud_module.crud_contract_access.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractaccess)
def delete_contract_access(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractaccess not found")
    return crud_module.crud_contract_access.remove(db=db, id=id)