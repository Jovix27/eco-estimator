"""
Estimation Engine.
Wraps the BOQ result and applies overhead, profit, taxes and other adjustments
to produce a complete project cost estimate.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Optional

from services.boq_engine import BOQResult, BOQLineItem


@dataclass
class TradeBreakdown:
    trade: str
    direct_cost: float
    share_pct: float


@dataclass
class EstimateResult:
    project_id: str

    # Direct costs
    direct_cost: float            # sum of all BOQ amounts
    trade_breakdown: List[TradeBreakdown]

    # Adjustments
    overhead_pct: float
    overhead_amount: float
    profit_pct: float
    profit_amount: float
    contingency_pct: float
    contingency_amount: float

    # Totals
    sub_total: float              # direct + overhead + profit
    gst_pct: float
    gst_amount: float
    grand_total: float

    # Per-area metrics
    total_area_sqft: float
    cost_per_sqft: float
    grand_total_per_sqft: float

    # Trade allocation percentages (material / labour / equipment)
    total_material_cost: float
    total_labor_cost: float
    total_equipment_cost: float

    # Estimation method metadata
    method: str
    building_type: str
    location: str
    quality: str
    num_floors: int


def run_estimation(
    boq_result: BOQResult,
    overhead_pct: float = 10.0,
    profit_pct: float = 10.0,
    contingency_pct: float = 3.0,
    gst_pct: float = 12.0,      # GST on construction labour ~12%
    method: str = "Item Rate Method",
) -> EstimateResult:
    """
    Apply overhead, profit, contingency and GST to a BOQ result.

    Args:
        boq_result:       Output from generate_boq()
        overhead_pct:     Site overhead as % of direct cost (default 10%)
        profit_pct:       Contractor profit as % of direct cost (default 10%)
        contingency_pct:  Risk buffer as % of direct cost (default 3%)
        gst_pct:          GST rate on total construction (default 12%)
        method:           Estimation method label

    Returns:
        EstimateResult with full cost breakdown
    """
    items: List[BOQLineItem] = boq_result.line_items
    direct = boq_result.total_direct_cost
    area = boq_result.total_area_sqft

    # ── Trade-wise breakdown ─────────────────────────────────────────────
    trade_map: Dict[str, float] = {}
    for item in items:
        trade_map[item.trade] = trade_map.get(item.trade, 0.0) + item.amount

    trade_breakdown = [
        TradeBreakdown(
            trade=t,
            direct_cost=round(v, 2),
            share_pct=round((v / direct) * 100, 1) if direct else 0,
        )
        for t, v in trade_map.items()
    ]

    # ── Material / Labour / Equipment split ──────────────────────────────
    total_mat = round(sum(i.quantity * i.material_rate for i in items), 2)
    total_lab = round(sum(i.quantity * i.labor_rate for i in items), 2)
    total_eqp = round(sum(i.quantity * i.equipment_rate for i in items), 2)

    # ── Adjustments ──────────────────────────────────────────────────────
    overhead = round(direct * overhead_pct / 100, 2)
    profit = round(direct * profit_pct / 100, 2)
    contingency = round(direct * contingency_pct / 100, 2)
    sub_total = round(direct + overhead + profit + contingency, 2)
    gst = round(sub_total * gst_pct / 100, 2)
    grand_total = round(sub_total + gst, 2)

    cost_per_sqft = round(direct / area, 2) if area else 0
    gt_per_sqft = round(grand_total / area, 2) if area else 0

    return EstimateResult(
        project_id=boq_result.project_id,
        direct_cost=direct,
        trade_breakdown=trade_breakdown,
        overhead_pct=overhead_pct,
        overhead_amount=overhead,
        profit_pct=profit_pct,
        profit_amount=profit,
        contingency_pct=contingency_pct,
        contingency_amount=contingency,
        sub_total=sub_total,
        gst_pct=gst_pct,
        gst_amount=gst,
        grand_total=grand_total,
        total_area_sqft=area,
        cost_per_sqft=cost_per_sqft,
        grand_total_per_sqft=gt_per_sqft,
        total_material_cost=total_mat,
        total_labor_cost=total_lab,
        total_equipment_cost=total_eqp,
        method=method,
        building_type=boq_result.building_type,
        location=boq_result.location,
        quality=boq_result.quality,
        num_floors=boq_result.num_floors,
    )


# ── Plinth Area Method (quick estimate) ─────────────────────────────────────

PLINTH_AREA_RATES: Dict[str, Dict[str, float]] = {
    "residential": {"economy": 1_400, "standard": 1_900, "premium": 2_600, "luxury": 3_800},
    "villa":       {"economy": 1_700, "standard": 2_400, "premium": 3_200, "luxury": 5_000},
    "commercial":  {"economy": 1_800, "standard": 2_500, "premium": 3_500, "luxury": 5_500},
    "industrial":  {"economy": 1_200, "standard": 1_600, "premium": 2_200, "luxury": 3_000},
}


def plinth_area_estimate(
    total_area_sqft: float,
    building_type: str = "residential",
    quality: str = "standard",
    location: str = "Other",
    overhead_pct: float = 10.0,
    profit_pct: float = 10.0,
    gst_pct: float = 12.0,
) -> Dict:
    """Quick plinth-area method estimate (no BOQ required)."""
    from services.data.work_items import LOCATION_FACTORS

    base_rate = PLINTH_AREA_RATES.get(building_type, PLINTH_AREA_RATES["residential"])\
                                 .get(quality, 1_900)
    loc = LOCATION_FACTORS.get(location, 1.0)
    rate = round(base_rate * loc, 2)
    direct = round(total_area_sqft * rate, 2)
    overhead = round(direct * overhead_pct / 100, 2)
    profit = round(direct * profit_pct / 100, 2)
    sub_total = round(direct + overhead + profit, 2)
    gst = round(sub_total * gst_pct / 100, 2)
    grand_total = round(sub_total + gst, 2)

    return {
        "method": "Plinth Area Method",
        "total_area_sqft": total_area_sqft,
        "plinth_area_rate": rate,
        "direct_cost": direct,
        "overhead_amount": overhead,
        "profit_amount": profit,
        "sub_total": sub_total,
        "gst_amount": gst,
        "grand_total": grand_total,
        "cost_per_sqft": rate,
        "grand_total_per_sqft": round(grand_total / total_area_sqft, 2),
    }
