"""
Comprehensive BOQ Work-Items Database — Indian Construction (2024-25 rates).
25 trade-wise items covering the full lifecycle of an RCC-framed building.

Each item defines:
  qty_factor   – quantity per sqft of the relevant area basis
  qty_basis    – "footprint" (BUA / floors) or "bua" (total built-up area)
  base_rate    – ₹ per unit (all-in: material + labour + equipment)
  material_pct – fraction of base_rate that is material
  labor_pct    – fraction that is labour
  equip_pct    – fraction that is equipment
  type_mult    – rate multiplier per building type
"""

from typing import Dict, List

# ---------------------------------------------------------------------------
# Building-type rate multipliers
# ---------------------------------------------------------------------------
BUILDING_TYPE_MULTIPLIERS: Dict[str, float] = {
    "residential": 1.00,
    "villa":       1.25,
    "commercial":  1.20,
    "industrial":  1.05,
}

# ---------------------------------------------------------------------------
# Location / city-tier cost index
# ---------------------------------------------------------------------------
LOCATION_FACTORS: Dict[str, float] = {
    "Delhi":     1.15,
    "Mumbai":    1.20,
    "Bangalore": 1.15,
    "Hyderabad": 1.10,
    "Chennai":   1.10,
    "Pune":      1.12,
    "Kolkata":   1.05,
    "Ahmedabad": 1.05,
    "Jaipur":    0.95,
    "Lucknow":   0.90,
    "Bhopal":    0.90,
    "Nagpur":    0.95,
    "Other":     1.00,
}

# ---------------------------------------------------------------------------
# Quality-grade rate multipliers
# ---------------------------------------------------------------------------
QUALITY_MULTIPLIERS: Dict[str, float] = {
    "economy":  0.80,
    "standard": 1.00,
    "premium":  1.25,
    "luxury":   1.55,
}

