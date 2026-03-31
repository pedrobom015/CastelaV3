from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/partner", tags=["partner"])

@router.get("/", response_model=List[schemas_module.Partner])
def read_partner(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_partner.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Partner)
def read_partner_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partner not found")
    return obj

@router.post("/", response_model=schemas_module.Partner, status_code=status.HTTP_201_CREATED)
def create_partner(obj_in: schemas_module.PartnerCreate, db: Session = Depends(get_db)):
    return crud_module.crud_partner.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Partner)
def update_partner(id: int, obj_in: schemas_module.PartnerUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partner not found")
    return crud_module.crud_partner.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Partner)
def delete_partner(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_partner.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partner not found")
    return crud_module.crud_partner.remove(db=db, id=id)