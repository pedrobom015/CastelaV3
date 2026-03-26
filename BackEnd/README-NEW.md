# Castela Backend v2.0

Backend moderno em **FastAPI** com autentica\x87?o JWT, ORM SQLAlchemy e arquitetura escal\xa0vel.

## ??? Arquitetura

```
BackEnd/
\xc3\xc4\xc4 core/                      # Configura\x87?es e seguran\x87a
\xb3   \xc3\xc4\xc4 config.py             # Settings centralizadas
\xb3   \xc3\xc4\xc4 security.py           # JWT, hashing de senhas
\xb3   \xc3\xc4\xc4 logger.py             # Logging estruturado
\xb3   \xc0\xc4\xc4 __init__.py
\xc3\xc4\xc4 api/
\xb3   \xc0\xc4\xc4 v1/
\xb3       \xc3\xc4\xc4 endpoints/        # Rotas por recurso
\xb3       \xb3   \xc3\xc4\xc4 auth.py      # Login, registro
\xb3       \xb3   \xc0\xc4\xc4 ...
\xb3       \xc3\xc4\xc4 dependencies.py  # Depend\x88ncias (auth, db)
\xb3       \xc0\xc4\xc4 __init__.py
\xc3\xc4\xc4 middlewares/              # Middlewares personalizados
\xb3   \xc3\xc4\xc4 cors.py              # CORS e security headers
\xb3   \xc3\xc4\xc4 error_handler.py     # Tratamento de erros
\xb3   \xc0\xc4\xc4 __init__.py
\xc3\xc4\xc4 models.py                # Modelo SQLAlchemy com AuditMixin
\xc3\xc4\xc4 schemas.py               # Valida\x87?o Pydantic
\xc3\xc4\xc4 crud_base.py             # CRUD gen\x82rico reutiliz\xa0vel
\xc3\xc4\xc4 database.py              # Configura\x87?o SQLAlchemy + Pool
\xc3\xc4\xc4 main.py                  # Aplica\x87?o FastAPI
\xc3\xc4\xc4 alembic/                 # Migrations (Alembic)
\xc3\xc4\xc4 requirements.txt
\xc3\xc4\xc4 Dockerfile
\xc3\xc4\xc4 alembic.ini
\xc0\xc4\xc4 README.md
```

## ?? In\xa1cio R\xa0pido

### 1. Instala\x87?o de depend\x88ncias

```bash
pip install -r requirements.txt
```

### 2. Configura\x87?o

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Vari\xa0veis principais:**
```env
CASTELA_USER=root
CASTELA_SECRET_PASSWORD=root
CASTELA_ADDRESS=localhost
CASTELA_DB=casteladb
SECRET_KEY=your-secret-key-here
```

### 3. Executar migrations (Alembic)

```bash
# Criar uma nova migration autom\xa0tica
alembic revision --autogenerate -m "Initial migration"

# Aplicar migrations
alembic upgrade head
```

### 4. Rodas a aplica\x87?o

```bash
# Desenvolvimento
fastapi run main.py

# Produ\x87?o (com Gunicorn)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

A API estar\xa0 dispon\xa1vel em `http://localhost:8000/api/v1/docs`

---

## ?? Autentica\x87?o

### Registrar novo usu\xa0rio

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

### Usar token em requisi\x87?es

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

### Servi\x87os dispon\xa1veis ap\xa2s `docker-compose up`

| Servi\x87o | URL | Descri\x87?o |
|---------|-----|-----------|
| Backend | `http://localhost:8000` | API REST |
| Frontend | `http://localhost:3000` | React app |
| Nginx | `http://localhost:80` | Reverse Proxy |
| MySQL | `localhost:3306` | Database |

---

## ?? Padr?o CRUD Gen\x82rico

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

## ?? Migra\x87?es com Alembic

### Criar nova migration autom\xa0tica

```bash
alembic revision --autogenerate -m "Add new column"
```

### Aplicar migrations

```bash
# Pr\xa2xima migration
alembic upgrade +1

# ?ltima migration
alembic upgrade head

# Reverter \xa3ltima
alembic downgrade -1
```

---

## ?? Logging

Aplica\x87?o usa **structlog** para logging estruturado:

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

Para d\xa3vidas ou problemas, abra uma issue ou entre em contato.

---

**Vers?o:** 2.0.0
**?ltima atualiza\x87?o:** Mar\x87o 2026
