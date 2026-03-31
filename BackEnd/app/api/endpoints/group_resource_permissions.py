from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/group_resource_permissions", tags=["group_resource_permissions"])

@router.get("/", response_model=List[schemas.GroupResourcePermissions])
def read_group_resource_permissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.GroupResourcePermissions).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.GroupResourcePermissions)
def read_group_resource_permissions_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.GroupResourcePermissions).filter(models.GroupResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="GroupResourcePermissions not found")
    return obj

@router.post("/", response_model=schemas.GroupResourcePermissions, status_code=status.HTTP_201_CREATED)
def create_group_resource_permissions(obj_in: schemas.GroupResourcePermissionsCreate, db: Session = Depends(get_db)):
    db_obj = models.GroupResourcePermissions(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.GroupResourcePermissions)
def update_group_resource_permissions(id: int, obj_in: schemas.GroupResourcePermissionsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.GroupResourcePermissions).filter(models.GroupResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="GroupResourcePermissions not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.GroupResourcePermissions)
def delete_group_resource_permissions(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.GroupResourcePermissions).filter(models.GroupResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="GroupResourcePermissions not found")
    db.delete(obj)
    db.commit()
    return obj
