from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_preference", tags=["sys_preference"])

@router.get("/", response_model=List[schemas_module.Syspreference])
def read_sys_preference(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_preference.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Syspreference)
def read_sys_preference_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_preference.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syspreference not found")
    return obj

@router.post("/", response_model=schemas_module.Syspreference, status_code=status.HTTP_201_CREATED)
def create_sys_preference(obj_in: schemas_module.SyspreferenceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_preference.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Syspreference)
def update_sys_preference(id: int, obj_in: schemas_module.SyspreferenceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_preference.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syspreference not found")
    return crud_module.crud_sys_preference.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Syspreference)
def delete_sys_preference(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_preference.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syspreference not found")
    return crud_module.crud_sys_preference.remove(db=db, id=id)