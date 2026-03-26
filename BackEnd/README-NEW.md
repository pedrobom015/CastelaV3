# Castela Backend v2.0

Backend moderno em **FastAPI** com autentica‡?o JWT, ORM SQLAlchemy e arquitetura escal vel.

## ??? Arquitetura

```
BackEnd/
ÃÄÄ core/                      # Configura‡?es e seguran‡a
³   ÃÄÄ config.py             # Settings centralizadas
³   ÃÄÄ security.py           # JWT, hashing de senhas
³   ÃÄÄ logger.py             # Logging estruturado
³   ÀÄÄ __init__.py
ÃÄÄ api/
³   ÀÄÄ v1/
³       ÃÄÄ endpoints/        # Rotas por recurso
³       ³   ÃÄÄ auth.py      # Login, registro
³       ³   ÀÄÄ ...
³       ÃÄÄ dependencies.py  # Dependˆncias (auth, db)
³       ÀÄÄ __init__.py
ÃÄÄ middlewares/              # Middlewares personalizados
³   ÃÄÄ cors.py              # CORS e security headers
³   ÃÄÄ error_handler.py     # Tratamento de erros
³   ÀÄÄ __init__.py
ÃÄÄ models.py                # Modelo SQLAlchemy com AuditMixin
ÃÄÄ schemas.py               # Valida‡?o Pydantic
ÃÄÄ crud_base.py             # CRUD gen‚rico reutiliz vel
ÃÄÄ database.py              # Configura‡?o SQLAlchemy + Pool
ÃÄÄ main.py                  # Aplica‡?o FastAPI
ÃÄÄ alembic/                 # Migrations (Alembic)
ÃÄÄ requirements.txt
ÃÄÄ Dockerfile
ÃÄÄ alembic.ini
ÀÄÄ README.md
```

## ?? In¡cio R pido

### 1. Instala‡?o de dependˆncias

```bash
pip install -r requirements.txt
```

### 2. Configura‡?o

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Vari veis principais:**
```env
CASTELA_USER=root
CASTELA_SECRET_PASSWORD=root
CASTELA_ADDRESS=localhost
CASTELA_DB=casteladb
SECRET_KEY=your-secret-key-here
```

### 3. Executar migrations (Alembic)

```bash
# Criar uma nova migration autom tica
alembic revision --autogenerate -m "Initial migration"

# Aplicar migrations
alembic upgrade head
```

### 4. Rodas a aplica‡?o

```bash
# Desenvolvimento
fastapi run main.py

# Produ‡?o (com Gunicorn)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

A API estar  dispon¡vel em `http://localhost:8000/api/v1/docs`

---

## ?? Autentica‡?o

### Registrar novo usu rio

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Realizar login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "password123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "sys_user_id": 1,
    "username": "user123",
    "email": "user@example.com",
    "is_superuser": false
  }
}
```

### Usar token em requisi‡?es

```bash
curl -X GET "http://localhost:8000/api/v1/recursos" \
  -H "Authorization: Bearer <seu_token>"
```

---

## ?? Docker

### Build e run com Docker Compose

```bash
# Subir toda a stack (Backend + MySQL + Frontend + Nginx)
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Derrubar
docker-compose down
```

### Servi‡os dispon¡veis ap¢s `docker-compose up`

| Servi‡o | URL | Descri‡?o |
|---------|-----|-----------|
| Backend | `http://localhost:8000` | API REST |
| Frontend | `http://localhost:3000` | React app |
| Nginx | `http://localhost:80` | Reverse Proxy |
| MySQL | `localhost:3306` | Database |

---

## ?? Padr?o CRUD Gen‚rico

Cada tabela segue o padr?o:

### 1. **Model** (models.py)
```python
class Contrato(Base, AuditMixin):
    __tablename__ = "contrato"
    id = Column(Integer, primary_key=True)
    numero = Column(String(50), unique=True)
    # ...
```

### 2. **Schemas** (schemas.py)
```python
class ContratoBase(BaseModel):
    numero: str

class ContratoCreate(ContratoBase):
    pass

class ContratoResponse(ContratoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
```

### 3. **CRUD** (automaticamente)
```python
contrato_crud = CRUDBase[Contrato, ContratoCreate, dict](Contrato)
```

### 4. **Endpoint** (api/v1/endpoints/contrato.py)
```python
@router.get("/contratos")
async def list_contratos(db: Session = Depends(get_db)):
    return contrato_crud.get_multi(db)
```

---

## ?? Testing

```bash
# Executar testes
pytest

# Com cobertura
pytest --cov=.
```

---

## ?? Estrutura de Dados

### AuditMixin (Base para todas as tabelas)

Todas as tabelas herdam:

```python
created_at: DateTime      # Quando foi criado
updated_at: DateTime      # ?ltimo update
deleted_at: DateTime      # Soft delete (NULL = ativo)
created_by: Integer       # User ID que criou
updated_by: Integer       # User ID que atualizou
deleted_by: Integer       # User ID que deletou
```

---

## ?? Migra‡?es com Alembic

### Criar nova migration autom tica

```bash
alembic revision --autogenerate -m "Add new column"
```

### Aplicar migrations

```bash
# Pr¢xima migration
alembic upgrade +1

# ?ltima migration
alembic upgrade head

# Reverter £ltima
alembic downgrade -1
```

---

## ?? Logging

Aplica‡?o usa **structlog** para logging estruturado:

```python
from core.logger import get_logger

logger = get_logger(__name__)

logger.info("evento", user_id=1, action="login")
logger.error("erro", error="message", exc_type="ValueError")
```

---

## ??? Security Headers

Automaticamente configurados:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## ?? Roadmap

- [x] JWT Authentication
- [x] Soft Delete + Audit Trail
- [x] Logging estruturado
- [x] CORS + Security Headers
- [x] Docker Compose
- [x] Alembic Migrations
- [ ] Rate Limiting
- [ ] Caching (Redis)
- [ ] Tests (pytest)
- [ ] GraphQL endpoint
- [ ] OpenAPI documentation

---

## ?? Contribuindo

1. Crie nova branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -am 'Add nova feature'`
3. Push: `git push origin feature/nova-feature`
4. PR

---

## ?? Suporte

Para d£vidas ou problemas, abra uma issue ou entre em contato.

---

**Vers?o:** 2.0.0  
**?ltima atualiza‡?o:** Mar‡o 2026
