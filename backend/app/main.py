import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .models import Workspace
from .seed_data import seed_demo_workspace
from .routers import workspaces, rules, reviews, insights
from .engine.ai_adapter import ai_adapter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Automatically seed the Nimbus Coffee demo brand on initial boot
    db = SessionLocal()
    try:
        seed_demo_workspace(db, force_reset=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sentinel: Enterprise Brand & Compliance Review Engine with Grounded AI and Deterministic Guardrails",
    lifespan=lifespan
)

# Enable CORS for frontend & judges
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(workspaces.router)
app.include_router(rules.router)
app.include_router(reviews.router)
app.include_router(insights.router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ai_active": ai_adapter.is_ai_available(),
        "ai_model": settings.GEMINI_MODEL if ai_adapter.is_ai_available() else "Offline / Deterministic Fallback"
    }

@app.get("/")
def root():
    return {
        "message": "Sentinel Review Engine API is operational.",
        "documentation": "/docs",
        "health": "/health"
    }
