from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/age_addendum", tags=["age_addendum"])

@router.get("/", response_model=List[schemas_module.Ageaddendum])
def read_age_addendum(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_age_addendum.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Ageaddendum)
def read_age_addendum_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_age_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ageaddendum not found")
    return obj

@router.post("/", response_model=schemas_module.Ageaddendum, status_code=status.HTTP_201_CREATED)
def create_age_addendum(obj_in: schemas_module.AgeaddendumCreate, db: Session = Depends(get_db)):
    return crud_module.crud_age_addendum.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Ageaddendum)
def update_age_addendum(id: int, obj_in: schemas_module.AgeaddendumUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_age_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ageaddendum not found")
    return crud_module.crud_age_addendum.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Ageaddendum)
def delete_age_addendum(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_age_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ageaddendum not found")
    return crud_module.crud_age_addendum.remove(db=db, id=id)