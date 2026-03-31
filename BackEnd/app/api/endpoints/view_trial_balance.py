from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_trial_balance", tags=["view_trial_balance"])

@router.get("/", response_model=List[schemas_module.Viewtrialbalance])
def read_view_trial_balance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_trial_balance.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewtrialbalance)
def read_view_trial_balance_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_trial_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewtrialbalance not found")
    return obj

@router.post("/", response_model=schemas_module.Viewtrialbalance, status_code=status.HTTP_201_CREATED)
def create_view_trial_balance(obj_in: schemas_module.ViewtrialbalanceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_trial_balance.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewtrialbalance)
def update_view_trial_balance(id: int, obj_in: schemas_module.ViewtrialbalanceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_trial_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewtrialbalance not found")
    return crud_module.crud_view_trial_balance.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewtrialbalance)
def delete_view_trial_balance(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_trial_balance.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewtrialbalance not found")
    return crud_module.crud_view_trial_balance.remove(db=db, id=id)