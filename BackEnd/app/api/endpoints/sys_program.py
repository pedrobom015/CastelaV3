from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_program", tags=["sys_program"])

@router.get("/", response_model=List[schemas_module.Sysprogram])
def read_sys_program(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_program.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Sysprogram)
def read_sys_program_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysprogram not found")
    return obj

@router.post("/", response_model=schemas_module.Sysprogram, status_code=status.HTTP_201_CREATED)
def create_sys_program(obj_in: schemas_module.SysprogramCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_program.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Sysprogram)
def update_sys_program(id: int, obj_in: schemas_module.SysprogramUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysprogram not found")
    return crud_module.crud_sys_program.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Sysprogram)
def delete_sys_program(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysprogram not found")
    return crud_module.crud_sys_program.remove(db=db, id=id)