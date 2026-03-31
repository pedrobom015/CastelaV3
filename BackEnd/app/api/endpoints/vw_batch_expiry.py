from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_batch_expiry", tags=["vw_batch_expiry"])

@router.get("/", response_model=List[schemas_module.Vwbatchexpiry])
def read_vw_batch_expiry(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_batch_expiry.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwbatchexpiry)
def read_vw_batch_expiry_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_batch_expiry.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwbatchexpiry not found")
    return obj

@router.post("/", response_model=schemas_module.Vwbatchexpiry, status_code=status.HTTP_201_CREATED)
def create_vw_batch_expiry(obj_in: schemas_module.VwbatchexpiryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_batch_expiry.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwbatchexpiry)
def update_vw_batch_expiry(id: int, obj_in: schemas_module.VwbatchexpiryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_batch_expiry.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwbatchexpiry not found")
    return crud_module.crud_vw_batch_expiry.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwbatchexpiry)
def delete_vw_batch_expiry(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_batch_expiry.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwbatchexpiry not found")
    return crud_module.crud_vw_batch_expiry.remove(db=db, id=id)