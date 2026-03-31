from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/communication_channel", tags=["communication_channel"])

@router.get("/", response_model=List[schemas_module.Communicationchannel])
def read_communication_channel(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_communication_channel.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Communicationchannel)
def read_communication_channel_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_communication_channel.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Communicationchannel not found")
    return obj

@router.post("/", response_model=schemas_module.Communicationchannel, status_code=status.HTTP_201_CREATED)
def create_communication_channel(obj_in: schemas_module.CommunicationchannelCreate, db: Session = Depends(get_db)):
    return crud_module.crud_communication_channel.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Communicationchannel)
def update_communication_channel(id: int, obj_in: schemas_module.CommunicationchannelUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_communication_channel.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Communicationchannel not found")
    return crud_module.crud_communication_channel.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Communicationchannel)
def delete_communication_channel(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_communication_channel.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Communicationchannel not found")
    return crud_module.crud_communication_channel.remove(db=db, id=id)