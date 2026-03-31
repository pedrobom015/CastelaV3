from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.schemas.missing_tables as schemas
import app.models.missing_tables as models

router = APIRouter(prefix="/time_blocks", tags=["time_blocks"])

@router.get("/", response_model=List[schemas.TimeBlocks])
def read_time_blocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.TimeBlocks).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.TimeBlocks)
def read_time_blocks_by_id(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.TimeBlocks).filter(models.TimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlocks not found")
    return obj

@router.post("/", response_model=schemas.TimeBlocks, status_code=status.HTTP_201_CREATED)
def create_time_blocks(obj_in: schemas.TimeBlocksCreate, db: Session = Depends(get_db)):
    db_obj = models.TimeBlocks(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=schemas.TimeBlocks)
def update_time_blocks(id: int, obj_in: schemas.TimeBlocksUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.TimeBlocks).filter(models.TimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlocks not found")
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{id}", response_model=schemas.TimeBlocks)
def delete_time_blocks(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.TimeBlocks).filter(models.TimeBlocks.time_block_id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="TimeBlocks not found")
    db.delete(obj)
    db.commit()
    return obj
