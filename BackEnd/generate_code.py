import re
from pathlib import Path
from typing import Dict


def extract_tables_from_dump(sql_content: str) -> dict:
    tables = {}
    
    content = re.sub(r'--.*$', '', sql_content, flags=re.MULTILINE)
    
    table_pattern = r'CREATE TABLE[^`]*`?(\w+)`?\s*\('
    
    for match in re.finditer(table_pattern, content, re.IGNORECASE):
        table_name = match.group(1)
        start_pos = match.end() - 1
        
        paren_count = 1
        end_pos = start_pos + 1
        while end_pos < len(content) and paren_count > 0:
            if content[end_pos] == '(':
                paren_count += 1
            elif content[end_pos] == ')':
                paren_count -= 1
            end_pos += 1
        
        body = content[start_pos:end_pos]
        
        columns = {}
        primary_keys = []
        
        for line in body.split('\n'):
            line = line.strip().strip(',').strip()
            if not line or len(line) < 3:
                continue
            
            line_upper = line.upper()
            
            if line_upper.startswith('PRIMARY KEY') or line_upper.startswith('KEY ') or line_upper.startswith('UNIQUE KEY') or line_upper.startswith('CONSTRAINT') or line_upper.startswith('INDEX') or line_upper.startswith('FOREIGN KEY'):
                continue
            
            col_match = re.match(r"^`?(\w+)`?\s+(\w+)", line, re.IGNORECASE)
            if col_match:
                col_name = col_match.group(1)
                col_type_raw = col_match.group(2).lower()
                
                is_nullable = 'NOT NULL' not in line_upper
                
                mysql_to_python = {
                    'int': 'int', 'bigint': 'int', 'smallint': 'int', 'tinyint': 'int',
                    'mediumint': 'int', 'decimal': 'float', 'float': 'float', 'double': 'float',
                    'varchar': 'str', 'char': 'str', 'text': 'str', 'longtext': 'str',
                    'datetime': 'datetime', 'timestamp': 'datetime', 'date': 'date', 'time': 'time',
                    'json': 'str', 'bool': 'bool', 'boolean': 'bool'
                }
                
                python_type = mysql_to_python.get(col_type_raw, 'str')
                
                columns[col_name] = {
                    'type': python_type,
                    'nullable': is_nullable
                }
        
        if columns:
            tables[table_name] = {
                'columns': columns,
                'primary_keys': primary_keys if primary_keys else ['id'],
                'foreign_keys': []
            }
    
    return tables


def to_camel_case(name: str) -> str:
    name = re.sub(r'[^a-zA-Z0-9]', '', name)
    return name[0].upper() + name[1:] if name else ''


def to_snake_case(name: str) -> str:
    s = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s


def get_column_sqlalchemy(col_name: str, col_info: Dict, is_pk: bool) -> str:
    col_type = col_info['type']
    
    type_map = {
        'datetime': 'DateTime(timezone=True)',
        'date': 'DateTime(timezone=True)',
        'bool': 'Boolean',
        'int': 'Integer',
        'float': 'Float'
    }
    
    type_str = type_map.get(col_type, 'String(255)')
    
    if is_pk:
        return f'Column({type_str}, primary_key=True, index=True, autoincrement=True)'
    elif not col_info['nullable']:
        return f'Column({type_str}, nullable=False)'
    else:
        return f'Column({type_str}, nullable=True)'


def generate_models(tables: Dict, output_file: Path):
    lines = [
        'from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float',
        'from sqlalchemy.orm import relationship',
        'from app.models.base import Base, AuditMixin',
        ''
    ]
    
    for table_name, info in tables.items():
        columns = info['columns']
        pk = info['primary_keys'][0] if info['primary_keys'] else 'id'
        
        class_name = to_camel_case(table_name)
        if not class_name or not columns:
            continue
            
        lines.append(f'class {class_name}(Base, AuditMixin):')
        lines.append(f'    __tablename__ = "{table_name}"')
        lines.append('')
        
        for col_name, col_info in columns.items():
            is_pk = col_name.lower() == pk.lower()
            col_sql = get_column_sqlalchemy(col_name, col_info, is_pk)
            lines.append(f'    {col_name} = {col_sql}')
        
        lines.append('')
    
    output_file.write_text('\n'.join(lines), encoding='utf-8')


