# Routing and Controllers - Best Practices

Complete guide to FastAPI route definitions and dependency injection patterns.

## Table of Contents

- [FastAPI APIRouter Focus](#fastapi-apirouter-focus)
- [Controllers in Python](#controllers-in-python)
- [Anti-Patterns](#anti-patterns)
- [Error Handling](#error-handling)
- [HTTP Status Codes](#http-status-codes)

---

## FastAPI APIRouter Focus

### The Golden Rule

**Routes should ONLY:**
- [OK] Define route paths using `@router.get`, `@router.post`, etc.
- [OK] Inject dependencies (`Depends()`).
- [OK] Delegate to services or controllers.

**Routes should NEVER:**
- [BAD] Contain business logic.
- [BAD] Access database directly (`cursor.execute` in route).
- [BAD] Manually validate input dicts (use Pydantic instead).

### Clean Route Pattern

```python
# routes/user_routes.py
from fastapi import APIRouter, Depends
from schemas.user import UserCreate, UserResponse
from dependencies import get_user_service, verify_login_status
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

# [OK] CLEAN: Route definition only
@router.post('/', response_model=UserResponse, status_code=201)
def create_user(
    user_in: UserCreate,
    user_id: int = Depends(verify_login_status),
    service: UserService = Depends(get_user_service)
):
    return service.create_user(user_in, current_user_id=user_id)

@router.get('/{user_id}', response_model=UserResponse)
def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    return service.get_user(user_id)
```

---

## Controllers in Python

While old MVC frameworks use large `BaseController` classes, FastAPI apps use a more functional approach. Controllers are typically single modules or lightweight classes, or the routing logic itself acts as the "Controller" if it just passes data to Services.

### Controller Pattern

If you prefer separating routes from payload preparation:

```python
# controllers/user_controller.py
from fastapi import HTTPException
from schemas.user import UserCreate
from services.user_service import UserService
from utils.exceptions import BusinessException, NotFoundException

class UserController:
    @staticmethod
    def create(user_in: UserCreate, service: UserService):
        try:
            return service.create(user_in)
        except BusinessException as e:
            raise HTTPException(status_code=400, detail=str(e))
```

And in `routes/user_routes.py`:
```python
@router.post('/')
def create_endpoint(user_in: UserCreate, service: UserService = Depends(get_user_service)):
    return UserController.create(user_in, service)
```

_Note_: FastAPI also allows defining global exception handlers, which removes the need for empty Controller classes.

---

## Anti-Patterns

### Anti-Pattern: Business Logic in Routes (Bad [BAD])

```python
# [BAD] ANTI-PATTERN: Business logic in route
@router.post('/{form_id}/submit')
def submit_form(form_id: int, req_data: dict, db = Depends(get_db)):
    # ❌ Permission checking in route
    cursor = db.cursor()
    cursor.execute("SELECT user_id FROM forms WHERE id = %s", (form_id,))
    # ...

    # ❌ Logic in route
    if req_data.get("status") == "FINAL":
        cursor.execute("UPDATE forms SET ...")

    db.commit()
    return {"success": True}
```

### Refactoring

Extract variables, validate with Pydantic, and move logic to a Service class injected via `Depends()`.

---

## Error Handling

### Exception Handlers
In FastAPI, you shouldn't pollute every route with `try...except`. Instead, define custom exceptions and register global exception handlers.

```python
# main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from utils.exceptions import BusinessException, NotFoundException

app = FastAPI()

@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": str(exc)},
    )

@app.exception_handler(NotFoundException)
async def notfound_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": str(exc)},
    )
```

Now, in your service:
```python
def get_user(self, user_id: int):
    user = self.repo.find_by_id(user_id)
    if not user:
        raise NotFoundException(f"User {user_id} not found")  # handled globally!
    return user
```

---

## HTTP Status Codes

### Standard Codes (Used in `@router.get/post/put`)

| Code | Use Case | Example (FastAPI argument) |
|------|----------|---------|
| 200 | Success (GET, PUT) | default |
| 201 | Created (POST) | `status_code=201` |
| 204 | No Content (DELETE) | `status_code=204` |
| 400 | Bad Request | Raised for business logic errors |
| 401 | Unauthorized | Token missing/invalid |
| 403 | Forbidden | No permission for resource |
| 404 | Not Found | Resource missing |
| 422 | Unprocessable | Pydantic validation failed (automatic) |

```python
@router.post("/", status_code=201)
def create(...): ...
```
