from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/announcement_resources", tags=["announcement_resources"])

@router.get("/", response_model=List[schemas.AnnouncementResources])
def read_announcement_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AnnouncementResources).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.AnnouncementResources)
def read_announcement_resources_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementResources).filter(models.AnnouncementResources.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementResources not found")
    return obj

@router.post("/", response_model=schemas.AnnouncementResources, status_code=status.HTTP_201_CREATED)
def create_announcement_resources(obj_in: schemas.AnnouncementResourcesCreate, db: Session = Depends(get_db)):
    db_obj = models.AnnouncementResources(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.AnnouncementResources)
def update_announcement_resources(id: int, obj_in: schemas.AnnouncementResourcesUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementResources).filter(models.AnnouncementResources.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementResources not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.AnnouncementResources)
def delete_announcement_resources(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AnnouncementResources).filter(models.AnnouncementResources.announcement_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="AnnouncementResources not found")
    db.delete(obj)
    db.commit()
    return obj
