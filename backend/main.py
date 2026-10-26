from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import engine, Base
from app.api.v1 import api_v1_router

# Create tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BackTrack Academic Backlog Management API",
    description="Enterprise REST API for university academic backlog tracking, clearance audits, and digital certificates.",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 namespace
app.include_router(api_v1_router)

@app.get("/")
def read_root():
    return {
        "system": "BackTrack Academic Backlog Management API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

