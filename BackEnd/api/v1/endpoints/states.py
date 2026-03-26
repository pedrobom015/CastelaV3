from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from crud import crud_state
from schemas import State, StateCreate, StateUpdate

router = APIRouter(prefix="/states", tags=["States"])


@router.get("/", response_model=List[State])
def list_states(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos os estados com paginação.
    - **skip**: número de registros a pular (para paginação)
    - **limit**: número máximo de registros por página
    """
    states = crud_state.get_multi(db, skip=skip, limit=limit)
    return states


@router.get("/all", response_model=List[State])
def list_all_states(db: Session = Depends(get_db)):
    """
    Lista todos os estados sem paginação (para dropdowns/selects).
    """
    states = crud_state.get_multi(db, skip=0, limit=10000)
    return states


@router.get("/{state_id}", response_model=State)
def get_state(state_id: int, db: Session = Depends(get_db)):
    """
    Retorna um estado específico pelo ID.
    - **state_id**: ID do estado a buscar
    """
    state = crud_state.get(db, state_id)
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado com ID {state_id} não encontrado"
        )
    return state


@router.post("/", response_model=State, status_code=status.HTTP_201_CREATED)
def create_state(state: StateCreate, db: Session = Depends(get_db)):
    """
    Cria um novo estado.
    - **name**: nome do estado (ex: São Paulo)
    - **uf**: UF do estado (ex: SP)
    - **codigo_ibge**: código IBGE (opcional)
    """
    return crud_state.create(db, obj_in=state)


@router.put("/{state_id}", response_model=State)
def update_state(
    state_id: int,
    state: StateUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um estado existente.
    - **state_id**: ID do estado a atualizar
    - Campos opcionais: name, uf, codigo_ibge
    """
    existing_state = crud_state.get(db, state_id)
    if not existing_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado com ID {state_id} não encontrado"
        )
    return crud_state.update(db, db_obj=existing_state, obj_in=state)


@router.delete("/{state_id}", status_code=status.HTTP_200_OK)
def delete_state(state_id: int, db: Session = Depends(get_db)):
    """
    Remove um estado (soft delete).
    - **state_id**: ID do estado a remover
    """
    existing_state = crud_state.get(db, state_id)
    if not existing_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado com ID {state_id} não encontrado"
        )
    crud_state.remove(db, id=state_id)
    return {"message": f"Estado {state_id} removido com sucesso", "deleted": True}


@router.get("/search/", response_model=List[State])
def search_states(
    q: str = "",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Busca estados por nome ou UF.
    - **q**: termo de busca (busca em name e uf)
    """
    if not q:
        return crud_state.get_multi(db, skip=skip, limit=limit)

    states = db.query(crud_state.model).filter(
        (crud_state.model.name.ilike(f"%{q}%")) |
        (crud_state.model.uf.ilike(f"%{q}%"))
    ).offset(skip).limit(limit).all()
    return states


@router.get("/by-uf/{uf}", response_model=State)
def get_state_by_uf(uf: str, db: Session = Depends(get_db)):
    """
    Retorna um estado pelo UF.
    - **uf**: UF do estado (ex: SP, RJ, MG)
    """
    state = db.query(crud_state.model).filter(
        crud_state.model.uf == uf.upper()
    ).first()
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado com UF {uf} não encontrado"
        )
    return state