from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/log_event_type", tags=["log_event_type"])

@router.get("/", response_model=List[schemas_module.Logeventtype])
def read_log_event_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_log_event_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Logeventtype)
def read_log_event_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_log_event_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Logeventtype not found")
    return obj

@router.post("/", response_model=schemas_module.Logeventtype, status_code=status.HTTP_201_CREATED)
def create_log_event_type(obj_in: schemas_module.LogeventtypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_log_event_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Logeventtype)
def update_log_event_type(id: int, obj_in: schemas_module.LogeventtypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_log_event_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Logeventtype not found")
    return crud_module.crud_log_event_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Logeventtype)
def delete_log_event_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_log_event_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Logeventtype not found")
    return crud_module.crud_log_event_type.remove(db=db, id=id)