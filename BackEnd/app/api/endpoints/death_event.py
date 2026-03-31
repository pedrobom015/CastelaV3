from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/death_event", tags=["death_event"])

@router.get("/", response_model=List[schemas_module.Deathevent])
def read_death_event(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_death_event.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Deathevent)
def read_death_event_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_death_event.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Deathevent not found")
    return obj

@router.post("/", response_model=schemas_module.Deathevent, status_code=status.HTTP_201_CREATED)
def create_death_event(obj_in: schemas_module.DeatheventCreate, db: Session = Depends(get_db)):
    return crud_module.crud_death_event.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Deathevent)
def update_death_event(id: int, obj_in: schemas_module.DeatheventUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_death_event.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Deathevent not found")
    return crud_module.crud_death_event.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Deathevent)
def delete_death_event(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_death_event.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Deathevent not found")
    return crud_module.crud_death_event.remove(db=db, id=id)