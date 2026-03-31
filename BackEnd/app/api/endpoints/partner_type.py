from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/partner_type", tags=["partner_type"])

@router.get("/", response_model=List[schemas_module.Partnertype])
def read_partner_type(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_partner_type.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Partnertype)
def read_partner_type_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partnertype not found")
    return obj

@router.post("/", response_model=schemas_module.Partnertype, status_code=status.HTTP_201_CREATED)
def create_partner_type(obj_in: schemas_module.PartnertypeCreate, db: Session = Depends(get_db)):
    return crud_module.crud_partner_type.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Partnertype)
def update_partner_type(id: int, obj_in: schemas_module.PartnertypeUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partnertype not found")
    return crud_module.crud_partner_type.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Partnertype)
def delete_partner_type(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner_type.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partnertype not found")
    return crud_module.crud_partner_type.remove(db=db, id=id)