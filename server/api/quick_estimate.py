from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.material_service import get_material_prices, get_location_multiplier
from services.data.work_items import BUILDING_TYPE_MULTIPLIERS, QUALITY_MULTIPLIERS

router = APIRouter(prefix="/quick-estimate", tags=["Quick Estimate"])

class EstimateRequest(BaseModel):
    area_sqft: float
    location: str
    building_type: str = "residential"
    quality_level: str = "standard"
    include_tax: bool = True
    eco_optimized: bool = False

class PriceBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float

class QuickEstimateResponse(BaseModel):
    total_cost: float
    rate_per_sqft: float
    location_index: float
    breakdown: List[PriceBreakdown]
    material_prices: Dict[str, Dict]
    validation_status: str
    carbon_reduction_pct: float = 0.0

# Base rate for standard residential in a baseline city (₹/sq.ft)
BASE_CONSTRUCTION_RATE = 1800.0

@router.get("/rates")
async def get_rates(location: str = "Other"):
    """Fetch current rates and location factors."""
    prices = get_material_prices(location)
    multiplier = get_location_multiplier(location)
    return {
        "location": location,
        "multiplier": multiplier,
        "material_prices": prices
    }

@router.post("/calculate", response_model=QuickEstimateResponse)
async def calculate_quick_estimate(request: EstimateRequest):
    """
    Perform a quick location-aware estimation.
    """
    if request.area_sqft <= 0:
        raise HTTPException(status_code=400, detail="Area must be greater than zero")

    # 1. Base Rate Calculation
    loc_mult = get_location_multiplier(request.location)
    bldg_mult = BUILDING_TYPE_MULTIPLIERS.get(request.building_type, 1.0)
    qual_mult = QUALITY_MULTIPLIERS.get(request.quality_level, 1.0)
    
    # 2. Eco-Optimization Logic
    # Sustainable materials typically cost 8-12% more but reduce carbon by 25-40%
    eco_cost_premium = 1.10 if request.eco_optimized else 1.0
    carbon_reduction = 35.0 if request.eco_optimized else 0.0
    
    # Combined rate
    final_rate = BASE_CONSTRUCTION_RATE * loc_mult * bldg_mult * qual_mult * eco_cost_premium
    direct_cost = final_rate * request.area_sqft
    
    # 3. Add Standard Overheads (15% for profit + 5% for contingency)
    overhead_pct = 0.20
    total_cost = direct_cost * (1 + overhead_pct)
    
    if request.include_tax:
        total_cost *= 1.12  # 12% GST
        
    # 4. Intelligent Validation (Heuristics)
    validation = "Valid"
    if final_rate < 1400:
        validation = "Warning: Rate unusually low"
    elif final_rate > 5500:
        validation = "Warning: Rate unusually high"

    # 5. Breakdown Generation (Simplified typical construction split)
    # If eco-optimized, shift some cost towards specialized civil/MEP
    civil_pct = 48 if request.eco_optimized else 45
    mep_pct = 17 if request.eco_optimized else 15
    finish_pct = 20 if request.eco_optimized else 25
    
    breakdown = [
        PriceBreakdown(category="Civil Work & Structure", amount=total_cost * (civil_pct/100), percentage=civil_pct),
        PriceBreakdown(category="Finishing (Flooring/Paint)", amount=total_cost * (finish_pct/100), percentage=finish_pct),
        PriceBreakdown(category="MEP (Electrical/Plumbing)", amount=total_cost * (mep_pct/100), percentage=mep_pct),
        PriceBreakdown(category="Overheads & Profit", amount=total_cost * 0.10, percentage=10),
        PriceBreakdown(category="Misc & Contingency", amount=total_cost * 0.05, percentage=5),
    ]

    return QuickEstimateResponse(
        total_cost=round(total_cost, 2),
        rate_per_sqft=round(total_cost / request.area_sqft, 2),
        location_index=loc_mult,
        breakdown=breakdown,
        material_prices=get_material_prices(request.location),
        validation_status=validation,
        carbon_reduction_pct=carbon_reduction
    )

