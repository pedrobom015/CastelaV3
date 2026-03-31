import re
from pathlib import Path


def extract_tables_from_dump(sql_content: str) -> dict:
    tables = {}
    
    content = re.sub(r'--[^\n]*\n', '\n', sql_content)
    
    table_pattern = r'CREATE TABLE[^`]*`?(\w+)`?\s*\((.*?)\)\s*ENGINE'
    
    for match in re.finditer(table_pattern, content, re.DOTALL | re.IGNORECASE):
        table_name = match.group(1)
        body = match.group(2)
        
        columns = {}
        primary_keys = []
        foreign_keys = []
        
        for line in body.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if 'PRIMARY KEY' in line.upper():
                pk_match = re.search(r'\(([^)]+)\)', line)
                if pk_match:
                    primary_keys = [k.strip().strip('`') for k in pk_match.group(1).split(',')]
                continue
                
            if 'FOREIGN KEY' in line.upper():
                fk_match = re.search(r'FOREIGN KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?', line, re.IGNORECASE)
                if fk_match:
                    foreign_keys.append({
                        'column': fk_match.group(1),
                        'ref_table': fk_match.group(2),
                        'ref_column': fk_match.group(3)
                    })
                continue
                
            if re.match(r'^(INDEX|KEY|UNIQUE KEY|CONSTRAINT)', line, re.IGNORECASE):
                continue
            
            col_match = re.match(r"`?(\w+)`?\s+(.+)", line, re.IGNORECASE)
            if col_match:
                col_name = col_match.group(1)
                col_def = col_match.group(2).rstrip(',').rstrip(')')
                
                type_match = re.match(r'(\w+)(?:\(([^)]+)\))?', col_def.strip(), re.IGNORECASE)
                col_type = type_match.group(1).lower() if type_match else 'varchar'
                
                is_nullable = 'NOT NULL' not in col_def.upper()
                
                mysql_to_python = {
                    'int': 'int', 'bigint': 'int', 'smallint': 'int', 'tinyint': 'int',
                    'decimal': 'float', 'float': 'float', 'double': 'float',
                    'varchar': 'str', 'char': 'str', 'text': 'str',
                    'datetime': 'datetime', 'timestamp': 'datetime', 'date': 'date',
                    'json': 'str', 'bool': 'bool', 'boolean': 'bool'
                }
                
                python_type = mysql_to_python.get(col_type, 'str')
                
                columns[col_name] = {
                    'type': python_type,
                    'nullable': is_nullable
                }
        
        tables[table_name] = {
            'columns': columns,
            'primary_keys': primary_keys if primary_keys else ['id'],
            'foreign_keys': foreign_keys
        }
    
    return tables


def main():
    base_dir = Path(__file__).parent
    
    print('=' * 60)
    print('TESTE DO PARSER - DUMP COMPLETO')
    print('=' * 60)
    
    filepath = base_dir / 'Dump_ERP_Castela.sql'
    content = filepath.read_text(encoding='utf-8')
    
    tables = extract_tables_from_dump(content)
    
    print(f'Total de tabelas: {len(tables)}')
    
    for name, info in list(tables.items())[:10]:
        print(f'\nTabela: {name}')
        print(f'  Colunas: {len(info["columns"])}')
        print(f'  PK: {info["primary_keys"]}')


if __name__ == '__main__':
    main()