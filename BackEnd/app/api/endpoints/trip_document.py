from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/trip_document", tags=["trip_document"])

@router.get("/", response_model=List[schemas_module.Tripdocument])
def read_trip_document(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_trip_document.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Tripdocument)
def read_trip_document_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripdocument not found")
    return obj

@router.post("/", response_model=schemas_module.Tripdocument, status_code=status.HTTP_201_CREATED)
def create_trip_document(obj_in: schemas_module.TripdocumentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_trip_document.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Tripdocument)
def update_trip_document(id: int, obj_in: schemas_module.TripdocumentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripdocument not found")
    return crud_module.crud_trip_document.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Tripdocument)
def delete_trip_document(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_trip_document.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tripdocument not found")
    return crud_module.crud_trip_document.remove(db=db, id=id)