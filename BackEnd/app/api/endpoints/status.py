from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/status", tags=["status"])

@router.get("/", response_model=List[schemas_module.Status])
def read_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Status)
def read_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Status not found")
    return obj

@router.post("/", response_model=schemas_module.Status, status_code=status.HTTP_201_CREATED)
def create_status(obj_in: schemas_module.StatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Status)
def update_status(id: int, obj_in: schemas_module.StatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Status not found")
    return crud_module.crud_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Status)
def delete_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Status not found")
    return crud_module.crud_status.remove(db=db, id=id)