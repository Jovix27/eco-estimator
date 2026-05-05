/**
 * Typed API client for the Eco Estimator backend.
 * All functions throw on non-2xx responses with a descriptive message.
 */

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const e = await res.json(); msg = e.detail || JSON.stringify(e) } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  location: string
  building_type: string
  total_area_sqft: number
  num_floors: number
  quality: string
  overhead_pct: number
  profit_pct: number
  description: string
  created_at: string
  updated_at: string
}

export interface BOQItem {
  id: string
  item_no: string
  trade: string
  description: string
  unit: string
  quantity: number
  material_rate: number
  labor_rate: number
  equipment_rate: number
  rate: number
  amount: number
  is_manual: boolean
  sort_order: number
}

export interface TradeGroup {
  trade: string
  items: BOQItem[]
  subtotal: number
}

export interface TradeBreakdown {
  trade: string
  direct_cost: number
  share_pct: number
}

export interface Estimate {
  project_id: string
  direct_cost: number
  trade_breakdown: TradeBreakdown[]
  overhead_pct: number
  overhead_amount: number
  profit_pct: number
  profit_amount: number
  contingency_pct: number
  contingency_amount: number
  sub_total: number
  gst_pct: number
  gst_amount: number
  grand_total: number
  total_area_sqft: number
  cost_per_sqft: number
  grand_total_per_sqft: number
  total_material_cost: number
  total_labor_cost: number
  total_equipment_cost: number
  method: string
  building_type: string
  location: string
  quality: string
  num_floors: number
  created_at?: string
}

export interface MetaOptions {
  building_types: string[]
  locations: string[]
  quality_grades: string[]
}

// ── Projects ──────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => request<{ projects: Project[]; total: number }>('/projects/'),

  create: (body: {
    name: string
    location: string
    building_type: string
    total_area_sqft: number
    num_floors: number
    quality: string
    overhead_pct: number
    profit_pct: number
    description?: string
  }) => request<{ project: Project; boq_items_count: number }>('/projects/', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  get: (id: string) => request<{ project: Project; boq_items: BOQItem[]; estimate: Estimate | null }>(`/projects/${id}`),

  update: (id: string, body: Partial<Project>) =>
    request<{ project: Project }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) => fetch(`${BASE}/projects/${id}`, { method: 'DELETE' }),

  regenerateBoq: (id: string) =>
    request<{ boq_items: BOQItem[]; total_direct_cost: number }>(`/projects/${id}/regenerate-boq`, { method: 'POST' }),

  getOptions: () => request<MetaOptions>('/projects/meta/options'),
}

// ── BOQ ───────────────────────────────────────────────────────────────────

export const boqApi = {
  get: (projectId: string) =>
    request<{ trades: TradeGroup[]; total_direct_cost: number; item_count: number }>(`/projects/${projectId}/boq`),

  updateItem: (projectId: string, itemId: string, body: { quantity?: number; rate?: number; description?: string }) =>
    request<{ item: BOQItem }>(`/projects/${projectId}/boq/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}

// ── Estimates ─────────────────────────────────────────────────────────────

export const estimatesApi = {
  run: (projectId: string, body: {
    overhead_pct?: number
    profit_pct?: number
    contingency_pct?: number
    gst_pct?: number
    method?: string
  }) => request<Estimate>(`/projects/${projectId}/estimate`, { method: 'POST', body: JSON.stringify(body) }),

  plinthArea: (projectId: string, overheadPct = 10, profitPct = 10) =>
    request<Record<string, number | string>>(`/projects/${projectId}/estimate/plinth-area?overhead_pct=${overheadPct}&profit_pct=${profitPct}`),
}

// ── Export ────────────────────────────────────────────────────────────────

export const exportApi = {
  downloadExcel: (projectId: string, projectName: string) => {
    const a = document.createElement('a')
    a.href = `${BASE}/export/projects/${projectId}/excel`
    a.download = `EcoEstimator_${projectName.replace(/\s+/g, '_')}_BOQ.xlsx`
    a.click()
  },
}
