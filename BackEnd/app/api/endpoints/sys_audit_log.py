from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_audit_log", tags=["sys_audit_log"])

@router.get("/", response_model=List[schemas_module.Sysauditlog])
def read_sys_audit_log(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_audit_log.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Sysauditlog)
def read_sys_audit_log_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_audit_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysauditlog not found")
    return obj

@router.post("/", response_model=schemas_module.Sysauditlog, status_code=status.HTTP_201_CREATED)
def create_sys_audit_log(obj_in: schemas_module.SysauditlogCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_audit_log.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Sysauditlog)
def update_sys_audit_log(id: int, obj_in: schemas_module.SysauditlogUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_audit_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysauditlog not found")
    return crud_module.crud_sys_audit_log.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Sysauditlog)
def delete_sys_audit_log(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_audit_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysauditlog not found")
    return crud_module.crud_sys_audit_log.remove(db=db, id=id)