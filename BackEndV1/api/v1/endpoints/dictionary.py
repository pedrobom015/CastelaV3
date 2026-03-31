from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional

from database import get_dict_db
from models import TableMapping as TableMappingModel, FieldMapping as FieldMappingModel
from schemas import (
    TableMapping, TableMappingCreate, TableMappingUpdate,
    FieldMapping, FieldMappingCreate, FieldMappingUpdate,
    FieldMappingWithTable
)

router = APIRouter(prefix="/dictionary", tags=["Dictionary"])


# ==================== TABLE MAPPING ====================

@router.get("/tables", response_model=List[TableMapping])
def list_tables(
    skip: int = 0,
    limit: int = 100,
    module: Optional[str] = None,
    migration_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_dict_db)
):
    query = db.query(TableMappingModel)
    
    if module:
        query = query.filter(TableMappingModel.module == module)
    if migration_status:
        query = query.filter(TableMappingModel.migration_status == migration_status)
    if search:
        query = query.filter(
            or_(
                TableMappingModel.table_name_new.ilike(f"%{search}%"),
                TableMappingModel.table_name_old.ilike(f"%{search}%"),
                TableMappingModel.description.ilike(f"%{search}%")
            )
        )
    
    return query.offset(skip).limit(limit).all()


@router.get("/tables/count")
def count_tables(
    module: Optional[str] = None,
    migration_status: Optional[str] = None,
    db: Session = Depends(get_dict_db)
):
    query = db.query(func.count(TableMappingModel.table_mapping_id))
    
    if module:
        query = query.filter(TableMappingModel.module == module)
    if migration_status:
        query = query.filter(TableMappingModel.migration_status == migration_status)
    
    return {"count": query.scalar()}


