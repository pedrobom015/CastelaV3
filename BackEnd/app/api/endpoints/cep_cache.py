from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/cep_cache", tags=["cep_cache"])

@router.get("/", response_model=List[schemas_module.Cepcache])
def read_cep_cache(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_cep_cache.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Cepcache)
def read_cep_cache_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_cep_cache.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cepcache not found")
    return obj

@router.post("/", response_model=schemas_module.Cepcache, status_code=status.HTTP_201_CREATED)
def create_cep_cache(obj_in: schemas_module.CepcacheCreate, db: Session = Depends(get_db)):
    return crud_module.crud_cep_cache.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Cepcache)
def update_cep_cache(id: int, obj_in: schemas_module.CepcacheUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_cep_cache.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cepcache not found")
    return crud_module.crud_cep_cache.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Cepcache)
def delete_cep_cache(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_cep_cache.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cepcache not found")
    return crud_module.crud_cep_cache.remove(db=db, id=id)