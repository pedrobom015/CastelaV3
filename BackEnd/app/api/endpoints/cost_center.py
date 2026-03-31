from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/cost_center", tags=["cost_center"])

@router.get("/", response_model=List[schemas_module.Costcenter])
def read_cost_center(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_cost_center.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Costcenter)
def read_cost_center_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_cost_center.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Costcenter not found")
    return obj

@router.post("/", response_model=schemas_module.Costcenter, status_code=status.HTTP_201_CREATED)
def create_cost_center(obj_in: schemas_module.CostcenterCreate, db: Session = Depends(get_db)):
    return crud_module.crud_cost_center.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Costcenter)
def update_cost_center(id: int, obj_in: schemas_module.CostcenterUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_cost_center.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Costcenter not found")
    return crud_module.crud_cost_center.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Costcenter)
def delete_cost_center(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_cost_center.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Costcenter not found")
    return crud_module.crud_cost_center.remove(db=db, id=id)