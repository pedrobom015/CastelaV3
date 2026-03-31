from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/ordpgrc", tags=["ordpgrc"])

@router.get("/", response_model=List[schemas_module.Ordpgrc])
def read_ordpgrc(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_ordpgrc.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Ordpgrc)
def read_ordpgrc_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_ordpgrc.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ordpgrc not found")
    return obj

@router.post("/", response_model=schemas_module.Ordpgrc, status_code=status.HTTP_201_CREATED)
def create_ordpgrc(obj_in: schemas_module.OrdpgrcCreate, db: Session = Depends(get_db)):
    return crud_module.crud_ordpgrc.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Ordpgrc)
def update_ordpgrc(id: int, obj_in: schemas_module.OrdpgrcUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_ordpgrc.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ordpgrc not found")
    return crud_module.crud_ordpgrc.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Ordpgrc)
def delete_ordpgrc(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_ordpgrc.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ordpgrc not found")
    return crud_module.crud_ordpgrc.remove(db=db, id=id)