from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/charge", tags=["charge"])

@router.get("/", response_model=List[schemas_module.Charge])
def read_charge(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_charge.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Charge)
def read_charge_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_charge.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Charge not found")
    return obj

@router.post("/", response_model=schemas_module.Charge, status_code=status.HTTP_201_CREATED)
def create_charge(obj_in: schemas_module.ChargeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_charge.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Charge)
def update_charge(id: int, obj_in: schemas_module.ChargeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_charge.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Charge not found")
    return crud_module.crud_charge.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Charge)
def delete_charge(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_charge.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Charge not found")
    return crud_module.crud_charge.remove(db=db, id=id)