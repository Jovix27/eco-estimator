"""
Materials database and API routes.
Configurable constants for Indian residential construction thumb-rules.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/materials", tags=["Materials"])


# ─── CONFIGURABLE THUMB-RULE CONSTANTS ────────────────────────────────
# These can be adjusted per project type or region

THUMB_RULES = {
    "cement_bags_per_sqft": 0.4,       # bags of 50kg each
    "cement_kg_per_bag": 50,
    "steel_kg_per_sqft": 3.5,
    "bricks_per_sqft": 8,
    "sand_cuft_per_sqft": 1.25,
    "aggregate_cuft_per_sqft": 2.5,
    "cuft_to_cum": 0.0283168,          # 1 cuft = 0.0283168 m³
    # Per-floor multipliers
    "floor_multiplier_structural": 1.0,  # each floor adds 100% structural load
    "floor_multiplier_finishing": 0.85,  # finishing grows at 85% per additional floor
}


# ─── DATA MODELS ──────────────────────────────────────────────────────

class Material(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    rate_per_unit: float          # INR
    carbon_per_unit: float        # kgCO2e per unit
    description: str
    is_sustainable: bool
    alternative_to: Optional[str] = None


class ThumbRulesResponse(BaseModel):
    cement_bags_per_sqft: float
    cement_kg_per_bag: float
    steel_kg_per_sqft: float
    bricks_per_sqft: float
    sand_cuft_per_sqft: float
    aggregate_cuft_per_sqft: float
    cuft_to_cum: float
    floor_multiplier_structural: float
    floor_multiplier_finishing: float


# ─── MATERIAL DATABASE (Indian Market Context) ─────────────────────────

MATERIALS_DB: List[dict] = [
    # ── CEMENT (OPC 53 Grade) ──
    {
        "id": "cement_opc",
        "name": "OPC 53 Grade Cement",
        "category": "Cement",
        "unit": "kg",
        "rate_per_unit": 8.0,             # ₹8/kg (~₹400/bag)
        "carbon_per_unit": 0.9,           # 0.9 kgCO2e per kg cement
        "description": "Ordinary Portland Cement 53 Grade (IS 12269)",
        "is_sustainable": False,
    },
    {
        "id": "cement_flyash",
        "name": "Fly Ash Blended Cement (PPC)",
        "category": "Cement",
        "unit": "kg",
        "rate_per_unit": 7.2,             # ₹7.2/kg (~₹360/bag)
        "carbon_per_unit": 0.55,          # ~40% lower carbon
        "description": "Portland Pozzolana Cement with 25-35% fly ash (IS 1489)",
        "is_sustainable": True,
        "alternative_to": "cement_opc",
    },
    {
        "id": "cement_ggbs",
        "name": "GGBS Blended Cement (PSC)",
        "category": "Cement",
        "unit": "kg",
        "rate_per_unit": 7.8,
        "carbon_per_unit": 0.42,          # ~53% lower carbon
        "description": "Portland Slag Cement with 50-70% GGBS (IS 455)",
        "is_sustainable": True,
        "alternative_to": "cement_opc",
    },

    # ── STEEL (TMT Bars) ──
    {
        "id": "steel_tmt",
        "name": "TMT Steel Bars (Fe500)",
        "category": "Steel",
        "unit": "kg",
        "rate_per_unit": 72.0,            # ₹72/kg
        "carbon_per_unit": 2.8,           # 2.8 kgCO2e per kg
        "description": "Standard TMT reinforcement bars Fe500 grade",
        "is_sustainable": False,
    },
    {
        "id": "steel_recycled",
        "name": "Recycled-Content Steel (≥70%)",
        "category": "Steel",
        "unit": "kg",
        "rate_per_unit": 78.0,
        "carbon_per_unit": 1.2,           # ~57% lower carbon
        "description": "EAF steel with ≥70% recycled scrap content",
        "is_sustainable": True,
        "alternative_to": "steel_tmt",
    },

    # ── BRICKS / BLOCKS ──
    {
        "id": "brick_clay",
        "name": "Traditional Clay Bricks",
        "category": "Bricks",
        "unit": "nos",
        "rate_per_unit": 8.5,             # ₹8.5 per brick
        "carbon_per_unit": 0.2,           # 0.2 kgCO2e per brick
        "description": "Red clay kiln-fired bricks (IS 1077 Class A)",
        "is_sustainable": False,
    },
    {
        "id": "brick_aac",
        "name": "AAC Blocks (600×200×200)",
        "category": "Bricks",
        "unit": "nos",
        "rate_per_unit": 50.0,            # ₹50 per block (1 block ≈ 8 bricks)
        "carbon_per_unit": 0.64,          # 0.08 kgCO2e per brick equivalent × 8
        "description": "Autoclaved Aerated Concrete blocks — 60% less carbon per wall area",
        "is_sustainable": True,
        "alternative_to": "brick_clay",
    },

    # ── SAND ──
    {
        "id": "sand_river",
        "name": "River Sand (Fine Aggregate)",
        "category": "Sand",
        "unit": "m³",
        "rate_per_unit": 2800.0,          # ₹2800/m³
        "carbon_per_unit": 5.0,           # 5 kgCO2e per m³
        "description": "Natural river sand for concrete and plastering",
        "is_sustainable": False,
    },
    {
        "id": "sand_msand",
        "name": "M-Sand (Manufactured Sand)",
        "category": "Sand",
        "unit": "m³",
        "rate_per_unit": 2200.0,
        "carbon_per_unit": 3.8,           # ~24% lower carbon
        "description": "Crushed stone manufactured sand (IS 383 Zone II)",
        "is_sustainable": True,
        "alternative_to": "sand_river",
    },

    # ── AGGREGATE ──
    {
        "id": "aggregate_natural",
        "name": "Natural Coarse Aggregate (20mm)",
        "category": "Aggregate",
        "unit": "m³",
        "rate_per_unit": 1800.0,
        "carbon_per_unit": 4.0,           # 4 kgCO2e per m³
        "description": "Crushed granite coarse aggregate 20mm nominal size",
        "is_sustainable": False,
    },
    {
        "id": "aggregate_recycled",
        "name": "Recycled Concrete Aggregate",
        "category": "Aggregate",
        "unit": "m³",
        "rate_per_unit": 1400.0,
        "carbon_per_unit": 1.5,           # ~63% lower carbon
        "description": "Aggregate from demolished concrete waste, IS 383 compliant",
        "is_sustainable": True,
        "alternative_to": "aggregate_natural",
    },
]


# ─── API ROUTES ───────────────────────────────────────────────────────

@router.get("/", response_model=List[Material])
async def list_materials():
    """List all available materials with their eco-factors."""
    return MATERIALS_DB


@router.get("/thumb-rules", response_model=ThumbRulesResponse)
async def get_thumb_rules():
    """Get the configurable thumb-rule constants used for BOQ generation."""
    return THUMB_RULES


@router.get("/categories")
async def list_categories():
    """Get unique material categories."""
    cats = sorted(set(m["category"] for m in MATERIALS_DB))
    return cats


@router.get("/conventional", response_model=List[Material])
async def list_conventional():
    """List only conventional (non-sustainable) materials."""
    return [m for m in MATERIALS_DB if not m["is_sustainable"]]


@router.get("/sustainable", response_model=List[Material])
async def list_sustainable():
    """List only sustainable alternative materials."""
    return [m for m in MATERIALS_DB if m["is_sustainable"]]


@router.get("/alternatives/{material_id}", response_model=List[Material])
async def get_alternatives(material_id: str):
    """Get sustainable alternatives for a specific material."""
    return [m for m in MATERIALS_DB if m.get("alternative_to") == material_id]
