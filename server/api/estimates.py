"""
Estimation Engine with Carbon Intelligence and Eco-Grade Classification.
Computes cost breakdown, carbon footprint, eco-grade, and eco-alternatives.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from api.boq import generate_boq, BuildingParams, BOQLineItem
from api.materials import MATERIALS_DB

router = APIRouter(prefix="/estimate", tags=["Estimation"])


# ─── ECO-GRADE CLASSIFICATION ────────────────────────────────────────

ECO_GRADES = [
    {"grade": "A+", "max_ratio": 1200, "label": "Exceptional", "color": "#10b981",
     "description": "Ultra-low carbon footprint. Leading the industry in sustainability."},
    {"grade": "A",  "max_ratio": 2200, "label": "Excellent", "color": "#22c55e",
     "description": "Highly sustainable choices. Meets top green building standards."},
    {"grade": "B",  "max_ratio": 3200, "label": "Good", "color": "#f59e0b",
     "description": "Balanced carbon footprint with significant eco-swaps implemented."},
    {"grade": "C",  "max_ratio": 4200, "label": "Average", "color": "#f97316",
     "description": "Standard carbon intensity for conventional residential projects."},
    {"grade": "D",  "max_ratio": float("inf"), "label": "Poor", "color": "#ef4444",
     "description": "High carbon intensity. Urgent sustainable transitions recommended."},
]


def compute_eco_grade(total_carbon: float, total_cost: float) -> dict:
    """
    Compute Eco-Grade based on kgCO2e per lakh INR.
    Ratio = total_carbon / (total_cost / 100000)
    """
    if total_cost <= 0:
        return {
            "grade": "—",
            "label": "N/A",
            "ratio": 0,
            "color": "#6b7280",
            "description": "Insufficient data to compute eco-grade.",
        }

    ratio = total_carbon / (total_cost / 100000)

    for g in ECO_GRADES:
        if ratio <= g["max_ratio"]:
            return {
                "grade": g["grade"],
                "label": g["label"],
                "ratio": round(ratio, 1),
                "color": g["color"],
                "description": g["description"],
            }

    # Fallback (should not reach here)
    return ECO_GRADES[-1]


# ─── ALTERNATIVE SUGGESTION ENGINE ───────────────────────────────────

def suggest_optimal_materials(
    line_items: List[BOQLineItem],
    building_params: "BuildingParams",
    current_overrides: dict | None = None,
) -> List[dict]:
    """
    For each conventional material in the BOQ, re-run the BOQ engine with the
    eco-swap to get accurate post-swap quantities (handles unit conversions like
    brick→AAC 1:8 ratio).
    """
    suggestions = []
    overrides = dict(current_overrides or {})

    for item in line_items:
        if item.is_sustainable:
            continue

        alternatives = [m for m in MATERIALS_DB if m.get("alternative_to") == item.material_id]
        if not alternatives:
            continue

        best_alt = min(alternatives, key=lambda m: m["carbon_per_unit"])

        # Re-run BOQ with this single swap to get correct quantity
        test_overrides = {**overrides, item.category: best_alt["id"]}
        swapped_boq = generate_boq(building_params, test_overrides)
        swapped_item = next((li for li in swapped_boq if li.category == item.category), None)

        if not swapped_item:
            continue

        cost_diff = swapped_item.total_cost - item.total_cost
        carbon_diff = item.total_carbon - swapped_item.total_carbon
        carbon_reduction_pct = round((carbon_diff / item.total_carbon) * 100, 1) if item.total_carbon > 0 else 0

        suggestions.append({
            "current_material": {
                "id": item.material_id,
                "name": item.material_name,
                "total_cost": item.total_cost,
                "total_carbon": item.total_carbon,
            },
            "suggested_alternative": {
                "id": best_alt["id"],
                "name": best_alt["name"],
                "total_cost": swapped_item.total_cost,
                "total_carbon": swapped_item.total_carbon,
                "is_sustainable": True,
            },
            "cost_difference": round(cost_diff, 2),
            "cost_change_pct": round((cost_diff / item.total_cost) * 100, 1) if item.total_cost > 0 else 0,
            "carbon_savings": round(carbon_diff, 2),
            "carbon_reduction_pct": carbon_reduction_pct,
        })

    return suggestions


# ─── REQUEST / RESPONSE MODELS ───────────────────────────────────────

class EstimateRequest(BaseModel):
    building_params: BuildingParams
    material_overrides: Optional[Dict[str, str]] = Field(
        default=None,
        description="Map of category name to material_id for eco-swap"
    )


class MaterialCostBreakdown(BaseModel):
    material_id: str
    material_name: str
    category: str
    quantity: float
    unit: str
    rate_per_unit: float
    total_cost: float
    carbon_per_unit: float
    total_carbon: float
    is_sustainable: bool
    cost_share_pct: float
    carbon_share_pct: float


class EcoGrade(BaseModel):
    grade: str
    label: str
    ratio: float
    color: str
    description: str


class EstimateResponse(BaseModel):
    building_params: BuildingParams
    materials: List[MaterialCostBreakdown]
    total_cost: float
    total_carbon: float
    cost_per_sqft: float
    carbon_per_sqft: float
    eco_grade: EcoGrade
    eco_suggestions: List[dict]
    potential_carbon_savings: float
    potential_savings_pct: float


# ─── API ROUTES ───────────────────────────────────────────────────────

@router.post("/calculate", response_model=EstimateResponse)
async def calculate_estimate(request: EstimateRequest):
    """
    Full estimation: cost + carbon + eco-grade + eco-alternative suggestions.
    
    Combines BOQ generation with carbon intelligence to produce a complete
    sustainability-aware cost estimate.
    """
    try:
        line_items = generate_boq(request.building_params, request.material_overrides)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    total_cost = sum(item.total_cost for item in line_items)
    total_carbon = sum(item.total_carbon for item in line_items)

    # Compute per-material share percentages
    materials_breakdown = []
    for item in line_items:
        materials_breakdown.append(MaterialCostBreakdown(
            material_id=item.material_id,
            material_name=item.material_name,
            category=item.category,
            quantity=item.quantity,
            unit=item.unit,
            rate_per_unit=item.rate_per_unit,
            total_cost=item.total_cost,
            carbon_per_unit=item.carbon_per_unit,
            total_carbon=item.total_carbon,
            is_sustainable=item.is_sustainable,
            cost_share_pct=round((item.total_cost / total_cost) * 100, 1) if total_cost > 0 else 0,
            carbon_share_pct=round((item.total_carbon / total_carbon) * 100, 1) if total_carbon > 0 else 0,
        ))

    # Eco grade
    eco_grade_data = compute_eco_grade(total_carbon, total_cost)
    eco_grade = EcoGrade(**eco_grade_data)

    # Eco suggestions
    suggestions = suggest_optimal_materials(line_items, request.building_params, request.material_overrides)
    potential_savings = sum(s["carbon_savings"] for s in suggestions)
    potential_pct = round((potential_savings / total_carbon) * 100, 1) if total_carbon > 0 else 0

    return EstimateResponse(
        building_params=request.building_params,
        materials=materials_breakdown,
        total_cost=round(total_cost, 2),
        total_carbon=round(total_carbon, 2),
        cost_per_sqft=round(total_cost / request.building_params.built_up_area_sqft, 2),
        carbon_per_sqft=round(total_carbon / request.building_params.built_up_area_sqft, 2),
        eco_grade=eco_grade,
        eco_suggestions=suggestions,
        potential_carbon_savings=round(potential_savings, 2),
        potential_savings_pct=potential_pct,
    )


@router.get("/eco-grades")
async def get_eco_grades():
    """Return the eco-grade classification scale."""
    return [
        {"grade": g["grade"], "max_ratio": g["max_ratio"] if g["max_ratio"] != float("inf") else None,
         "label": g["label"], "color": g["color"], "description": g["description"]}
        for g in ECO_GRADES
    ]
