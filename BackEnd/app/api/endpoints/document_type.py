from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/document_type", tags=["document_type"])

@router.get("/", response_model=List[schemas_module.Documenttype])
def read_document_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_document_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Documenttype)
def read_document_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documenttype not found")
    return obj

@router.post("/", response_model=schemas_module.Documenttype, status_code=status.HTTP_201_CREATED)
def create_document_type(obj_in: schemas_module.DocumenttypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_document_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Documenttype)
def update_document_type(id: int, obj_in: schemas_module.DocumenttypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documenttype not found")
    return crud_module.crud_document_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Documenttype)
def delete_document_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_document_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Documenttype not found")
    return crud_module.crud_document_type.remove(db=db, id=id)