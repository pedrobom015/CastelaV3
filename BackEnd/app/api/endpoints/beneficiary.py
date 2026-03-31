from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/beneficiary", tags=["beneficiary"])

@router.get("/", response_model=List[schemas_module.Beneficiary])
def read_beneficiary(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_beneficiary.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Beneficiary)
def read_beneficiary_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_beneficiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    return obj

@router.post("/", response_model=schemas_module.Beneficiary, status_code=status.HTTP_201_CREATED)
def create_beneficiary(obj_in: schemas_module.BeneficiaryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_beneficiary.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Beneficiary)
def update_beneficiary(id: int, obj_in: schemas_module.BeneficiaryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_beneficiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    return crud_module.crud_beneficiary.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Beneficiary)
def delete_beneficiary(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_beneficiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    return crud_module.crud_beneficiary.remove(db=db, id=id)