from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/document", tags=["document"])

@router.get("/", response_model=List[schemas_module.Document])
def read_document(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_document.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Document)
def read_document_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return obj

@router.post("/", response_model=schemas_module.Document, status_code=status.HTTP_201_CREATED)
def create_document(obj_in: schemas_module.DocumentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_document.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Document)
def update_document(id: int, obj_in: schemas_module.DocumentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return crud_module.crud_document.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Document)
def delete_document(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return crud_module.crud_document.remove(db=db, id=id)