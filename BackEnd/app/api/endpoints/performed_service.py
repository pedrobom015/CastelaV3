from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/performed_service", tags=["performed_service"])

@router.get("/", response_model=List[schemas_module.Performedservice])
def read_performed_service(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_performed_service.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Performedservice)
def read_performed_service_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_performed_service.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Performedservice not found")
    return obj

@router.post("/", response_model=schemas_module.Performedservice, status_code=status.HTTP_201_CREATED)
def create_performed_service(obj_in: schemas_module.PerformedserviceCreate, db: Session = Depends(get_db)):
    return crud_module.crud_performed_service.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Performedservice)
def update_performed_service(id: int, obj_in: schemas_module.PerformedserviceUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_performed_service.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Performedservice not found")
    return crud_module.crud_performed_service.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Performedservice)
def delete_performed_service(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_performed_service.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Performedservice not found")
    return crud_module.crud_performed_service.remove(db=db, id=id)