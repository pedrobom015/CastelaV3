---
name: backend-dev-guidelines
description: Guia completo de desenvolvimento backend para o projeto Castela/Presserv. Use ao criar rotas, modelos Pydantic, classes CRUD, endpoints FastAPI ou ao trabalhar com FastAPI, Pydantic v2, mysql-connector-python e MySQL 8. Cobre arquitetura em camadas (models → CRUD classes → routes), padrão CRUD_BASE, pool de conexões, validação, paginação, naming conventions e anti-patterns. Projeto previsto para ~180 tabelas.
---

# Backend Development Guidelines — Castela/Presserv

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|-----------|-----------|-------|
| Framework | FastAPI | 0.115.x |
| Validação | Pydantic | v2 |
| Banco de Dados | MySQL | 8.x |
| Driver DB | mysql-connector-python | 9.3.x |
| Servidor | Uvicorn | 0.22.x |
| Runtime | Python | 3.11+ |

---

## Quando Usar Esta Skill

Ativa automaticamente ao trabalhar em:
- Criar ou modificar endpoints FastAPI
- Criar modelos Pydantic (`database_models.py` ou `models/`)
- Criar classes CRUD (`api_common_tables.py`)
- Operações de banco de dados MySQL
- Paginação e listagem de registros
- Qualquer nova tabela do sistema

---

## Quick Start — Nova Tabela Completa

- [ ] **SQL**: Tabela criada/verificada no MySQL (sem `column_N`, sem typos)
- [ ] **Modelo**: `{TabelaBase}` em `database_models.py` com padrão de campos
- [ ] **CRUD**: Classe em `api_common_tables.py` herdando de `CRUD_BASE`
- [ ] **Instância**: Variável global em `main.py` (ou router dedicado)
- [ ] **Rotas**: 6 endpoints padrão com **nomes únicos** de função
- [ ] **Nomes**: `GET /list_all/` e `GET /list/` com funções com nomes distintos
- [ ] **ID Rota**: Parâmetro `{item_id}` da rota bate com o parâmetro da função
- [ ] **Status HTTP**: `200 OK` para GET, `201 Created` para POST

---

## Arquitetura em Camadas

```
HTTP Request
    ↓
main.py (FastAPI routes) — ou routers/{modulo}.py
    ↓
api_common_tables.py (CRUD_BASE subclasses)
    ↓
database_models.py (Pydantic BaseModel)
    ↓
MySQL (mysql-connector-python)
```

**Princípio:** Cada camada tem UMA responsabilidade.

---

## Estrutura de Arquivos

```
back_end_castela/
├── main.py                    # Rotas FastAPI + instância DB
├── api_common_tables.py       # Classes CRUD (CRUD_BASE + subclasses)
├── database_models.py         # Modelos Pydantic
├── utils.py                   # Serialização (truple_to_json_list)
├── utils/                     # (futuro) utilitários adicionais
├── routers/                   # (futuro) APIRouter por domínio
│   ├── system.py
│   ├── contract.py
│   ├── partner.py
│   ├── geography.py
│   └── common.py
├── models/                    # (futuro) modelos separados por domínio
│   ├── system.py
│   ├── contract.py
│   └── ...
├── DB/
│   └── Cria_DB_Castela_v1.sql
├── requirements.txt
└── .env_dev
```

**Convenções de Nomenclatura:**
- Modelos Pydantic: `PascalCase + Base` → `GenderBase`, `ContractBase`
- Classes CRUD: `CRUD_UPPER_SNAKE` → `CRUD_GENDER`, `CRUD_PAYMENT_STATUS`
- Variáveis CRUD globais: `crud_{snake}` → `crud_gender`, `crud_pay_st`
- Tabelas MySQL: `snake_case` → `gender`, `payment_status`, `contract_charge`
- ID padrão: sempre `{tablename}_id` → `gender_id`, `payment_status_id`

---

## Padrão de Modelo Pydantic (OBRIGATÓRIO)

```python
# database_models.py
from pydantic import BaseModel
from datetime import datetime

class MinhaTabela(BaseModel):
    minha_tabela_id: int            # ← sempre {tablename}_id, NUNCA só 'id'
    campo_obrigatorio: str
    campo_opcional: int | None = None
    campo_bool: bool | None = None
    # Campos de auditoria — SEMPRE presentes em toda tabela
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    created_by: int | None = None
    updated_by: int | None = None
    deleted_by: int | None = None
```

> ⚠️ **Nunca use `id` sozinho** como nome do campo ID. Sempre use `{tablename}_id`.
> Isso é necessário para o `CRUD_BASE` funcionar corretamente com `__lblID`.

---

## Padrão CRUD_BASE — Uso Obrigatório

### Caso 1: Tabela Simples (sem customização)

```python
# api_common_tables.py
class CRUD_MINHA_TABELA(CRUD_BASE):
    def __init__(self):
        super().__init__(MinhaTabela, 'minha_tabela', 'minha_tabela_id')
        #                ^modelo       ^tabela SQL     ^coluna PK
```

