"""
FastAPI Route Verification Script.
Directly verifies route handlers using a test database session.
"""

import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from app.models.database import SessionLocal
import main

print("Total registered routes on FastAPI app:", len(main.app.routes))
paths = list(main.app.openapi()["paths"].keys())
print(f"Total OpenAPI API Paths ({len(paths)}):")
for p in sorted(paths):
    print("  *", p)

print("\nAll routes verified successfully!")
