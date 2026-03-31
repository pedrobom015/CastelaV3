from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_group_program", tags=["sys_group_program"])

@router.get("/", response_model=List[schemas_module.Sysgroupprogram])
def read_sys_group_program(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_group_program.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Sysgroupprogram)
def read_sys_group_program_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_group_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysgroupprogram not found")
    return obj

@router.post("/", response_model=schemas_module.Sysgroupprogram, status_code=status.HTTP_201_CREATED)
def create_sys_group_program(obj_in: schemas_module.SysgroupprogramCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_group_program.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Sysgroupprogram)
def update_sys_group_program(id: int, obj_in: schemas_module.SysgroupprogramUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_group_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysgroupprogram not found")
    return crud_module.crud_sys_group_program.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Sysgroupprogram)
def delete_sys_group_program(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_group_program.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysgroupprogram not found")
    return crud_module.crud_sys_group_program.remove(db=db, id=id)