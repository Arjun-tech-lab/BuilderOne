"""BuilderOne FastAPI application entrypoint."""
import logging
import sys
from pathlib import Path

# Support vendor installs without a virtualenv
BACKEND_ROOT = Path(__file__).resolve().parents[1]
VENDOR = BACKEND_ROOT / "vendor"
if VENDOR.exists() and str(VENDOR) not in sys.path:
    sys.path.insert(0, str(VENDOR))
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 — register models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("builderone")

settings = get_settings()

app = FastAPI(
    title="BuilderOne API",
    description="Marketplace connecting homeowners with construction companies in Bengaluru.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_path = Path(settings.storage_local_path)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

app.include_router(api_router, prefix=settings.api_prefix)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.on_event("startup")
def on_startup():
    logger.info("Creating database tables if needed…")
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_startup:
        try:
            from scripts.seed import run_seed

            run_seed(reset=False)
            logger.info("Demo seed checked/applied.")
        except Exception:
            logger.exception("Seed failed — continuing without demo data.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "database": "sqlite" if settings.is_sqlite else "postgresql",
    }
