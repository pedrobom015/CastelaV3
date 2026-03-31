---
name: backend-dev-guidelines
description: Guia completo de desenvolvimento backend para o projeto Castela/Presserv. Use ao criar rotas, modelos SQLAlchemy, schemas Pydantic, classes CRUD, endpoints FastAPI ou ao trabalhar com FastAPI, Pydantic v2, SQLAlchemy e MySQL 8. Cobre arquitetura em camadas (models → schemas → CRUD → endpoints), pool de conexões, validação, paginação, soft delete, naming conventions e anti-patterns. Projeto previsto para ~180 tabelas.
---

# Backend Development Guidelines — Castela/Presserv

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|-----------|-----------|-------|
| Framework | FastAPI | 0.115.x |
| ORM | SQLAlchemy | 2.x |
| Validação | Pydantic | v2 |
| Banco de Dados | MySQL | 8.x |
| Driver DB | pymysql | - |
| Servidor | Uvicorn | 0.22.x |
| Runtime | Python | 3.11+ |

---

## Quando Usar Esta Skill

Ativa automaticamente ao trabalhar em:
- Criar ou modificar endpoints FastAPI em `api/v1/endpoints/`
- Criar modelos SQLAlchemy em `models.py`
- Criar schemas Pydantic em `schemas.py`
- Criar classes CRUD em `crud.py`
- Operações de banco de dados MySQL
- Paginação e listagem de registros
- Qualquer nova tabela do sistema

---

## Arquitetura em Camadas

```
HTTP Request
    ↓
main.py (FastAPI app + routers)
    ↓
api/v1/endpoints/ (rotas FastAPI)
    ↓
crud.py (instâncias CRUDBase)
    ↓
crud_base.py (CRUDBase genérico)
    ↓
models.py (SQLAlchemy models)
    ↓
MySQL 8.x (pymysql driver)
```

