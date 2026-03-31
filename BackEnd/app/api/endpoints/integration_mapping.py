from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/integration_mapping", tags=["integration_mapping"])

@router.get("/", response_model=List[schemas_module.Integrationmapping])
def read_integration_mapping(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_integration_mapping.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Integrationmapping)
def read_integration_mapping_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_mapping.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationmapping not found")
    return obj

@router.post("/", response_model=schemas_module.Integrationmapping, status_code=status.HTTP_201_CREATED)
def create_integration_mapping(obj_in: schemas_module.IntegrationmappingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_integration_mapping.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Integrationmapping)
def update_integration_mapping(id: int, obj_in: schemas_module.IntegrationmappingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_mapping.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationmapping not found")
    return crud_module.crud_integration_mapping.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Integrationmapping)
def delete_integration_mapping(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_integration_mapping.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Integrationmapping not found")
    return crud_module.crud_integration_mapping.remove(db=db, id=id)