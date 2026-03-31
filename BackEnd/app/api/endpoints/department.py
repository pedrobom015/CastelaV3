from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/department", tags=["department"])

@router.get("/", response_model=List[schemas_module.Department])
def read_department(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_department.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Department)
def read_department_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_department.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")
    return obj

@router.post("/", response_model=schemas_module.Department, status_code=status.HTTP_201_CREATED)
def create_department(obj_in: schemas_module.DepartmentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_department.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Department)
def update_department(id: int, obj_in: schemas_module.DepartmentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_department.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")
    return crud_module.crud_department.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Department)
def delete_department(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_department.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")
    return crud_module.crud_department.remove(db=db, id=id)