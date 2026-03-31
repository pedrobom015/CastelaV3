from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from database import get_db
from crud_booking import (
    crud_reservation_series, crud_reservation_instance,
    crud_blackout_series, crud_blackout_instance, crud_custom_attribute
)
from models_booking import ReservationResource, ReservationUser
from schemas_booking import (
    ReservationSeries, ReservationSeriesCreate, ReservationSeriesUpdate,
    ReservationInstance, ReservationInstanceCreate, ReservationInstanceUpdate,
    BlackoutSeries, BlackoutSeriesCreate, BlackoutSeriesUpdate,
    BlackoutInstance, BlackoutInstanceCreate,
    CustomAttribute, CustomAttributeCreate, CustomAttributeUpdate,
    ReservationResourceCreate, ReservationUserCreate
)

router = APIRouter(prefix="/booking", tags=["Booking - Reservations"])


# ==================== RESERVATIONS ====================

@router.get("/reservations/", response_model=List[ReservationSeries])
def list_reservations(
    skip: int = 0,
    limit: int = 100,
    status_id: Optional[int] = None,
    owner_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lista reservas com filtros."""
    query = db.query(crud_reservation_series.model)
    if status_id is not None:
        query = query.filter(crud_reservation_series.model.status_id == status_id)
    if owner_id is not None:
        query = query.filter(crud_reservation_series.model.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()


@router.get("/reservations/{series_id}", response_model=ReservationSeries)
def get_reservation(series_id: int, db: Session = Depends(get_db)):
    """Retorna uma reserva específica."""
    reservation = crud_reservation_series.get(db, series_id)
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reserva {series_id} não encontrada")
    return reservation


@router.post("/reservations/", response_model=ReservationSeries, status_code=201)
def create_reservation(
    reservation: ReservationSeriesCreate,
    resource_ids: Optional[List[int]] = None,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova reserva.
    - resource_ids: lista de IDs dos recursos a reservar
    """
    # Criar a série
    db_reservation = crud_reservation_series.create(db, obj_in=reservation)
    
    # Criar instância automaticamente
    ref_number = str(uuid.uuid4())[:8].upper()
    
    # Se não especificar datas, usa defaults
    # O frontend deve enviar start_date e end_date
    # Por ora, vamos criar a instância com os dados fornecidos
    
    return db_reservation


@router.put("/reservations/{series_id}", response_model=ReservationSeries)
def update_reservation(
    series_id: int,
    reservation: ReservationSeriesUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma reserva."""
    existing = crud_reservation_series.get(db, series_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Reserva {series_id} não encontrada")
    return crud_reservation_series.update(db, db_obj=existing, obj_in=reservation)


@router.delete("/reservations/{series_id}")
def delete_reservation(series_id: int, db: Session = Depends(get_db)):
    """Remove uma reserva (soft delete)."""
    existing = crud_reservation_series.get(db, series_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Reserva {series_id} não encontrada")
    crud_reservation_series.remove(db, id=series_id)
    return {"message": f"Reserva {series_id} removida", "deleted": True}


# ==================== RESERVATION INSTANCES ====================

@router.get("/reservation-instances/", response_model=List[ReservationInstance])
def list_reservation_instances(
    series_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista instâncias de reserva."""
    query = db.query(crud_reservation_instance.model)
    if series_id is not None:
        query = query.filter(crud_reservation_instance.model.series_id == series_id)
    if start_date is not None:
        query = query.filter(crud_reservation_instance.model.start_date >= start_date)
    if end_date is not None:
        query = query.filter(crud_reservation_instance.model.end_date <= end_date)
    return query.offset(skip).limit(limit).all()


@router.get("/reservation-instances/{instance_id}", response_model=ReservationInstance)
def get_reservation_instance(instance_id: int, db: Session = Depends(get_db)):
    """Retorna uma instância de reserva."""
    instance = crud_reservation_instance.get(db, instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Instância {instance_id} não encontrada")
    return instance


# ==================== RESERVATION RESOURCES ====================

@router.post("/reservations/{series_id}/resources/")
def add_resource_to_reservation(
    series_id: int,
    resource_id: int,
    resource_level_id: int = 1,
    db: Session = Depends(get_db)
):
    """Adiciona um recurso a uma reserva."""
    # Verificar se a reserva existe
    reservation = crud_reservation_series.get(db, series_id)
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reserva {series_id} não encontrada")
    
    # Verificar se o recurso já está na reserva
    existing = db.query(ReservationResource).filter(
        ReservationResource.series_id == series_id,
        ReservationResource.resource_id == resource_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Recurso já adicionado à reserva")
    
    # Adicionar o recurso
    res = ReservationResource(
        series_id=series_id,
        resource_id=resource_id,
        resource_level_id=resource_level_id
    )
    db.add(res)
    db.commit()
    
    return {"message": "Recurso adicionado à reserva", "series_id": series_id, "resource_id": resource_id}


@router.delete("/reservations/{series_id}/resources/{resource_id}")
def remove_resource_from_reservation(
    series_id: int,
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Remove um recurso de uma reserva."""
    existing = db.query(ReservationResource).filter(
        ReservationResource.series_id == series_id,
        ReservationResource.resource_id == resource_id
    ).first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Recurso não encontrado na reserva")
    
    db.delete(existing)
    db.commit()
    
    return {"message": "Recurso removido da reserva"}


# ==================== RESERVATION USERS ====================

@router.post("/reservations/{series_id}/participants/")
def add_participant(
    series_id: int,
    instance_id: int,
    sys_user_id: int,
    reservation_user_level: int = 1,
    db: Session = Depends(get_db)
):
    """Adiciona um participante a uma reserva."""
    # Verificar se a reserva existe
    reservation = crud_reservation_series.get(db, series_id)
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reserva {series_id} não encontrada")
    
    # Adicionar participante
    participant = ReservationUser(
        reservation_instance_id=instance_id,
        sys_user_id=sys_user_id,
        reservation_user_level=reservation_user_level
    )
    db.add(participant)
    db.commit()
    
    return {"message": "Participante adicionado", "sys_user_id": sys_user_id}


@router.delete("/reservations/{series_id}/participants/{sys_user_id}")
def remove_participant(
    series_id: int,
    instance_id: int,
    sys_user_id: int,
    db: Session = Depends(get_db)
):
    """Remove um participante de uma reserva."""
    existing = db.query(ReservationUser).filter(
        ReservationUser.reservation_instance_id == instance_id,
        ReservationUser.sys_user_id == sys_user_id
    ).first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Participante não encontrado")
    
    db.delete(existing)
    db.commit()
    
    return {"message": "Participante removido"}


# ==================== BLACKOUTS ====================

@router.get("/blackouts/", response_model=List[BlackoutSeries])
def list_blackouts(
    skip: int = 0,
    limit: int = 100,
    owner_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lista bloqueios de horário."""
    query = db.query(crud_blackout_series.model)
    if owner_id is not None:
        query = query.filter(crud_blackout_series.model.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()


@router.post("/blackouts/", response_model=BlackoutSeries, status_code=201)
def create_blackout(blackout: BlackoutSeriesCreate, db: Session = Depends(get_db)):
    """Cria um novo bloqueio de horário."""
    return crud_blackout_series.create(db, obj_in=blackout)


@router.delete("/blackouts/{blackout_id}")
def delete_blackout(blackout_id: int, db: Session = Depends(get_db)):
    """Remove um bloqueio."""
    existing = crud_blackout_series.get(db, blackout_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Bloqueio {blackout_id} não encontrado")
    crud_blackout_series.remove(db, id=blackout_id)
    return {"message": f"Bloqueio {blackout_id} removido", "deleted": True}


# ==================== CUSTOM ATTRIBUTES ====================

@router.get("/custom-attributes/", response_model=List[CustomAttribute])
def list_custom_attributes(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista campos personalizados."""
    query = db.query(crud_custom_attribute.model)
    if category:
        query = query.filter(crud_custom_attribute.model.category == category)
    return query.offset(skip).limit(limit).all()


@router.post("/custom-attributes/", response_model=CustomAttribute, status_code=201)
def create_custom_attribute(attr: CustomAttributeCreate, db: Session = Depends(get_db)):
    """Cria um novo campo personalizado."""
    return crud_custom_attribute.create(db, obj_in=attr)


@router.put("/custom-attributes/{attribute_id}", response_model=CustomAttribute)
def update_custom_attribute(
    attribute_id: int,
    attr: CustomAttributeUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um campo personalizado."""
    existing = crud_custom_attribute.get(db, attribute_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Atributo {attribute_id} não encontrado")
    return crud_custom_attribute.update(db, db_obj=existing, obj_in=attr)


@router.delete("/custom-attributes/{attribute_id}")
def delete_custom_attribute(attribute_id: int, db: Session = Depends(get_db)):
    """Remove um campo personalizado."""
    existing = crud_custom_attribute.get(db, attribute_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Atributo {attribute_id} não encontrado")
    crud_custom_attribute.remove(db, id=attribute_id)
    return {"message": f"Atributo {attribute_id} removido", "deleted": True}
