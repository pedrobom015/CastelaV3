from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/quotas", tags=["quotas"])

@router.get("/", response_model=List[schemas.Quotas])
def read_quotas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Quotas).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Quotas)
def read_quotas_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Quotas).filter(models.Quotas.quota_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Quotas not found")
    return obj

@router.post("/", response_model=schemas.Quotas, status_code=status.HTTP_201_CREATED)
def create_quotas(obj_in: schemas.QuotasCreate, db: Session = Depends(get_db)):
    db_obj = models.Quotas(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Quotas)
def update_quotas(id: int, obj_in: schemas.QuotasUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Quotas).filter(models.Quotas.quota_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Quotas not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Quotas)
def delete_quotas(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Quotas).filter(models.Quotas.quota_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Quotas not found")
    db.delete(obj)
    db.commit()
    return obj
