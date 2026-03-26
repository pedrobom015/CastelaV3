#!/usr/bin/env python3
"""
Script para gerar INSERTs no field_mapping_dictionary a partir do dump SQL.
Parseia o Dump_ERP_Castela.sql e extrai a estrutura das tabelas.
"""

import re
import sys
from pathlib import Path
from collections import defaultdict

DUMP_FILE = Path(__file__).parent / "Dump_ERP_Castela.sql"
OUTPUT_FILE = Path(__file__).parent / "field_mapping_inserts.sql"

MODULE_PATTERNS = {
    'finan': [
        'account', 'accounting', 'bank_', 'billing', 'budget', 'cash', 'charge',
        'cost_center', 'currency', 'expense', 'financial', 'fiscal', 'journal',
        'payment', 'receivable', 'payable', 'invoice', 'tax', 'tax_', 'balance'
    ],
    'contratos': [
        'contract', 'addendum', 'beneficiary', 'group_batch', 'death_event',
        'membership', 'coverage', 'pool', 'version', 'validation'
    ],
    'estoque': [
        'inventory', 'stock', 'goods', 'product', 'item_', 'batch_', 'warehouse',
        'adjustment', 'receipt', 'supply', 'purchase', 'order_', 'requisition'
    ],
    'frota': [
        'driver', 'vehicle', 'viatura', 'maintenance', 'trip_', 'route_',
        'fuel_', 'insurance', 'document_', 'license_', 'km_'
    ],
    'fiscal': [
        'fiscal', 'nfe', 'nfce', 'cte', 'mdfe', 'serie', 'icms', 'ipi',
        'pis', 'cofins', 'cfop', 'cst', 'ncm', 'tribut'
    ],
    'rh': [
        'employee', 'department', 'payroll', 'salary', 'holiday', 'point_',
        'attendance', 'role_', 'permission', 'user_', 'team_'
    ],
    'farmacia': [
        'pharmacy', 'drug_', 'medicament', 'prescription', 'recipe_', 'drog_',
        'farmacia', 'remedio', 'posologia'
    ],
    'comercial': [
        'customer', 'partner_', 'lead_', 'proposal', 'quotation', 'sale_',
        'visit_', 'contact_', 'campaign', 'pipeline', 'opportunity'
    ],
    'ti': [
        'api_', 'integration', 'sync_', 'log_', 'cache_', 'config_', 'setting',
        'system', 'unit_', 'module_', 'parameter'
    ],
    'ged': [
        'document', 'doc_to_', 'archive', 'attachment', 'file_', 'image_'
    ],
    'cep': [
        'cep_', 'city', 'state_', 'address', 'zipcode', 'ibge'
    ],
    'adm': [
        'company', 'branch_', 'message_', 'template', 'communication'
    ]
}

DBF_TYPE_MAP = {
    'varchar': 'C',
    'char': 'C',
    'text': 'C',
    'longtext': 'C',
    'mediumtext': 'C',
    'tinytext': 'C',
    'int': 'N',
    'integer': 'N',
    'bigint': 'N',
    'smallint': 'N',
    'tinyint': 'N',
    'decimal': 'N',
    'float': 'N',
    'double': 'N',
    'numeric': 'N',
    'date': 'D',
    'datetime': 'D',
    'timestamp': 'D',
    'time': 'D',
    'year': 'N',
    'boolean': 'L',
    'bool': 'L',
    'enum': 'C',
    'set': 'C',
    'json': 'C',
    'binary': 'B',
    'varbinary': 'B',
    'blob': 'B',
    'mediumblob': 'B',
    'longblob': 'B',
}

def detect_module(table_name):
    """Detecta o módulo da tabela baseado no nome."""
    table_lower = table_name.lower()
    scores = defaultdict(int)

    for module, patterns in MODULE_PATTERNS.items():
        for pattern in patterns:
            if pattern in table_lower:
                scores[module] += 1

    if scores:
        return max(scores, key=scores.get)
    return 'outros'

