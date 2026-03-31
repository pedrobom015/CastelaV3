from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/request_for_quotation", tags=["request_for_quotation"])

@router.get("/", response_model=List[schemas_module.Requestforquotation])
def read_request_for_quotation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_request_for_quotation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Requestforquotation)
def read_request_for_quotation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_request_for_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Requestforquotation not found")
    return obj

@router.post("/", response_model=schemas_module.Requestforquotation, status_code=status.HTTP_201_CREATED)
def create_request_for_quotation(obj_in: schemas_module.RequestforquotationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_request_for_quotation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Requestforquotation)
def update_request_for_quotation(id: int, obj_in: schemas_module.RequestforquotationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_request_for_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Requestforquotation not found")
    return crud_module.crud_request_for_quotation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Requestforquotation)
def delete_request_for_quotation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_request_for_quotation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Requestforquotation not found")
    return crud_module.crud_request_for_quotation.remove(db=db, id=id)