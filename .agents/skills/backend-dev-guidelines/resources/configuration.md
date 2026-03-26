# Configuration Management - Pydantic Settings Pattern

Complete guide to managing configuration in FastAPI microservices.

## Table of Contents

- [Pydantic Settings Overview](#pydantic-settings-overview)
- [NEVER Use os.getenv Directly in Code](#never-use-osgetenv-directly-in-code)
- [Implementation Pattern](#implementation-pattern)

---

## Pydantic Settings Overview

The standard in FastAPI for handling configurations is using `pydantic-settings`.

**Benefits over raw `os.getenv`:**
- [OK] Fully typed settings.
- [OK] Automatic casting (e.g., string `"3306"` to int `3306`).
- [OK] Automatically loads `.env` files.
- [OK] Validates variables at application launch (fails fast).

---

## NEVER Use os.getenv Directly in Code

### The Rule

```python
# [BAD] NEVER DO THIS
import os
timeout = int(os.getenv("TIMEOUT_MS", 5000))

# [OK] ALWAYS DO THIS
from config import settings
timeout = settings.TIMEOUT_MS
```

---

## Implementation Pattern

### 1. Install Library
```bash
pip install pydantic-settings
```

### 2. Define Settings Class

```python
# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    ENVIRONMENT: str = "development"
    PORT: int = 8000

    # Database Settings
    DB_HOST: str
    DB_PORT: int = 3306
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # JWT Authentication
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Sentry
    SENTRY_DSN: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 1.0

    # Pydantic Settings Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # Extra fields in .env that aren't defined here are ignored
        extra="ignore"
    )

# Instantiate a single global settings object
settings = Settings()
```

### 3. Provide an Environment Variables Template

Create a `.env.example` file so new developers know what is required.

```ini
# .env.example
ENVIRONMENT=development
PORT=8000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=castela_db

JWT_SECRET=super_secret_key_change_in_production
SENTRY_DSN=
```

### Validation
If a required field (like `DB_HOST` above, which lacks a default) is missing from the `.env` file or from environment variables, Pydantic will throw a `ValidationError` when `settings = Settings()` runs, preventing the app from starting with bad configuration.
