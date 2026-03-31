from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
import app.crud.domain_erp as crud_module
import app.schemas.domain_erp as schemas_module

router = APIRouter(prefix="/goods_receipt", tags=["goods_receipt"])

@router.get("/", response_model=List[schemas_module.Goodsreceipt])
def read_goods_receipt(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_module.crud_goods_receipt.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas_module.Goodsreceipt)
def read_goods_receipt_by_id(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_goods_receipt.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Goodsreceipt not found")
    return obj

@router.post("/", response_model=schemas_module.Goodsreceipt, status_code=status.HTTP_201_CREATED)
def create_goods_receipt(obj_in: schemas_module.GoodsreceiptCreate, db: Session = Depends(get_db)):
    return crud_module.crud_goods_receipt.create(db=db, obj_in=obj_in)

@router.put("/{id}", response_model=schemas_module.Goodsreceipt)
def update_goods_receipt(id: int, obj_in: schemas_module.GoodsreceiptUpdate, db: Session = Depends(get_db)):
    obj = crud_module.crud_goods_receipt.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Goodsreceipt not found")
    return crud_module.crud_goods_receipt.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/{id}", response_model=schemas_module.Goodsreceipt)
def delete_goods_receipt(id: int, db: Session = Depends(get_db)):
    obj = crud_module.crud_goods_receipt.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Goodsreceipt not found")
    return crud_module.crud_goods_receipt.remove(db=db, id=id)