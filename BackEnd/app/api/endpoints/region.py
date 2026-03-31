from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/region", tags=["region"])

@router.get("/", response_model=List[schemas_module.Region])
def read_region(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_region.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Region)
def read_region_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_region.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Region not found")
    return obj

@router.post("/", response_model=schemas_module.Region, status_code=status.HTTP_201_CREATED)
def create_region(obj_in: schemas_module.RegionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_region.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Region)
def update_region(id: int, obj_in: schemas_module.RegionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_region.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Region not found")
    return crud_module.crud_region.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Region)
def delete_region(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_region.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Region not found")
    return crud_module.crud_region.remove(db=db, id=id)