# ---------------------------------------------------------------------------
# Work Items
# ---------------------------------------------------------------------------
WORK_ITEMS: List[Dict] = [

    # ─────────────────────── 1. SITE WORK ───────────────────────────────

    {
        "id": "sw_01",
        "item_no": "1.1",
        "trade": "Site Work",
        "description": "Site clearing, grubbing & levelling including disposal",
        "unit": "sqft",
        "base_rate": 25.0,
        "material_pct": 0.00,
        "labor_pct": 0.70,
        "equip_pct": 0.30,
        "qty_factor": 1.00,   # 1 sqft per sqft of footprint
        "qty_basis": "footprint",
        "notes": "IS 1200 Part-1",
    },
    {
        "id": "sw_02",
        "item_no": "1.2",
        "trade": "Site Work",
        "description": "Earth excavation for foundation in ordinary/hard soil (up to 1.5m depth) including dressing of sides, ramming of bottom and disposal up to 50m lead",
        "unit": "cum",
        "base_rate": 420.0,
        "material_pct": 0.00,
        "labor_pct": 0.55,
        "equip_pct": 0.45,
        "qty_factor": 0.018,  # ~0.19 m³/sqm footprint
        "qty_basis": "footprint",
        "notes": "IS 1200 Part-1",
    },
    {
        "id": "sw_03",
        "item_no": "1.3",
        "trade": "Site Work",
        "description": "Filling in plinth with sand/earth including watering, ramming and compaction",
        "unit": "cum",
        "base_rate": 220.0,
        "material_pct": 0.40,
        "labor_pct": 0.45,
        "equip_pct": 0.15,
        "qty_factor": 0.006,
        "qty_basis": "footprint",
        "notes": "IS 1200 Part-1",
    },

    # ─────────────────────── 2. FOUNDATION ──────────────────────────────

    {
        "id": "fn_01",
        "item_no": "2.1",
        "trade": "Foundation",
        "description": "Plain cement concrete M10 (1:3:6) for foundation bed / levelling course, 75mm thick",
        "unit": "cum",
        "base_rate": 4_500.0,
        "material_pct": 0.62,
        "labor_pct": 0.28,
        "equip_pct": 0.10,
        "qty_factor": 0.0024,   # 75mm PCC × footprint
        "qty_basis": "footprint",
        "notes": "IS 456, IS 2185",
    },
    {
        "id": "fn_02",
        "item_no": "2.2",
        "trade": "Foundation",
        "description": "Reinforced concrete M20 (1:1.5:3) for isolated / combined footings including formwork",
        "unit": "cum",
        "base_rate": 7_200.0,
        "material_pct": 0.58,
        "labor_pct": 0.30,
        "equip_pct": 0.12,
        "qty_factor": 0.018,
        "qty_basis": "footprint",
        "notes": "IS 456",
    },
    {
        "id": "fn_03",
        "item_no": "2.3",
        "trade": "Foundation",
        "description": "High-yield strength deformed bars (HYSD Fe500) for foundation reinforcement including cutting, bending and placing",
        "unit": "kg",
        "base_rate": 92.0,
        "material_pct": 0.78,
        "labor_pct": 0.17,
        "equip_pct": 0.05,
        "qty_factor": 2.20,
        "qty_basis": "footprint",
        "notes": "IS 1786",
    },

    # ─────────────────────── 3. PLINTH ──────────────────────────────────

    {
        "id": "pl_01",
        "item_no": "3.1",
        "trade": "Plinth",
        "description": "RCC M20 plinth beam including shuttering / formwork",
        "unit": "cum",
        "base_rate": 7_800.0,
        "material_pct": 0.58,
        "labor_pct": 0.30,
        "equip_pct": 0.12,
        "qty_factor": 0.006,
        "qty_basis": "footprint",
        "notes": "IS 456",
    },
    {
        "id": "pl_02",
        "item_no": "3.2",
        "trade": "Plinth",
        "description": "HYSD Fe500 steel for plinth beam reinforcement",
        "unit": "kg",
        "base_rate": 92.0,
        "material_pct": 0.78,
        "labor_pct": 0.17,
        "equip_pct": 0.05,
        "qty_factor": 0.80,
        "qty_basis": "footprint",
        "notes": "IS 1786",
    },
    {
        "id": "pl_03",
        "item_no": "3.3",
        "trade": "Plinth",
        "description": "Damp-proof course (DPC) — 50mm thick cement concrete M15 with waterproofing compound",
        "unit": "sqft",
        "base_rate": 45.0,
        "material_pct": 0.55,
        "labor_pct": 0.40,
        "equip_pct": 0.05,
        "qty_factor": 1.00,
        "qty_basis": "footprint",
        "notes": "IS 2190",
    },

    # ─────────────────────── 4. SUPERSTRUCTURE ──────────────────────────

    {
        "id": "ss_01",
        "item_no": "4.1",
        "trade": "Superstructure",
        "description": "RCC M25 columns including shuttering / formwork (all floors)",
        "unit": "cum",
        "base_rate": 9_200.0,
        "material_pct": 0.55,
        "labor_pct": 0.32,
        "equip_pct": 0.13,
        "qty_factor": 0.004,   # per sqft of BUA
        "qty_basis": "bua",
        "notes": "IS 456",
    },
    {
        "id": "ss_02",
        "item_no": "4.2",
        "trade": "Superstructure",
        "description": "HYSD Fe500 steel for column reinforcement",
        "unit": "kg",
        "base_rate": 92.0,
        "material_pct": 0.78,
        "labor_pct": 0.17,
        "equip_pct": 0.05,
        "qty_factor": 0.55,
        "qty_basis": "bua",
        "notes": "IS 1786",
    },
    {
        "id": "ss_03",
        "item_no": "4.3",
        "trade": "Superstructure",
        "description": "RCC M20 beams / lintels including shuttering / formwork",
        "unit": "cum",
        "base_rate": 8_000.0,
        "material_pct": 0.57,
        "labor_pct": 0.30,
        "equip_pct": 0.13,
        "qty_factor": 0.005,
        "qty_basis": "bua",
        "notes": "IS 456",
    },
    {
        "id": "ss_04",
        "item_no": "4.4",
        "trade": "Superstructure",
        "description": "HYSD Fe500 steel for beam reinforcement",
        "unit": "kg",
        "base_rate": 92.0,
        "material_pct": 0.78,
        "labor_pct": 0.17,
        "equip_pct": 0.05,
        "qty_factor": 0.65,
        "qty_basis": "bua",
        "notes": "IS 1786",
    },
    {
        "id": "ss_05",
        "item_no": "4.5",
        "trade": "Superstructure",
        "description": "RCC M20 slab (125mm thick) including shuttering / formwork",
        "unit": "cum",
        "base_rate": 7_500.0,
        "material_pct": 0.57,
        "labor_pct": 0.30,
        "equip_pct": 0.13,
        "qty_factor": 0.0116,   # 125mm × 0.0929 sqm/sqft
        "qty_basis": "bua",
        "notes": "IS 456",
    },
    {
        "id": "ss_06",
        "item_no": "4.6",
        "trade": "Superstructure",
        "description": "HYSD Fe500 steel for slab reinforcement",
        "unit": "kg",
        "base_rate": 92.0,
        "material_pct": 0.78,
        "labor_pct": 0.17,
        "equip_pct": 0.05,
        "qty_factor": 1.85,
        "qty_basis": "bua",
        "notes": "IS 1786",
    },
    {
        "id": "ss_07",
        "item_no": "4.7",
        "trade": "Superstructure",
        "description": "RCC staircase (doglegged) M20 including shuttering and steel",
        "unit": "cum",
        "base_rate": 11_000.0,
        "material_pct": 0.55,
        "labor_pct": 0.35,
        "equip_pct": 0.10,
        "qty_factor": 0.0015,   # per sqft of BUA (staircase volume)
        "qty_basis": "bua",
        "notes": "IS 456",
    },

    # ─────────────────────── 5. MASONRY ─────────────────────────────────

    {
        "id": "ma_01",
        "item_no": "5.1",
        "trade": "Masonry",
        "description": "Brick masonry in cement mortar 1:6 — 230mm thick external walls using first class bricks",
        "unit": "cum",
        "base_rate": 4_800.0,
        "material_pct": 0.52,
        "labor_pct": 0.43,
        "equip_pct": 0.05,
        "qty_factor": 0.016,    # ~0.73 sqm wall/sqm floor × 0.23 depth → 0.168 cum/sqm → × 0.0929
        "qty_basis": "bua",
        "notes": "IS 1905, IS 2212",
    },
    {
        "id": "ma_02",
        "item_no": "5.2",
        "trade": "Masonry",
        "description": "Brick masonry in cement mortar 1:4 — 115mm thick internal partition walls",
        "unit": "cum",
        "base_rate": 4_500.0,
        "material_pct": 0.50,
        "labor_pct": 0.45,
        "equip_pct": 0.05,
        "qty_factor": 0.012,
        "qty_basis": "bua",
        "notes": "IS 1905",
    },

    # ─────────────────────── 6. PLASTERING ──────────────────────────────

    {
        "id": "pt_01",
        "item_no": "6.1",
        "trade": "Plastering",
        "description": "External cement plaster 18mm thick in CM 1:4 including wire mesh / chicken mesh",
        "unit": "sqm",
        "base_rate": 195.0,
        "material_pct": 0.42,
        "labor_pct": 0.54,
        "equip_pct": 0.04,
        "qty_factor": 0.093,    # ~1 sqm wall/sqm floor × 0.0929
        "qty_basis": "bua",
        "notes": "IS 1661",
    },
    {
        "id": "pt_02",
        "item_no": "6.2",
        "trade": "Plastering",
        "description": "Internal cement plaster 12mm thick in CM 1:6 to walls + POP putty finish (2mm)",
        "unit": "sqm",
        "base_rate": 165.0,
        "material_pct": 0.40,
        "labor_pct": 0.56,
        "equip_pct": 0.04,
        "qty_factor": 0.280,    # ~3 sqm wall+ceil/sqm floor × 0.0929
        "qty_basis": "bua",
        "notes": "IS 1661",
    },

    # ─────────────────────── 7. FLOORING ────────────────────────────────

    {
        "id": "fl_01",
        "item_no": "7.1",
        "trade": "Flooring",
        "description": "Vitrified floor tiles 600×600mm (Grade A, 8-10mm thick) including cement mortar bed 1:4 and grouting",
        "unit": "sqm",
        "base_rate": 850.0,
        "material_pct": 0.65,
        "labor_pct": 0.30,
        "equip_pct": 0.05,
        "qty_factor": 0.097,    # 1.05 wastage × 0.0929
        "qty_basis": "bua",
        "notes": "IS 15622",
    },
    {
        "id": "fl_02",
        "item_no": "7.2",
        "trade": "Flooring",
        "description": "Anti-skid ceramic tiles 300×300mm for bathrooms/kitchen including mortar bed and grouting",
        "unit": "sqm",
        "base_rate": 720.0,
        "material_pct": 0.62,
        "labor_pct": 0.33,
        "equip_pct": 0.05,
        "qty_factor": 0.014,    # ~15% of BUA for wet areas
        "qty_basis": "bua",
        "notes": "IS 13753",
    },

    # ─────────────────────── 8. DOORS & WINDOWS ─────────────────────────

    {
        "id": "dw_01",
        "item_no": "8.1",
        "trade": "Doors & Windows",
        "description": "Solid core flush door shutter 35mm thick with frame (90×210cm) including hardware",
        "unit": "nos",
        "base_rate": 9_500.0,
        "material_pct": 0.70,
        "labor_pct": 0.25,
        "equip_pct": 0.05,
        "qty_factor": 0.0083,   # 1 door per 120 sqft BUA
        "qty_basis": "bua",
        "notes": "IS 2191",
    },
    {
        "id": "dw_02",
        "item_no": "8.2",
        "trade": "Doors & Windows",
        "description": "Aluminium sliding window 100×120cm (2-track) with 5mm toughened glass including mosquito mesh",
        "unit": "nos",
        "base_rate": 8_200.0,
        "material_pct": 0.72,
        "labor_pct": 0.23,
        "equip_pct": 0.05,
        "qty_factor": 0.013,    # 1 window per 77 sqft
        "qty_basis": "bua",
        "notes": "IS 1948",
    },

    # ─────────────────────── 9. WATERPROOFING ────────────────────────────

    {
        "id": "wp_01",
        "item_no": "9.1",
        "trade": "Waterproofing",
        "description": "Terrace waterproofing — polymer-modified bitumen membrane (APP/SBS, 4mm) with brick bat coba and IPS finish",
        "unit": "sqm",
        "base_rate": 420.0,
        "material_pct": 0.60,
        "labor_pct": 0.35,
        "equip_pct": 0.05,
        "qty_factor": 0.097,    # footprint area in sqm
        "qty_basis": "footprint_sqm",
        "notes": "IS 1346",
    },

    # ─────────────────────── 10. PAINTING ────────────────────────────────

    {
        "id": "pa_01",
        "item_no": "10.1",
        "trade": "Painting",
        "description": "Interior acrylic emulsion paint (2 coats) on POP / plaster surface including primer coat",
        "unit": "sqm",
        "base_rate": 110.0,
        "material_pct": 0.50,
        "labor_pct": 0.48,
        "equip_pct": 0.02,
        "qty_factor": 0.350,    # ~3.77 sqm wall+ceil/sqm floor × 0.0929
        "qty_basis": "bua",
        "notes": "IS 15489",
    },
    {
        "id": "pa_02",
        "item_no": "10.2",
        "trade": "Painting",
        "description": "Exterior weather-proof texture paint (2 coats) on cement plaster including primer",
        "unit": "sqm",
        "base_rate": 145.0,
        "material_pct": 0.55,
        "labor_pct": 0.43,
        "equip_pct": 0.02,
        "qty_factor": 0.093,
        "qty_basis": "bua",
        "notes": "IS 15489",
    },

    # ─────────────────────── 11. ELECTRICAL ──────────────────────────────

    {
        "id": "el_01",
        "item_no": "11.1",
        "trade": "Electrical",
        "description": "Concealed electrical wiring — 2.5mm² FR-PVC copper wire (FRLS) in conduit per point including MCB protection",
        "unit": "point",
        "base_rate": 1_800.0,
        "material_pct": 0.55,
        "labor_pct": 0.40,
        "equip_pct": 0.05,
        "qty_factor": 0.08,     # 1 point per 12.5 sqft
        "qty_basis": "bua",
        "notes": "IS 694, IE Rules",
    },
    {
        "id": "el_02",
        "item_no": "11.2",
        "trade": "Electrical",
        "description": "DB board (MCB panel) with 4-way single-phase + earth leakage circuit breaker per floor",
        "unit": "nos",
        "base_rate": 9_500.0,
        "material_pct": 0.65,
        "labor_pct": 0.30,
        "equip_pct": 0.05,
        "qty_factor": 1.0,      # 1 per floor → handled by floor count in engine
        "qty_basis": "per_floor",
        "notes": "IS 8828",
    },

    # ─────────────────────── 12. PLUMBING ────────────────────────────────

    {
        "id": "pb_01",
        "item_no": "12.1",
        "trade": "Plumbing",
        "description": "CPVC hot & cold water supply piping (25mm–50mm) including fittings, valves and testing",
        "unit": "lm",
        "base_rate": 520.0,
        "material_pct": 0.55,
        "labor_pct": 0.38,
        "equip_pct": 0.07,
        "qty_factor": 0.30,     # 0.30 lm per sqft
        "qty_basis": "bua",
        "notes": "IS 15778",
    },
    {
        "id": "pb_02",
        "item_no": "12.2",
        "trade": "Plumbing",
        "description": "uPVC soil & waste drainage pipes (75mm–110mm) including fittings, traps and testing",
        "unit": "lm",
        "base_rate": 380.0,
        "material_pct": 0.52,
        "labor_pct": 0.40,
        "equip_pct": 0.08,
        "qty_factor": 0.20,
        "qty_basis": "bua",
        "notes": "IS 4985",
    },
    {
        "id": "pb_03",
        "item_no": "12.3",
        "trade": "Plumbing",
        "description": "Sanitary fixtures set — EWC (wall-hung) + WHB + CP fittings (per bathroom/toilet)",
        "unit": "set",
        "base_rate": 18_000.0,
        "material_pct": 0.72,
        "labor_pct": 0.23,
        "equip_pct": 0.05,
        "qty_factor": 0.0055,   # 1 set per 180 sqft
        "qty_basis": "bua",
        "notes": "IS 2556",
    },
]

# Index by id for fast lookup
WORK_ITEMS_BY_ID: Dict[str, Dict] = {item["id"]: item for item in WORK_ITEMS}

# Unique trade names in display order
TRADES: List[str] = list(dict.fromkeys(item["trade"] for item in WORK_ITEMS))
