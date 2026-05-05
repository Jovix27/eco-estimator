import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FolderOpen, MapPin, Layers, Star, Trash2,
  RefreshCw, Building2, ChevronRight, X
} from 'lucide-react'
import { projectsApi, type Project, type MetaOptions } from '../lib/api'
import { motion } from 'framer-motion'

const QUALITY_LABELS: Record<string, string> = {
  economy: 'Economy', standard: 'Standard', premium: 'Premium', luxury: 'Luxury'
}
const TYPE_LABELS: Record<string, string> = {
  residential: 'Residential', villa: 'Villa', commercial: 'Commercial', industrial: 'Industrial'
}

// ── Create-project modal ────────────────────────────────────────────────────

interface CreateModalProps {
  options: MetaOptions | null
  onClose: () => void
  onCreated: () => void
}

function CreateModal({ options, onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState({
    name: '',
    location: 'Delhi',
    building_type: 'residential',
    total_area_sqft: 1000,
    num_floors: 1,
    quality: 'standard',
    overhead_pct: 10,
    profit_pct: 10,
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return }
    setLoading(true); setError(null)
    try {
      await projectsApi.create(form)
      onCreated()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 glass p-10 border-[var(--nothing-border-strong)] relative overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--nothing-border)] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--nothing-green)] shadow-[0_0_10px_var(--nothing-green)]"></div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--nothing-text)]">INITIALIZE_PROJECT_VECTOR</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--nothing-surface)] transition-all text-[var(--nothing-text-dim)]"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Project Identification</label>
            <input
              className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase tracking-tight focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)]"
              placeholder="E.G. SHARMA_RESIDENCE_01"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Site Geographic Node</label>
              <select
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all appearance-none text-[var(--nothing-text)]"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              >
                {(options?.locations ?? ['Delhi', 'Mumbai', 'Other']).map(l => (
                  <option key={l} value={l} className="bg-[var(--nothing-surface)]">{l.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Asset Typology</label>
              <select
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all appearance-none text-[var(--nothing-text)]"
                value={form.building_type}
                onChange={e => set('building_type', e.target.value)}
              >
                {(options?.building_types ?? ['residential', 'villa', 'commercial', 'industrial']).map(t => (
                  <option key={t} value={t} className="bg-[var(--nothing-surface)]">{(TYPE_LABELS[t] ?? t).toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Built-Up Area (sqft)</label>
              <input
                type="number"
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)]"
                value={form.total_area_sqft}
                min={100}
                onChange={e => set('total_area_sqft', parseFloat(e.target.value) || 1000)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">No. of Floors</label>
              <input
                type="number"
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)]"
                value={form.num_floors}
                min={1}
                max={50}
                onChange={e => set('num_floors', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Build Quality Standard</label>
            <div className="grid grid-cols-4 gap-1">
              {(options?.quality_grades ?? ['economy','standard','premium','luxury']).map(q => (
                <button
                  key={q}
                  onClick={() => set('quality', q)}
                  className={`py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                    form.quality === q
                      ? 'border-[var(--nothing-green)] bg-[var(--nothing-green-dim)] text-[var(--nothing-green)]'
                      : 'border-[var(--nothing-border)] text-[var(--nothing-text-dim)] hover:border-[var(--nothing-border-strong)]'
                  }`}
                >
                  {QUALITY_LABELS[q] ?? q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Overhead %</label>
              <input
                type="number"
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)]"
                value={form.overhead_pct}
                min={0}
                max={50}
                onChange={e => set('overhead_pct', parseFloat(e.target.value) || 10)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Profit %</label>
              <input
                type="number"
                className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)]"
                value={form.profit_pct}
                min={0}
                max={50}
                onChange={e => set('profit_pct', parseFloat(e.target.value) || 10)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Description (optional)</label>
            <textarea
              className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-xs font-black uppercase focus:outline-none focus:border-[var(--nothing-lime)]/40 transition-all text-[var(--nothing-text)] resize-none"
              rows={2}
              placeholder="CLIENT NAME, ADDRESS..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {error && <p className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-2 uppercase tracking-widest border border-red-500/20">⚠ {error}</p>}

          <div className="flex gap-4 pt-6">
            <button onClick={onClose} className="btn-nothing-outline flex-1">
              Abort_Op
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="btn-nothing flex-1 flex items-center justify-center gap-3"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? 'INITIALIZING...' : 'Deploy_Core'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [options, setOptions] = useState<MetaOptions | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [{ projects }, opts] = await Promise.all([
        projectsApi.list(),
        projectsApi.getOptions(),
      ])
      setProjects(projects)
      setOptions(opts)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteProject = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await projectsApi.delete(id)
      setProjects(ps => ps.filter(p => p.id !== id))
    } finally { setDeleting(null) }
  }

  return (
    <div className="animate-fade-up pt-32 px-6 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full border-[var(--nothing-border-strong)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--nothing-green)]"></div>
            <span className="text-[9px] font-mono text-[var(--nothing-green)] uppercase tracking-[0.2em]">Repository_Access</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight uppercase italic leading-[0.9]">Projects</h1>
          <p className="text-sm text-[var(--nothing-text-dim)] max-w-md">
            Showing <span className="text-[var(--nothing-text)] font-bold">{projects.length} project vectors</span> currently active in the core estimation pipeline.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-nothing flex items-center gap-3"
        >
          <Plus size={16} /> Deploy_New_Project
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[var(--nothing-lime)]" size={28} />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 industrial-card border-[var(--nothing-border)]">
          <FolderOpen className="mx-auto text-[var(--nothing-text-dim)] opacity-10 mb-6" size={48} />
          <h2 className="text-xl font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em] mb-3 italic">No_Projects_Found</h2>
          <p className="text-[10px] text-[var(--nothing-text-dim)] opacity-20 font-black uppercase tracking-widest mb-8">// Initialize a new project vector to begin BOQ generation</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-10 py-5 bg-[var(--nothing-lime)] text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--nothing-text)] hover:text-[var(--nothing-bg)] transition-all inline-flex items-center gap-3"
          >
            <Plus size={14} /> Init_Project_V3
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {projects.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              className="glass p-8 group cursor-pointer border-[var(--nothing-border)] hover:border-[var(--nothing-green)]/30 transition-all relative overflow-hidden"
              onClick={() => nav(`/projects/${p.id}`)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 glass border border-[var(--nothing-border-strong)] flex items-center justify-center group-hover:border-[var(--nothing-green)] transition-all">
                  <Building2 size={20} className="text-[var(--nothing-text-dim)] group-hover:text-[var(--nothing-green)] transition-all" />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteProject(p.id, p.name) }}
                  disabled={deleting === p.id}
                  className="p-2 text-[var(--nothing-text-dim)] opacity-20 hover:text-red-500 hover:opacity-100 transition-all"
                >
                  {deleting === p.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter italic mb-1 truncate group-hover:text-[var(--nothing-lime)] transition-colors">{p.name}</h3>
                  <p className="text-[10px] text-[var(--nothing-text-dim)] opacity-30 font-black uppercase tracking-widest line-clamp-1 italic">// {p.description || 'No meta description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-[var(--nothing-border)]">
                  <div className="space-y-1">
                    <div className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">Node</div>
                    <div className="text-[10px] font-black uppercase truncate">{p.location}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">Area_Expansion</div>
                    <div className="text-[10px] font-black uppercase">{p.total_area_sqft.toLocaleString()} SQFT</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">Typology</div>
                    <div className="text-[10px] font-black uppercase">{TYPE_LABELS[p.building_type] ?? p.building_type}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">Spec_Std</div>
                    <div className="text-[10px] font-black uppercase text-[var(--nothing-lime)]">{QUALITY_LABELS[p.quality] ?? p.quality}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--nothing-border)]">
                  <div className="text-[9px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--nothing-green)] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Access_Terminal <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          options={options}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load() }}
        />
      )}
    </div>
  )
}
