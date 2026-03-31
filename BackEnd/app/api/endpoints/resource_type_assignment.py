from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/resource_type_assignment", tags=["resource_type_assignment"])

@router.get("/", response_model=List[schemas.ResourceTypeAssignment])
def read_resource_type_assignment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceTypeAssignment).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceTypeAssignment)
def read_resource_type_assignment_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypeAssignment).filter(models.ResourceTypeAssignment.assignment_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypeAssignment not found")
    return obj

@router.post("/", response_model=schemas.ResourceTypeAssignment, status_code=status.HTTP_201_CREATED)
def create_resource_type_assignment(obj_in: schemas.ResourceTypeAssignmentCreate, db: Session = Depends(get_db)):
    db_obj = models.ResourceTypeAssignment(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.ResourceTypeAssignment)
def update_resource_type_assignment(id: int, obj_in: schemas.ResourceTypeAssignmentUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypeAssignment).filter(models.ResourceTypeAssignment.assignment_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypeAssignment not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.ResourceTypeAssignment)
def delete_resource_type_assignment(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.ResourceTypeAssignment).filter(models.ResourceTypeAssignment.assignment_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="ResourceTypeAssignment not found")
    db.delete(obj)
    db.commit()
    return obj
