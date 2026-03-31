from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/integration_setting", tags=["integration_setting"])

@router.get("/", response_model=List[schemas_module.Integrationsetting])
def read_integration_setting(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_integration_setting.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Integrationsetting)
def read_integration_setting_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationsetting not found")
    return obj

@router.post("/", response_model=schemas_module.Integrationsetting, status_code=status.HTTP_201_CREATED)
def create_integration_setting(obj_in: schemas_module.IntegrationsettingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_integration_setting.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Integrationsetting)
def update_integration_setting(id: int, obj_in: schemas_module.IntegrationsettingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationsetting not found")
    return crud_module.crud_integration_setting.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Integrationsetting)
def delete_integration_setting(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_setting.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationsetting not found")
    return crud_module.crud_integration_setting.remove(db=db, id=id)