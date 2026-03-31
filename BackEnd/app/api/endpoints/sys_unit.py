from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_unit", tags=["sys_unit"])

@router.get("/", response_model=List[schemas_module.Sysunit])
def read_sys_unit(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_unit.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Sysunit)
def read_sys_unit_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_unit.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysunit not found")
    return obj

@router.post("/", response_model=schemas_module.Sysunit, status_code=status.HTTP_201_CREATED)
def create_sys_unit(obj_in: schemas_module.SysunitCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_unit.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Sysunit)
def update_sys_unit(id: int, obj_in: schemas_module.SysunitUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_unit.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysunit not found")
    return crud_module.crud_sys_unit.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Sysunit)
def delete_sys_unit(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_unit.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysunit not found")
    return crud_module.crud_sys_unit.remove(db=db, id=id)