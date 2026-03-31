from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/membership_card", tags=["membership_card"])

@router.get("/", response_model=List[schemas_module.Membershipcard])
def read_membership_card(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_membership_card.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Membershipcard)
def read_membership_card_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_membership_card.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Membershipcard not found")
    return obj

@router.post("/", response_model=schemas_module.Membershipcard, status_code=status.HTTP_201_CREATED)
def create_membership_card(obj_in: schemas_module.MembershipcardCreate, db: Session = Depends(get_db)):
    return crud_module.crud_membership_card.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Membershipcard)
def update_membership_card(id: int, obj_in: schemas_module.MembershipcardUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_membership_card.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Membershipcard not found")
    return crud_module.crud_membership_card.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Membershipcard)
def delete_membership_card(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_membership_card.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Membershipcard not found")
    return crud_module.crud_membership_card.remove(db=db, id=id)