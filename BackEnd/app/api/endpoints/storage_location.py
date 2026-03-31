from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/storage_location", tags=["storage_location"])

@router.get("/", response_model=List[schemas_module.Storagelocation])
def read_storage_location(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_storage_location.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Storagelocation)
def read_storage_location_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_storage_location.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Storagelocation not found")
    return obj

@router.post("/", response_model=schemas_module.Storagelocation, status_code=status.HTTP_201_CREATED)
def create_storage_location(obj_in: schemas_module.StoragelocationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_storage_location.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Storagelocation)
def update_storage_location(id: int, obj_in: schemas_module.StoragelocationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_storage_location.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Storagelocation not found")
    return crud_module.crud_storage_location.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Storagelocation)
def delete_storage_location(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_storage_location.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Storagelocation not found")
    return crud_module.crud_storage_location.remove(db=db, id=id)