# Services and Repositories - Business Logic Layer

Complete guide to organizing business logic with services and data access with repositories in FastAPI using Python and MySQL.

## Table of Contents

- [Service Layer Overview](#service-layer-overview)
- [Dependency Injection Pattern](#dependency-injection-pattern)
- [Repository Pattern](#repository-pattern)
- [Service Design Principles](#service-design-principles)
- [Testing Services](#testing-services)

---

## Service Layer Overview

### Purpose of Services

**Services contain business logic** - the 'what' and 'why' of your application:

```
Controller asks: "Should I do this?"
Service answers: "Yes/No, here's why, and here's what happens."
Repository executes: "Here's the data you requested using SQL."
```

**Services are responsible for:**
- ✅ Business rules enforcement (e.g., verifying limits, changing states).
- ✅ Orchestrating multiple repositories.
- ✅ Managing transactions (commit/rollback).
- ✅ Validation across multiple domains that Pydantic can't do alone.

**Services should NOT:**
- ❌ Know about FastAPI (No `HTTPException`, `Request`, or `Response`).
- ❌ Contain raw SQL (use repositories).

---

## Dependency Injection Pattern

FastAPI provides an excellent Dependency Injection system with `Depends()`. We leverage this to pass database connections and repositories into our services.

### Example Service Pattern

```python
# services/user_service.py
from typing import Optional
from models.user import UserCreate, User
from repositories.user_repository import UserRepository
from utils.exceptions import BusinessException, NotFoundException

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def create_user(self, user_in: UserCreate) -> User:
        # Business logic: Check if email exists
        existing_user = self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise BusinessException("Email already in use.")

        # Additional logic...

        return self.user_repo.create(user_in)

    def get_user(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User {user_id} not found.")
        return user
```

### FastAPI Dependency Injection Setup

```python
# dependencies.py
from fastapi import Depends
from core.database import get_db_connection
from repositories.user_repository import UserRepository
from services.user_service import UserService

def get_user_repository(connection = Depends(get_db_connection)) -> UserRepository:
    return UserRepository(connection)

def get_user_service(repo: UserRepository = Depends(get_user_repository)) -> UserService:
    return UserService(repo)
```

**Usage in a Route:**

```python
# routes/user_routes.py
from fastapi import APIRouter, Depends
from models.user import UserCreate, UserResponse
from services.user_service import UserService
from dependencies import get_user_service

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_endpoint(
    user_in: UserCreate,
    service: UserService = Depends(get_user_service)
):
    # Controllers can be inline here for simplicity, or separated if complex
    return service.create_user(user_in)
```

---

## Repository Pattern

### Purpose of Repositories

**Repositories abstract the `mysql-connector-python` logic.**
They isolate the SQL from the rest of the application. Given ~180 legacy tables, keeping SQL organized is critical.

**Repositories are responsible for:**
- ✅ All raw SQL operations (`SELECT`, `INSERT`, `UPDATE`).
- ✅ Using parameterized queries to prevent SQL injection (`%s`).
- ✅ Mapping database row tuples/dicts into Pydantic models.

### Example Repository Pattern

```python
# repositories/user_repository.py
from typing import Optional, List
from mysql.connector.connection import MySQLConnection
from models.user import User, UserCreate

class UserRepository:
    def __init__(self, connection: MySQLConnection):
        self.connection = connection

    def get_by_id(self, user_id: int) -> Optional[User]:
        cursor = self.connection.cursor(dictionary=True)
        try:
            sql = "SELECT id, email, name, is_active FROM users WHERE id = %s"
            cursor.execute(sql, (user_id,))
            row = cursor.fetchone()
            if row:
                return User(**row)
            return None
        finally:
            cursor.close()

    def get_by_email(self, email: str) -> Optional[User]:
        cursor = self.connection.cursor(dictionary=True)
        try:
            sql = "SELECT id, email, name, is_active FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            row = cursor.fetchone()
            if row:
                return User(**row)
            return None
        finally:
            cursor.close()

    def create(self, user: UserCreate) -> User:
        cursor = self.connection.cursor()
        try:
            sql = "INSERT INTO users (email, name, hashed_password) VALUES (%s, %s, %s)"
            cursor.execute(sql, (user.email, user.name, user.hashed_password))
            # It's usually the repository's job to commit its own transactions for simple creates,
            # or the service manages a unit of work if multiple actions are required.
            self.connection.commit()

            user_id = cursor.lastrowid
            return self.get_by_id(user_id)
        except Exception as e:
            self.connection.rollback()
            raise e
        finally:
            cursor.close()
```

---

## Service Design Principles

### 1. Separation of Framework

Services must not import `fastapi`. No `HTTPException`.
Instead, raise custom exceptions (e.g., `BusinessException`, `NotFoundException`), and use a FastAPI exception handler to map them to 400 or 404 responses.

### 2. Single Responsibility
Each service should handle a specific domain. Avoid massive `AppService` classes.
```python
# ✅ GOOD
class ContractService: ...
class InvoiceService: ...

# ❌ BAD
class MassiveSystemGodService: ...
```

---

## Testing Services

By separating Repositories and injecting them, Services become easily testable using `unittest.mock`.

```python
# tests/test_user_service.py
from unittest.mock import Mock
import pytest
from services.user_service import UserService
from models.user import UserCreate, User
from utils.exceptions import BusinessException

def test_create_user_raises_exception_if_email_exists():
    # Arrange
    mock_repo = Mock()
    # Mocking that the email already exists
    mock_repo.get_by_email.return_value = User(id=1, email="test@test.com", name="Test", is_active=True)

    service = UserService(user_repo=mock_repo)
    user_in = UserCreate(email="test@test.com", name="New", hashed_password="xxx")

    # Act & Assert
    with pytest.raises(BusinessException) as exc_info:
        service.create_user(user_in)

    assert "Email already in use" in str(exc_info.value)
    mock_repo.create.assert_not_called()
```
