from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/address_type", tags=["address_type"])

@router.get("/", response_model=List[schemas_module.Addresstype])
def read_address_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_address_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Addresstype)
def read_address_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_address_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addresstype not found")
    return obj

@router.post("/", response_model=schemas_module.Addresstype, status_code=status.HTTP_201_CREATED)
def create_address_type(obj_in: schemas_module.AddresstypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_address_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Addresstype)
def update_address_type(id: int, obj_in: schemas_module.AddresstypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_address_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addresstype not found")
    return crud_module.crud_address_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Addresstype)
def delete_address_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_address_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addresstype not found")
    return crud_module.crud_address_type.remove(db=db, id=id)