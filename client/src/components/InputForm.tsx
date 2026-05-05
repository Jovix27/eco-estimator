import { useState } from 'react'
import { Building2, Layers, Ruler, ArrowRight } from 'lucide-react'

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
    <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/10 p-6 animate-slide-up">
      <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary-500" />
        Building Parameters
      </h2>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Configure your project inputs</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Area */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Ruler size={12} /> Built-up Area (sqft)
          </label>
          <input
            type="number"
            value={area}
            onChange={e => setArea(Math.max(0, Number(e.target.value)))}
            min={100}
            max={100000}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-500 transition-all"
            placeholder="e.g. 1000"
          />
        </div>

        {/* Building Type */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Building2 size={12} /> Building Type
          </label>
          <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 cursor-default">
            Residential
          </div>
        </div>

        {/* Floors */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Layers size={12} /> Number of Floors
          </label>
          <input
            type="number"
            value={floors}
            onChange={e => setFloors(Math.max(1, Math.min(20, Number(e.target.value))))}
            min={1}
            max={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || area <= 0}
        className="w-full py-3.5 rounded-xl gradient-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-primary-500/20"
      >
        {isLoading ? (
          <span className="animate-pulse-soft">Generating...</span>
        ) : (
          <>Generate Estimate <ArrowRight size={14} /></>
        )}
      </button>
    </form>
  )
}
