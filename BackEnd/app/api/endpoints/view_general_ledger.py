from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_general_ledger", tags=["view_general_ledger"])

@router.get("/", response_model=List[schemas_module.Viewgeneralledger])
def read_view_general_ledger(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_general_ledger.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewgeneralledger)
def read_view_general_ledger_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_general_ledger.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewgeneralledger not found")
    return obj

@router.post("/", response_model=schemas_module.Viewgeneralledger, status_code=status.HTTP_201_CREATED)
def create_view_general_ledger(obj_in: schemas_module.ViewgeneralledgerCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_general_ledger.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewgeneralledger)
def update_view_general_ledger(id: int, obj_in: schemas_module.ViewgeneralledgerUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_general_ledger.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewgeneralledger not found")
    return crud_module.crud_view_general_ledger.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewgeneralledger)
def delete_view_general_ledger(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_general_ledger.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewgeneralledger not found")
    return crud_module.crud_view_general_ledger.remove(db=db, id=id)