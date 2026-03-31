from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/state_machine_transitions", tags=["state_machine_transitions"])

@router.get("/", response_model=List[schemas_module.Statemachinetransitions])
def read_state_machine_transitions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_state_machine_transitions.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Statemachinetransitions)
def read_state_machine_transitions_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_state_machine_transitions.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statemachinetransitions not found")
    return obj

@router.post("/", response_model=schemas_module.Statemachinetransitions, status_code=status.HTTP_201_CREATED)
def create_state_machine_transitions(obj_in: schemas_module.StatemachinetransitionsCreate, db: Session = Depends(get_db)):
    return crud_module.crud_state_machine_transitions.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Statemachinetransitions)
def update_state_machine_transitions(id: int, obj_in: schemas_module.StatemachinetransitionsUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_state_machine_transitions.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statemachinetransitions not found")
    return crud_module.crud_state_machine_transitions.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Statemachinetransitions)
def delete_state_machine_transitions(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_state_machine_transitions.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Statemachinetransitions not found")
    return crud_module.crud_state_machine_transitions.remove(db=db, id=id)