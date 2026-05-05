"""API routes initialization."""

from fastapi import APIRouter
from api.materials import router as materials_router
from api.boq import router as boq_router
from api.estimates import router as estimates_router
from api.projects import router as projects_router
from api.export import router as export_router

api_router = APIRouter()

api_router.include_router(materials_router)
api_router.include_router(boq_router)
api_router.include_router(estimates_router)
api_router.include_router(projects_router)
api_router.include_router(export_router)
