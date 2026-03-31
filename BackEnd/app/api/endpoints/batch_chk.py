from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/batch_chk", tags=["batch_chk"])

@router.get("/", response_model=List[schemas_module.Batchchk])
def read_batch_chk(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_batch_chk.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Batchchk)
def read_batch_chk_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_chk.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchchk not found")
    return obj

@router.post("/", response_model=schemas_module.Batchchk, status_code=status.HTTP_201_CREATED)
def create_batch_chk(obj_in: schemas_module.BatchchkCreate, db: Session = Depends(get_db)):
    return crud_module.crud_batch_chk.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Batchchk)
def update_batch_chk(id: int, obj_in: schemas_module.BatchchkUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_chk.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchchk not found")
    return crud_module.crud_batch_chk.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Batchchk)
def delete_batch_chk(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_chk.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchchk not found")
    return crud_module.crud_batch_chk.remove(db=db, id=id)