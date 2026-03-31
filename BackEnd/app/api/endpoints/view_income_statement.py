from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/view_income_statement", tags=["view_income_statement"])

@router.get("/", response_model=List[schemas_module.Viewincomestatement])
def read_view_income_statement(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_view_income_statement.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Viewincomestatement)
def read_view_income_statement_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_income_statement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewincomestatement not found")
    return obj

@router.post("/", response_model=schemas_module.Viewincomestatement, status_code=status.HTTP_201_CREATED)
def create_view_income_statement(obj_in: schemas_module.ViewincomestatementCreate, db: Session = Depends(get_db)):
    return crud_module.crud_view_income_statement.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Viewincomestatement)
def update_view_income_statement(id: int, obj_in: schemas_module.ViewincomestatementUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_income_statement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewincomestatement not found")
    return crud_module.crud_view_income_statement.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Viewincomestatement)
def delete_view_income_statement(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_view_income_statement.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Viewincomestatement not found")
    return crud_module.crud_view_income_statement.remove(db=db, id=id)