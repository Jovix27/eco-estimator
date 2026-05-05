import { RefreshCw, TrendingDown, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'

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
      <div className="industrial-card p-10 border-[#00c853]/20 text-center bg-black/40">
        <div className="text-[#00c853] text-3xl mb-4 italic font-black">✓</div>
        <p className="text-[#00c853] text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM_OPTIMIZED: ALL_MATERIALS_ECO_ALIGNED</p>
      </div>
    )
  }

  return (
    <div className="industrial-card border-[var(--nothing-border)] overflow-hidden bg-[var(--nothing-surface)]">
      <div className="p-8 border-b border-[var(--nothing-border)] bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 bg-[var(--nothing-lime)]"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--nothing-text-dim)] opacity-40 flex items-center gap-3">
              ECO_SWAP_INTELLIGENCE_NODE
            </h2>
          </div>
          <p className="text-[10px] text-[var(--nothing-lime)] font-black uppercase tracking-[0.2em] italic">
            // POTENTIAL_REDUCTION: {potentialSavings.toFixed(0)} kgCO₂e <span className="text-[var(--nothing-text-dim)] opacity-20">({potentialPct}%)</span>
          </p>
        </div>
        {suggestions.length > 0 && (
          <button
            onClick={() => {
              suggestions.forEach(s => {
                const cats: Record<string, string> = {
                  cement_opc: 'Cement', steel_tmt: 'Steel', brick_clay: 'Bricks',
                  sand_river: 'Sand', aggregate_natural: 'Aggregate',
                }
                const cat = cats[s.current_material.id]
                if (cat) onSwap(cat, s.suggested_alternative.id)
              })
            }}
            className="px-6 py-3 bg-[var(--nothing-lime)] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[var(--nothing-text)] hover:scale-105 transition-all flex items-center gap-3"
          >
            <Zap size={12} className="fill-current" />
            INITIALIZE_MASS_SWAP
          </button>
        )}
      </div>

      <div className="divide-y divide-[var(--nothing-border)]">
        {suggestions.map((s, i) => {
          const isSwapped = Object.values(activeOverrides).includes(s.suggested_alternative.id)
          return (
            <div key={i} className={`p-8 flex flex-col lg:flex-row lg:items-center gap-8 transition-all relative ${isSwapped ? 'opacity-20 pointer-events-none grayscale' : 'hover:bg-white/[0.01]'}`}>
              {/* Current */}
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-[var(--nothing-text-dim)] opacity-20 font-black uppercase tracking-widest mb-3 italic">// SOURCE_MATERIAL</p>
                <p className="text-xs font-black text-[var(--nothing-text)] uppercase tracking-wider mb-2">{s.current_material.name}</p>
                <p className="text-[10px] text-[var(--nothing-text-dim)] opacity-30 font-black uppercase tracking-tighter italic">
                  ₹{s.current_material.total_cost.toLocaleString('en-IN')} · {s.current_material.total_carbon.toFixed(0)} kgCO₂e
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-8 h-[1px] bg-[var(--nothing-border)] relative">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-t border-[var(--nothing-border)] opacity-40 rotate-45" />
                </div>
              </div>

              {/* Alternative */}
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-[var(--nothing-lime)] opacity-40 font-black uppercase tracking-widest mb-3 italic">// ECO_DERIVATIVE_V2</p>
                <p className="text-xs font-black text-[var(--nothing-lime)] uppercase tracking-wider mb-2">{s.suggested_alternative.name}</p>
                <p className="text-[10px] text-[var(--nothing-text-dim)] opacity-30 font-black uppercase tracking-tighter italic">
                  ₹{s.suggested_alternative.total_cost.toLocaleString('en-IN')} · {s.suggested_alternative.total_carbon.toFixed(0)} kgCO₂e
                </p>
              </div>

              {/* Impact */}
              <div className="flex items-center gap-8 shrink-0 bg-white/[0.02] p-6 border border-[var(--nothing-border)]">
                <div className="text-center min-w-[60px]">
                  <div className={`text-xs font-black flex items-center justify-center gap-1 ${s.cost_difference > 0 ? 'text-[var(--nothing-red)]' : 'text-[var(--nothing-lime)]'}`}>
                    {s.cost_difference > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(s.cost_change_pct)}%
                  </div>
                  <p className="text-[8px] text-[var(--nothing-text-dim)] opacity-20 font-black uppercase mt-2 tracking-[0.2em]">COST_Δ</p>
                </div>
                <div className="text-center min-w-[60px]">
                  <div className="text-xs font-black text-[var(--nothing-lime)] flex items-center justify-center gap-1">
                    <ArrowDownRight size={14} />
                    {s.carbon_reduction_pct}%
                  </div>
                  <p className="text-[8px] text-[var(--nothing-text-dim)] opacity-20 font-black uppercase mt-2 tracking-[0.2em]">CARBON_Δ</p>
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
                  className="px-6 py-3 border border-[var(--nothing-lime)]/20 text-[var(--nothing-lime)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--nothing-lime)] hover:text-black transition-all disabled:opacity-0"
                >
                  SWAP_NODE
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
