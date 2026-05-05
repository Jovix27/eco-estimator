"""
Projects API — full CRUD.
Uses Supabase when configured, falls back to in-memory dict for local development.
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.boq_engine import generate_boq, BOQLineItem, BOQResult
from services.estimation_engine import run_estimation, plinth_area_estimate
from db.supabase import get_supabase

router = APIRouter(prefix="/projects", tags=["Projects"])

# ── In-memory fallback ──────────────────────────────────────────────────────
_PROJECTS: Dict[str, dict] = {}
_BOQ_ITEMS: Dict[str, List[dict]] = {}
_ESTIMATES: Dict[str, dict] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Schemas ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    location: str = Field(default="Other")
    building_type: str = Field(default="residential")
    total_area_sqft: float = Field(..., gt=0, le=500_000)
    num_floors: int = Field(default=1, ge=1, le=50)
    quality: str = Field(default="standard")
    overhead_pct: float = Field(default=10.0, ge=0, le=50)
    profit_pct: float = Field(default=10.0, ge=0, le=50)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    building_type: Optional[str] = None
    total_area_sqft: Optional[float] = None
    num_floors: Optional[int] = None
    quality: Optional[str] = None
    overhead_pct: Optional[float] = None
    profit_pct: Optional[float] = None
    description: Optional[str] = None


class BOQItemUpdate(BaseModel):
    quantity: Optional[float] = Field(default=None, gt=0)
    rate: Optional[float] = Field(default=None, ge=0)
    description: Optional[str] = None


class EstimateRequest(BaseModel):
    overhead_pct: Optional[float] = Field(default=None, ge=0, le=50)
    profit_pct: Optional[float] = Field(default=None, ge=0, le=50)
    contingency_pct: float = Field(default=3.0, ge=0, le=20)
    gst_pct: float = Field(default=12.0, ge=0, le=30)
    method: str = Field(default="Item Rate Method")


# ── Storage helpers ──────────────────────────────────────────────────────────

def _boq_item_to_dict(item: BOQLineItem) -> dict:
    return {
        "id": item.id,
        "item_no": item.item_no,
        "trade": item.trade,
        "description": item.description,
        "unit": item.unit,
        "quantity": item.quantity,
        "material_rate": item.material_rate,
        "labor_rate": item.labor_rate,
        "equipment_rate": item.equipment_rate,
        "rate": item.rate,
        "amount": item.amount,
        "is_manual": item.is_manual,
        "sort_order": item.sort_order,
    }


def _store_project(project: dict) -> dict:
    db = get_supabase()
    if db:
        try:
            res = db.table("projects").insert(project).execute()
            return res.data[0] if res.data else project
        except Exception as e:
            print(f"[DB] insert project failed: {e}")
    _PROJECTS[project["id"]] = project
    return project


def _get_project(pid: str) -> Optional[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("projects").select("*").eq("id", pid).single().execute()
            return res.data
        except Exception:
            pass
    return _PROJECTS.get(pid)


def _list_projects() -> List[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("projects").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception:
            pass
    return sorted(_PROJECTS.values(), key=lambda p: p["created_at"], reverse=True)


def _update_project(pid: str, updates: dict) -> Optional[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("projects").update(updates).eq("id", pid).execute()
            return res.data[0] if res.data else None
        except Exception:
            pass
    if pid in _PROJECTS:
        _PROJECTS[pid].update(updates)
        return _PROJECTS[pid]
    return None


def _delete_project(pid: str):
    db = get_supabase()
    if db:
        try:
            db.table("boq_items").delete().eq("project_id", pid).execute()
            db.table("project_estimates").delete().eq("project_id", pid).execute()
            db.table("projects").delete().eq("id", pid).execute()
            return
        except Exception:
            pass
    _PROJECTS.pop(pid, None)
    _BOQ_ITEMS.pop(pid, None)
    _ESTIMATES.pop(pid, None)


def _store_boq(pid: str, items: List[dict]):
    db = get_supabase()
    if db:
        try:
            db.table("boq_items").delete().eq("project_id", pid).execute()
            rows = [{**i, "project_id": pid} for i in items]
            db.table("boq_items").insert(rows).execute()
            return
        except Exception as e:
            print(f"[DB] store BOQ failed: {e}")
    _BOQ_ITEMS[pid] = items


def _get_boq(pid: str) -> List[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("boq_items").select("*").eq("project_id", pid)\
                    .order("sort_order").execute()
            return res.data or []
        except Exception:
            pass
    return _BOQ_ITEMS.get(pid, [])


def _update_boq_item(pid: str, item_id: str, updates: dict) -> Optional[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("boq_items").update(updates)\
                    .eq("project_id", pid).eq("id", item_id).execute()
            return res.data[0] if res.data else None
        except Exception:
            pass
    items = _BOQ_ITEMS.get(pid, [])
    for item in items:
        if item["id"] == item_id:
            item.update(updates)
            return item
    return None


def _store_estimate(pid: str, estimate: dict):
    db = get_supabase()
    if db:
        try:
            db.table("project_estimates").delete().eq("project_id", pid).execute()
            db.table("project_estimates").insert({**estimate, "project_id": pid}).execute()
            return
        except Exception as e:
            print(f"[DB] store estimate failed: {e}")
    _ESTIMATES[pid] = estimate


def _get_estimate(pid: str) -> Optional[dict]:
    db = get_supabase()
    if db:
        try:
            res = db.table("project_estimates").select("*").eq("project_id", pid)\
                    .order("created_at", desc=True).limit(1).execute()
            return res.data[0] if res.data else None
        except Exception:
            pass
    return _ESTIMATES.get(pid)


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def create_project(body: ProjectCreate):
    """Create a new project and auto-generate its BOQ."""
    pid = str(uuid.uuid4())
    now = _now()

    project = {
        "id": pid,
        "name": body.name,
        "location": body.location,
        "building_type": body.building_type,
        "total_area_sqft": body.total_area_sqft,
        "num_floors": body.num_floors,
        "quality": body.quality,
        "overhead_pct": body.overhead_pct,
        "profit_pct": body.profit_pct,
        "description": body.description or "",
        "created_at": now,
        "updated_at": now,
    }

    stored = _store_project(project)

    boq = generate_boq(
        total_area_sqft=body.total_area_sqft,
        num_floors=body.num_floors,
        building_type=body.building_type,
        location=body.location,
        quality=body.quality,
        project_id=pid,
    )
    items = [_boq_item_to_dict(i) for i in boq.line_items]
    _store_boq(pid, items)

    return {"project": stored, "boq_items_count": len(items)}


@router.get("/")
async def list_projects():
    """List all projects."""
    projects = _list_projects()
    return {"projects": projects, "total": len(projects)}


@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get project details with latest BOQ and estimate."""
    project = _get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    boq_items = _get_boq(project_id)
    estimate = _get_estimate(project_id)

    return {
        "project": project,
        "boq_items": boq_items,
        "estimate": estimate,
    }


