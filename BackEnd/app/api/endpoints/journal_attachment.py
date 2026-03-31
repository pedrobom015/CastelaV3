from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/journal_attachment", tags=["journal_attachment"])

@router.get("/", response_model=List[schemas_module.Journalattachment])
def read_journal_attachment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_journal_attachment.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Journalattachment)
def read_journal_attachment_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_attachment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalattachment not found")
    return obj

@router.post("/", response_model=schemas_module.Journalattachment, status_code=status.HTTP_201_CREATED)
def create_journal_attachment(obj_in: schemas_module.JournalattachmentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_journal_attachment.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Journalattachment)
def update_journal_attachment(id: int, obj_in: schemas_module.JournalattachmentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_attachment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalattachment not found")
    return crud_module.crud_journal_attachment.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Journalattachment)
def delete_journal_attachment(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_journal_attachment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Journalattachment not found")
    return crud_module.crud_journal_attachment.remove(db=db, id=id)