# Middleware and Dependencies Guide

Complete guide to handling cross-cutting concerns (Authentication, Context, Timing) in FastAPI.

## Table of Contents

- [FastAPI Dependencies vs Middleware](#fastapi-dependencies-vs-middleware)
- [Authentication Dependency](#authentication-dependency)
- [Global Middleware](#global-middleware)
- [Context and Audit Storage](#context-and-audit-storage)

---

## FastAPI Dependencies vs Middleware

In Express, everything was a Middleware. In FastAPI, we distinguish between:

1. **Global Middleware (`@app.middleware`)**: Runs on *every* request (e.g., CORS, Sentry, Request Timing).
2. **Dependencies (`Depends()`)**: Runs only on specific routes. Used for Authentication, Database Connections, and injecting Services.

**Rule of Thumb:** If it only applies to some routes or needs to return data (like a `User` object or a `DB Connection`), use a Dependency.

---

## Authentication Dependency

### Bearer Token Pattern

```python
# dependencies/auth.py
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from utils.jwt import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(user_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")

# Usage in a Route
@router.get('/protected')
def protected_route(user_id: int = Depends(get_current_user_id)):
    return {"message": f"Hello User {user_id}"}
```

---

## Global Middleware

### Request Timing and Logging Example

```python
# main.py
import time
import logging
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        # Process the request
        response = await call_next(request)
        
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        logging.info(f"{request.method} {request.url.path} completed in {process_time:.4f}s")
        return response

app.add_middleware(TimingMiddleware)
```

---

## Context and Audit Storage

In Node.js, we used `AsyncLocalStorage`. In Python (since 3.7), we use `contextvars` to store variables specific to the current asyncio task/request.

### ContextVars Pattern

```python
# utils/context.py
import contextvars
from typing import Optional

# Define a ContextVar
current_user_id_var: contextvars.ContextVar[Optional[int]] = contextvars.ContextVar(
    "current_user_id", default=None
)

def get_audit_user_id() -> Optional[int]:
    return current_user_id_var.get()

# Middleware to set it automatically on every request
from starlette.middleware.base import BaseHTTPMiddleware

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Extract user ID somehow, maybe from token or request state
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        user_id = extract_user_id(token) if token else None
        
        # Set the context var
        token_id = current_user_id_var.set(user_id)
        
        try:
            return await call_next(request)
        finally:
            # Reset the context var just in case
            current_user_id_var.reset(token_id)
```

**Usage in deeply nested Services:**
```python
# services/user_service.py
from utils.context import get_audit_user_id

def perform_sensitive_action():
    actor_id = get_audit_user_id()
    # Log this action using actor_id
```
