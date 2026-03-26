# Complete Examples - Full Working Code

Real-world end-to-end example showing complete implementation patterns in FastAPI.

## Table of Contents

- [The End-to-End User Creation Feature](#the-end-to-end-user-creation-feature)
  - [1. Configuration](#1-configuration)
  - [2. Pydantic Models](#2-pydantic-models)
  - [3. Repository (Raw MySQL)](#3-repository-raw-mysql)
  - [4. Service (Business Logic)](#4-service-business-logic)
  - [5. Dependencies (Inversion of Control)](#5-dependencies-inversion-of-control)
  - [6. Router & Controller](#6-router--controller)
  - [7. Application Entrypoint (main.py)](#7-application-entrypoint-mainpy)

---

## The End-to-End User Creation Feature

This example shows the entire lifecycle of a request interacting with all 4 architectural layers.

### 1. Configuration
```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "app_db"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. Pydantic Models
```python
# models/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
```

### 3. Repository (Raw MySQL)
```python
# repositories/user_repository.py
from typing import Optional
from mysql.connector.connection import MySQLConnection
from models.user import UserCreate, UserResponse

class UserRepository:
    def __init__(self, connection: MySQLConnection):
        self.connection = connection

    def get_by_email(self, email: str) -> Optional[UserResponse]:
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, name, email, is_active FROM users WHERE email = %s", (email,))
            row = cursor.fetchone()
            return UserResponse(**row) if row else None
        finally:
            cursor.close()

    def create(self, user: UserCreate, hashed_password: str) -> UserResponse:
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (user.name, user.email, hashed_password)
            )
            # The repository handles the SQL commit for standard queries
            self.connection.commit()
            new_id = cursor.lastrowid
            
            # Fetch the newly created record
            return UserResponse(
                id=new_id,
                name=user.name,
                email=user.email,
                is_active=True
            )
        except Exception as e:
            self.connection.rollback()
            raise e
        finally:
            cursor.close()
```

### 4. Service (Business Logic)
```python
# services/user_service.py
from repositories.user_repository import UserRepository
from models.user import UserCreate, UserResponse
from utils.exceptions import ConflictError

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def create_user(self, user_in: UserCreate) -> UserResponse:
        # Business Rule 1: Email Uniqueness
        existing = self.user_repo.get_by_email(user_in.email)
        if existing:
            raise ConflictError("Email already in use.")
            
        # Business Rule 2: Hash password (simulated)
        hashed_pw = f"hashed_{user_in.password}"
        
        # Delegate DB creation to repository
        return self.user_repo.create(user_in, hashed_pw)
```

### 5. Dependencies (Inversion of Control)
```python
# dependencies.py
from contextlib import contextmanager
from fastapi import Depends
from mysql.connector.pooling import MySQLConnectionPool
from repositories.user_repository import UserRepository
from services.user_service import UserService
from config import settings

pool = MySQLConnectionPool(
    pool_name="main_pool",
    pool_size=5,
    host=settings.DB_HOST,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
)

def get_db_connection():
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()

def get_user_repository(conn = Depends(get_db_connection)) -> UserRepository:
    return UserRepository(conn)

def get_user_service(repo: UserRepository = Depends(get_user_repository)) -> UserService:
    return UserService(repo)
```

### 6. Router & Controller
```python
# routes/user_routes.py
from fastapi import APIRouter, Depends
from models.user import UserCreate, UserResponse
from services.user_service import UserService
from dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=201)
def create_endpoint(
    user_in: UserCreate,
    service: UserService = Depends(get_user_service)
):
    # Route is perfectly clean. Automatic validation by Pydantic.
    return service.create_user(user_in)
```

### 7. Application Entrypoint (main.py)
```python
# main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from routes.user_routes import router as user_router
from utils.exceptions import ConflictError

app = FastAPI(title="Backend Castela Services")

# Global Exception Handlers map domain exceptions to HTTP Responses
@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(
        status_code=409,
        content={"success": False, "message": str(exc)}
    )

# Include Routers
app.include_router(user_router)
```
