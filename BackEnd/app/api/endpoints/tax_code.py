from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/tax_code", tags=["tax_code"])

@router.get("/", response_model=List[schemas_module.Taxcode])
def read_tax_code(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_tax_code.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Taxcode)
def read_tax_code_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_tax_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Taxcode not found")
    return obj

@router.post("/", response_model=schemas_module.Taxcode, status_code=status.HTTP_201_CREATED)
def create_tax_code(obj_in: schemas_module.TaxcodeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_tax_code.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Taxcode)
def update_tax_code(id: int, obj_in: schemas_module.TaxcodeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_tax_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Taxcode not found")
    return crud_module.crud_tax_code.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Taxcode)
def delete_tax_code(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_tax_code.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Taxcode not found")
    return crud_module.crud_tax_code.remove(db=db, id=id)