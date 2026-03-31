from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/vw_reorder_recommendation", tags=["vw_reorder_recommendation"])

@router.get("/", response_model=List[schemas_module.Vwreorderrecommendation])
def read_vw_reorder_recommendation(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_vw_reorder_recommendation.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Vwreorderrecommendation)
def read_vw_reorder_recommendation_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_reorder_recommendation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwreorderrecommendation not found")
    return obj

@router.post("/", response_model=schemas_module.Vwreorderrecommendation, status_code=status.HTTP_201_CREATED)
def create_vw_reorder_recommendation(obj_in: schemas_module.VwreorderrecommendationCreate, db: Session = Depends(get_db)):
    return crud_module.crud_vw_reorder_recommendation.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Vwreorderrecommendation)
def update_vw_reorder_recommendation(id: int, obj_in: schemas_module.VwreorderrecommendationUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_reorder_recommendation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwreorderrecommendation not found")
    return crud_module.crud_vw_reorder_recommendation.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Vwreorderrecommendation)
def delete_vw_reorder_recommendation(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_vw_reorder_recommendation.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vwreorderrecommendation not found")
    return crud_module.crud_vw_reorder_recommendation.remove(db=db, id=id)