from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/batch_tracking", tags=["batch_tracking"])

@router.get("/", response_model=List[schemas_module.Batchtracking])
def read_batch_tracking(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_batch_tracking.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Batchtracking)
def read_batch_tracking_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_tracking.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchtracking not found")
    return obj

@router.post("/", response_model=schemas_module.Batchtracking, status_code=status.HTTP_201_CREATED)
def create_batch_tracking(obj_in: schemas_module.BatchtrackingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_batch_tracking.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Batchtracking)
def update_batch_tracking(id: int, obj_in: schemas_module.BatchtrackingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_tracking.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchtracking not found")
    return crud_module.crud_batch_tracking.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Batchtracking)
def delete_batch_tracking(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_batch_tracking.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Batchtracking not found")
    return crud_module.crud_batch_tracking.remove(db=db, id=id)