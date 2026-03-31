from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/sys_user_group", tags=["sys_user_group"])

@router.get("/", response_model=List[schemas_module.Sysusergroup])
def read_sys_user_group(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_sys_user_group.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Sysusergroup)
def read_sys_user_group_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_user_group.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysusergroup not found")
    return obj

@router.post("/", response_model=schemas_module.Sysusergroup, status_code=status.HTTP_201_CREATED)
def create_sys_user_group(obj_in: schemas_module.SysusergroupCreate, db: Session = Depends(get_db)):
    return crud_module.crud_sys_user_group.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Sysusergroup)
def update_sys_user_group(id: int, obj_in: schemas_module.SysusergroupUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_user_group.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysusergroup not found")
    return crud_module.crud_sys_user_group.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Sysusergroup)
def delete_sys_user_group(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_sys_user_group.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sysusergroup not found")
    return crud_module.crud_sys_user_group.remove(db=db, id=id)