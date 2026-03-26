# Testing Guide - Backend Testing Strategies

Complete guide to testing FastAPI backend services with `pytest` and `unittest.mock`.

## Table of Contents

- [Unit Testing with Pytest](#unit-testing-with-pytest)
- [Mocking Strategies (Repositories)](#mocking-strategies-repositories)
- [Integration Testing with TestClient](#integration-testing-with-testclient)
- [Coverage Targets](#coverage-targets)

---

## Unit Testing with Pytest

### Test Structure

Test files should be named `test_*.py`.

```python
# tests/test_user_service.py
import pytest
from unittest.mock import Mock
from services.user_service import UserService
from models.user import UserCreate, User
from utils.exceptions import ConflictError

def test_create_user_throws_if_email_exists():
    # Arrange
    mock_repo = Mock()
    mock_repo.find_by_email.return_value = User(id=1, email="test@test.com", name="Test")

    service = UserService(user_repo=mock_repo)
    user_data = UserCreate(email="test@test.com", name="Test")

    # Act & Assert
    with pytest.raises(ConflictError) as exc_info:
        service.create(user_data)

    assert "Email already in use" in str(exc_info.value)
    mock_repo.create.assert_not_called()

def test_create_user_success():
    # Arrange
    mock_repo = Mock()
    mock_repo.find_by_email.return_value = None
    mock_repo.create.return_value = User(id=1, email="new@test.com", name="New")

    service = UserService(user_repo=mock_repo)
    user_data = UserCreate(email="new@test.com", name="New")

    # Act
    result = service.create(user_data)

    # Assert
    assert result.id == 1
    mock_repo.create.assert_called_once_with(user_data)
```

---

## Mocking Strategies (Repositories)

Because we use Dependency Injection, mocking the database is incredibly easy. We do **not** need to use complex mock-database libraries; we simply pass a `Mock()` object into the Service instead of the real `UserRepository`.

```python
# This avoids needing an active MySQL instance for unit tests!
mock_repo = Mock(spec=UserRepository)
service = UserService(user_repo=mock_repo)
```

---

## Integration Testing with TestClient

FastAPI provides a `TestClient` object that makes it easy to test endpoints without spinning up a real server.

```python
# tests/test_user_routes.py
from fastapi.testclient import TestClient
from main import app
from dependencies import get_user_service

client = TestClient(app)

def test_create_user_endpoint():
    # Arrange: Override the dependency to use a mock service
    mock_service = Mock()
    mock_service.create_user.return_value = {"id": 1, "email": "test@test.com", "name": "Api"}

    # Override FastAPI dependency for this test
    app.dependency_overrides[get_user_service] = lambda: mock_service

    # Act
    payload = {"email": "test@test.com", "name": "Api", "password": "secure"}
    response = client.post("/users/", json=payload)

    # Assert
    assert response.status_code == 201
    assert response.json()["id"] == 1

    # Cleanup dependency override
    app.dependency_overrides.clear()
```

---

## Coverage Targets

### Recommended Coverage

- **Unit Tests**: 70%+ coverage (Testing Services extensively)
- **Integration Tests**: Critical endpoints covered

### Run Coverage

Run `pytest` with `pytest-cov` installed:

```bash
pytest --cov=src tests/
```
