import { List } from 'lucide-react'

interface MaterialItem {
  material_id: string
  material_name: string
  category: string
  quantity: number
  unit: string
  rate_per_unit: number
  total_cost: number
  total_carbon: number
  is_sustainable: boolean
  cost_share_pct: number
  carbon_share_pct: number
}

interface BOQTableProps {
  materials: MaterialItem[]
}

export default function BOQTable({ materials }: BOQTableProps) {
  if (materials.length === 0) {
    return (
      <div className="industrial-card p-12 text-center border-white/5 bg-white/[0.01]">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic">
          // AWAITING_INPUT_PARAMS_TO_GENERATE_BILL_OF_QUANTITIES
        </p>
      </div>
    )
  }

  const totalCost = materials.reduce((s, m) => s + m.total_cost, 0)
  const totalCarbon = materials.reduce((s, m) => s + m.total_carbon, 0)

  return (
    <div className="industrial-card border-[var(--nothing-border)] bg-[var(--nothing-surface)] overflow-hidden">
      <div className="p-6 border-b border-[var(--nothing-border)] bg-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-[var(--nothing-lime)]"></div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--nothing-text-dim)] opacity-40 mb-1">
              PROCURMENT_AUDIT_LOG_V1
            </h2>
            <p className="text-lg font-black text-[var(--nothing-text)] italic tracking-widest uppercase">
              BILL_OF_QUANTITIES
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-widest">SYSTEM_STATUS</p>
          <p className="text-[10px] font-black text-[var(--nothing-lime)] uppercase tracking-widest italic">VERIFIED_FOR_TENDER</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-[var(--nothing-border)]">
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em]">MATERIAL_NODE</th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] text-right">QTY_NET</th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] text-right">UNIT_RATE</th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] text-right text-[var(--nothing-lime)]">TOTAL_VALUATION</th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] text-right">CARBON_INTENSITY</th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.2em] text-right">DIST_PCT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nothing-border)]">
            {materials.map(m => (
              <tr key={m.material_id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-black text-xs text-[var(--nothing-text)] uppercase tracking-wider mb-2">{m.material_name}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-[var(--nothing-text-dim)] opacity-30 uppercase tracking-widest">{m.category}</span>
                    <div className="w-1 h-1 bg-[var(--nothing-text-dim)] opacity-20"></div>
                    {m.is_sustainable ? (
                      <span className="text-[9px] text-[var(--nothing-lime)] font-black uppercase tracking-widest px-2 py-0.5 border border-[var(--nothing-lime)]/30 bg-[var(--nothing-lime)]/5 italic">
                        ECO_SPEC
                      </span>
                    ) : (
                      <span className="text-[9px] text-[var(--nothing-text-dim)] opacity-40 font-black uppercase tracking-widest px-2 py-0.5 border border-[var(--nothing-border)] bg-white/5 italic">
                        STD_SPEC
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-mono text-xs text-[var(--nothing-text)]">
                  {m.quantity.toLocaleString('en-IN')} <span className="text-[9px] text-[var(--nothing-text-dim)] opacity-30 font-black">{m.unit}</span>
                </td>
                <td className="px-6 py-5 text-right font-mono text-xs text-[var(--nothing-text-dim)] opacity-50">
                  ₹{m.rate_per_unit.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-5 text-right font-mono text-sm font-black text-[var(--nothing-lime)]">
                  ₹{m.total_cost.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-5 text-right font-mono text-xs text-[var(--nothing-text-dim)] opacity-50">
                  {m.total_carbon.toLocaleString('en-IN')} <span className="text-[8px] text-[var(--nothing-text-dim)] opacity-20 font-black uppercase tracking-tighter ml-1">kgCO₂e</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-tighter">COST</span>
                      <div className="w-16 h-1.5 bg-white/5 border border-[var(--nothing-border)] relative">
                        <div className="h-full bg-[var(--nothing-text)] opacity-40 transition-all duration-1000" style={{ width: `${m.cost_share_pct}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-[var(--nothing-text-dim)] opacity-40 w-8">{m.cost_share_pct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-tighter">CRBN</span>
                      <div className="w-16 h-1.5 bg-white/5 border border-[var(--nothing-border)] relative">
                        <div className="h-full bg-[var(--nothing-lime)] transition-all duration-1000" style={{ width: `${m.carbon_share_pct}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-[var(--nothing-lime)] opacity-60 w-8">{m.carbon_share_pct}%</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-white/5 border-t-2 border-[var(--nothing-border)]">
            <tr className="font-black">
              <td className="px-6 py-5 text-xs text-[var(--nothing-text)] uppercase tracking-[0.2em] italic">AGGREGATE_TOTALS</td>
              <td className="px-6 py-5" />
              <td className="px-6 py-5" />
              <td className="px-6 py-5 text-right font-mono text-lg text-[var(--nothing-lime)] tracking-tighter">₹{totalCost.toLocaleString('en-IN')}</td>
              <td className="px-6 py-5 text-right font-mono text-xs text-[var(--nothing-text)] uppercase">{totalCarbon.toLocaleString('en-IN')} kgCO₂e</td>
              <td className="px-6 py-5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
