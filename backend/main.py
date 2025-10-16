# [*] ProofBench Backend - FastAPI Application Entry Point
# Main application setup and configuration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.base import init_db, create_tables
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown events.

    Startup:
        - Initialize database connection
        - Create tables (development mode only)
        - Log configuration

    Shutdown:
        - Close database connections
        - Clean up resources
    """
    # [>] Startup
    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"[T] Debug mode: {settings.DEBUG}")

    # Initialize database
    await init_db(settings.DATABASE_URL)
    print(f"[+] Database initialized: {settings.DATABASE_URL.split('@')[-1]}")  # Hide credentials

    # Create tables in development mode
    if settings.DEBUG:
        await create_tables()
        print("[+] Database tables created (development mode)")

    yield

    # [#] Shutdown
    print(f"[-] Shutting down {settings.APP_NAME}")


# [=] FastAPI Application Instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## ProofBench API - Mathematical Proof Verification System

    Hybrid reasoning engine combining symbolic mathematics with AI-powered semantic evaluation.

    ### Features
    * Submit mathematical proofs for verification
    * Real-time status tracking
    * Logic Integrity Index (LII) scoring
    * Multi-LLM consensus evaluation
    * Natural language feedback

    ### Authentication
    All endpoints require an API key in the `X-API-Key` header.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


# [#] CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# [=] API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# [o] Health Check Endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.

    Returns:
        dict: Service status information
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG
    }


# [o] Root Endpoint
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with API information.

    Returns:
        dict: Welcome message and API documentation links
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} v{settings.APP_VERSION}",
        "docs": "/docs",
        "health": "/health",
        "api": settings.API_V1_PREFIX
    }


# [-] Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors.

    Args:
        request: FastAPI request object
        exc: Exception instance

    Returns:
        JSONResponse: Error response with 500 status code
    """
    print(f"[-] Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# [T] Development server runner
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )
