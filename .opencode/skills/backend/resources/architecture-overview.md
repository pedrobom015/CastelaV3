# Architecture Overview - Backend Services

Complete guide to the layered architecture pattern used in our FastAPI backend microservices.

## Table of Contents

- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Request Lifecycle](#request-lifecycle)
- [Directory Structure Rationale](#directory-structure-rationale)
- [Module Organization](#module-organization)
- [Separation of Concerns](#separation-of-concerns)

---

## Layered Architecture Pattern

### The Four Layers

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 1: ROUTES (FastAPI APIRouter)│
│  - Route definitions only           │
│  - Dependency Injection (Depends)   │
│  - Delegate to controllers          │
│  - NO business logic                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 2: CONTROLLERS               │
│  - Request/response handling        │
│  - Input validation (Pydantic via FastAPI)
│  - Call services                    │
│  - Format responses                 │
│  - Error handling                   │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 3: SERVICES                  │
│  - Business logic                   │
│  - Orchestration                    │
│  - Call repositories                │
│  - No HTTP knowledge                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 4: REPOSITORIES              │
│  - Data access abstraction          │
│  - MySQL raw queries via connector  │
│  - Connection pooling management    │
│  - Data mapping to Pydantic models  │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Database (MySQL 8)          │
└─────────────────────────────────────┘
```

### Why This Architecture?

**Testability:**
- Each layer can be tested independently.
- Easy to mock dependencies (especially Services and Repositories).
- Clear boundaries.

**Maintainability:**
- Crucial for a system with ~180 tables derived from a legacy ERP.
- Changes isolated to specific layers.
- Business logic separate from HTTP or Database concerns.

**Reusability:**
- Services can be used by routes, background tasks (Celery/RQ), or scripts.
- Repositories hide the raw SQL implementation.

**Scalability:**
- Easy to add new endpoints safely.
- Consistent patterns across all team members.

---

## Request Lifecycle

### Complete Flow Example

```python
1. HTTP POST /api/v1/users
   ↓
2. FastAPI matches route in user_routes.py
   ↓
3. Dependencies are resolved (Depends):
   - verify_token (authentication)
   - get_current_user (context tracking)
   - get_db_connection (pool allocation)
   ↓
4. Route handler delegating to controller:
   @router.post('/users', response_model=UserResponse)
   def create_user(user_in: UserCreate, db=Depends(get_db)):
       return UserController.create(user_in, db)
   ↓
5. Controller processes request:
   - Data is already validated by Pydantic (UserCreate).
   - Call UserService.create(user_in, db).
   - Handle business exceptions (e.g., raise HTTPException).
   ↓
6. Service executes business logic:
   - Check business rules (e.g., check if email exists).
   - Call UserRepository.create(user_data, db).
   - Return result.
   ↓
7. Repository performs database operation:
   - Executes `cursor.execute(sql, params)` using `mysql-connector-python`.
   - Handles database errors (e.g., IntegrityError).
   - Returns Pydantic model (User).
   ↓
8. Response flows back:
   Repository → Service → Controller → FastAPI → Client
```

---

## Directory Structure Rationale

### Routes Directory (`routes/` or `api/`)

**Purpose:** Register routes using `APIRouter`.

**Contents:**
- `user_routes.py` - FastAPI router for specific feature.

**Responsibilities:**
- Define endpoints `@router.get(...)`.
- Include dependencies (`Depends`).
- **NO business logic!**
- **NO direct DB calls!**

### Controllers Directory (`controllers/`)

**Purpose:** Bridge between HTTP and Business Logic.

**Contents:**
- `user_controller.py` - Functions or classes to handle the request.

**Responsibilities:**
- Call services.
- Map domain exceptions to `HTTPException`.
- Sometimes combined with Routes in simpler CRUDs, but separating them is cleaner for large apps.

### Services Directory (`services/`)

**Purpose:** Business logic and orchestration.

**Contents:**
- `user_service.py` - pure Python logic.

**Responsibilities:**
- Implement the "rules" of the system.
- Orchestrate multiple repositories.
- Manage transaction boundaries if a transaction spans multiple repos.
- Has NO idea it's running in FastAPI (no Request, no HTTPException).

### Repositories Directory (`repositories/` or `crud/`)

**Purpose:** Data access layer.

**Contents:**
- `user_repository.py` - Classes mapping to tables.

**Responsibilities:**
- Raw SQL queries.
- Mapping DB rows (tuples/dicts) to Pydantic models.
- Handling `mysql-connector` specific logic.

### Models Directory (`models/` or `schemas/`)

**Purpose:** Data validation and structures.

**Contents:**
- `user_models.py` - Pydantic v2 schemas.

---

## Separation of Concerns

### What Goes Where

**Routes/Controllers Layer:**
- ✅ Route definitions (`@router.post`)
- ✅ Security & Dependencies (`Depends`)
- ✅ Exception mapping (`raise HTTPException(status_code=400)`)
- ❌ Business logic
- ❌ SQL Queries

**Services Layer:**
- ✅ Business rules enforcement
- ✅ Orchestration of multiple tables
- ✅ Transaction management wrapper
- ❌ HTTP concerns (no `status_code`)
- ❌ Raw SQL (use repositories)

**Repositories Layer:**
- ✅ SQL Queries (`SELECT`, `INSERT`)
- ✅ Tuple-to-Pydantic mapping
- ✅ Database error catching
- ❌ Business rules
- ❌ HTTP concerns

---

**Related Files:**
- [SKILL.md](../SKILL.md) - Main guide
- [services-and-repositories.md](services-and-repositories.md) - Service and repository patterns

