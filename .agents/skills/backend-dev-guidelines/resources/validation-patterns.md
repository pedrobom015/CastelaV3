# Validation Patterns - Input Validation with Pydantic

Complete guide to input validation using Pydantic v2 schemas for FastAPI web services.

## Table of Contents

- [Why Pydantic?](#why-pydantic)
- [Basic Pydantic Patterns](#basic-pydantic-patterns)
- [Route-Level Validation](#route-level-validation)
- [DTO / Schema Pattern](#dto--schema-pattern)
- [Advanced Validations](#advanced-validations)

---

## Why Pydantic?

**Type Safety:**
- [OK] Full Python type hints (`typing` module)
- [OK] Automatic creation of OpenAPI documentation via FastAPI
- [OK] Compile-time checking with tools like `mypy`

**Developer Experience:**
- [OK] Seamless integration with FastAPI
- [OK] Classes define validation
- [OK] Less boilerplate

---

## Basic Pydantic Patterns

### Primitive Types

```python
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    admin = 'admin'
    operations = 'operations'
    user = 'user'

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: int = Field(..., gt=0)
    active: bool = True
    role: RoleEnum
    created_at: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list, max_length=10)
```

### Nested Objects

```python
class Address(BaseModel):
    street: str
    city: str
    zip_code: str = Field(pattern=r'^\d{5}$')

class UserWithAddress(BaseModel):
    name: str
    address: Address
```

---

## Route-Level Validation

FastAPI does validations automatically using Pydantic. You do not need manual parsing in your routes.

```python
from fastapi import APIRouter, Depends, HTTPException
from schemas.user import UserCreate

router = APIRouter()

# FastAPI automatically validates `req.body` against UserCreate!
@router.post('/')
def create_user(user_in: UserCreate):
    # If the input is invalid, FastAPI automatically returns a 422 HTTP status.
    # We only reach this point if validation passed.
    service = UserService()
    user = service.create(user_in)
    return user
```

---

## DTO / Schema Pattern

It is typical to separate schemas by operation (Create, Update, Response).

```python
# schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schema with shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str

# Schema for incoming creation requests
class UserCreate(UserBase):
    password: str

# Schema for incoming update requests (fields are optional)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None

# Schema for outgoing response
class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # Allows parsing from ORM objects or generic objects
```

---

## Advanced Validations

### Field Validation (`@field_validator`)

```python
from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def name_must_be_capitalized(cls, v: str) -> str:
        if not v[0].isupper():
            raise ValueError('Name must start with a capital letter')
        return v
```

### Model Validation (`@model_validator`)
Used when you need to validate multiple fields together.

```python
from pydantic import BaseModel, model_validator
from datetime import datetime

class ProxyCreate(BaseModel):
    starts_at: datetime
    expires_at: datetime

    @model_validator(mode='after')
    def check_dates(self) -> 'ProxyCreate':
        if self.expires_at <= self.starts_at:
            raise ValueError('expires_at must be after starts_at')
        return self
```

### Data Transformation
Pydantic handles typical coercions (e.g., string `"1"` to integer `1`), but you can force transformations using `BeforeValidator`.

```python
from typing import Annotated
from pydantic import BaseModel, BeforeValidator

def empty_str_to_none(v: str):
    if v == "":
        return None
    return v

class Item(BaseModel):
    name: Annotated[str, BeforeValidator(empty_str_to_none)]
```
