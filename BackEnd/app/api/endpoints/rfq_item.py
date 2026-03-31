from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/rfq_item", tags=["rfq_item"])

@router.get("/", response_model=List[schemas_module.Rfqitem])
def read_rfq_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_rfq_item.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Rfqitem)
def read_rfq_item_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqitem not found")
    return obj

@router.post("/", response_model=schemas_module.Rfqitem, status_code=status.HTTP_201_CREATED)
def create_rfq_item(obj_in: schemas_module.RfqitemCreate, db: Session = Depends(get_db)):
    return crud_module.crud_rfq_item.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Rfqitem)
def update_rfq_item(id: int, obj_in: schemas_module.RfqitemUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqitem not found")
    return crud_module.crud_rfq_item.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Rfqitem)
def delete_rfq_item(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_rfq_item.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Rfqitem not found")
    return crud_module.crud_rfq_item.remove(db=db, id=id)