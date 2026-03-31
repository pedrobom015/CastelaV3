from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/document_batch_item", tags=["document_batch_item"])

@router.get("/", response_model=List[schemas_module.Documentbatchitem])
def read_document_batch_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_document_batch_item.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Documentbatchitem)
def read_document_batch_item_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatchitem not found")
    return obj

@router.post("/", response_model=schemas_module.Documentbatchitem, status_code=status.HTTP_201_CREATED)
def create_document_batch_item(obj_in: schemas_module.DocumentbatchitemCreate, db: Session = Depends(get_db)):
    return crud_module.crud_document_batch_item.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Documentbatchitem)
def update_document_batch_item(id: int, obj_in: schemas_module.DocumentbatchitemUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatchitem not found")
    return crud_module.crud_document_batch_item.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Documentbatchitem)
def delete_document_batch_item(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_batch_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documentbatchitem not found")
    return crud_module.crud_document_batch_item.remove(db=db, id=id)