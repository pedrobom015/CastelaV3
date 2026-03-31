from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/terms_of_service", tags=["terms_of_service"])

@router.get("/", response_model=List[schemas.TermsOfService])
def read_terms_of_service(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.TermsOfService).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.TermsOfService)
def read_terms_of_service_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.TermsOfService).filter(models.TermsOfService.term_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TermsOfService not found")
    return obj

@router.post("/", response_model=schemas.TermsOfService, status_code=status.HTTP_201_CREATED)
def create_terms_of_service(obj_in: schemas.TermsOfServiceCreate, db: Session = Depends(get_db)):
    db_obj = models.TermsOfService(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.TermsOfService)
def update_terms_of_service(id: int, obj_in: schemas.TermsOfServiceUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.TermsOfService).filter(models.TermsOfService.term_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TermsOfService not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.TermsOfService)
def delete_terms_of_service(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.TermsOfService).filter(models.TermsOfService.term_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TermsOfService not found")
    db.delete(obj)
    db.commit()
    return obj
