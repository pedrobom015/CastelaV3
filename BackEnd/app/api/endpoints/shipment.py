from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/shipment", tags=["shipment"])

@router.get("/", response_model=List[schemas_module.Shipment])
def read_shipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_shipment.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Shipment)
def read_shipment_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_shipment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return obj

@router.post("/", response_model=schemas_module.Shipment, status_code=status.HTTP_201_CREATED)
def create_shipment(obj_in: schemas_module.ShipmentCreate, db: Session = Depends(get_db)):
    return crud_module.crud_shipment.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Shipment)
def update_shipment(id: int, obj_in: schemas_module.ShipmentUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_shipment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return crud_module.crud_shipment.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Shipment)
def delete_shipment(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_shipment.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return crud_module.crud_shipment.remove(db=db, id=id)