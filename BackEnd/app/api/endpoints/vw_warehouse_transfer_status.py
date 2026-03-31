from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_warehouse_transfer_status", tags=["vw_warehouse_transfer_status"])

@router.get("/", response_model=List[schemas_module.Vwwarehousetransferstatus])
def read_vw_warehouse_transfer_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_warehouse_transfer_status.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwwarehousetransferstatus)
def read_vw_warehouse_transfer_status_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_transfer_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehousetransferstatus not found")
    return obj

@router.post("/", response_model=schemas_module.Vwwarehousetransferstatus, status_code=status.HTTP_201_CREATED)
def create_vw_warehouse_transfer_status(obj_in: schemas_module.VwwarehousetransferstatusCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_warehouse_transfer_status.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwwarehousetransferstatus)
def update_vw_warehouse_transfer_status(id: int, obj_in: schemas_module.VwwarehousetransferstatusUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_transfer_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehousetransferstatus not found")
    return crud_module.crud_vw_warehouse_transfer_status.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwwarehousetransferstatus)
def delete_vw_warehouse_transfer_status(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_warehouse_transfer_status.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwwarehousetransferstatus not found")
    return crud_module.crud_vw_warehouse_transfer_status.remove(db=db, id=id)