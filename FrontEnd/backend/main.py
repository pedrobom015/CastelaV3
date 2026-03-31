import datetime
import os
import struct
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path
from typing import Any

from dbfread import DBF
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Presserv DBF API", version="1.0.0")

# Simula expiração de sessão (Cloudflare 403) em todas as operações de escrita.
# Para ativar: FORCE_403=true no arquivo backend/.env ou variável de ambiente.
FORCE_403 = os.getenv("FORCE_403", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "dados-teste"


# ---------- serialização / deserialização ------------------------------------

def _serialize(v: Any) -> Any:
    if isinstance(v, datetime.date):
        return v.isoformat()
    if v is None:
        return None
    return v


def _read_dbf(table_name: str) -> tuple[list[dict], list[dict]]:
    path = DATA_DIR / f"{table_name.upper()}.DBF"
    if not path.exists():
        raise HTTPException(404, f"{table_name.upper()}.DBF não encontrado")
    for enc in ("utf-8", "latin-1", "cp850"):
        try:
            table = DBF(str(path), encoding=enc, ignore_missing_memofile=True)
            fields = [{"name": f.name, "type": f.type, "length": f.length} for f in table.fields]
            records = [{k: _serialize(v) for k, v in dict(row).items()} for row in table]
            return fields, records
        except UnicodeDecodeError:
            continue
        except Exception as e:
            raise HTTPException(500, f"Erro ao ler {table_name}: {e}")
    raise HTTPException(500, f"Não foi possível decodificar {table_name}.DBF (utf-8/latin-1/cp850)")


def _dbf_path(table_name: str) -> Path:
    path = DATA_DIR / f"{table_name.upper()}.DBF"
    if not path.exists():
        raise HTTPException(404, f"{table_name.upper()}.DBF não encontrado")
    return path


# ---------- escritor DBF nativo (sem lib dbf) --------------------------------

def _encode_field_value(value: Any, ftype: str, length: int, decimals: int) -> bytes:
    """Serializa um valor para bytes no formato DBF."""
    if ftype in ("C",):
        s = str(value) if value is not None else ""
        return s.encode("utf-8", errors="replace")[:length].ljust(length, b" ")

    if ftype in ("N", "F"):
        if value is None or value == "":
            raw = b" " * length
        else:
            try:
                num = float(value)
            except (TypeError, ValueError):
                num = 0.0
            if decimals > 0:
                s = f"{num:.{decimals}f}"
            else:
                s = str(int(num))
            raw = s.encode("utf-8", errors="replace")[-length:].rjust(length, b" ")
        return raw[:length].rjust(length, b" ")

    if ftype == "D":
        if value and str(value).strip():
            try:
                d = datetime.date.fromisoformat(str(value)[:10])
                s = f"{d.year:04d}{d.month:02d}{d.day:02d}"
            except (ValueError, TypeError):
                s = " " * 8
        else:
            s = " " * 8
        return s.encode("utf-8")

    if ftype == "L":
        return b"T" if value else b"F"

    if ftype == "M":
        return b" " * 10  # referência memo — ignoramos conteúdo

    # fallback
    s = str(value) if value is not None else ""
    return s.encode("utf-8", errors="replace")[:length].ljust(length, b" ")


def _write_dbf(path: Path, fields: list[dict], records: list[dict]) -> None:
    """Escreve um arquivo DBF completo substituindo o conteúdo existente."""
    now = datetime.date.today()
    num_fields = len(fields)
    header_size = 32 + num_fields * 32 + 1
    record_size = 1 + sum(f["length"] for f in fields)
    num_records = len(records)

    buf = bytearray()

    # Cabeçalho principal (32 bytes)
    buf += struct.pack("<B", 3)                        # versão dBASE III
    buf += struct.pack("<BBB", now.year - 1900, now.month, now.day)
    buf += struct.pack("<I", num_records)              # qtd registros
    buf += struct.pack("<H", header_size)              # tamanho cabeçalho
    buf += struct.pack("<H", record_size)              # tamanho registro
    buf += b"\x00" * 20                               # reservado

    # Descritores de campo (32 bytes cada)
    for f in fields:
        name_bytes = f["name"].upper().encode("latin-1")[:11].ljust(11, b"\x00")
        buf += name_bytes
        buf += f["type"].encode("latin-1")
        buf += b"\x00" * 4                            # reservado
        buf += struct.pack("<B", f["length"])
        buf += struct.pack("<B", f.get("decimals", 0))
        buf += b"\x00" * 14                           # reservado

    buf += b"\r"  # terminador de cabeçalho

    # Registros
    for raw in records:
        buf += b" "  # flag não-deletado
        for f in fields:
            key_lower = f["name"].lower()
            key_upper = f["name"].upper()
            value = raw.get(key_lower, raw.get(key_upper))
            buf += _encode_field_value(value, f["type"], f["length"], f.get("decimals", 0))

    buf += b"\x1a"  # EOF

    path.write_bytes(bytes(buf))


# ---------- routes -----------------------------------------------------------

@app.get("/")
def root():
    files = sorted(f.name for f in DATA_DIR.glob("*.DBF"))
    return JSONResponse({"arquivos": files})


@app.get("/tables")
def list_tables():
    return JSONResponse({"tables": sorted(f.stem for f in DATA_DIR.glob("*.DBF"))})


@app.get("/tables/{table_name}/schema")
def get_schema(table_name: str):
    fields, _ = _read_dbf(table_name)
    return JSONResponse({"table": table_name.upper(), "fields": fields})


@app.get("/tables/{table_name}")
def get_table(table_name: str):
    fields, records = _read_dbf(table_name)
    return JSONResponse({
        "table": table_name.upper(),
        "count": len(records),
        "fields": fields,
        "records": records,
    })


@app.put("/tables/{table_name}")
def replace_table(table_name: str, body: dict):
    """Substitui todos os registros da tabela (recebe lista completa)."""
    if FORCE_403:
        raise HTTPException(403, "Simulação de sessão expirada (FORCE_403=true)")
    path = _dbf_path(table_name)
    records_data = body.get("records", [])
    try:
        fields, _ = _read_dbf(table_name)
        _write_dbf(path, fields, records_data)
        return JSONResponse({"ok": True, "count": len(records_data)})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erro ao salvar {table_name}: {e}")


@app.put("/tables/{table_name}/records/{record_index}")
def update_record(table_name: str, record_index: int, body: dict):
    """Atualiza os campos de um registro existente pelo índice (0-based)."""
    if FORCE_403:
        raise HTTPException(403, "Simulação de sessão expirada (FORCE_403=true)")
    fields, records = _read_dbf(table_name)
    if record_index < 0 or record_index >= len(records):
        raise HTTPException(400, f"Índice {record_index} fora do range (0-{len(records)-1})")
    records[record_index].update({k.lower(): v for k, v in body.items()})
    path = _dbf_path(table_name)
    try:
        _write_dbf(path, fields, records)
        return JSONResponse({"ok": True, "index": record_index})
    except Exception as e:
        raise HTTPException(500, f"Erro ao atualizar registro: {e}")


@app.post("/tables/{table_name}/records")
def add_record(table_name: str, body: dict):
    """Acrescenta um novo registro ao final da tabela."""
    if FORCE_403:
        raise HTTPException(403, "Simulação de sessão expirada (FORCE_403=true)")
    fields, records = _read_dbf(table_name)
    records.append({k.lower(): v for k, v in body.items()})
    path = _dbf_path(table_name)
    try:
        _write_dbf(path, fields, records)
        return JSONResponse({"ok": True, "index": len(records) - 1})
    except Exception as e:
        raise HTTPException(500, f"Erro ao adicionar registro: {e}")


@app.delete("/tables/{table_name}/records/{record_index}")
def delete_record(table_name: str, record_index: int):
    """Remove um registro pelo índice (hard delete — reescreve o arquivo)."""
    fields, records = _read_dbf(table_name)
    if record_index < 0 or record_index >= len(records):
        raise HTTPException(400, f"Índice {record_index} fora do range")
    records.pop(record_index)
    path = _dbf_path(table_name)
    try:
        _write_dbf(path, fields, records)
        return JSONResponse({"ok": True, "index": record_index})
    except Exception as e:
        raise HTTPException(500, f"Erro ao deletar registro: {e}")
