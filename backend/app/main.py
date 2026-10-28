import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .database import engine, Base, SessionLocal
from .models import Workspace
from .seed_data import seed_demo_workspace
from .routers import workspaces, rules, reviews, insights, public, auth
from .engine.ai_adapter import ai_adapter

# Path to built frontend (for production single-binary deployment)
FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

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
app.include_router(public.router)
app.include_router(auth.router, prefix="/api")
app.include_router(auth.router, prefix="", include_in_schema=False)

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

# Serve frontend static files in production
# In production, the React app is built and placed in frontend/dist/
# The backend serves it as a static SPA with catch-all fallback for client-side routing
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    # Mount static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")

    # Serve favicon and other root static files
    @app.get("/favicon.svg")
    async def favicon():
        fav = FRONTEND_DIST / "favicon.svg"
        if fav.exists():
            return FileResponse(str(fav))

    # SPA catch-all: serve index.html for all non-API routes
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi") or full_path == "health":
            return
        # Try to serve static file first
        static_file = FRONTEND_DIST / full_path
        if static_file.exists() and static_file.is_file():
            return FileResponse(str(static_file))
        # Fall back to index.html for client-side routing
        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Sentinel Review Engine API is operational.",
            "documentation": "/docs",
            "health": "/health",
            "note": "Frontend not found. Run 'cd frontend && npm run build' to enable static serving."
        }
