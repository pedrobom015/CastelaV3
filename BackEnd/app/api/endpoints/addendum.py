from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/addendum", tags=["addendum"])

@router.get("/", response_model=List[schemas_module.Addendum])
def read_addendum(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_addendum.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Addendum)
def read_addendum_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addendum not found")
    return obj

@router.post("/", response_model=schemas_module.Addendum, status_code=status.HTTP_201_CREATED)
def create_addendum(obj_in: schemas_module.AddendumCreate, db: Session = Depends(get_db)):
    return crud_module.crud_addendum.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Addendum)
def update_addendum(id: int, obj_in: schemas_module.AddendumUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addendum not found")
    return crud_module.crud_addendum.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Addendum)
def delete_addendum(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_addendum.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Addendum not found")
    return crud_module.crud_addendum.remove(db=db, id=id)