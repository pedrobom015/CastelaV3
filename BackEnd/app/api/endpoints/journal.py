from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/journal", tags=["journal"])

@router.get("/", response_model=List[schemas_module.Journal])
def read_journal(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_journal.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Journal)
def read_journal_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journal not found")
    return obj

@router.post("/", response_model=schemas_module.Journal, status_code=status.HTTP_201_CREATED)
def create_journal(obj_in: schemas_module.JournalCreate, db: Session = Depends(get_db)):
    return crud_module.crud_journal.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Journal)
def update_journal(id: int, obj_in: schemas_module.JournalUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journal not found")
    return crud_module.crud_journal.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Journal)
def delete_journal(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journal not found")
    return crud_module.crud_journal.remove(db=db, id=id)