from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/report_definition", tags=["report_definition"])

@router.get("/", response_model=List[schemas_module.Reportdefinition])
def read_report_definition(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_report_definition.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Reportdefinition)
def read_report_definition_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_report_definition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reportdefinition not found")
    return obj

@router.post("/", response_model=schemas_module.Reportdefinition, status_code=status.HTTP_201_CREATED)
def create_report_definition(obj_in: schemas_module.ReportdefinitionCreate, db: Session = Depends(get_db)):
    return crud_module.crud_report_definition.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Reportdefinition)
def update_report_definition(id: int, obj_in: schemas_module.ReportdefinitionUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_report_definition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reportdefinition not found")
    return crud_module.crud_report_definition.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Reportdefinition)
def delete_report_definition(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_report_definition.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reportdefinition not found")
    return crud_module.crud_report_definition.remove(db=db, id=id)