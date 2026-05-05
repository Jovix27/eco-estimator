import { useState } from 'react'
import { Building2, Layers, Ruler, ChevronRight } from 'lucide-react'

interface InputFormProps {
  onSubmit: (area: number, type: string, floors: number) => void
  isLoading: boolean
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [area, setArea] = useState(1000)
  const [buildingType] = useState('residential')
  const [floors, setFloors] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (area > 0) onSubmit(area, buildingType, floors)
  }

  return (
    <form onSubmit={handleSubmit} className="industrial-card p-10 bg-[var(--nothing-surface)] border-[var(--nothing-border)] animate-slide-up relative group">
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--nothing-lime)]/20"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[var(--nothing-lime)]"></div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--nothing-text-dim)] opacity-40 mb-1">
              PARAMETER_INPUT_SHEET
            </h2>
            <p className="text-xl font-black text-[var(--nothing-text)] italic tracking-widest uppercase">
              BUILDING_SPECIFICATIONS
            </p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[9px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-widest">MODULE_ID</p>
          <p className="text-[10px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest italic font-mono">EST_CORE_V4</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        {/* Area */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[var(--nothing-lime)] uppercase tracking-[0.2em] flex items-center gap-2 italic">
            <Ruler size={12} className="text-[var(--nothing-text-dim)] opacity-40" /> // BUILT_UP_AREA (SQFT)
          </label>
          <div className="relative">
            <input
              type="number"
              value={area}
              onChange={e => setArea(Math.max(0, Number(e.target.value)))}
              min={100}
              max={100000}
              className="w-full bg-[var(--nothing-bg)] border-2 border-[var(--nothing-border)] px-6 py-4 text-lg font-black text-[var(--nothing-text)] font-mono focus:outline-none focus:border-[var(--nothing-lime)] transition-colors uppercase italic"
              placeholder="0000"
            />
            <div className="absolute top-2 right-2 w-1 h-1 bg-[var(--nothing-lime)]/40"></div>
          </div>
        </div>

        {/* Building Type */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] flex items-center gap-2 italic">
            <Building2 size={12} /> // STRUCTURAL_CLASS
          </label>
          <div className="w-full bg-[var(--nothing-surface)] border-2 border-[var(--nothing-border)] px-6 py-4 text-lg font-black text-[var(--nothing-text-dim)] opacity-40 font-mono uppercase italic cursor-not-allowed">
            RESIDENTIAL_TYP
          </div>
        </div>

        {/* Floors */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] flex items-center gap-2 italic">
            <Layers size={12} /> // VERTICAL_NODES
          </label>
          <div className="relative">
            <input
              type="number"
              value={floors}
              onChange={e => setFloors(Math.max(1, Math.min(20, Number(e.target.value))))}
              min={1}
              max={20}
              className="w-full bg-[var(--nothing-bg)] border-2 border-[var(--nothing-border)] px-6 py-4 text-lg font-black text-[var(--nothing-text)] font-mono focus:outline-none focus:border-[var(--nothing-lime)] transition-colors uppercase italic"
            />
            <div className="absolute top-2 right-2 w-1 h-1 bg-[var(--nothing-text-dim)] opacity-20"></div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || area <= 0}
        className="group/btn w-full py-5 border-2 border-[var(--nothing-lime)] bg-[var(--nothing-lime)]/5 text-[var(--nothing-lime)] font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-[var(--nothing-lime)] hover:text-black transition-all disabled:opacity-20 disabled:grayscale relative overflow-hidden italic"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[var(--nothing-lime)] group-hover/btn:bg-black animate-ping"></div>
            INITIALIZING_SYSTEM_CALCULATION...
          </span>
        ) : (
          <>
            RUN_ESTIMATION_ENGINE <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
          </>
        )}
      </button>
    </form>
  )
}
