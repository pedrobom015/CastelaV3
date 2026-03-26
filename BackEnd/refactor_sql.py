import re
import sys

def process_sql(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all table names that have been created
    # CREATE TABLE IF NOT EXISTS tablename( or tablename (
    table_pattern = re.compile(r"CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)\s*\(", re.IGNORECASE)
    tables = table_pattern.findall(content)

    new_content = content

    for table in tables:
        # Avoid replacing things that are not standard tables if any, but the prompt says all tables.
        # It's an ERP, we replace `id` with `table_id`
        
        # 1. Replace the PK definition
        # `id INT UNSIGNED AUTO_INCREMENT` -> `{table}_id INT UNSIGNED AUTO_INCREMENT`
        # Using a regex to catch exact 'id' at the start of a line after spaces
        regex_pk_def = re.compile(r"(\s+)id(\s+INT UNSIGNED AUTO_INCREMENT)", re.IGNORECASE)
        
        # But wait, doing a global replacement of \s+id\s+ might hit other tables. 
        # So we should process table by table block.

    # Better approach: parse by blocks
    blocks = new_content.split('CREATE TABLE IF NOT EXISTS')
    
    out_blocks = [blocks[0]] # Everything before the first CREATE TABLE
    
    for block in blocks[1:]:
        # block starts with " tablename( ..." or " tablename ("
        # extract table name
        m = re.match(r"\s*([a-zA-Z0-9_]+)\s*\(", block)
        if m:
            tname = m.group(1)
            # rename id -> tname_id
            # regex to replace id INT UNSIGNED
            block = re.sub(r"(\n\s*)id(\s+INT UNSIGNED AUTO_INCREMENT)", rf"\1{tname}_id\2", block, count=1, flags=re.IGNORECASE)
            # rename PRIMARY KEY (id) -> PRIMARY KEY (tname_id)
            block = re.sub(r"PRIMARY KEY\s*\(\s*id\s*\)", rf"PRIMARY KEY ({tname}_id)", block, flags=re.IGNORECASE)
            
            # replace UNIQUE KEY idx_user_id (id) -> UNIQUE KEY idx_user_id (tname_id)
            block = re.sub(r"\(\s*id\s*\)", rf"({tname}_id)", block)
            # wait, the above `(id)` replacement might be too broad if there are multi-column keys like `(id, something_else)`.
            # Let's do it carefully with word boundaries
            block = re.sub(r"\((id)\)", rf"({tname}_id)", block)
            block = re.sub(r"\(id,", rf"({tname}_id,", block)
            block = re.sub(r",\s*id\)", rf", {tname}_id)", block)
            block = re.sub(r",\s*id\s*,", rf", {tname}_id,", block)
            
        out_blocks.append(block)
        
    final_content = "CREATE TABLE IF NOT EXISTS".join(out_blocks)
    
    # 2. Fix FOREIGN KEY REFERENCES 
    # REFERENCES tablename(id) -> REFERENCES tablename(tablename_id)
    def ref_replacer(match):
        ref_table = match.group(1)
        return f"REFERENCES {ref_table}({ref_table}_id)"
        
    final_content = re.sub(r"REFERENCES\s+([a-zA-Z0-9_]+)\s*\(\s*id\s*\)", ref_replacer, final_content, flags=re.IGNORECASE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)

if __name__ == "__main__":
    process_sql(sys.argv[1])
