from fastapi import APIRouter
from pathlib import Path
import importlib.util
import sys

api_router = APIRouter()

endpoints_dir = Path(__file__).parent / "endpoints"

for file_path in sorted(endpoints_dir.glob("*.py")):
    if file_path.name.startswith("_") or file_path.stem in ["__init__"]:
        continue
    
    module_name = file_path.stem
    
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        
        if hasattr(module, "router"):
            api_router.include_router(module.router)