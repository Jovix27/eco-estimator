import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, RefreshCw, Download, Calculator, FileSpreadsheet,
  BarChart3, AlertCircle, CheckCircle2, Layers, MapPin, Star,
  Play, Settings, Zap
} from 'lucide-react'
import { DotGrid, DotMatrixHeader } from '../components/DotMatrix'
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
    <div className="industrial-card p-8 border-nothing-border shadow-[0_0_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 mb-8 border-b border-nothing-border pb-4">
        <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-text-muted">
          Estimation_Param_Node
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {[
          { key: 'overhead_pct', label: 'Site Overhead %', help: 'Supervisory / Logistics' },
          { key: 'profit_pct', label: 'Contractor Profit %', help: 'Net margin on direct' },
          { key: 'contingency_pct', label: 'Contingency %', help: 'Risk / Escalation' },
          { key: 'gst_pct', label: 'GST %', help: 'Statutory Taxation' },
        ].map(({ key, label, help }) => (
          <div key={key} className="space-y-2">
            <label className="block text-[8px] font-black text-nothing-text-muted uppercase tracking-[0.2em]">{label}</label>
            <input
              type="number"
              step="0.5"
              className="w-full bg-nothing-bg-muted border border-nothing-border px-4 py-3 text-xs font-black uppercase focus:outline-none focus:border-nothing-lime transition-all text-nothing-text"
              value={(settings as any)[key]}
              onChange={e => set(key, parseFloat(e.target.value) || 0)}
            />
            <p className="text-[8px] text-nothing-text-muted/50 font-black uppercase tracking-widest italic">// {help}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest bg-rose-500/5 border border-rose-500/10 px-4 py-3 mb-6">
          <AlertCircle size={10} /> {error}
        </div>
      )}

      <button
        onClick={run}
        disabled={running}
        className="w-full py-5 bg-nothing-text text-nothing-bg text-[10px] font-black uppercase tracking-[0.4em] hover:bg-nothing-lime hover:text-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(0,0,0,0.1)]"
      >
        {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
        {running ? 'PROCESSING_ALGORITHM…' : 'Execute_Estimation'}
      </button>

      {existing && (
        <div className="mt-8 p-6 bg-nothing-bg-muted border border-nothing-border space-y-4">
          <p className="text-[9px] font-black text-nothing-lime uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
            <CheckCircle2 size={10} /> Latest_Vector_Result
          </p>
          <div className="space-y-1">
            {[
              ['Direct Cost', INR(existing.direct_cost)],
              [`Overhead (${existing.overhead_pct}%)`, INR(existing.overhead_amount)],
              [`Profit (${existing.profit_pct}%)`, INR(existing.profit_amount)],
              [`Contingency (${existing.contingency_pct}%)`, INR(existing.contingency_amount)],
              ['Sub-Total', INR(existing.sub_total)],
              [`GST (${existing.gst_pct}%)`, INR(existing.gst_amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] font-black uppercase tracking-tighter py-2 border-b border-nothing-border/50">
                <span className="text-nothing-text-muted">{k}</span>
                <span className="text-nothing-text">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline pt-4">
            <span className="text-[11px] font-black text-nothing-text uppercase tracking-[0.2em]">Grand_Total</span>
            <span className="text-2xl font-black text-nothing-lime italic tracking-tighter">{INR(existing.grand_total)}</span>
          </div>
          <div className="flex justify-between text-[8px] text-nothing-text-muted/50 font-black uppercase tracking-[0.2em] pt-2">
            <span>Per sqft (all-in)</span>
            <span>₹{existing.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <div className="relative">
          <RefreshCw className="animate-spin text-nothing-lime" size={40} />
          <div className="absolute inset-0 animate-pulse bg-nothing-lime/20 blur-xl rounded-full"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-lime">Accessing_Core_Memory</p>
          <div className="flex gap-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-nothing-text-muted/20 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
        <p className="text-rose-500 font-semibold mb-2 uppercase text-[10px] tracking-widest">{error || 'Project not found'}</p>
        <Link to="/projects" className="text-nothing-lime text-[10px] font-black uppercase tracking-widest hover:underline">← Back to projects</Link>
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
    { key: 'estimate', label: 'Estimate', icon: <Calculator size={14} /> },
    { key: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={14} /> },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none -z-10">
        <DotGrid rows={12} cols={15} gap={20} color="#00c853" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-nothing-border pb-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="w-10 h-10 flex items-center justify-center bg-nothing-bg-muted border border-nothing-border hover:bg-nothing-text/5 hover:border-nothing-lime transition-all group">
              <ChevronLeft size={18} className="text-nothing-text-muted group-hover:text-nothing-lime" />
            </Link>
            <DotMatrixHeader text="Project_Terminal_V2" />
          </div>
          
          <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
            {project.name.split(' ').map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? 'text-nothing-lime' : 'text-nothing-text'}>
                {word} 
              </span>
            ))}
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-widest text-nothing-text-muted italic">
            <span className="flex items-center gap-2">
              <MapPin size={12} className="text-nothing-lime" /> {project.location}
            </span>
            <span className="flex items-center gap-2">
              <Layers size={12} className="text-nothing-lime" />
              {TYPE_LABELS[project.building_type] ?? project.building_type} · {project.num_floors}F · {project.total_area_sqft.toLocaleString()} SQFT
            </span>
            <span className="flex items-center gap-2">
              <Star size={12} className="text-nothing-lime" /> {QUALITY_LABELS[project.quality] ?? project.quality}
            </span>
          </div>
        </div>
 
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportApi.downloadExcel(project.id, project.name)}
            className="flex items-center gap-3 px-6 py-4 bg-nothing-bg-muted border border-nothing-border text-nothing-text text-[10px] font-black uppercase tracking-[0.3em] hover:bg-nothing-text/5 hover:border-nothing-lime transition-all"
          >
            <Download size={14} /> Export_Xlsx
          </button>
          <button
            onClick={regenerateBoq}
            disabled={boqLoading}
            className="flex items-center gap-3 px-6 py-4 bg-nothing-lime text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-nothing-text hover:text-nothing-bg transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={boqLoading ? 'animate-spin' : ''} />
            {boqLoading ? 'PROCESSING…' : 'Reset_Vector'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-12">
        {[
          { label: 'Direct_Cost (BOQ)', value: INR(totalDirect), color: 'text-nothing-text' },
          { label: 'Rate_Sqft (Direct)', value: totalDirect > 0 ? `₹${Math.round(totalDirect / project.total_area_sqft).toLocaleString('en-IN')}` : '—', color: 'text-nothing-text-muted/60' },
          { label: 'Grand_Terminal_Total', value: estimate ? INR(estimate.grand_total) : '—', color: 'text-nothing-lime' },
          { label: 'Yield_All-In', value: estimate ? `₹${estimate.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—', color: 'text-nothing-lime/60' },
        ].map(k => (
          <div key={k.label} className="industrial-card p-6 border-nothing-border hover:bg-nothing-bg-muted transition-all">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-nothing-text-muted mb-3">{k.label}</p>
            <p className={`text-2xl font-black italic tracking-tighter ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-nothing-border mb-8">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'text-nothing-lime border-nothing-lime bg-nothing-bg-muted'
                : 'text-nothing-text-muted/50 border-transparent hover:text-nothing-text-muted hover:bg-nothing-bg-muted/50'
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
          <div className="text-center py-32 industrial-card border-nothing-border">
            <FileSpreadsheet className="mx-auto text-nothing-text-muted/20 mb-4" size={48} />
            <p className="text-nothing-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-8">System_Halt: No_BOQ_Vector_Found</p>
            <button onClick={regenerateBoq} className="px-10 py-5 bg-nothing-lime text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-nothing-text hover:text-nothing-bg transition-all">
              Initialize_BOQ_Protocol
            </button>
          </div>
        )
      )}

      {/* Estimate tab */}
      {tab === 'estimate' && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <EstimatePanel projectId={project.id} project={project} existing={estimate} onRun={setEstimate} />
          </div>
          <div className="lg:col-span-3">
            {estimate ? (
              <div className="industrial-card p-8 border-nothing-border">
                <p className="text-[9px] text-nothing-text-muted/40 mb-8 font-black uppercase tracking-[0.4em] border-b border-nothing-border pb-4">Logic_Method: {estimate.method.toUpperCase()}</p>
 
                <div className="space-y-1">
                  {[
                    { label: '01. Direct_Production_Cost', value: INR(estimate.direct_cost) },
                    { label: `02. Logistics_Overhead (${estimate.overhead_pct}%)`, value: INR(estimate.overhead_amount) },
                    { label: `03. Capital_Profit (${estimate.profit_pct}%)`, value: INR(estimate.profit_amount) },
                    { label: `04. Risk_Contingency (${estimate.contingency_pct}%)`, value: INR(estimate.contingency_amount) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-3 border-b border-nothing-border/30 text-[10px] font-black uppercase tracking-tighter">
                      <span className="text-nothing-text-muted">{row.label}</span>
                      <span className="text-nothing-text">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-4 border-b border-nothing-border/50 font-black text-nothing-text-muted/60 text-[10px] uppercase tracking-widest">
                    <span>Sub-Total_Vector</span>
                    <span>{INR(estimate.sub_total)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-nothing-border/30 text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-nothing-text-muted">{`05. Statutory_Tax (GST ${estimate.gst_pct}%)`}</span>
                    <span className="text-nothing-text">{INR(estimate.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between py-8 text-nothing-lime font-black text-2xl italic tracking-tighter">
                    <span>GRAND_TOTAL</span>
                    <span>{INR(estimate.grand_total)}</span>
                  </div>
                </div>
 
                <div className="grid grid-cols-3 gap-1 mt-8">
                  {[
                    { label: 'Materials', value: estimate.total_material_cost },
                    { label: 'Labour', value: estimate.total_labor_cost },
                    { label: 'Equip', value: estimate.total_equipment_cost },
                  ].map(d => (
                    <div key={d.label} className="p-4 bg-nothing-bg-muted border border-nothing-border group hover:border-nothing-lime transition-all">
                      <p className="text-[8px] text-nothing-text-muted/40 font-black uppercase tracking-widest mb-2 group-hover:text-nothing-lime/60">{d.label}</p>
                      <p className="text-xs font-black tracking-tighter italic text-nothing-text">{INR(d.value)}</p>
                      <div className="mt-3 h-1 bg-nothing-border overflow-hidden">
                        <div className="h-full bg-nothing-lime/60" style={{ width: `${Math.round(d.value / estimate.direct_cost * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-20 industrial-card border-nothing-border">
                <div className="text-center">
                  <Calculator className="mx-auto text-nothing-text-muted/20 mb-3" size={40} />
                  <p className="text-nothing-text-muted text-[10px] font-black uppercase tracking-widest">Run estimation to see full breakdown</p>
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
          <div className="text-center py-32 industrial-card border-nothing-border">
            <BarChart3 className="mx-auto text-nothing-text-muted/20 mb-6" size={48} />
            <p className="text-nothing-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">// System_Halt: No_Estimate_Vector_Available</p>
            <button
              onClick={() => setTab('estimate')}
              className="px-10 py-5 bg-nothing-lime text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-nothing-text hover:text-nothing-bg transition-all inline-flex items-center gap-3"
            >
              <Calculator size={14} /> Initialize_Estimation
            </button>
          </div>
        )
      )}
    </div>
  )
}
