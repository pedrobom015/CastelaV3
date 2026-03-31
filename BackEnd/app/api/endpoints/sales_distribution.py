from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sales_distribution", tags=["sales_distribution"])

@router.get("/", response_model=List[schemas_module.Salesdistribution])
def read_sales_distribution(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sales_distribution.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Salesdistribution)
def read_sales_distribution_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_distribution.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesdistribution not found")
    return obj

@router.post("/", response_model=schemas_module.Salesdistribution, status_code=status.HTTP_201_CREATED)
def create_sales_distribution(obj_in: schemas_module.SalesdistributionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sales_distribution.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Salesdistribution)
def update_sales_distribution(id: int, obj_in: schemas_module.SalesdistributionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_distribution.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesdistribution not found")
    return crud_module.crud_sales_distribution.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Salesdistribution)
def delete_sales_distribution(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sales_distribution.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Salesdistribution not found")
    return crud_module.crud_sales_distribution.remove(db=db, id=id)