def parse_field_type(field_def):
    field_def = field_def.strip().upper()
    match = re.match(r'(\w+)\s*(\((\d+(?:,\d+)?)\))?', field_def)
    if not match:
        return 'UNKNOWN', None, None

    base_type = match.group(1).lower()
    size_str = match.group(3)

    if size_str:
        if ',' in size_str:
            size, precision = size_str.split(',')
            return base_type, int(size), int(precision)
        else:
            return base_type, int(size_str), None

    return base_type, None, None

def parse_mysql_type(mysql_type):
    mysql_type = mysql_type.strip().upper()

    if 'VARCHAR' in mysql_type:
        match = re.search(r'VARCHAR\s*\((\d+)\)', mysql_type)
        return f'VARCHAR({match.group(1)})' if match else 'VARCHAR(255)'

    if 'CHAR' in mysql_type:
        match = re.search(r'CHAR\s*\((\d+)\)', mysql_type)
        return f'CHAR({match.group(1)})' if match else 'CHAR(1)'

    if 'DECIMAL' in mysql_type or 'NUMERIC' in mysql_type:
        match = re.search(r'(DECIMAL|NUMERIC)\s*\((\d+)(?:,(\d+))?\)', mysql_type)
        if match:
            if match.group(3):
                return f'DECIMAL({match.group(2)},{match.group(3)})'
            return f'DECIMAL({match.group(2)})'
        return 'DECIMAL(10,2)'

    if 'INT' in mysql_type:
        if 'TINYINT' in mysql_type:
            return 'TINYINT'
        if 'SMALLINT' in mysql_type:
            return 'SMALLINT'
        if 'BIGINT' in mysql_type:
            return 'BIGINT'
        return 'INT'

    type_map = {
        'FLOAT': 'FLOAT', 'DOUBLE': 'DOUBLE', 'DATETIME': 'DATETIME',
        'TIMESTAMP': 'TIMESTAMP', 'DATE': 'DATE', 'TIME': 'TIME',
        'TEXT': 'TEXT', 'LONGTEXT': 'LONGTEXT', 'MEDIUMTEXT': 'MEDIUMTEXT',
        'TINYTEXT': 'TINYTEXT', 'BLOB': 'BLOB', 'LONGBLOB': 'LONGBLOB',
        'MEDIUMBLOB': 'MEDIUMBLOB', 'TINYBLOB': 'TINYBLOB', 'JSON': 'JSON',
        'ENUM': 'ENUM', 'SET': 'SET', 'BOOLEAN': 'BOOLEAN'
    }

    for k, v in type_map.items():
        if k in mysql_type:
            return v

    return mysql_type

def is_nullable(field_def):
    field_def = field_def.upper()
    return 0 if 'NOT NULL' in field_def else 1

def get_default_value(field_def):
    match = re.search(r"DEFAULT\s+'([^']*)'", field_def, re.IGNORECASE)
    if match:
        return match.group(1).replace("'", "''")

    match = re.search(r"DEFAULT\s+(\d+(?:\.\d+)?)", field_def, re.IGNORECASE)
    if match:
        return match.group(1)

    match = re.search(r"DEFAULT\s+(\w+)", field_def, re.IGNORECASE)
    if match:
        val = match.group(1).upper()
        return None if val in ('NULL', 'CURRENT_TIMESTAMP') else match.group(1)

    return None

def extract_tables(dump_content):
    tables = []

    create_table_pattern = re.compile(
        r'CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+`?(\w+)`?\s*\((.*?)\)\s*(?:ENGINE|;)',
        re.IGNORECASE | re.DOTALL
    )

    for match in create_table_pattern.finditer(dump_content):
        table_name = match.group(1)
        fields_block = match.group(2)
        module = detect_module(table_name)

        fields = []
        field_lines = re.split(r',\s*(?![^()]*\))', fields_block)

        for line in field_lines:
            line = line.strip()
            line = re.sub(r'^\s*PRIMARY\s+KEY.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*UNIQUE\s+KEY.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*KEY.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*FOREIGN\s+KEY.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*CONSTRAINT.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*INDEX.*', '', line, flags=re.IGNORECASE)
            line = re.sub(r'^\s*CHECK.*', '', line, flags=re.IGNORECASE)
            line = line.strip()

            if not line:
                continue

            field_match = re.match(r'`?(\w+)`?\s+(.+)', line)
            if field_match:
                field_name = field_match.group(1)
                field_def = field_match.group(2)

                field_type, size, precision = parse_field_type(field_def)
                mysql_type = parse_mysql_type(field_def)
                nullable = is_nullable(field_def)
                default = get_default_value(field_def)

                fields.append({
                    'name': field_name,
                    'type': field_type,
                    'mysql_type': mysql_type,
                    'size': size,
                    'precision': precision,
                    'nullable': nullable,
                    'default': default
                })

        if fields:
            tables.append({
                'name': table_name,
                'module': module,
                'fields': fields
            })

    return tables

