from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/billing_rule_application", tags=["billing_rule_application"])

@router.get("/", response_model=List[schemas_module.Billingruleapplication])
def read_billing_rule_application(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_billing_rule_application.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Billingruleapplication)
def read_billing_rule_application_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule_application.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingruleapplication not found")
    return obj

@router.post("/", response_model=schemas_module.Billingruleapplication, status_code=status.HTTP_201_CREATED)
def create_billing_rule_application(obj_in: schemas_module.BillingruleapplicationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_billing_rule_application.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Billingruleapplication)
def update_billing_rule_application(id: int, obj_in: schemas_module.BillingruleapplicationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule_application.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingruleapplication not found")
    return crud_module.crud_billing_rule_application.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Billingruleapplication)
def delete_billing_rule_application(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_billing_rule_application.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Billingruleapplication not found")
    return crud_module.crud_billing_rule_application.remove(db=db, id=id)