from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import SysUser
from schemas import CurrentUser
from core import get_current_user_from_token

# Type aliases para facilitar uso nas rotas
SessionDep = Depends(get_db)


async def get_current_user(
    current_user_data: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
) -> CurrentUser:
    """Dependency para obter usu rio atual autenticado"""
    user_id = current_user_data.get("id")
    user = db.query(SysUser).filter(SysUser.sys_user_id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usu rio n?o encontrado"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usu rio inativo"
        )
    
    return CurrentUser(
        sys_user_id=user.sys_user_id,
        username=user.username,
        email=user.email,
        is_superuser=user.is_superuser
    )


async def get_current_superuser(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Dependency para verificar se usu rio ‚ superuser"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a superusu rios"
        )
    return current_user


# Aliases para uso em rotas
UserDep = Depends(get_current_user)
SuperUserDep = Depends(get_current_superuser)
