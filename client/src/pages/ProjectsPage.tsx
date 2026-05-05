import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FolderOpen, MapPin, Layers, Star, Trash2,
  RefreshCw, Building2, ChevronRight, X
} from 'lucide-react'
import { projectsApi, type Project, type MetaOptions } from '../lib/api'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 glass rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Project Name *</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="e.g. Sharma Residence, Gurgaon"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Location</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-gray-900"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              >
                {(options?.locations ?? ['Delhi', 'Mumbai', 'Other']).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Building Type</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-gray-900"
                value={form.building_type}
                onChange={e => set('building_type', e.target.value)}
              >
                {(options?.building_types ?? ['residential', 'villa', 'commercial', 'industrial']).map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Total Built-Up Area (sqft)</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                value={form.total_area_sqft}
                min={100}
                onChange={e => set('total_area_sqft', parseFloat(e.target.value) || 1000)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">No. of Floors</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                value={form.num_floors}
                min={1}
                max={50}
                onChange={e => set('num_floors', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Quality Grade</label>
            <div className="grid grid-cols-4 gap-2">
              {(options?.quality_grades ?? ['economy','standard','premium','luxury']).map(q => (
                <button
                  key={q}
                  onClick={() => set('quality', q)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    form.quality === q
                      ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                      : 'border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  {QUALITY_LABELS[q] ?? q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Overhead %</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                value={form.overhead_pct}
                min={0}
                max={50}
                onChange={e => set('overhead_pct', parseFloat(e.target.value) || 10)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Profit %</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                value={form.profit_pct}
                min={0}
                max={50}
                onChange={e => set('profit_pct', parseFloat(e.target.value) || 10)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Description (optional)</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 resize-none"
              rows={2}
              placeholder="Client name, address, scope notes..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">⚠ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? 'Generating BOQ…' : 'Create Project'}
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

  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} · Item Rate Method
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-primary-500" size={28} />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 glass rounded-2xl border border-white/5">
          <FolderOpen className="mx-auto text-gray-600 mb-4" size={48} />
          <h2 className="text-lg font-bold text-gray-400 mb-2">No projects yet</h2>
          <p className="text-sm text-gray-600 mb-6">Create your first project to generate a BOQ automatically.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold inline-flex items-center gap-2"
          >
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div
              key={p.id}
              className="glass rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all p-5 cursor-pointer group"
              onClick={() => nav(`/projects/${p.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                  <Building2 size={18} className="text-white" />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteProject(p.id, p.name) }}
                  disabled={deleting === p.id}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {deleting === p.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              <h3 className="font-bold text-sm mb-1 truncate">{p.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-1">{p.description || 'No description'}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <MapPin size={11} className="text-primary-500" />
                  {p.location}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Layers size={11} className="text-blue-400" />
                  {TYPE_LABELS[p.building_type] ?? p.building_type} · {p.num_floors} floor{p.num_floors > 1 ? 's' : ''} · {p.total_area_sqft.toLocaleString()} sqft
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Star size={11} className="text-yellow-400" />
                  {QUALITY_LABELS[p.quality] ?? p.quality}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-600">{new Date(p.created_at).toLocaleDateString()}</span>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </div>
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
