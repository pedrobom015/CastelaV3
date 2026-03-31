from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vehicle_daily_log", tags=["vehicle_daily_log"])

@router.get("/", response_model=List[schemas_module.Vehicledailylog])
def read_vehicle_daily_log(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_daily_log.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vehicledailylog)
def read_vehicle_daily_log_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_daily_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicledailylog not found")
    return obj

@router.post("/", response_model=schemas_module.Vehicledailylog, status_code=status.HTTP_201_CREATED)
def create_vehicle_daily_log(obj_in: schemas_module.VehicledailylogCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vehicle_daily_log.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vehicledailylog)
def update_vehicle_daily_log(id: int, obj_in: schemas_module.VehicledailylogUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_daily_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicledailylog not found")
    return crud_module.crud_vehicle_daily_log.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vehicledailylog)
def delete_vehicle_daily_log(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vehicle_daily_log.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicledailylog not found")
    return crud_module.crud_vehicle_daily_log.remove(db=db, id=id)