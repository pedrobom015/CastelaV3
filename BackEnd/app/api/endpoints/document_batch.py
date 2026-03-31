from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/document_batch", tags=["document_batch"])

@router.get("/", response_model=List[schemas_module.Documentbatch])
def read_document_batch(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_document_batch.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Documentbatch)
def read_document_batch_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatch not found")
    return obj

@router.post("/", response_model=schemas_module.Documentbatch, status_code=status.HTTP_201_CREATED)
def create_document_batch(obj_in: schemas_module.DocumentbatchCreate, db: Session = Depends(get_db)):
    return crud_module.crud_document_batch.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Documentbatch)
def update_document_batch(id: int, obj_in: schemas_module.DocumentbatchUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatch not found")
    return crud_module.crud_document_batch.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Documentbatch)
def delete_document_batch(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatch not found")
    return crud_module.crud_document_batch.remove(db=db, id=id)