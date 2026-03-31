from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/address", tags=["address"])

@router.get("/", response_model=List[schemas_module.Address])
def read_address(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_address.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Address)
def read_address_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_address.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Address not found")
    return obj

@router.post("/", response_model=schemas_module.Address, status_code=status.HTTP_201_CREATED)
def create_address(obj_in: schemas_module.AddressCreate, db: Session = Depends(get_db)):
    return crud_module.crud_address.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Address)
def update_address(id: int, obj_in: schemas_module.AddressUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_address.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Address not found")
    return crud_module.crud_address.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Address)
def delete_address(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_address.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Address not found")
    return crud_module.crud_address.remove(db=db, id=id)