def generate_schemas(tables: Dict, output_file: Path):
    lines = [
        'from pydantic import BaseModel, ConfigDict',
        'from datetime import datetime',
        'from typing import Optional',
        ''
    ]
    
    for table_name, info in tables.items():
        columns = info['columns']
        class_name = to_camel_case(table_name)
        pk = info['primary_keys'][0] if info['primary_keys'] else 'id'
        
        if not class_name or not columns:
            continue
        
        base_fields = []
        for col_name, col_info in columns.items():
            if col_name == pk:
                continue
            py_type = col_info['type']
            
            type_map = {
                'datetime': 'Optional[datetime]',
                'date': 'Optional[datetime]',
                'bool': 'bool = False',
                'int': 'Optional[int] = None',
                'float': 'Optional[float] = None'
            }
            py_type = type_map.get(py_type, 'Optional[str] = None')
            
            base_fields.append((col_name, py_type))
        
        if not base_fields:
            continue
            
        lines.append(f'class {class_name}Base(BaseModel):')
        for col_name, col_type in base_fields:
            lines.append(f'    {col_name}: {col_type}')
        lines.append('')
        
        lines.append(f'class {class_name}Create({class_name}Base):')
        lines.append('    pass')
        lines.append('')
        
        lines.append(f'class {class_name}Update(BaseModel):')
        for col_name, col_type in base_fields:
            if col_name not in ['created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by']:
                lines.append(f'    {col_name}: {col_type} = None')
        lines.append('')
        
        lines.append(f'class {class_name}({class_name}Base):')
        lines.append(f'    {pk}: int')
        lines.append('    created_at: Optional[datetime] = None')
        lines.append('    updated_at: Optional[datetime] = None')
        lines.append('    model_config = ConfigDict(from_attributes=True)')
        lines.append('')
    
    output_file.write_text('\n'.join(lines), encoding='utf-8')


def generate_crud(tables: Dict, output_file: Path):
    lines = [
        'from app.crud.base import CRUDBase',
        ''
    ]
    
    model_classes = []
    for table_name in tables.keys():
        class_name = to_camel_case(table_name)
        if class_name and tables[table_name]['columns']:
            model_classes.append(class_name)
    
    if model_classes:
        lines.append('from app.models.domain_erp import (')
        for i, c in enumerate(sorted(model_classes)):
            lines.append(f'    {c},' if i < len(model_classes) - 1 else f'    {c}')
        lines.append(')')
        lines.append('')
        lines.append('from app.schemas.domain_erp import (')
        for i, c in enumerate(sorted(model_classes)):
            lines.append(f'    {c}Create, {c}Update,' if i < len(model_classes) - 1 else f'    {c}Create, {c}Update')
        lines.append(')')
        lines.append('')
    
    for table_name, info in tables.items():
        class_name = to_camel_case(table_name)
        if class_name and info['columns']:
            lines.append(f'crud_{to_snake_case(table_name)} = CRUDBase[{class_name}, {class_name}Create, {class_name}Update]({class_name})')
    
    output_file.write_text('\n'.join(lines), encoding='utf-8')


