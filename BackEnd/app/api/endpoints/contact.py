from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/contact", tags=["contact"])

@router.get("/", response_model=List[schemas_module.Contact])
def read_contact(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_contact.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Contact)
def read_contact_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contact not found")
    return obj

@router.post("/", response_model=schemas_module.Contact, status_code=status.HTTP_201_CREATED)
def create_contact(obj_in: schemas_module.ContactCreate, db: Session = Depends(get_db)):
    return crud_module.crud_contact.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Contact)
def update_contact(id: int, obj_in: schemas_module.ContactUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contact not found")
    return crud_module.crud_contact.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Contact)
def delete_contact(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_contact.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Contact not found")
    return crud_module.crud_contact.remove(db=db, id=id)