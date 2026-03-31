from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/custom_time_blocks", tags=["custom_time_blocks"])

@router.get("/", response_model=List[schemas.CustomTimeBlocks])
def read_custom_time_blocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.CustomTimeBlocks).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.CustomTimeBlocks)
def read_custom_time_blocks_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomTimeBlocks).filter(models.CustomTimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomTimeBlocks not found")
    return obj

@router.post("/", response_model=schemas.CustomTimeBlocks, status_code=status.HTTP_201_CREATED)
def create_custom_time_blocks(obj_in: schemas.CustomTimeBlocksCreate, db: Session = Depends(get_db)):
    db_obj = models.CustomTimeBlocks(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.CustomTimeBlocks)
def update_custom_time_blocks(id: int, obj_in: schemas.CustomTimeBlocksUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.CustomTimeBlocks).filter(models.CustomTimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomTimeBlocks not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.CustomTimeBlocks)
def delete_custom_time_blocks(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.CustomTimeBlocks).filter(models.CustomTimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="CustomTimeBlocks not found")
    db.delete(obj)
    db.commit()
    return obj
