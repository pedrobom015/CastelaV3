# Async Patterns and Error Handling

Complete guide to asynchronous patterns and custom error handling in FastAPI and Python.

## Table of Contents

- [FastAPI: Sync vs Async](#fastapi-sync-vs-async)
- [Async/Await Best Practices](#asyncawait-best-practices)
- [Custom Error Types](#custom-error-types)
- [Error Propagation](#error-propagation)

---

## FastAPI: Sync vs Async

FastAPI supports both standard `def` and asynchronous `async def` route handlers.

**Important Rule:** If your database driver is strictly synchronous (like the standard `mysql-connector-python`), **do NOT use `async def` for your endpoints or services** unless you are using threads/executors behind the scenes.
FastAPI automatically runs standard `def` functions in an external threadpool so it doesn't block the async event loop.

```python
# [OK] Use synchronous functions for sync database access
@router.get('/users')
def get_users(service: UserService = Depends(get_user_service)):
    return service.get_all()

# [BAD] Do not use async def if you make synchronous `cursor.execute` calls inside!
@router.get('/users')
async def get_users_bad(service: UserService = Depends(get_user_service)):
    # This will BLOCK the entire FastAPI server if service uses standard mysql-connector
    return service.get_all()
```

---

## Async/Await Best Practices (If using AsyncIO / Async Drivers)

If you are using an async driver (like `aiomysql` or `asyncio`), you should adopt the `async/await` syntax thoroughly.

### Always Await Properly

```python
# [OK]
async def fetch_data():
    data = await database.query()
    return data
```

### Try-Except Blocks

Always wrap potentially failing logic and propagate meaningful errors.

```python
async def process_data():
    try:
        data = await fetch_data()
        return data
    except Exception as error:
        # Sentry capture, format error, log...
        raise error
```

### Parallel Operations

```python
import asyncio

# [OK] Run concurrently
async def get_dashboard_summary():
    users_task = fetch_users()
    sales_task = fetch_sales()

    # Executes in parallel
    users, sales = await asyncio.gather(users_task, sales_task)
    return {"users": users, "sales": sales}
```

---

## Custom Error Types

Define application-specific errors inheriting from `Exception`. Let FastAPI's global exception handler catch them.

```python
# utils/exceptions.py

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class NotFoundError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=404)

class ForbiddenError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=403)

class ConflictError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=409)
```

---

## Error Propagation

### Proper Error Chains

Raise domain exceptions up the stack, and handle them elegantly at the framework boundary.

```python
# Repository Layer
def find_user():
    try:
        # DB calls
        pass
    except DatabaseError as e:
        # Maybe log error here
        raise Exception(f"Failed to query database: {e}")

# Service Layer
def process_user():
    try:
        user = repo.find_user()
        if not user:
            raise NotFoundError("User not found.")
    except Exception as e:
        # Add context and re-raise
        raise e

# Controller / Route Layer (handled automatically by FastAPI exception_handler)
@router.get("/")
def endpoint():
    # Calling process_user(); if NotFoundError is raised, it will be mapped to a 404 response
    return service.process_user()
```

---

**Related Files:**
- [routing-and-controllers.md](routing-and-controllers.md) for how FastAPI global error handlers manage exceptions.
