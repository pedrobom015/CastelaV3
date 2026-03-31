from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/user_resource_permissions", tags=["user_resource_permissions"])

@router.get("/", response_model=List[schemas.UserResourcePermissions])
def read_user_resource_permissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.UserResourcePermissions).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.UserResourcePermissions)
def read_user_resource_permissions_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserResourcePermissions).filter(models.UserResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermissions not found")
    return obj

@router.post("/", response_model=schemas.UserResourcePermissions, status_code=status.HTTP_201_CREATED)
def create_user_resource_permissions(obj_in: schemas.UserResourcePermissionsCreate, db: Session = Depends(get_db)):
    db_obj = models.UserResourcePermissions(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.UserResourcePermissions)
def update_user_resource_permissions(id: int, obj_in: schemas.UserResourcePermissionsUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.UserResourcePermissions).filter(models.UserResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermissions not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.UserResourcePermissions)
def delete_user_resource_permissions(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.UserResourcePermissions).filter(models.UserResourcePermissions.permission_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="UserResourcePermissions not found")
    db.delete(obj)
    db.commit()
    return obj
