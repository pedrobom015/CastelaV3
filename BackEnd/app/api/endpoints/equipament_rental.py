from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/equipament_rental", tags=["equipament_rental"])

@router.get("/", response_model=List[schemas_module.Equipamentrental])
def read_equipament_rental(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_equipament_rental.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Equipamentrental)
def read_equipament_rental_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_equipament_rental.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipamentrental not found")
    return obj

@router.post("/", response_model=schemas_module.Equipamentrental, status_code=status.HTTP_201_CREATED)
def create_equipament_rental(obj_in: schemas_module.EquipamentrentalCreate, db: Session = Depends(get_db)):
    return crud_module.crud_equipament_rental.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Equipamentrental)
def update_equipament_rental(id: int, obj_in: schemas_module.EquipamentrentalUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_equipament_rental.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipamentrental not found")
    return crud_module.crud_equipament_rental.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Equipamentrental)
def delete_equipament_rental(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_equipament_rental.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipamentrental not found")
    return crud_module.crud_equipament_rental.remove(db=db, id=id)