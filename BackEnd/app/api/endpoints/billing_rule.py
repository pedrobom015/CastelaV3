from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/billing_rule", tags=["billing_rule"])

@router.get("/", response_model=List[schemas_module.Billingrule])
def read_billing_rule(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_billing_rule.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Billingrule)
def read_billing_rule_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingrule not found")
    return obj

@router.post("/", response_model=schemas_module.Billingrule, status_code=status.HTTP_201_CREATED)
def create_billing_rule(obj_in: schemas_module.BillingruleCreate, db: Session = Depends(get_db)):
    return crud_module.crud_billing_rule.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Billingrule)
def update_billing_rule(id: int, obj_in: schemas_module.BillingruleUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingrule not found")
    return crud_module.crud_billing_rule.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Billingrule)
def delete_billing_rule(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingrule not found")
    return crud_module.crud_billing_rule.remove(db=db, id=id)