def generate_inserts(tables):
    inserts = []
    inserts.append("-- =============================================================================")
    inserts.append("-- INSERTs gerados automaticamente pelo generate_field_mapping.py")
    inserts.append("-- Fonte: Dump_ERP_Castela.sql")
    inserts.append("-- =============================================================================")
    inserts.append("")
    inserts.append("SET FOREIGN_KEY_CHECKS = 0;")
    inserts.append("")
    inserts.append("-- =============================================================================")
    inserts.append("-- TABLE_MAPPING - Mapeamento de tabelas")
    inserts.append("-- =============================================================================")
    inserts.append("")
    inserts.append("TRUNCATE TABLE table_mapping;")
    inserts.append("")

    for table in tables:
        table_name = table['name']
        module = table['module']
        field_count = len(table['fields'])

        inserts.append(f"""INSERT INTO table_mapping (
    table_name_new, module, description, record_count_approx, is_active, migration_status
) VALUES (
    '{table_name}', '{module}', 'Tabela {table_name} - {field_count} campos',
    NULL, 1, 'pending'
);""")

    inserts.append("")
    inserts.append("-- =============================================================================")
    inserts.append("-- FIELD_MAPPING - Mapeamento de campos")
    inserts.append("-- =============================================================================")
    inserts.append("")
    inserts.append("TRUNCATE TABLE field_mapping;")
    inserts.append("")

    for table in tables:
        table_name = table['name']

        for field in table['fields']:
            field_name = field['name']
            field_type = field['mysql_type']
            field_size = field['size'] or 'NULL'
            field_precision = field['precision'] or 'NULL'
            nullable = field['nullable']
            default_val = field['default']

            default_sql = f"'{default_val}'" if default_val is not None else 'NULL'
            field_type_old = DBF_TYPE_MAP.get(field['type'], '?')

            inserts.append(f"""INSERT INTO field_mapping (
    table_name_new, field_name_new, field_type_new, field_size_new,
    field_precision_new, nullable_new, default_value_new,
    field_type_old, is_mapped
) VALUES (
    '{table_name}', '{field_name}', '{field_type}', {field_size},
    {field_precision}, {nullable}, {default_sql},
    '{field_type_old}', 0
);""")

    inserts.append("")
    inserts.append("SET FOREIGN_KEY_CHECKS = 1;")

    return '\n'.join(inserts)

def main():
    print(f"Lendo dump: {DUMP_FILE}")

    if not DUMP_FILE.exists():
        print(f"Erro: Arquivo não encontrado: {DUMP_FILE}")
        sys.exit(1)

    dump_content = DUMP_FILE.read_text(encoding='utf-8', errors='ignore')

    print("Extraindo tabelas...")
    tables = extract_tables(dump_content)

    print(f"Encontradas {len(tables)} tabelas")

    module_counts = defaultdict(int)
    for t in tables:
        module_counts[t['module']] += 1

    print("Distribuição por módulo:")
    for mod, count in sorted(module_counts.items()):
        print(f"  {mod}: {count} tabelas")

    total_fields = sum(len(t['fields']) for t in tables)
    print(f"Total de campos: {total_fields}")

    print("\nGerando INSERTs...")
    inserts = generate_inserts(tables)

    OUTPUT_FILE.write_text(inserts, encoding='utf-8')

    print(f"\nArquivo gerado: {OUTPUT_FILE}")
    print(f"Tamanho: {len(inserts):,} caracteres")

if __name__ == '__main__':
    main()
