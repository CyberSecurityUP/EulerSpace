"""EulerSpace Backend - FastAPI Application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router

app = FastAPI(
    title="EulerSpace",
    description="Mathematical & Physics Laboratory Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "EulerSpace",
        "version": "0.1.0",
        "modules": [
            "Math Engine (SymPy)",
            "Physics Simulator (SciPy)",
            "AI Assistant",
            "Visualization",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
