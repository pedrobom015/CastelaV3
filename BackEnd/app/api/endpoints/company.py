from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/company", tags=["company"])

@router.get("/", response_model=List[schemas_module.Company])
def read_company(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_company.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Company)
def read_company_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_company.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    return obj

@router.post("/", response_model=schemas_module.Company, status_code=status.HTTP_201_CREATED)
def create_company(obj_in: schemas_module.CompanyCreate, db: Session = Depends(get_db)):
    return crud_module.crud_company.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Company)
def update_company(id: int, obj_in: schemas_module.CompanyUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_company.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    return crud_module.crud_company.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Company)
def delete_company(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_company.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    return crud_module.crud_company.remove(db=db, id=id)