@router.get("/tables/{table_id}", response_model=TableMapping)
def get_table(table_id: int, db: Session = Depends(get_dict_db)):
    table = db.query(TableMappingModel).filter(TableMappingModel.table_mapping_id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Tabela não encontrada")
    return table


@router.post("/tables", response_model=TableMapping, status_code=status.HTTP_201_CREATED)
def create_table(table: TableMappingCreate, db: Session = Depends(get_dict_db)):
    existing = db.query(TableMappingModel).filter(
        TableMappingModel.table_name_new == table.table_name_new
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tabela já existe")
    
    db_obj = TableMappingModel(**table.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/tables/{table_id}", response_model=TableMapping)
def update_table(table_id: int, table: TableMappingUpdate, db: Session = Depends(get_dict_db)):
    existing = db.query(TableMappingModel).filter(TableMappingModel.table_mapping_id == table_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Tabela não encontrada")
    
    update_data = table.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing, field, value)
    
    db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/tables/{table_id}")
def delete_table(table_id: int, db: Session = Depends(get_dict_db)):
    existing = db.query(TableMappingModel).filter(TableMappingModel.table_mapping_id == table_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Tabela não encontrada")
    
    db.delete(existing)
    db.commit()
    return {"message": "Tabela removida", "deleted": True}


# ==================== FIELD MAPPING ====================

@router.get("/fields", response_model=List[FieldMapping])
def list_fields(
    skip: int = 0,
    limit: int = 100,
    table_name: Optional[str] = None,
    is_mapped: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_dict_db)
):
    query = db.query(FieldMappingModel)
    
    if table_name:
        query = query.filter(FieldMappingModel.table_name_new == table_name)
    if is_mapped is not None:
        query = query.filter(FieldMappingModel.is_mapped == is_mapped)
    if search:
        query = query.filter(
            or_(
                FieldMappingModel.field_name_new.ilike(f"%{search}%"),
                FieldMappingModel.field_name_old.ilike(f"%{search}%"),
                FieldMappingModel.description.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(FieldMappingModel.table_name_new, FieldMappingModel.field_name_new).offset(skip).limit(limit).all()


@router.get("/fields/count")
def count_fields(
    table_name: Optional[str] = None,
    is_mapped: Optional[int] = None,
    db: Session = Depends(get_dict_db)
):
    query = db.query(func.count(FieldMappingModel.field_mapping_id))
    
    if table_name:
        query = query.filter(FieldMappingModel.table_name_new == table_name)
    if is_mapped is not None:
        query = query.filter(FieldMappingModel.is_mapped == is_mapped)
    
    return {"count": query.scalar()}


@router.get("/fields/table/{table_name}", response_model=List[FieldMapping])
def get_fields_by_table(table_name: str, db: Session = Depends(get_dict_db)):
    fields = db.query(FieldMappingModel).filter(
        FieldMappingModel.table_name_new == table_name
    ).order_by(FieldMappingModel.field_name_new).all()
    return fields


@router.get("/fields/{field_id}", response_model=FieldMapping)
def get_field(field_id: int, db: Session = Depends(get_dict_db)):
    field = db.query(FieldMappingModel).filter(FieldMappingModel.field_mapping_id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Campo não encontrado")
    return field


@router.post("/fields", response_model=FieldMapping, status_code=status.HTTP_201_CREATED)
def create_field(field: FieldMappingCreate, db: Session = Depends(get_dict_db)):
    db_obj = FieldMappingModel(**field.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/fields/{field_id}", response_model=FieldMapping)
def update_field(field_id: int, field: FieldMappingUpdate, db: Session = Depends(get_dict_db)):
    existing = db.query(FieldMappingModel).filter(FieldMappingModel.field_mapping_id == field_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Campo não encontrado")
    
    update_data = field.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(existing, field_name, value)
    
    db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/fields/{field_id}")
def delete_field(field_id: int, db: Session = Depends(get_dict_db)):
    existing = db.query(FieldMappingModel).filter(FieldMappingModel.field_mapping_id == field_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Campo não encontrado")
    
    db.delete(existing)
    db.commit()
    return {"message": "Campo removido", "deleted": True}


@router.post("/fields/bulk")
def bulk_create_fields(fields: List[FieldMappingCreate], db: Session = Depends(get_dict_db)):
    created = []
    for field in fields:
        obj = FieldMappingModel(**field.model_dump())
        db.add(obj)
        created.append(obj)
    db.commit()
    for obj in created:
        db.refresh(obj)
    return {"created": len(created)}


@router.put("/fields/bulk-status")
def bulk_update_status(
    field_ids: List[int],
    is_mapped: int,
    mapping_notes: Optional[str] = None,
    db: Session = Depends(get_dict_db)
):
    fields = db.query(FieldMappingModel).filter(
        FieldMappingModel.field_mapping_id.in_(field_ids)
    ).all()
    
    for field in fields:
        field.is_mapped = is_mapped
        if mapping_notes:
            field.mapping_notes = mapping_notes
    
    db.commit()
    return {"updated": len(fields)}


# ==================== COMBINED VIEW ====================

@router.get("/fields-with-tables", response_model=List[FieldMappingWithTable])
def list_fields_with_tables(
    skip: int = 0,
    limit: int = 100,
    table_name: Optional[str] = None,
    is_mapped: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_dict_db)
):
    query = db.query(
        FieldMappingModel,
        TableMappingModel.module,
        TableMappingModel.migration_status,
        TableMappingModel.description
    ).outerjoin(
        TableMappingModel,
        FieldMappingModel.table_name_new == TableMappingModel.table_name_new
    )
    
    if table_name:
        query = query.filter(FieldMappingModel.table_name_new == table_name)
    if is_mapped is not None:
        query = query.filter(FieldMappingModel.is_mapped == is_mapped)
    if search:
        query = query.filter(
            or_(
                FieldMappingModel.field_name_new.ilike(f"%{search}%"),
                FieldMappingModel.field_name_old.ilike(f"%{search}%")
            )
        )
    
    results = query.offset(skip).limit(limit).all()
    
    return [
        FieldMappingWithTable(
            field_mapping_id=fm.field_mapping_id,
            table_name_new=fm.table_name_new,
            field_name_new=fm.field_name_new,
            field_type_new=fm.field_type_new,
            field_size_new=fm.field_size_new,
            field_precision_new=fm.field_precision_new,
            nullable_new=fm.nullable_new,
            default_value_new=fm.default_value_new,
            table_name_old=fm.table_name_old,
            field_name_old=fm.field_name_old,
            field_type_old=fm.field_type_old,
            field_size_old=fm.field_size_old,
            description=fm.description,
            context=fm.context,
            mapping_notes=fm.mapping_notes,
            is_mapped=fm.is_mapped,
            module=tbl_module,
            table_migration_status=tbl_status,
            table_description=tbl_desc
        )
        for fm, tbl_module, tbl_status, tbl_desc in results
    ]


# ==================== STATS / DASHBOARD ====================

@router.get("/stats")
def get_dictionary_stats(db: Session = Depends(get_dict_db)):
    total_tables = db.query(func.count(TableMappingModel.table_mapping_id)).scalar()
    total_fields = db.query(func.count(FieldMappingModel.field_mapping_id)).scalar()
    
    mapped_fields = db.query(func.count(FieldMappingModel.field_mapping_id)).filter(
        FieldMappingModel.is_mapped == 1
    ).scalar()
    
    reviewed_fields = db.query(func.count(FieldMappingModel.field_mapping_id)).filter(
        FieldMappingModel.is_mapped == 2
    ).scalar()
    
    pending_fields = db.query(func.count(FieldMappingModel.field_mapping_id)).filter(
        FieldMappingModel.is_mapped == 0
    ).scalar()
    
    tables_by_module = db.query(
        TableMappingModel.module,
        func.count(TableMappingModel.table_mapping_id)
    ).group_by(TableMappingModel.module).all()
    
    tables_by_status = db.query(
        TableMappingModel.migration_status,
        func.count(TableMappingModel.table_mapping_id)
    ).group_by(TableMappingModel.migration_status).all()
    
    return {
        "total_tables": total_tables,
        "total_fields": total_fields,
        "mapped_fields": mapped_fields,
        "reviewed_fields": reviewed_fields,
        "pending_fields": pending_fields,
        "tables_by_module": {k: v for k, v in tables_by_module if k},
        "tables_by_status": {k: v for k, v in tables_by_status if k}
    }


@router.get("/modules")
def get_modules(db: Session = Depends(get_dict_db)):
    modules = db.query(TableMappingModel.module).distinct().filter(
        TableMappingModel.module.isnot(None)
    ).all()
    return [m[0] for m in modules]


@router.get("/table-names")
def get_table_names(db: Session = Depends(get_dict_db)):
    tables = db.query(
        TableMappingModel.table_name_new,
        TableMappingModel.description,
        TableMappingModel.module
    ).all()
    return [{"name": t[0], "description": t[1], "module": t[2]} for t in tables]
