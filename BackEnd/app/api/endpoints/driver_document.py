from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/driver_document", tags=["driver_document"])

@router.get("/", response_model=List[schemas_module.Driverdocument])
def read_driver_document(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_driver_document.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Driverdocument)
def read_driver_document_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driverdocument not found")
    return obj

@router.post("/", response_model=schemas_module.Driverdocument, status_code=status.HTTP_201_CREATED)
def create_driver_document(obj_in: schemas_module.DriverdocumentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_driver_document.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Driverdocument)
def update_driver_document(id: int, obj_in: schemas_module.DriverdocumentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driverdocument not found")
    return crud_module.crud_driver_document.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Driverdocument)
def delete_driver_document(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_driver_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Driverdocument not found")
    return crud_module.crud_driver_document.remove(db=db, id=id)