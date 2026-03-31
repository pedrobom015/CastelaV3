from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_groups", tags=["resource_groups"])

@router.get("/", response_model=List[schemas.ResourceGroups])
def read_resource_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceGroups).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceGroups)
def read_resource_groups_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceGroups).filter(models.ResourceGroups.group_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceGroups not found")
    return obj

@router.post("/", response_model=schemas.ResourceGroups, status_code=status.HTTP_201_CREATED)
def create_resource_groups(obj_in: schemas.ResourceGroupsCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceGroups(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceGroups)
def update_resource_groups(id: int, obj_in: schemas.ResourceGroupsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceGroups).filter(models.ResourceGroups.group_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceGroups not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceGroups)
def delete_resource_groups(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceGroups).filter(models.ResourceGroups.group_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceGroups not found")
    db.delete(obj)
    db.commit()
    return obj