Isso dá automaticamente:
- `get_reg_list(cursor)` — SELECT * sem filtro
- `get_reg_id(cursor, val_id)` — SELECT por ID, raise 404 se não encontrado
- `insert_reg(cursor, conn_db, item)` — INSERT com modelo Pydantic
- `delete_reg_id(cursor, conn_db, id)` — Soft delete (SET deleted_at)
- `update_reg_id(cursor, conn_db, item)` — UPDATE genérico a partir do modelo
- `get_reg_sort_list(cursor, sorter_id, pg_init, pg_end)` — Lista paginada

### Caso 2: Tabela com Campos Customizados no Update

```python
class CRUD_ESTADO(CRUD_BASE):
    def __init__(self):
        super().__init__(EstadoBase, 'estado', 'estado_id')

    def update_reg_custom(self, cursor, conn_db,
                          id_est: int, name: str, uf: str, codigo_ibge: str):
        update_query = f"""
        UPDATE {self.get_tablename()}
        SET name=%s, uf=%s, codigo_ibge=%s, updated_at=current_timestamp()
        WHERE {self.get_lblID()}= %s;
        """
        values = (name, uf, codigo_ibge, id_est)
        cursor.execute(update_query, values)
        conn_db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"message": "Updated successfully"}
```

### Métodos Auxiliares do CRUD_BASE

```python
self.get_tablename()   # retorna nome da tabela (string)
self.get_lblID()       # retorna nome da coluna PK (string)
self.data_model        # referência ao modelo Pydantic
```

---

## Padrão de Rotas FastAPI (OBRIGATÓRIO)

### Regra Crítica: Nomes de Função SEMPRE Únicos

```python
# ❌ ERRADO — FastAPI registra só a primeira, a segunda é ignorada
@app.get("/lista_all/")
def select_list_gender(): ...

@app.get("/lista/")
def select_list_gender(): ...  # ← mesmo nome! nunca alcançado

# ✅ CORRETO — nomes distintos para cada endpoint
@app.get("/lista_all/")
def list_all_gender(): ...

@app.get("/lista/")
def list_paged_gender(): ...
```

### Template Completo de Rotas (6 endpoints padrão)

```python
##################################################################
#            CRUD minha_tabela
##################################################################

@app.get("/apipresserv/v1/minha_tabela/{item_id}", status_code=status.HTTP_200_OK)
def get_minha_tabela_by_id(item_id: int):
    return crud_minha_tabela.get_reg_id(cursor_core, item_id)

@app.get("/apipresserv/v1/minha_tabela/list_all/", status_code=status.HTTP_200_OK)
def list_all_minha_tabela():
    return crud_minha_tabela.get_reg_list(cursor_core)

@app.get("/apipresserv/v1/minha_tabela/list/", status_code=status.HTTP_200_OK)
def list_paged_minha_tabela(sort_field: str, pg_init: int, pg_end: int):
    return crud_minha_tabela.get_reg_sort_list(cursor_core, sort_field, pg_init, pg_end)

@app.post("/apipresserv/v1/minha_tabela/", status_code=status.HTTP_201_CREATED)
def insert_minha_tabela(item: MinhaTabela):
    return crud_minha_tabela.insert_reg(cursor_core, db_castela_core, item)

@app.put("/apipresserv/v1/minha_tabela/{item_id}", status_code=status.HTTP_200_OK)
def update_minha_tabela(item: MinhaTabela):
    return crud_minha_tabela.update_reg_id(cursor_core, db_castela_core, item)

@app.delete("/apipresserv/v1/minha_tabela/{item_id}", status_code=status.HTTP_200_OK)
def delete_minha_tabela(item_id: int):
    return crud_minha_tabela.delete_reg_id(cursor_core, db_castela_core, item_id)

##################################################################
#        FIM CRUD minha_tabela
##################################################################
```

### Status HTTP Corretos

| Operação | Status Code |
|---------|------------|
| GET (lista ou por ID) | `200 OK` |
| POST (criação) | `201 Created` |
| PUT (atualização) | `200 OK` |
| DELETE (soft delete) | `200 OK` |
| Não encontrado | `404 Not Found` |
| Erro de validação | `400 Bad Request` |

> ❌ **Nunca use `HTTP_302_FOUND` para retornar dados** — esse código é para redirecionamento.

---

## Padrão de Verificação de Rota vs. Parâmetro

Sempre verifique que o parâmetro na URL bate com o parâmetro da função:

```python
# ❌ ERRADO — {doc_type_id} na rota mas a função usa addr_type_id
@app.get("/apipresserv/v1/addr_type/{doc_type_id}")
def get_addr_type_by_id(addr_type_id: int): ...

# ✅ CORRETO — parâmetros idênticos
@app.get("/apipresserv/v1/addr_type/{addr_type_id}")
def get_addr_type_by_id(addr_type_id: int): ...
```

---

## Anti-Patterns a Evitar

