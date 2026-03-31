from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/api_error", tags=["api_error"])

@router.get("/", response_model=List[schemas_module.Apierror])
def read_api_error(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_api_error.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Apierror)
def read_api_error_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_api_error.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Apierror not found")
    return obj

@router.post("/", response_model=schemas_module.Apierror, status_code=status.HTTP_201_CREATED)
def create_api_error(obj_in: schemas_module.ApierrorCreate, db: Session = Depends(get_db)):
    return crud_module.crud_api_error.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Apierror)
def update_api_error(id: int, obj_in: schemas_module.ApierrorUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_api_error.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Apierror not found")
    return crud_module.crud_api_error.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Apierror)
def delete_api_error(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_api_error.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Apierror not found")
    return crud_module.crud_api_error.remove(db=db, id=id)