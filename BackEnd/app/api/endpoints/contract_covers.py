from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contract_covers", tags=["contract_covers"])

@router.get("/", response_model=List[schemas_module.Contractcovers])
def read_contract_covers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contract_covers.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contractcovers)
def read_contract_covers_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_covers.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractcovers not found")
    return obj

@router.post("/", response_model=schemas_module.Contractcovers, status_code=status.HTTP_201_CREATED)
def create_contract_covers(obj_in: schemas_module.ContractcoversCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contract_covers.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contractcovers)
def update_contract_covers(id: int, obj_in: schemas_module.ContractcoversUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_covers.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractcovers not found")
    return crud_module.crud_contract_covers.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contractcovers)
def delete_contract_covers(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contract_covers.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contractcovers not found")
    return crud_module.crud_contract_covers.remove(db=db, id=id)