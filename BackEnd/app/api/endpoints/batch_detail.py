from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/batch_detail", tags=["batch_detail"])

@router.get("/", response_model=List[schemas_module.Batchdetail])
def read_batch_detail(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_batch_detail.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Batchdetail)
def read_batch_detail_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_detail.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchdetail not found")
    return obj

@router.post("/", response_model=schemas_module.Batchdetail, status_code=status.HTTP_201_CREATED)
def create_batch_detail(obj_in: schemas_module.BatchdetailCreate, db: Session = Depends(get_db)):
    return crud_module.crud_batch_detail.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Batchdetail)
def update_batch_detail(id: int, obj_in: schemas_module.BatchdetailUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_detail.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchdetail not found")
    return crud_module.crud_batch_detail.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Batchdetail)
def delete_batch_detail(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_detail.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchdetail not found")
    return crud_module.crud_batch_detail.remove(db=db, id=id)