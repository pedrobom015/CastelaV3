from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/reservation_color_rules", tags=["reservation_color_rules"])

@router.get("/", response_model=List[schemas.ReservationColorRules])
def read_reservation_color_rules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReservationColorRules).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ReservationColorRules)
def read_reservation_color_rules_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationColorRules).filter(models.ReservationColorRules.rule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationColorRules not found")
    return obj

@router.post("/", response_model=schemas.ReservationColorRules, status_code=status.HTTP_201_CREATED)
def create_reservation_color_rules(obj_in: schemas.ReservationColorRulesCreate, db: Session = Depends(get_db)):
    db_obj = models.ReservationColorRules(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ReservationColorRules)
def update_reservation_color_rules(id: int, obj_in: schemas.ReservationColorRulesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationColorRules).filter(models.ReservationColorRules.rule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationColorRules not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ReservationColorRules)
def delete_reservation_color_rules(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ReservationColorRules).filter(models.ReservationColorRules.rule_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ReservationColorRules not found")
    db.delete(obj)
    db.commit()
    return obj
