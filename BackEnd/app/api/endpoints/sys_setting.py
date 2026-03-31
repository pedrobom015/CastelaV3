from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_setting", tags=["sys_setting"])

@router.get("/", response_model=List[schemas_module.Syssetting])
def read_sys_setting(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_setting.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Syssetting)
def read_sys_setting_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syssetting not found")
    return obj

@router.post("/", response_model=schemas_module.Syssetting, status_code=status.HTTP_201_CREATED)
def create_sys_setting(obj_in: schemas_module.SyssettingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_setting.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Syssetting)
def update_sys_setting(id: int, obj_in: schemas_module.SyssettingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syssetting not found")
    return crud_module.crud_sys_setting.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Syssetting)
def delete_sys_setting(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Syssetting not found")
    return crud_module.crud_sys_setting.remove(db=db, id=id)