def generate_endpoints(tables: Dict, endpoints_dir: Path):
    endpoints_dir.mkdir(parents=True, exist_ok=True)
    
    for table_name, info in tables.items():
        class_name = to_camel_case(table_name)
        pk = info['primary_keys'][0] if info['primary_keys'] else 'id'
        snake_name = to_snake_case(table_name)
        
        if not class_name or not info['columns']:
            continue
        
        output_file = endpoints_dir / f'{snake_name}.py'
        
        lines = [
            'from fastapi import APIRouter, Depends, HTTPException, status',
            'from sqlalchemy.orm import Session',
            'from typing import List',
            'from app.core.database import get_db',
            'import app.crud.domain_erp as crud_module',
            'import app.schemas.domain_erp as schemas_module',
            '',
            f'router = APIRouter(prefix="/{snake_name}", tags=["{snake_name}"])',
            '',
            f'@router.get("/", response_model=List[schemas_module.{class_name}])',
            f'def read_{snake_name}(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):',
            f'    return crud_module.crud_{snake_name}.get_multi(db, skip=skip, limit=limit)',
            '',
            f'@router.get("/{{{pk}}}", response_model=schemas_module.{class_name})',
            f'def read_{snake_name}_by_id({pk}: int, db: Session = Depends(get_db)):',
            f'    obj = crud_module.crud_{snake_name}.get(db, id={pk})',
            f'    if not obj:',
            f'        raise HTTPException(status_code=404, detail="{class_name} not found")',
            f'    return obj',
            '',
            f'@router.post("/", response_model=schemas_module.{class_name}, status_code=status.HTTP_201_CREATED)',
            f'def create_{snake_name}(obj_in: schemas_module.{class_name}Create, db: Session = Depends(get_db)):',
            f'    return crud_module.crud_{snake_name}.create(db=db, obj_in=obj_in)',
            '',
            f'@router.put("/{{{pk}}}", response_model=schemas_module.{class_name})',
            f'def update_{snake_name}({pk}: int, obj_in: schemas_module.{class_name}Update, db: Session = Depends(get_db)):',
            f'    obj = crud_module.crud_{snake_name}.get(db, id={pk})',
            f'    if not obj:',
            f'        raise HTTPException(status_code=404, detail="{class_name} not found")',
            f'    return crud_module.crud_{snake_name}.update(db=db, db_obj=obj, obj_in=obj_in)',
            '',
            f'@router.delete("/{{{pk}}}", response_model=schemas_module.{class_name})',
            f'def delete_{snake_name}({pk}: int, db: Session = Depends(get_db)):',
            f'    obj = crud_module.crud_{snake_name}.get(db, id={pk})',
            f'    if not obj:',
            f'        raise HTTPException(status_code=404, detail="{class_name} not found")',
            f'    return crud_module.crud_{snake_name}.remove(db=db, id={pk})',
        ]
        
        output_file.write_text('\n'.join(lines), encoding='utf-8')


def main():
    base_dir = Path(__file__).parent
    app_dir = base_dir / 'app'
    
    for old_file in (app_dir / 'models').glob('domain_*.py'):
        old_file.unlink()
    for old_file in (app_dir / 'schemas').glob('domain_*.py'):
        old_file.unlink()
    for old_file in (app_dir / 'crud').glob('domain_*.py'):
        if old_file.name != 'base.py':
            old_file.unlink()
    
    print('=' * 60)
    print('GERADOR DE CÓDIGO - ERP CASTELA (DUMP COMPLETO)')
    print('=' * 60)
    print()
    
    filepath = base_dir / 'Dump_ERP_Castela.sql'
    print(f'Lendo: {filepath.name}...')
    content = filepath.read_text(encoding='utf-8')
    
    tables = extract_tables_from_dump(content)
    valid_tables = {k: v for k, v in tables.items() if v['columns']}
    print(f'Total de tabelas: {len(valid_tables)}')
    print()
    
    print('Gerando models...')
    generate_models(valid_tables, app_dir / 'models' / 'domain_erp.py')
    print('  - domain_erp.py')
    
    print('Gerando schemas...')
    generate_schemas(valid_tables, app_dir / 'schemas' / 'domain_erp.py')
    print('  - domain_erp.py')
    
    print('Gerando crud...')
    generate_crud(valid_tables, app_dir / 'crud' / 'domain_erp.py')
    print('  - domain_erp.py')
    
    print('Gerando endpoints...')
    generate_endpoints(valid_tables, app_dir / 'api' / 'endpoints')
    print(f'  - {len(valid_tables)} endpoints')
    
    print()
    print('=' * 60)
    print('Concluído!')
    print('=' * 60)


if __name__ == '__main__':
    main()