@router.put("/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate):
    """Update project metadata."""
    project = _get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = _now()
    updated = _update_project(project_id, updates)
    return {"project": updated}


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str):
    """Delete a project and all related data."""
    if not _get_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    _delete_project(project_id)


@router.post("/{project_id}/regenerate-boq")
async def regenerate_boq(project_id: str):
    """Re-generate BOQ from current project parameters (resets manual edits)."""
    project = _get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    boq = generate_boq(
        total_area_sqft=project["total_area_sqft"],
        num_floors=project["num_floors"],
        building_type=project["building_type"],
        location=project["location"],
        quality=project["quality"],
        project_id=project_id,
    )
    items = [_boq_item_to_dict(i) for i in boq.line_items]
    _store_boq(project_id, items)

    return {"boq_items": items, "total_direct_cost": boq.total_direct_cost}


@router.get("/{project_id}/boq")
async def get_boq(project_id: str):
    """Get BOQ items grouped by trade."""
    if not _get_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    items = _get_boq(project_id)
    if not items:
        raise HTTPException(status_code=404, detail="BOQ not generated yet")

    trades: Dict[str, Any] = {}
    for item in items:
        t = item["trade"]
        if t not in trades:
            trades[t] = {"trade": t, "items": [], "subtotal": 0.0}
        trades[t]["items"].append(item)
        trades[t]["subtotal"] = round(trades[t]["subtotal"] + item["amount"], 2)

    total = round(sum(i["amount"] for i in items), 2)

    return {
        "trades": list(trades.values()),
        "total_direct_cost": total,
        "item_count": len(items),
    }


