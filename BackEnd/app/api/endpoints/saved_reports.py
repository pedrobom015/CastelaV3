from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/saved_reports", tags=["saved_reports"])

@router.get("/", response_model=List[schemas.SavedReports])
def read_saved_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.SavedReports).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.SavedReports)
def read_saved_reports_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.SavedReports).filter(models.SavedReports.report_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="SavedReports not found")
    return obj

@router.post("/", response_model=schemas.SavedReports, status_code=status.HTTP_201_CREATED)
def create_saved_reports(obj_in: schemas.SavedReportsCreate, db: Session = Depends(get_db)):
    db_obj = models.SavedReports(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.SavedReports)
def update_saved_reports(id: int, obj_in: schemas.SavedReportsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.SavedReports).filter(models.SavedReports.report_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="SavedReports not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.SavedReports)
def delete_saved_reports(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.SavedReports).filter(models.SavedReports.report_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="SavedReports not found")
    db.delete(obj)
    db.commit()
    return obj
