import re
from pathlib import Path

base_dir = Path(__file__).parent

sql_files = [
    'Cria_DB_Castela_v2.sql',
    'Cria_DB_Finan_v2.sql',
    'Cria_DB_Estoque_v2.sql',
    'Cria_DB_Viaturas_v2.sql'
]

for filename in sql_files:
    filepath = base_dir / filename
    if filepath.exists():
        content = filepath.read_text(encoding='utf-8-sig')
        tables = re.findall(r'CREATE TABLE IF NOT EXISTS `?(\w+)`?', content, re.IGNORECASE)
        print(f'{filename}: {len(tables)} tabelas')
        print(f'  Primeiras: {tables[:5]}')
        print()