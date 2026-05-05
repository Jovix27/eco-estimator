"""
Eco Estimator - FastAPI Backend
Main entry point for the API server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router

app = FastAPI(
    title="Eco Estimator API",
    description="AI-first cloud-native estimating platform for construction",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Eco Estimator API",
        "version": "0.1.0",
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "ok",
        "database": "pending",  # Will connect to Supabase
        "storage": "pending",   # Will connect to S3/Supabase Storage
    }

