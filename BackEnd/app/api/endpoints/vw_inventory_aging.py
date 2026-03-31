from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_inventory_aging", tags=["vw_inventory_aging"])

@router.get("/", response_model=List[schemas_module.Vwinventoryaging])
def read_vw_inventory_aging(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_inventory_aging.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwinventoryaging)
def read_vw_inventory_aging_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryaging not found")
    return obj

@router.post("/", response_model=schemas_module.Vwinventoryaging, status_code=status.HTTP_201_CREATED)
def create_vw_inventory_aging(obj_in: schemas_module.VwinventoryagingCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_inventory_aging.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwinventoryaging)
def update_vw_inventory_aging(id: int, obj_in: schemas_module.VwinventoryagingUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryaging not found")
    return crud_module.crud_vw_inventory_aging.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwinventoryaging)
def delete_vw_inventory_aging(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_inventory_aging.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwinventoryaging not found")
    return crud_module.crud_vw_inventory_aging.remove(db=db, id=id)