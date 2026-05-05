"""
BOQ Generation Engine.
Produces a trade-wise Bill of Quantities using the Item Rate Method.
Quantities are calculated from building parameters × thumb-rule factors.
"""

from __future__ import annotations
import uuid
from typing import List, Optional, Dict
from dataclasses import dataclass, field

from services.data.work_items import (
    WORK_ITEMS,
    BUILDING_TYPE_MULTIPLIERS,
    LOCATION_FACTORS,
    QUALITY_MULTIPLIERS,
)


@dataclass
class BOQLineItem:
    id: str
    item_no: str
    trade: str
    description: str
    unit: str
    quantity: float
    material_rate: float   # ₹ per unit (material portion)
    labor_rate: float      # ₹ per unit (labour portion)
    equipment_rate: float  # ₹ per unit (equipment portion)
    rate: float            # total rate per unit
    amount: float          # quantity × rate
    is_manual: bool = False
    sort_order: int = 0


@dataclass
class BOQSummary:
    trade: str
    item_count: int
    subtotal: float


@dataclass
class BOQResult:
    project_id: str
    line_items: List[BOQLineItem]
    trade_summaries: List[BOQSummary]
    total_direct_cost: float
    building_type: str
    location: str
    quality: str
    total_area_sqft: float
    num_floors: int


def generate_boq(
    total_area_sqft: float,
    num_floors: int = 1,
    building_type: str = "residential",
    location: str = "Other",
    quality: str = "standard",
    project_id: Optional[str] = None,
    item_overrides: Optional[Dict[str, Dict]] = None,   # item_id → {quantity, rate}
) -> BOQResult:
    """
    Generate a complete Item-Rate BOQ from building parameters.

    Args:
        total_area_sqft: Total built-up area across all floors (sqft)
        num_floors:      Number of above-ground floors
        building_type:   residential | villa | commercial | industrial
        location:        City name matching LOCATION_FACTORS keys
        quality:         economy | standard | premium | luxury
        project_id:      UUID for the project (auto-generated if None)
        item_overrides:  Manual overrides for specific items {id: {quantity?, rate?}}

    Returns:
        BOQResult with all line items and summary
    """
    footprint_sqft = total_area_sqft / max(num_floors, 1)
    footprint_sqm = footprint_sqft * 0.0929        # sqm
    bua_sqm = total_area_sqft * 0.0929             # sqm

    type_mult = BUILDING_TYPE_MULTIPLIERS.get(building_type, 1.0)
    loc_mult = LOCATION_FACTORS.get(location, 1.0)
    qual_mult = QUALITY_MULTIPLIERS.get(quality, 1.0)
    composite_rate_mult = type_mult * loc_mult * qual_mult

    pid = project_id or str(uuid.uuid4())
    overrides = item_overrides or {}
    items: List[BOQLineItem] = []

    for idx, wi in enumerate(WORK_ITEMS):
        # ── Quantity ─────────────────────────────────────────────
        basis = wi["qty_basis"]
        factor = wi["qty_factor"]

        if basis == "footprint":
            raw_qty = footprint_sqft * factor
        elif basis == "footprint_sqm":
            raw_qty = footprint_sqm * factor
        elif basis == "bua":
            raw_qty = total_area_sqft * factor
        elif basis == "per_floor":
            raw_qty = float(num_floors)
        else:
            raw_qty = total_area_sqft * factor

        qty = round(raw_qty, 3)

        # ── Rate ─────────────────────────────────────────────────
        base_rate = wi["base_rate"] * composite_rate_mult
        mat_rate = round(base_rate * wi["material_pct"], 2)
        lab_rate = round(base_rate * wi["labor_pct"], 2)
        eqp_rate = round(base_rate * wi["equip_pct"], 2)
        total_rate = round(mat_rate + lab_rate + eqp_rate, 2)

        # ── Apply manual overrides ───────────────────────────────
        ov = overrides.get(wi["id"], {})
        if "quantity" in ov:
            qty = float(ov["quantity"])
        if "rate" in ov:
            total_rate = float(ov["rate"])
            mat_rate = round(total_rate * wi["material_pct"], 2)
            lab_rate = round(total_rate * wi["labor_pct"], 2)
            eqp_rate = round(total_rate * wi["equip_pct"], 2)

        amount = round(qty * total_rate, 2)

        items.append(BOQLineItem(
            id=wi["id"],
            item_no=wi["item_no"],
            trade=wi["trade"],
            description=wi["description"],
            unit=wi["unit"],
            quantity=qty,
            material_rate=mat_rate,
            labor_rate=lab_rate,
            equipment_rate=eqp_rate,
            rate=total_rate,
            amount=amount,
            is_manual="quantity" in ov or "rate" in ov,
            sort_order=idx,
        ))

    # ── Trade summaries ──────────────────────────────────────────
    trade_totals: Dict[str, float] = {}
    trade_counts: Dict[str, int] = {}
    for item in items:
        trade_totals[item.trade] = trade_totals.get(item.trade, 0) + item.amount
        trade_counts[item.trade] = trade_counts.get(item.trade, 0) + 1

    summaries = [
        BOQSummary(trade=t, item_count=trade_counts[t], subtotal=round(trade_totals[t], 2))
        for t in trade_totals
    ]

    total = round(sum(item.amount for item in items), 2)

    return BOQResult(
        project_id=pid,
        line_items=items,
        trade_summaries=summaries,
        total_direct_cost=total,
        building_type=building_type,
        location=location,
        quality=quality,
        total_area_sqft=total_area_sqft,
        num_floors=num_floors,
    )
