from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_version", tags=["contract_version"])

@router.get("/", response_model=List[schemas_module.Contractversion])
def read_contract_version(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_version.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractversion)
def read_contract_version_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_version.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractversion not found")
    return obj

@router.post("/", response_model=schemas_module.Contractversion, status_code=status.HTTP_201_CREATED)
def create_contract_version(obj_in: schemas_module.ContractversionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_version.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractversion)
def update_contract_version(id: int, obj_in: schemas_module.ContractversionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_version.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractversion not found")
    return crud_module.crud_contract_version.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractversion)
def delete_contract_version(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_version.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractversion not found")
    return crud_module.crud_contract_version.remove(db=db, id=id)