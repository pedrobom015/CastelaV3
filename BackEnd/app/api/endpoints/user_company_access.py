from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/user_company_access", tags=["user_company_access"])

@router.get("/", response_model=List[schemas_module.Usercompanyaccess])
def read_user_company_access(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_user_company_access.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Usercompanyaccess)
def read_user_company_access_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_company_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Usercompanyaccess not found")
    return obj

@router.post("/", response_model=schemas_module.Usercompanyaccess, status_code=status.HTTP_201_CREATED)
def create_user_company_access(obj_in: schemas_module.UsercompanyaccessCreate, db: Session = Depends(get_db)):
    return crud_module.crud_user_company_access.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Usercompanyaccess)
def update_user_company_access(id: int, obj_in: schemas_module.UsercompanyaccessUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_company_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Usercompanyaccess not found")
    return crud_module.crud_user_company_access.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Usercompanyaccess)
def delete_user_company_access(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_user_company_access.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Usercompanyaccess not found")
    return crud_module.crud_user_company_access.remove(db=db, id=id)