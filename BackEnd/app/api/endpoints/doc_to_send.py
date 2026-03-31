from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/doc_to_send", tags=["doc_to_send"])

@router.get("/", response_model=List[schemas_module.Doctosend])
def read_doc_to_send(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_doc_to_send.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Doctosend)
def read_doc_to_send_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_doc_to_send.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Doctosend not found")
    return obj

@router.post("/", response_model=schemas_module.Doctosend, status_code=status.HTTP_201_CREATED)
def create_doc_to_send(obj_in: schemas_module.DoctosendCreate, db: Session = Depends(get_db)):
    return crud_module.crud_doc_to_send.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Doctosend)
def update_doc_to_send(id: int, obj_in: schemas_module.DoctosendUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_doc_to_send.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Doctosend not found")
    return crud_module.crud_doc_to_send.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Doctosend)
def delete_doc_to_send(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_doc_to_send.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Doctosend not found")
    return crud_module.crud_doc_to_send.remove(db=db, id=id)