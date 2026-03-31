from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/medical_foward", tags=["medical_foward"])

@router.get("/", response_model=List[schemas_module.Medicalfoward])
def read_medical_foward(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_medical_foward.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Medicalfoward)
def read_medical_foward_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_medical_foward.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medicalfoward not found")
    return obj

@router.post("/", response_model=schemas_module.Medicalfoward, status_code=status.HTTP_201_CREATED)
def create_medical_foward(obj_in: schemas_module.MedicalfowardCreate, db: Session = Depends(get_db)):
    return crud_module.crud_medical_foward.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Medicalfoward)
def update_medical_foward(id: int, obj_in: schemas_module.MedicalfowardUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_medical_foward.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medicalfoward not found")
    return crud_module.crud_medical_foward.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Medicalfoward)
def delete_medical_foward(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_medical_foward.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medicalfoward not found")
    return crud_module.crud_medical_foward.remove(db=db, id=id)