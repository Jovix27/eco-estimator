"""
BOQ Generation Engine.
Generates Bill of Quantities from building parameters using Indian construction thumb-rules.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from api.materials import MATERIALS_DB, THUMB_RULES

router = APIRouter(prefix="/boq", tags=["BOQ"])


# ─── REQUEST / RESPONSE MODELS ───────────────────────────────────────

class BuildingParams(BaseModel):
    built_up_area_sqft: float = Field(..., gt=0, le=100000, description="Built-up area in sqft")
    building_type: str = Field(default="residential", description="Building type")
    num_floors: int = Field(default=1, ge=1, le=20, description="Number of floors")


class BOQLineItem(BaseModel):
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


class BOQResponse(BaseModel):
    building_params: BuildingParams
    line_items: List[BOQLineItem]
    summary: dict


# ─── HELPER: LOOKUP MATERIAL ─────────────────────────────────────────

def _get_material(material_id: str) -> dict:
    for m in MATERIALS_DB:
        if m["id"] == material_id:
            return m
    raise ValueError(f"Material not found: {material_id}")


# ─── BOQ GENERATION LOGIC ────────────────────────────────────────────

def generate_boq(params: BuildingParams, material_overrides: Optional[dict] = None) -> List[BOQLineItem]:
    """
    Generate BOQ from building parameters using thumb-rules.
    
    material_overrides: dict mapping category -> material_id to use sustainable alternatives
                        e.g. {"Cement": "cement_flyash", "Bricks": "brick_aac"}
    """
    area = params.built_up_area_sqft
    floors = params.num_floors
    overrides = material_overrides or {}

    rules = THUMB_RULES
    items = []

    # Floor multiplier: structural scales linearly, finishing at 85%
    structural_factor = floors * rules["floor_multiplier_structural"]
    finishing_factor = 1 + (floors - 1) * rules["floor_multiplier_finishing"]

    # ── 1. CEMENT ──
    cement_id = overrides.get("Cement", "cement_opc")
    cement_mat = _get_material(cement_id)
    cement_bags = area * rules["cement_bags_per_sqft"] * structural_factor
    cement_kg = cement_bags * rules["cement_kg_per_bag"]
    items.append(_build_line(cement_mat, round(cement_kg, 1)))

    # ── 2. STEEL ──
    steel_id = overrides.get("Steel", "steel_tmt")
    steel_mat = _get_material(steel_id)
    steel_kg = area * rules["steel_kg_per_sqft"] * structural_factor
    items.append(_build_line(steel_mat, round(steel_kg, 1)))

    # ── 3. BRICKS / BLOCKS ──
    brick_id = overrides.get("Bricks", "brick_clay")
    brick_mat = _get_material(brick_id)
    bricks_count = area * rules["bricks_per_sqft"] * finishing_factor
    # If using AAC blocks, 1 block ≈ 8 bricks
    if brick_id == "brick_aac":
        bricks_count = bricks_count / 8
    items.append(_build_line(brick_mat, round(bricks_count, 0)))

    # ── 4. SAND ──
    sand_id = overrides.get("Sand", "sand_river")
    sand_mat = _get_material(sand_id)
    sand_cuft = area * rules["sand_cuft_per_sqft"] * structural_factor
    sand_cum = sand_cuft * rules["cuft_to_cum"]
    items.append(_build_line(sand_mat, round(sand_cum, 2)))

    # ── 5. AGGREGATE ──
    agg_id = overrides.get("Aggregate", "aggregate_natural")
    agg_mat = _get_material(agg_id)
    agg_cuft = area * rules["aggregate_cuft_per_sqft"] * structural_factor
    agg_cum = agg_cuft * rules["cuft_to_cum"]
    items.append(_build_line(agg_mat, round(agg_cum, 2)))

    return items


def _build_line(material: dict, quantity: float) -> BOQLineItem:
    total_cost = round(quantity * material["rate_per_unit"], 2)
    total_carbon = round(quantity * material["carbon_per_unit"], 2)
    return BOQLineItem(
        material_id=material["id"],
        material_name=material["name"],
        category=material["category"],
        quantity=quantity,
        unit=material["unit"],
        rate_per_unit=material["rate_per_unit"],
        total_cost=total_cost,
        carbon_per_unit=material["carbon_per_unit"],
        total_carbon=total_carbon,
        is_sustainable=material["is_sustainable"],
    )


# ─── API ROUTES ───────────────────────────────────────────────────────

class BOQGenerateRequest(BaseModel):
    building_params: BuildingParams
    material_overrides: Optional[dict] = Field(
        default=None,
        description="Map of category name to material_id for eco-swap. e.g. {'Cement': 'cement_flyash'}"
    )


@router.post("/generate", response_model=BOQResponse)
async def generate(request: BOQGenerateRequest):
    """
    Generate a Bill of Quantities from building parameters.
    
    Uses standard Indian construction thumb-rules:
    - Cement: 0.4 bags/sqft (configurable)
    - Steel: 3.5 kg/sqft
    - Bricks: 8 nos/sqft
    - Sand: 1.25 cuft/sqft
    - Aggregate: 2.5 cuft/sqft
    """
    try:
        line_items = generate_boq(request.building_params, request.material_overrides)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    total_cost = sum(item.total_cost for item in line_items)
    total_carbon = sum(item.total_carbon for item in line_items)

    summary = {
        "total_cost": round(total_cost, 2),
        "total_carbon": round(total_carbon, 2),
        "cost_per_sqft": round(total_cost / request.building_params.built_up_area_sqft, 2),
        "carbon_per_sqft": round(total_carbon / request.building_params.built_up_area_sqft, 2),
        "num_materials": len(line_items),
    }

    return BOQResponse(
        building_params=request.building_params,
        line_items=line_items,
        summary=summary,
    )