@router.patch("/{project_id}/boq/{item_id}")
async def update_boq_item(project_id: str, item_id: str, body: BOQItemUpdate):
    """Manually override a BOQ item's quantity or rate."""
    if not _get_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    items = _get_boq(project_id)
    target = next((i for i in items if i["id"] == item_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="BOQ item not found")

    updates: dict = {"is_manual": True}
    qty = body.quantity if body.quantity is not None else target["quantity"]
    rate = body.rate if body.rate is not None else target["rate"]

    if body.quantity is not None:
        updates["quantity"] = qty
    if body.rate is not None:
        updates["rate"] = rate
    if body.description is not None:
        updates["description"] = body.description

    updates["amount"] = round(qty * rate, 2)

    updated = _update_boq_item(project_id, item_id, updates)
    return {"item": updated}


@router.post("/{project_id}/estimate")
async def create_estimate(project_id: str, body: EstimateRequest):
    """Run full estimation (overhead + profit + taxes) on current BOQ."""
    project = _get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    items = _get_boq(project_id)
    if not items:
        raise HTTPException(status_code=400, detail="BOQ is empty — regenerate BOQ first")

    boq_items_obj = [
        BOQLineItem(**{k: i[k] for k in [
            "id", "item_no", "trade", "description", "unit", "quantity",
            "material_rate", "labor_rate", "equipment_rate", "rate",
            "amount", "is_manual", "sort_order"
        ]})
        for i in items
    ]

    total = round(sum(i["amount"] for i in items), 2)

    boq_result = BOQResult(
        project_id=project_id,
        line_items=boq_items_obj,
        trade_summaries=[],
        total_direct_cost=total,
        building_type=project["building_type"],
        location=project["location"],
        quality=project["quality"],
        total_area_sqft=project["total_area_sqft"],
        num_floors=project["num_floors"],
    )

    overhead_pct = body.overhead_pct if body.overhead_pct is not None else project.get("overhead_pct", 10.0)
    profit_pct = body.profit_pct if body.profit_pct is not None else project.get("profit_pct", 10.0)

    est = run_estimation(
        boq_result=boq_result,
        overhead_pct=overhead_pct,
        profit_pct=profit_pct,
        contingency_pct=body.contingency_pct,
        gst_pct=body.gst_pct,
        method=body.method,
    )

    from dataclasses import asdict
    est_dict = asdict(est)
    est_dict["created_at"] = _now()
    _store_estimate(project_id, est_dict)

    return est_dict


@router.get("/{project_id}/estimate/plinth-area")
async def quick_plinth_estimate(
    project_id: str,
    overhead_pct: float = Query(default=10.0),
    profit_pct: float = Query(default=10.0),
):
    """Quick Plinth Area Method estimate."""
    project = _get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return plinth_area_estimate(
        total_area_sqft=project["total_area_sqft"],
        building_type=project["building_type"],
        quality=project["quality"],
        location=project["location"],
        overhead_pct=overhead_pct,
        profit_pct=profit_pct,
    )


@router.get("/meta/options")
async def get_options():
    """Return all valid dropdown options for the project form."""
    from services.data.work_items import BUILDING_TYPE_MULTIPLIERS, LOCATION_FACTORS, QUALITY_MULTIPLIERS
    return {
        "building_types": list(BUILDING_TYPE_MULTIPLIERS.keys()),
        "locations": sorted(LOCATION_FACTORS.keys()),
        "quality_grades": list(QUALITY_MULTIPLIERS.keys()),
    }
