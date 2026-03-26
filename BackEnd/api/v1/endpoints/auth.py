from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import SysUser
from schemas import LoginRequest, TokenResponse, SysUserCreate, SysUserResponse
from crud_base import CRUDBase
from core import (
    hash_password,
    verify_password,
    create_access_token,
)
from core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# CRUD para SysUser
user_crud = CRUDBase[SysUser, SysUserCreate, dict](SysUser)


@router.post("/register", response_model=SysUserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: SysUserCreate,
    db: Session = Depends(get_db)
):
    """Registra um novo usu\xa0rio"""
    # Verificar se usu\xa0rio j\xa0 existe
    existing_user = db.query(SysUser).filter(
        (SysUser.username == user_data.username) | (SysUser.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usu\xa0rio ou email j\xa0 existe"
        )

    # Hash da senha
    create_data = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
    }

    user = SysUser(**create_data)
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Realiza login e retorna token JWT"""
    # Buscar usu\xa0rio por username
    user = db.query(SysUser).filter(SysUser.username == credentials.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inv\xa0lidas"
        )

    # Verificar senha
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inv\xa0lidas"
        )

    # Verificar se usu\xa0rio est\xa0 ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usu\xa0rio inativo"
        )

    # Gerar token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.sys_user_id, "email": user.email},
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=SysUserResponse.from_orm(user)
    )
