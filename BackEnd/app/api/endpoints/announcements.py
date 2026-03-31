from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.get("/", response_model=List[schemas.Announcements])
def read_announcements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Announcements).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.Announcements)
def read_announcements_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Announcements).filter(models.Announcements.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Announcements not found")
    return obj

@router.post("/", response_model=schemas.Announcements, status_code=status.HTTP_201_CREATED)
def create_announcements(obj_in: schemas.AnnouncementsCreate, db: Session = Depends(get_db)):
    db_obj = models.Announcements(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.Announcements)
def update_announcements(id: int, obj_in: schemas.AnnouncementsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Announcements).filter(models.Announcements.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Announcements not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.Announcements)
def delete_announcements(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Announcements).filter(models.Announcements.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Announcements not found")
    db.delete(obj)
    db.commit()
    return obj
