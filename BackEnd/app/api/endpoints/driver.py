from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/driver", tags=["driver"])

@router.get("/", response_model=List[schemas_module.Driver])
def read_driver(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_driver.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Driver)
def read_driver_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driver not found")
    return obj

@router.post("/", response_model=schemas_module.Driver, status_code=status.HTTP_201_CREATED)
def create_driver(obj_in: schemas_module.DriverCreate, db: Session = Depends(get_db)):
    return crud_module.crud_driver.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Driver)
def update_driver(id: int, obj_in: schemas_module.DriverUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driver not found")
    return crud_module.crud_driver.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Driver)
def delete_driver(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driver not found")
    return crud_module.crud_driver.remove(db=db, id=id)