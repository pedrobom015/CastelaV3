from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/specialty", tags=["specialty"])

@router.get("/", response_model=List[schemas_module.Specialty])
def read_specialty(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_specialty.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Specialty)
def read_specialty_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_specialty.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return obj

@router.post("/", response_model=schemas_module.Specialty, status_code=status.HTTP_201_CREATED)
def create_specialty(obj_in: schemas_module.SpecialtyCreate, db: Session = Depends(get_db)):
    return crud_module.crud_specialty.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Specialty)
def update_specialty(id: int, obj_in: schemas_module.SpecialtyUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_specialty.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return crud_module.crud_specialty.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Specialty)
def delete_specialty(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_specialty.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return crud_module.crud_specialty.remove(db=db, id=id)