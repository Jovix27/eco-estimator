"""
Pydantic models for API request/response schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


# ============ ENUMS ============

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    APPROVED = "approved"
    ARCHIVED = "archived"


class DrawingType(str, Enum):
    PDF = "pdf"
    DWG = "dwg"
    IFC = "ifc"
    REVIT = "rvt"
    IMAGE = "image"


class QTOItemType(str, Enum):
    WALL = "wall"
    OPENING = "opening"
    SLAB = "slab"
    COLUMN = "column"
    BEAM = "beam"
    LINEAR = "linear"
    AREA = "area"
    COUNT = "count"


# ============ BASE MODELS ============

class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============ PROJECT MODELS ============

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ProjectStatus] = None


class Project(ProjectBase, TimestampMixin):
    id: str
    status: ProjectStatus = ProjectStatus.DRAFT
    owner_id: str
    
    class Config:
        from_attributes = True


# ============ DRAWING MODELS ============

class DrawingBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    drawing_type: DrawingType
    scale: Optional[float] = Field(None, description="Drawing scale, e.g., 1:100 = 0.01")


class DrawingCreate(DrawingBase):
    project_id: str


class Drawing(DrawingBase, TimestampMixin):
    id: str
    project_id: str
    file_url: str
    file_size: int
    processed: bool = False
    
    class Config:
        from_attributes = True


# ============ QTO ITEM MODELS ============

class QTOItemBase(BaseModel):
    item_type: QTOItemType
    description: str
    quantity: float
    unit: str = Field(..., description="Unit of measurement, e.g., sqm, cum, rm, nos")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="ML confidence score")


class QTOItemCreate(QTOItemBase):
    drawing_id: str
    source_coordinates: Optional[dict] = None  # Bounding box or polygon coordinates


class QTOItemUpdate(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    is_verified: Optional[bool] = None


class QTOItem(QTOItemBase, TimestampMixin):
    id: str
    drawing_id: str
    is_verified: bool = False
    verified_by: Optional[str] = None
    source_coordinates: Optional[dict] = None
    
    class Config:
        from_attributes = True


# ============ RATE BOOK MODELS ============

class RateBookItemBase(BaseModel):
    item_code: str = Field(..., min_length=1, max_length=50)
    description: str
    unit: str
    rate: float = Field(..., ge=0)
    effective_date: datetime
    source: Optional[str] = Field(None, description="Source of rate, e.g., CPWD, MORTH, Supplier")


class RateBookItemCreate(RateBookItemBase):
    rate_book_id: str


class RateBookItem(RateBookItemBase, TimestampMixin):
    id: str
    rate_book_id: str
    is_active: bool = True
    
    class Config:
        from_attributes = True


# ============ BOQ MODELS ============

class BOQLineItem(BaseModel):
    item_code: str
    description: str
    quantity: float
    unit: str
    rate: float
    amount: float
    qto_item_id: Optional[str] = None
    rate_item_id: Optional[str] = None


class BOQSummary(BaseModel):
    project_id: str
    version: int
    total_amount: float
    currency: str = "INR"
    line_items: list[BOQLineItem]
    created_at: datetime
    created_by: str


# ============ RISK MODELS ============

class RiskSimulationInput(BaseModel):
    project_id: str
    iterations: int = Field(default=10000, ge=100, le=100000)
    confidence_levels: list[float] = Field(default=[0.5, 0.8, 0.9], description="P50, P80, P90")


class RiskSimulationResult(BaseModel):
    project_id: str
    iterations: int
    mean_estimate: float
    std_deviation: float
    percentiles: dict[str, float]  # {"P50": value, "P80": value, "P90": value}
    histogram_data: list[float]
    computed_at: datetime
