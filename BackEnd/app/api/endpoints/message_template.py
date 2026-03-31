from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/message_template", tags=["message_template"])

@router.get("/", response_model=List[schemas_module.Messagetemplate])
def read_message_template(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_message_template.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Messagetemplate)
def read_message_template_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_message_template.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Messagetemplate not found")
    return obj

@router.post("/", response_model=schemas_module.Messagetemplate, status_code=status.HTTP_201_CREATED)
def create_message_template(obj_in: schemas_module.MessagetemplateCreate, db: Session = Depends(get_db)):
    return crud_module.crud_message_template.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Messagetemplate)
def update_message_template(id: int, obj_in: schemas_module.MessagetemplateUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_message_template.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Messagetemplate not found")
    return crud_module.crud_message_template.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Messagetemplate)
def delete_message_template(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_message_template.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Messagetemplate not found")
    return crud_module.crud_message_template.remove(db=db, id=id)