❌ **Nomes de função duplicados** em `main.py` (segunda sempre ignorada pelo FastAPI)
❌ **Campo `id`** sozinho no modelo — use sempre `{tablename}_id`
❌ **`HTTP_302_FOUND`** em endpoints GET que retornam dados
❌ **Parâmetros de rota desconectados** da assinatura da função
❌ **Classes CRUD sem herdar de `CRUD_BASE`** — sempre use herança
❌ **SQL hardcoded** nas subclasses quando `CRUD_BASE` já cobre o caso
❌ **`print()`** em código — use `logging.getLogger(__name__)`
❌ **Conexão global única** sem pool — risco de timeout e travamentos
❌ **Misturar idiomas** nos nomes de campo (só inglês para colunas)
❌ **Colunas `column_N`** sem nome/propósito no SQL

---

## Checklist SQL antes de Criar um Modelo

Antes de criar o modelo Python para uma tabela:

- [ ] Tabela tem PK `AUTO_INCREMENT` com nome `{tablename}_id`
- [ ] Não há colunas genéricas como `column_9`
- [ ] `updated_at` tem `ON UPDATE CURRENT_TIMESTAMP` (ou atualização manual)
- [ ] Sem typos no nome de colunas (ex: `billing_frequenc` → `billing_frequency`)
- [ ] Nomes de colunas em inglês
- [ ] FKs declaradas com `CONSTRAINT` e `KEY` de índice

---

## Módulos do Projeto

Ver recursos por tópico específico:

| Precisa de... | Arquivo |
|--------------|---------|
| Contexto completo de arquitetura | [architecture-overview.md](resources/architecture-overview.md) |
| Padrão CRUD_BASE detalhado | [services-and-repositories.md](resources/services-and-repositories.md) |
| Rotas e controllers | [routing-and-controllers.md](resources/routing-and-controllers.md) |
| Modelos Pydantic e validação | [validation-patterns.md](resources/validation-patterns.md) |
| Acesso ao banco de dados | [database-patterns.md](resources/database-patterns.md) |
| Configuração e env vars | [configuration.md](resources/configuration.md) |
| Tratamento de erros async | [async-and-errors.md](resources/async-and-errors.md) |
| Testes | [testing-guide.md](resources/testing-guide.md) |
| Exemplos completos | [complete-examples.md](resources/complete-examples.md) |

---

## Inconsistências Conhecidas (a corrigir durante higienização)

> Esta seção documenta bugs/inconsistências no código atual que devem ser corrigidos.
> Atualize quando um item for resolvido.

| # | Arquivo | Problema | Status |
|---|---------|---------|--------|
| 1 | `main.py` | `select_list_gender` duplicado (linhas 56 e 72) | 🔴 Aberto |
| 2 | `main.py` | `select_list_doc_type` duplicado (linhas 84 e 100) | 🔴 Aberto |
| 3 | `main.py` | `select_list_addr_type` duplicado (linhas 116 e 132) | 🔴 Aberto |
| 4 | `main.py` | `select_list_estado_uf` duplicado (linhas 181 e 193) | 🔴 Aberto |
| 5 | `main.py` | `select_list_cidade` duplicado (linhas 218 e 230) | 🔴 Aberto |
| 6 | `main.py` | `update_estado_uf` duplicado (linhas 201 e 206) | 🔴 Aberto |
| 7 | `main.py` | `update_cidade` duplicado (linhas 238 e 243) | 🔴 Aberto |
| 8 | `main.py` | Rota `addr_type` usa `{doc_type_id}` mas função usa `addr_type_id` | 🔴 Aberto |
| 9 | `main.py` | Rota DELETE `cidade` usa `{estado_id}` mas função usa `cidade_id` | 🔴 Aberto |
| 10 | `main.py` | Todos GET por ID usam `HTTP_302_FOUND` (deveria ser 200) | 🔴 Aberto |
| 11 | `database_models.py` | `EstadoBase.id` deveria ser `estado_id` | 🔴 Aberto |
| 12 | `database_models.py` | `CidadeBase.id` deveria ser `cidade_id` | 🔴 Aberto |
| 13 | `api_common_tables.py` | `CRUD_GENDER`, `CRUD_DOCUMENT_TYPE`, `CRUD_ADDRESS_TYPE` não herdam de `CRUD_BASE` | 🔴 Aberto |
| 14 | `api_common_tables.py` | `print()` em código de produção (linhas 119, 128, 132, 291, 370, 604) | 🔴 Aberto |
| 15 | `DB/Cria_DB_Castela_v1.sql` | `address_type` tem `column_9` sem propósito | 🔴 Aberto |
| 16 | `DB/Cria_DB_Castela_v1.sql` | `contract.billing_frequenc` — typo (falta 'y') | 🔴 Aberto |
| 17 | `DB/Cria_DB_Castela_v1.sql` | Tabelas `estado` e `cidade` ausentes no SQL v1 | 🔴 Aberto |
| 18 | `main.py` | Conexão DB global sem pool (risco de timeout) | 🔸 Técnico |

---

**Skill Status**: ATUALIZADO ✅
**Versão**: v2.0 — Python/FastAPI/MySQL
**Última atualização**: 2026-03-09
