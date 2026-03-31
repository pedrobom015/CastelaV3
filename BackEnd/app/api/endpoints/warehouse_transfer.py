from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/warehouse_transfer", tags=["warehouse_transfer"])

@router.get("/", response_model=List[schemas_module.Warehousetransfer])
def read_warehouse_transfer(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_warehouse_transfer.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Warehousetransfer)
def read_warehouse_transfer_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse_transfer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehousetransfer not found")
    return obj

@router.post("/", response_model=schemas_module.Warehousetransfer, status_code=status.HTTP_201_CREATED)
def create_warehouse_transfer(obj_in: schemas_module.WarehousetransferCreate, db: Session = Depends(get_db)):
    return crud_module.crud_warehouse_transfer.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Warehousetransfer)
def update_warehouse_transfer(id: int, obj_in: schemas_module.WarehousetransferUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse_transfer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehousetransfer not found")
    return crud_module.crud_warehouse_transfer.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Warehousetransfer)
def delete_warehouse_transfer(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_warehouse_transfer.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehousetransfer not found")
    return crud_module.crud_warehouse_transfer.remove(db=db, id=id)