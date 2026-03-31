from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/subsidiary", tags=["subsidiary"])

@router.get("/", response_model=List[schemas_module.Subsidiary])
def read_subsidiary(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_subsidiary.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Subsidiary)
def read_subsidiary_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_subsidiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subsidiary not found")
    return obj

@router.post("/", response_model=schemas_module.Subsidiary, status_code=status.HTTP_201_CREATED)
def create_subsidiary(obj_in: schemas_module.SubsidiaryCreate, db: Session = Depends(get_db)):
    return crud_module.crud_subsidiary.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Subsidiary)
def update_subsidiary(id: int, obj_in: schemas_module.SubsidiaryUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_subsidiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subsidiary not found")
    return crud_module.crud_subsidiary.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Subsidiary)
def delete_subsidiary(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_subsidiary.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subsidiary not found")
    return crud_module.crud_subsidiary.remove(db=db, id=id)