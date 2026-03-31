from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/journal_type", tags=["journal_type"])

@router.get("/", response_model=List[schemas_module.Journaltype])
def read_journal_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_journal_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Journaltype)
def read_journal_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journaltype not found")
    return obj

@router.post("/", response_model=schemas_module.Journaltype, status_code=status.HTTP_201_CREATED)
def create_journal_type(obj_in: schemas_module.JournaltypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_journal_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Journaltype)
def update_journal_type(id: int, obj_in: schemas_module.JournaltypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journaltype not found")
    return crud_module.crud_journal_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Journaltype)
def delete_journal_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journaltype not found")
    return crud_module.crud_journal_type.remove(db=db, id=id)