from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_balance_sheet", tags=["view_balance_sheet"])

@router.get("/", response_model=List[schemas_module.Viewbalancesheet])
def read_view_balance_sheet(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_balance_sheet.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewbalancesheet)
def read_view_balance_sheet_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_balance_sheet.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbalancesheet not found")
    return obj

@router.post("/", response_model=schemas_module.Viewbalancesheet, status_code=status.HTTP_201_CREATED)
def create_view_balance_sheet(obj_in: schemas_module.ViewbalancesheetCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_balance_sheet.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewbalancesheet)
def update_view_balance_sheet(id: int, obj_in: schemas_module.ViewbalancesheetUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_balance_sheet.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbalancesheet not found")
    return crud_module.crud_view_balance_sheet.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewbalancesheet)
def delete_view_balance_sheet(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_balance_sheet.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewbalancesheet not found")
    return crud_module.crud_view_balance_sheet.remove(db=db, id=id)