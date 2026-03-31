from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/user_session", tags=["user_session"])

@router.get("/", response_model=List[schemas.UserSession])
def read_user_session(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.UserSession).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.UserSession)
def read_user_session_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserSession).filter(models.UserSession.session_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserSession not found")
    return obj

@router.post("/", response_model=schemas.UserSession, status_code=status.HTTP_201_CREATED)
def create_user_session(obj_in: schemas.UserSessionCreate, db: Session = Depends(get_db)):
    db_obj = models.UserSession(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.UserSession)
def update_user_session(id: int, obj_in: schemas.UserSessionUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.UserSession).filter(models.UserSession.session_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserSession not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.UserSession)
def delete_user_session(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserSession).filter(models.UserSession.session_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserSession not found")
    db.delete(obj)
    db.commit()
    return obj
