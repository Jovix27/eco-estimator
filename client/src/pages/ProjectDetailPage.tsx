import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, RefreshCw, Download, Calculator, FileSpreadsheet,
  BarChart3, AlertCircle, CheckCircle2, Layers, MapPin, Star,
  Play, Settings
} from 'lucide-react'
import { projectsApi, boqApi, estimatesApi, exportApi, type Project, type TradeGroup, type Estimate } from '../lib/api'
import BOQGrid from '../components/BOQGrid'
import CostCharts from '../components/CostCharts'

type Tab = 'boq' | 'estimate' | 'reports'

const INR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// ── Estimate Settings panel ─────────────────────────────────────────────────

interface EstimatePanelProps {
  projectId: string
  project: Project
  existing: Estimate | null
  onRun: (est: Estimate) => void
}

function EstimatePanel({ projectId, project, existing, onRun }: EstimatePanelProps) {
  const [settings, setSettings] = useState({
    overhead_pct: project.overhead_pct,
    profit_pct: project.profit_pct,
    contingency_pct: 3.0,
    gst_pct: 12.0,
  })
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: string, v: number) => setSettings(s => ({ ...s, [k]: v }))

  const run = async () => {
    setRunning(true); setError(null)
    try {
      const est = await estimatesApi.run(projectId, settings)
      onRun(est)
    } catch (e: any) {
      setError(e.message)
    } finally { setRunning(false) }
  }

  return (
    <div className="glass rounded-2xl border border-white/10 p-6">
      <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
        <Settings size={14} className="text-primary-400" />
        Estimation Parameters
      </h3>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {[
          { key: 'overhead_pct', label: 'Site Overhead %', help: 'Supervisory, site facilities' },
          { key: 'profit_pct', label: 'Contractor Profit %', help: 'On direct cost' },
          { key: 'contingency_pct', label: 'Contingency %', help: 'Risk & escalation buffer' },
          { key: 'gst_pct', label: 'GST %', help: 'On sub-total amount' },
        ].map(({ key, label, help }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="50"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              value={(settings as any)[key]}
              onChange={e => set(key, parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-600 mt-0.5">{help}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={12} /> {error}
        </div>
      )}

      <button
        onClick={run}
        disabled={running}
        className="w-full py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
        {running ? 'Running Estimation…' : 'Run Estimation'}
      </button>

      {existing && (
        <div className="mt-4 p-4 rounded-xl bg-primary-900/20 border border-primary-800/30">
          <p className="text-xs font-semibold text-primary-300 mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Latest Result
          </p>
          {[
            ['Direct Cost', INR(existing.direct_cost)],
            [`Overhead (${existing.overhead_pct}%)`, INR(existing.overhead_amount)],
            [`Profit (${existing.profit_pct}%)`, INR(existing.profit_amount)],
            [`Contingency (${existing.contingency_pct}%)`, INR(existing.contingency_amount)],
            ['Sub-Total', INR(existing.sub_total)],
            [`GST (${existing.gst_pct}%)`, INR(existing.gst_amount)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5">
              <span className="text-gray-400">{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-black text-primary-300 pt-2">
            <span>Grand Total</span>
            <span>{INR(existing.grand_total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>Per sqft (all-in)</span>
            <span className="font-mono">₹{existing.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [trades, setTrades] = useState<TradeGroup[]>([])
  const [totalDirect, setTotalDirect] = useState(0)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [boqLoading, setBoqLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('boq')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const { project, estimate } = await projectsApi.get(id)
      setProject(project)
      setEstimate(estimate)
      const boqData = await boqApi.get(id)
      setTrades(boqData.trades)
      setTotalDirect(boqData.total_direct_cost)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const regenerateBoq = async () => {
    if (!id || !confirm('Regenerate BOQ? This will reset all manual edits.')) return
    setBoqLoading(true)
    try {
      await projectsApi.regenerateBoq(id)
      const boqData = await boqApi.get(id)
      setTrades(boqData.trades)
      setTotalDirect(boqData.total_direct_cost)
    } catch (e: any) {
      setError(e.message)
    } finally { setBoqLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={40} />
        <p className="text-red-400 font-semibold mb-2">{error || 'Project not found'}</p>
        <Link to="/projects" className="text-primary-400 text-sm hover:underline">← Back to projects</Link>
      </div>
    )
  }

  const TYPE_LABELS: Record<string, string> = {
    residential: 'Residential', villa: 'Villa', commercial: 'Commercial', industrial: 'Industrial',
  }
  const QUALITY_LABELS: Record<string, string> = {
    economy: 'Economy', standard: 'Standard', premium: 'Premium', luxury: 'Luxury',
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'boq', label: 'BOQ Editor', icon: <FileSpreadsheet size={14} /> },
    { key: 'estimate', label: 'Estimation', icon: <Calculator size={14} /> },
    { key: 'reports', label: 'Reports & Charts', icon: <BarChart3 size={14} /> },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link to="/projects" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-2">
            <ChevronLeft size={12} /> Projects
          </Link>
          <h1 className="text-2xl font-black truncate">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-primary-500" /> {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Layers size={11} className="text-blue-400" />
              {TYPE_LABELS[project.building_type] ?? project.building_type} · {project.num_floors}F · {project.total_area_sqft.toLocaleString()} sqft
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400" /> {QUALITY_LABELS[project.quality] ?? project.quality}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportApi.downloadExcel(project.id, project.name)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-green-800/50 text-green-400 text-xs font-semibold hover:bg-green-900/20 transition-all"
          >
            <Download size={13} /> Export Excel
          </button>
          <button
            onClick={regenerateBoq}
            disabled={boqLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={boqLoading ? 'animate-spin' : ''} />
            {boqLoading ? 'Regenerating…' : 'Regen. BOQ'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Direct Cost (BOQ)', value: INR(totalDirect), color: 'text-white' },
          { label: 'Per Sqft (Direct)', value: totalDirect > 0 ? `₹${Math.round(totalDirect / project.total_area_sqft).toLocaleString('en-IN')}` : '—', color: 'text-blue-300' },
          { label: 'Grand Total', value: estimate ? INR(estimate.grand_total) : '—', color: 'text-primary-300' },
          { label: 'Per Sqft (All-in)', value: estimate ? `₹${estimate.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—', color: 'text-yellow-300' },
        ].map(k => (
          <div key={k.label} className="glass rounded-xl border border-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">{k.label}</p>
            <p className={`text-lg font-black ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'text-primary-300 border-primary-500 bg-primary-900/10'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* BOQ tab */}
      {tab === 'boq' && (
        trades.length > 0 ? (
          <BOQGrid
            projectId={project.id}
            trades={trades}
            totalDirectCost={totalDirect}
            onUpdate={(newTrades, newTotal) => { setTrades(newTrades); setTotalDirect(newTotal) }}
          />
        ) : (
          <div className="text-center py-20 glass rounded-2xl border border-white/5">
            <FileSpreadsheet className="mx-auto text-gray-600 mb-3" size={40} />
            <p className="text-gray-400 text-sm mb-4">No BOQ items yet</p>
            <button onClick={regenerateBoq} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold">
              Generate BOQ
            </button>
          </div>
        )
      )}

      {/* Estimate tab */}
      {tab === 'estimate' && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <EstimatePanel
              projectId={project.id}
              project={project}
              existing={estimate}
              onRun={est => setEstimate(est)}
            />
          </div>

          <div className="lg:col-span-3">
            {estimate ? (
              <div className="glass rounded-2xl border border-white/10 p-6">
                <p className="text-xs text-gray-500 mb-4 font-semibold uppercase tracking-wider">{estimate.method}</p>

                <div className="space-y-2 text-sm">
                  {[
                    { label: '1. Direct Cost (BOQ)', value: INR(estimate.direct_cost) },
                    { label: `2. Overhead (${estimate.overhead_pct}%)`, value: INR(estimate.overhead_amount) },
                    { label: `3. Profit (${estimate.profit_pct}%)`, value: INR(estimate.profit_amount) },
                    { label: `4. Contingency (${estimate.contingency_pct}%)`, value: INR(estimate.contingency_amount) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">{row.label}</span>
                      <span className="font-mono">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b border-white/5 font-semibold">
                    <span>Sub-Total</span>
                    <span className="font-mono">{INR(estimate.sub_total)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">{`5. GST (${estimate.gst_pct}%)`}</span>
                    <span className="font-mono">{INR(estimate.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-primary-300 font-black text-base">
                    <span>GRAND TOTAL</span>
                    <span>{INR(estimate.grand_total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
                  {[
                    { label: 'Material', value: estimate.total_material_cost },
                    { label: 'Labour', value: estimate.total_labor_cost },
                    { label: 'Equipment', value: estimate.total_equipment_cost },
                  ].map(d => (
                    <div key={d.label} className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-[10px] text-gray-500 mb-1">{d.label}</p>
                      <p className="text-sm font-bold">{INR(d.value)}</p>
                      <p className="text-[10px] text-gray-600">{Math.round(d.value / estimate.direct_cost * 100)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-20 glass rounded-2xl border border-white/5">
                <div className="text-center">
                  <Calculator className="mx-auto text-gray-600 mb-3" size={40} />
                  <p className="text-gray-400 text-sm">Run estimation to see full breakdown</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        estimate ? (
          <CostCharts estimate={estimate} />
        ) : (
          <div className="text-center py-24 glass rounded-2xl border border-white/5">
            <BarChart3 className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-sm mb-4">Run an estimation first to generate reports</p>
            <button
              onClick={() => setTab('estimate')}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <Calculator size={12} /> Go to Estimation
            </button>
          </div>
        )
      )}
    </div>
  )
}
