from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/city", tags=["city"])

@router.get("/", response_model=List[schemas_module.City])
def read_city(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_city.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.City)
def read_city_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_city.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="City not found")
    return obj

@router.post("/", response_model=schemas_module.City, status_code=status.HTTP_201_CREATED)
def create_city(obj_in: schemas_module.CityCreate, db: Session = Depends(get_db)):
    return crud_module.crud_city.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.City)
def update_city(id: int, obj_in: schemas_module.CityUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_city.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="City not found")
    return crud_module.crud_city.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.City)
def delete_city(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_city.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="City not found")
    return crud_module.crud_city.remove(db=db, id=id)