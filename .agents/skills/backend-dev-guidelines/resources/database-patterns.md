# Database Patterns - MySQL Connector Best Practices

Complete guide to database access patterns using `mysql-connector-python` in our FastAPI microservices.

## Table of Contents

- [Connection Pooling](#connection-pooling)
- [Repository Pattern](#repository-pattern)
- [Transaction Patterns](#transaction-patterns)
- [Query Optimization](#query-optimization)
- [N+1 Query Prevention](#n1-query-prevention)
- [Error Handling](#error-handling)

---

## Connection Pooling

### Basic Pattern

Never create a new connection from scratch for every request. Use a connection pool.

```python
from contextlib import contextmanager
from mysql.connector.pooling import MySQLConnectionPool
import os

db_pool = MySQLConnectionPool(
    pool_name="fastapi_pool",
    pool_size=10,
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

@contextmanager
def get_db_connection():
    connection = db_pool.get_connection()
    try:
        yield connection
    finally:
        connection.close()  # Returns connection to the pool
```

### FastAPI Dependency

```python
from fastapi import Depends

def get_db():
    with get_db_connection() as conn:
        yield conn
```

---

## Repository Pattern

### Why Use Repositories

[OK] **Use repositories because:**
- All raw SQL queries must be isolated.
- Central place to use `cursor.execute()`.
- Converts raw database tuples/dicts into Pydantic models.

[BAD] **Never do this:**
- Write SQL directly in FastAPI routes or Services.

### Repository Template

```python
from typing import Optional, List
from mysql.connector.connection import MySQLConnection
from models.user import User

class UserRepository:
    def __init__(self, connection: MySQLConnection):
        self.connection = connection

    def find_by_id(self, user_id: int) -> Optional[User]:
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, email, name, is_active FROM users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if row:
                return User(**row)
            return None
        finally:
            cursor.close()

    def find_active(self) -> List[User]:
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, email, name, is_active FROM users WHERE is_active = 1 ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [User(**row) for row in rows]
        finally:
            cursor.close()
```

---

## Transaction Patterns

### Simple Transaction

```python
def create_user_with_profile(self, user_data: dict, profile_data: dict) -> User:
    cursor = self.connection.cursor()
    try:
        # Step 1: Create user
        cursor.execute("INSERT INTO users (email, name) VALUES (%s, %s)", (user_data['email'], user_data['name']))
        user_id = cursor.lastrowid

        # Step 2: Create profile
        cursor.execute("INSERT INTO user_profiles (user_id, bio) VALUES (%s, %s)", (user_id, profile_data['bio']))

        # Commit manually
        self.connection.commit()
        return self.find_by_id(user_id)
    except Exception as e:
        self.connection.rollback()
        raise e
    finally:
        cursor.close()
```

---

## Query Optimization

### Use SELECT to Limit Fields

```python
# [BAD] Fetches all fields, wasting memory and network
cursor.execute("SELECT * FROM users")

# [OK] Only fetch needed fields
cursor.execute("SELECT id, email FROM users")
```

---

## N+1 Query Prevention

### Problem: N+1 Queries

```python
# [BAD] N+1 Query Problem
users = self.find_all_users() # 1 query

for user in users:
    # N queries (one per user) inside a loop
    profile = self.find_profile_by_user_id(user.id)
```

### Solution: Use JOINs or IN clause

```python
# [OK] Single query with JOIN
cursor.execute("""
    SELECT u.id, u.email, p.bio
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
""")

# [OK] Or batch query
user_ids = [u.id for u in users]
format_strings = ','.join(['%s'] * len(user_ids))
cursor.execute(f"SELECT * FROM user_profiles WHERE user_id IN ({format_strings})", tuple(user_ids))
```

---

## Error Handling

### MySQL Config and Error Types

```python
import mysql.connector
from utils.exceptions import ConflictError, DatabaseError

try:
    cursor.execute("INSERT INTO users (email) VALUES (%s)", (email,))
    self.connection.commit()
except mysql.connector.Error as err:
    self.connection.rollback()
    if err.errno == 1062:  # ER_DUP_ENTRY
        raise ConflictError('Email already exists')
    if err.errno == 1452:  # ER_NO_REFERENCED_ROW_2
        raise DatabaseError('Invalid foreign key reference')

    # Reraise or log
    raise DatabaseError(f"Database error: {err.msg}")
```
