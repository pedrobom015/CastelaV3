# Sentry Integration and Monitoring

Complete guide to error tracking and performance monitoring with Sentry in FastAPI.

## Table of Contents

- [Core Principles](#core-principles)
- [Sentry Initialization](#sentry-initialization)
- [Error Capture Patterns](#error-capture-patterns)

---

## Core Principles

**MANDATORY**: All unexpected errors MUST be captured to Sentry. No exceptions.

---

## Sentry Initialization

### FastAPI Integration Pattern

**Location:** `main.py`

```python
import sentry_sdk
from config import settings

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
    profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
    
    # By default, sentry_sdk.init() automatically includes the FastAPI integration
    # if fastapi is installed!
)

from fastapi import FastAPI
app = FastAPI()
```

### Filtering PII (Before Send)

If you need to mask sensitive information before logging to Sentry:

```python
def strip_sensitive_data(event, hint):
    # Mask emails
    if 'user' in event and 'email' in event['user']:
        email = event['user']['email']
        parts = email.split('@')
        if len(parts) == 2:
            event['user']['email'] = f"{parts[0][:2]}***@{parts[1]}"
            
    # Remove authorization headers
    if 'request' in event and 'headers' in event['request']:
        if 'authorization' in event['request']['headers']:
            event['request']['headers']['authorization'] = '[Filtered]'
            
    return event

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    before_send=strip_sensitive_data
)
```

---

## Error Capture Patterns

### 1. Global Exception Handler

FastAPI global exception handlers are the best place to log unhandled business exceptions that result in 500s.

```python
from fastapi import Request
from fastapi.responses import JSONResponse
import sentry_sdk

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Capture the exception
    sentry_sdk.capture_exception(exc)
    
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal Server Error"}
    )
```

### 2. Manual Capture with Context

If you catch an error and handle it, but still want to log it:

```python
import sentry_sdk

def risky_operation(user_id: int):
    try:
        # Something that might fail
        pass
    except Exception as e:
        with sentry_sdk.push_scope() as scope:
            scope.set_user({"id": user_id})
            scope.set_tag("operation_type", "POST_CREATION")
            scope.set_context("extra_info", {"attempt": 1})
            
            sentry_sdk.capture_exception(e)
            
        # Re-raise or handle
        raise e
```
