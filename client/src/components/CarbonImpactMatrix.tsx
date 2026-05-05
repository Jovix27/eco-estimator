import React from 'react'

interface Material {
  material_name: string
  category: string
  total_carbon: number
  carbon_share_pct: number
}

interface CarbonImpactMatrixProps {
  materials: Material[]
  totalCarbon: number
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function CarbonImpactMatrix({ materials, totalCarbon }: CarbonImpactMatrixProps) {
  const generateGrid = (material: Material) => {
    const cols = 48
    const cells = []
    const baseIntensity = material.carbon_share_pct / 15
    
    for (let i = 0; i < cols; i++) {
      const intensity = Math.max(0, Math.min(4, Math.floor(baseIntensity + (Math.random() * 2 - 1))))
      cells.push(intensity)
    }
    return cells
  }

  const colorMap = [
    'bg-[var(--nothing-surface)]', // baseline
    'bg-[#333333]', // low
    'bg-[#666666]', // mid
    'bg-[var(--nothing-text)]', // high
    'bg-[var(--nothing-lime)]', // critical
  ]

  return (
    <div className="industrial-card p-8 border-[var(--nothing-border)] font-mono bg-[var(--nothing-surface)]/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[var(--nothing-border)] pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 bg-[var(--nothing-lime)]"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--nothing-text-dim)] opacity-40">
              CARBON_IMPACT_INTENSITY_MATRIX
            </h2>
          </div>
          <p className="text-3xl font-black italic tracking-tighter text-[var(--nothing-text)]">
            {totalCarbon.toLocaleString()} <span className="text-sm not-italic font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-[0.2em]">kgCO2e_TOTAL</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.02] p-4 border border-[var(--nothing-border)]">
          <span className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-widest italic">// INTENSITY_INDEX</span>
          <div className="flex gap-1.5">
            {colorMap.map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 ${c} border border-black/20`} />
            ))}
          </div>
          <span className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest italic">MAX_STRESS</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between text-[8px] font-black text-[var(--nothing-text-dim)] opacity-10 mb-2 pl-16">
          {MONTHS.map(m => <span key={m} className="tracking-[0.2em]">{m}</span>)}
        </div>
        
        <div className="space-y-1.5">
          {materials.map((m, idx) => {
            const grid = generateGrid(m)
            return (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-12 text-[8px] text-[var(--nothing-text-dim)] opacity-20 font-black truncate uppercase tracking-widest text-right group-hover:text-[var(--nothing-lime)] group-hover:opacity-100 transition-all" title={m.material_name}>
                  {m.category.slice(0, 3)}
                </div>
                <div className="flex-1 flex gap-1 overflow-hidden py-1">
                  {grid.map((level, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 h-3 transition-all duration-300 ${colorMap[level]} hover:scale-y-125 cursor-crosshair border border-black/40`}
                      title={`${m.material_name}: Level ${level} intensity`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--nothing-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[9px] font-black text-[var(--nothing-text-dim)] opacity-10 uppercase tracking-[0.3em] italic">
          // PROMPT: ANALYZE_THERMAL_PERFORMANCE_VECTOR_V4.0
        </span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-3 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">
            <div className="w-2 h-2 bg-[var(--nothing-lime)]" /> SYSTEM_EFFICIENCY
          </span>
          <span className="flex items-center gap-3 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">
            <div className="w-2 h-2 bg-[var(--nothing-text)]" /> RESOURCE_HOTSPOT
          </span>
        </div>
      </div>
    </div>
  )
}
