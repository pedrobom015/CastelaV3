from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/state", tags=["state"])

@router.get("/", response_model=List[schemas_module.State])
def read_state(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_state.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.State)
def read_state_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_state.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="State not found")
    return obj

@router.post("/", response_model=schemas_module.State, status_code=status.HTTP_201_CREATED)
def create_state(obj_in: schemas_module.StateCreate, db: Session = Depends(get_db)):
    return crud_module.crud_state.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.State)
def update_state(id: int, obj_in: schemas_module.StateUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_state.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="State not found")
    return crud_module.crud_state.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.State)
def delete_state(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_state.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="State not found")
    return crud_module.crud_state.remove(db=db, id=id)