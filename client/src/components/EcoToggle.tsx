import { RefreshCw, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface EcoSuggestion {
  current_material: { id: string; name: string; total_cost: number; total_carbon: number }
  suggested_alternative: { id: string; name: string; total_cost: number; total_carbon: number }
  cost_difference: number
  cost_change_pct: number
  carbon_savings: number
  carbon_reduction_pct: number
}

interface EcoToggleProps {
  suggestions: EcoSuggestion[]
  potentialSavings: number
  potentialPct: number
  onSwap: (category: string, materialId: string) => void
  activeOverrides: Record<string, string>
}

export default function EcoToggle({ suggestions, potentialSavings, potentialPct, onSwap, activeOverrides }: EcoToggleProps) {
  if (suggestions.length === 0) {
    return (
      <div className="glass rounded-2xl border border-green-500/20 p-6 text-center">
        <div className="text-green-500 text-2xl mb-2">✓</div>
        <p className="text-green-400 text-sm font-bold">All materials are eco-optimized!</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-500" />
            Eco-Swap Intelligence
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Potential savings: {potentialSavings.toFixed(0)} kgCO₂e ({potentialPct}%)
          </p>
        </div>
        {suggestions.length > 0 && (
          <button
            onClick={() => {
              suggestions.forEach(s => {
                // Find category from material DB name
                const cats: Record<string, string> = {
                  cement_opc: 'Cement', steel_tmt: 'Steel', brick_clay: 'Bricks',
                  sand_river: 'Sand', aggregate_natural: 'Aggregate',
                }
                const cat = cats[s.current_material.id]
                if (cat) onSwap(cat, s.suggested_alternative.id)
              })
            }}
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/30 transition-all flex items-center gap-1.5"
          >
            <TrendingDown size={12} />
            Swap All
          </button>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {suggestions.map((s, i) => {
          const isSwapped = Object.values(activeOverrides).includes(s.suggested_alternative.id)
          return (
            <div key={i} className={`p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${isSwapped ? 'opacity-40' : ''}`}>
              {/* Current */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Current</p>
                <p className="text-sm font-bold truncate">{s.current_material.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">
                  ₹{s.current_material.total_cost.toLocaleString('en-IN')} · {s.current_material.total_carbon.toFixed(0)} kgCO₂e
                </p>
              </div>

              {/* Arrow */}
              <div className="text-gray-600 hidden md:block">→</div>

              {/* Alternative */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1">Eco Alternative</p>
                <p className="text-sm font-bold text-green-400 truncate">{s.suggested_alternative.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">
                  ₹{s.suggested_alternative.total_cost.toLocaleString('en-IN')} · {s.suggested_alternative.total_carbon.toFixed(0)} kgCO₂e
                </p>
              </div>

              {/* Impact */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className={`text-xs font-black flex items-center gap-0.5 ${s.cost_difference > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                    {s.cost_difference > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(s.cost_change_pct)}%
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase">Cost</p>
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-green-500 flex items-center gap-0.5">
                    <ArrowDownRight size={12} />
                    {s.carbon_reduction_pct}%
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase">Carbon</p>
                </div>
                <button
                  onClick={() => {
                    const cats: Record<string, string> = {
                      cement_opc: 'Cement', steel_tmt: 'Steel', brick_clay: 'Bricks',
                      sand_river: 'Sand', aggregate_natural: 'Aggregate',
                    }
                    const cat = cats[s.current_material.id]
                    if (cat) onSwap(cat, s.suggested_alternative.id)
                  }}
                  disabled={isSwapped}
                  className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all disabled:opacity-30"
                >
                  Swap
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
