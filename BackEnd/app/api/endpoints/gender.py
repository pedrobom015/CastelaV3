from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/gender", tags=["gender"])

@router.get("/", response_model=List[schemas_module.Gender])
def read_gender(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_gender.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Gender)
def read_gender_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_gender.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Gender not found")
    return obj

@router.post("/", response_model=schemas_module.Gender, status_code=status.HTTP_201_CREATED)
def create_gender(obj_in: schemas_module.GenderCreate, db: Session = Depends(get_db)):
    return crud_module.crud_gender.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Gender)
def update_gender(id: int, obj_in: schemas_module.GenderUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_gender.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Gender not found")
    return crud_module.crud_gender.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Gender)
def delete_gender(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_gender.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Gender not found")
    return crud_module.crud_gender.remove(db=db, id=id)