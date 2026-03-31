from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/announcement_groups", tags=["announcement_groups"])

@router.get("/", response_model=List[schemas.AnnouncementGroups])
def read_announcement_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AnnouncementGroups).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.AnnouncementGroups)
def read_announcement_groups_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementGroups).filter(models.AnnouncementGroups.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementGroups not found")
    return obj

@router.post("/", response_model=schemas.AnnouncementGroups, status_code=status.HTTP_201_CREATED)
def create_announcement_groups(obj_in: schemas.AnnouncementGroupsCreate, db: Session = Depends(get_db)):
    db_obj = models.AnnouncementGroups(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.AnnouncementGroups)
def update_announcement_groups(id: int, obj_in: schemas.AnnouncementGroupsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementGroups).filter(models.AnnouncementGroups.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementGroups not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.AnnouncementGroups)
def delete_announcement_groups(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementGroups).filter(models.AnnouncementGroups.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementGroups not found")
    db.delete(obj)
    db.commit()
    return obj
