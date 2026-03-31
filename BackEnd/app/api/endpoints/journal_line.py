from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/journal_line", tags=["journal_line"])

@router.get("/", response_model=List[schemas_module.Journalline])
def read_journal_line(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_journal_line.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Journalline)
def read_journal_line_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_line.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalline not found")
    return obj

@router.post("/", response_model=schemas_module.Journalline, status_code=status.HTTP_201_CREATED)
def create_journal_line(obj_in: schemas_module.JournallineCreate, db: Session = Depends(get_db)):
    return crud_module.crud_journal_line.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Journalline)
def update_journal_line(id: int, obj_in: schemas_module.JournallineUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_line.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalline not found")
    return crud_module.crud_journal_line.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Journalline)
def delete_journal_line(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_line.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalline not found")
    return crud_module.crud_journal_line.remove(db=db, id=id)