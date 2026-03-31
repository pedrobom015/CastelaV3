from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/audit_log_archive", tags=["audit_log_archive"])

@router.get("/", response_model=List[schemas_module.Auditlogarchive])
def read_audit_log_archive(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_audit_log_archive.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Auditlogarchive)
def read_audit_log_archive_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_audit_log_archive.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditlogarchive not found")
    return obj

@router.post("/", response_model=schemas_module.Auditlogarchive, status_code=status.HTTP_201_CREATED)
def create_audit_log_archive(obj_in: schemas_module.AuditlogarchiveCreate, db: Session = Depends(get_db)):
    return crud_module.crud_audit_log_archive.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Auditlogarchive)
def update_audit_log_archive(id: int, obj_in: schemas_module.AuditlogarchiveUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_audit_log_archive.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditlogarchive not found")
    return crud_module.crud_audit_log_archive.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Auditlogarchive)
def delete_audit_log_archive(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_audit_log_archive.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditlogarchive not found")
    return crud_module.crud_audit_log_archive.remove(db=db, id=id)