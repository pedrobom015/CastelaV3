from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/status_reason", tags=["status_reason"])

@router.get("/", response_model=List[schemas_module.Statusreason])
def read_status_reason(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_status_reason.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Statusreason)
def read_status_reason_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_status_reason.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statusreason not found")
    return obj

@router.post("/", response_model=schemas_module.Statusreason, status_code=status.HTTP_201_CREATED)
def create_status_reason(obj_in: schemas_module.StatusreasonCreate, db: Session = Depends(get_db)):
    return crud_module.crud_status_reason.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Statusreason)
def update_status_reason(id: int, obj_in: schemas_module.StatusreasonUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_status_reason.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statusreason not found")
    return crud_module.crud_status_reason.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Statusreason)
def delete_status_reason(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_status_reason.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statusreason not found")
    return crud_module.crud_status_reason.remove(db=db, id=id)