**Princípio:** Cada camada tem UMA responsabilidade.
- **models.py** = definição de tabelas (SQLAlchemy)
- **schemas.py** = validação de dados (Pydantic)
- **crud.py** = operações de banco (instâncias CRUDBase)
- **endpoints/** = rotas HTTP

---

## Estrutura de Arquivos

```
BackEnd/
├── main.py                      # FastAPI app + startup
├── database.py                  # Engine, Session, Base
├── models.py                    # SQLAlchemy models (TODAS as tabelas)
├── schemas.py                    # Pydantic schemas (Create/Update/Response)
├── crud.py                      # Instâncias CRUDBase por tabela
├── crud_base.py                 # Classe CRUDBase genérica
├── utils.py                     # Utilitários
├── core/
│   ├── config.py                # Configurações (Settings)
│   ├── security.py              # Hash JWT
│   └── logger.py                # Logging
├── api/
│   └── v1/
│       ├── __init__.py          # api_router
│       ├── dependencies.py      # Depends reusable
│       └── endpoints/
│           ├── auth.py          # Autenticação
│           └── {tabela}.py     # NOVOS: endpoint por tabela
├── middlewares/
│   ├── cors.py
│   ├── error_handler.py
│   └── __init__.py
├── alembic/
│   ├── versions/                # Migrações
│   └── env.py
├── requirements.txt
└── .env                         # Variáveis de ambiente
```

---

## Quick Start — Nova Tabela Completa (4 passos)

### Passo 1: SQL (verificar tabela existe no MySQL)
```sql
CREATE TABLE IF NOT EXISTS minha_tabela (
    minha_tabela_id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);
```

### Passo 2: Model (adicionar em `models.py`)
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

class MinhaTabela(Base):
    __tablename__ = "minha_tabela"
    
    minha_tabela_id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(255), nullable=True)
    ativo = Column(Boolean, default=True)
    
    # AuditMixin fields (obrigatórios em todas as tabelas)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    deleted_by = Column(Integer, nullable=True)
```

### Passo 3: Schema (adicionar em `schemas.py`)
```python
from pydantic import BaseModel, ConfigConfig
from datetime import datetime
from typing import Optional

class MinhaTabelaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class MinhaTabelaCreate(MinhaTabelaBase):
    pass

class MinhaTabelaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None

class MinhaTabela(MinhaTabelaBase):
    minha_tabela_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
```

### Passo 4: CRUD + Endpoint (adicionar em `crud.py` e criar arquivo)
```python
# crud.py
from crud_base import CRUDBase
from models import MinhaTabela
from schemas import MinhaTabelaCreate, MinhaTabelaUpdate

crud_minha_tabela = CRUDBase[MinhaTabela, MinhaTabelaCreate, MinhaTabelaUpdate](MinhaTabela)
```

```python
# api/v1/endpoints/minha_tabela.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from crud import crud_minha_tabela
from schemas import MinhaTabela, MinhaTabelaCreate, MinhaTabelaUpdate

router = APIRouter(prefix="/minha-tabela", tags=["MinhaTabela"])

@router.get("/", response_model=List[MinhaTabela])
def list_minha_tabela(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_minha_tabela.get_multi(db, skip=skip, limit=limit)

@router.get("/{minha_tabela_id}", response_model=MinhaTabela)
def get_minha_tabela(minha_tabela_id: int, db: Session = Depends(get_db)):
    return crud_minha_tabela.get(db, minha_tabela_id)

@router.post("/", response_model=MinhaTabela, status_code=201)
def create_minha_tabela(item: MinhaTabelaCreate, db: Session = Depends(get_db)):
    return crud_minha_tabela.create(db, obj_in=item)

@router.put("/{minha_tabela_id}", response_model=MinhaTabela)
def update_minha_tabela(minha_tabela_id: int, item: MinhaTabelaUpdate, db: Session = Depends(get_db)):
    existing = crud_minha_tabela.get(db, minha_tabela_id)
    return crud_minha_tabela.update(db, db_obj=existing, obj_in=item)

@router.delete("/{minha_tabela_id}")
def delete_minha_tabela(minha_tabela_id: int, db: Session = Depends(get_db)):
    return crud_minha_tabela.remove(db, id=minha_tabela_id)
```

---

## Convenções de Nomenclatura

| Elemento | Padrão | Exemplo |
|---------|--------|---------|
| Tabela MySQL | snake_case | `minha_tabela` |
| Primary Key | `{tabela}_id` | `minha_tabela_id` |
| Modelo SQLAlchemy | PascalCase | `MinhaTabela` |
| Schema Base | `{Nome}Base` | `MinhaTabelaBase` |
| Schema Create | `{Nome}Create` | `MinhaTabelaCreate` |
| Schema Update | `{Nome}Update` | `MinhaTabelaUpdate` |
| Schema Response | `{Nome}` | `MinhaTabela` |
| Variável CRUD | `crud_{snake}` | `crud_minha_tabela` |
| Router | snake_case | `/minha-tabela` |
| Campo FK | `{tabela}_id` | `estado_id` |

---

## Campos Obrigatórios em Todas as Tabelas

Todas as tabelas devem ter estes campos de auditoria:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| `{tabela}_id` | INT | ✅ | Primary Key auto increment |
| `created_at` | DATETIME | ✅ | Data de criação |
| `updated_at` | DATETIME | ✅ | Data de última atualização |
| `deleted_at` | DATETIME | ✅ | Soft delete (NULL = ativo) |
| `created_by` | INT | ⚫ | Usuário que criou |
| `updated_by` | INT | ⚫ | Usuário que alterou |
| `deleted_by` | INT | ⚫ | Usuário que deleteu |

> ⚫ Opcional, mas recomendado para auditoria.

---

## CRUDBase — Métodos Disponíveis

```python
crud = CRUDBase[Model, CreateSchema, UpdateSchema](Model)

# READ
crud.get(db, id)                    # Retorna UM registro por ID (ignora deletados)
crud.get_multi(db, skip=0, limit=100)  # Retorna LISTA com paginação (ignora deletados)

# CREATE
crud.create(db, obj_in=schema)       # Cria novo registro

# UPDATE
crud.update(db, db_obj=model, obj_in=schema)  # Atualiza registro existente

# DELETE (SOFT DELETE)
crud.remove(db, id)                  # Define deleted_at = agora
```

### Soft Delete Automático
O `CRUDBase` automaticamente:
- `get()` → ignora registros com `deleted_at != NULL`
- `get_multi()` → ignora registros com `deleted_at != NULL`
- `remove()` → Define `deleted_at = NOW()` em vez de excluir

---

## Padrão de Endpoint (6 operações)

| Método | Path | Status | Descrição |
|--------|------|--------|-----------|
| GET | `/` | 200 | Lista todos (paginado) |
| GET | `/{id}` | 200 | Detalhe por ID |
| POST | `/` | 201 | Criar novo |
| PUT | `/{id}` | 200 | Atualizar |
| DELETE | `/{id}` | 200 | Soft delete |
| GET | `/search` | 200 | Busca com filtros (opcional) |

### Exemplo completo com busca:
```python
@router.get("/", response_model=List[MinhaTabela])
def list_items(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return crud_minha_tabela.get_multi(db, skip=skip, limit=limit)

@router.get("/search", response_model=List[MinhaTabela])
def search_items(
    q: str = "",
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Busca por nome ou descrição"""
    query = db.query(MinhaTabela).filter(
        (MinhaTabela.nome.contains(q)) | 
        (MinhaTabela.descricao.contains(q))
    )
    return query.offset(skip).limit(limit).all()
```

---

## Anti-Patterns a Evitar

❌ **Usar `id` sozinho** — sempre use `{tabela}_id`
❌ **Hardcoded SQL** — use SQLAlchemy queries
❌ **print() em produção** — use logging
❌ **Conexão sem pool** — já configurado em `database.py`
❌ **Misturar idiomas** — colunas em inglês, UI em português
❌ **Criação manual de endpoints** — siga o template padrão
❌ **忘 soft delete** — SEMPRE use delete_at em vez de DELETE
❌ **Sem validação Pydantic** — schemas obrigatórios
❌ **Endpoints sem paginação** — sempre use skip/limit

---

## Configuração de Ambiente

```bash
# .env
CASTELA_USER=root
CASTELA_SECRET_PASSWORD=senha123
CASTELA_ADDRESS=localhost
CASTELA_DB=casteladb
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
```

---

## Status HTTP Corretos

| Operação | Status Code |
|---------|------------|
| GET (lista) | `200 OK` |
| GET (por ID) | `200 OK` |
| POST (criação) | `201 Created` |
| PUT (atualização) | `200 OK` |
| DELETE (soft) | `200 OK` |
| Não encontrado | `404 Not Found` |
| Erro validação | `400 Bad Request` |
| Erro servidor | `500 Internal Server Error` |

---

## Checklist Nova Tabela

Antes decommitar código de nova tabela:

- [ ] Tabela existe no MySQL (`sql/Cria_DB_Castela_v2.sql`)
- [ ] Model em `models.py` com todos os campos
- [ ] Schemas (Base, Create, Update, Response) em `schemas.py`
- [ ] CRUD instance em `crud.py`
- [ ] Endpoint file em `api/v1/endpoints/{tabela}.py`
- [ ] Rotas incluídas em `api/v1/__init__.py`
- [ ] Testado no Swagger (`/docs`)
- [ ] Paginação funcionando
- [ ] Soft delete funcionando

---

**Skill Status**: ATUALIZADO ✅
**Versão**: v3.0 — SQLAlchemy + Pydantic v2 + FastAPI
**Última atualização**: 2026-03-23