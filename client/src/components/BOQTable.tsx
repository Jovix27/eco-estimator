import { Leaf, AlertCircle } from 'lucide-react'

interface MaterialItem {
  material_id: string
  material_name: string
  category: string
  quantity: number
  unit: string
  rate_per_unit: number
  total_cost: number
  carbon_per_unit: number
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
      <div className="glass rounded-2xl border border-white/10 p-12 text-center">
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest opacity-50">Enter building parameters to generate BOQ</p>
      </div>
    )
  }

  const totalCost = materials.reduce((s, m) => s + m.total_cost, 0)
  const totalCarbon = materials.reduce((s, m) => s + m.total_carbon, 0)

  return (
    <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-white/10 bg-white/5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          📋 Bill of Quantities
        </h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Material-level cost & carbon breakdown</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-5 py-3 font-black">Material</th>
              <th className="px-5 py-3 font-black text-right">Quantity</th>
              <th className="px-5 py-3 font-black text-right">Rate (₹)</th>
              <th className="px-5 py-3 font-black text-right">Cost (₹)</th>
              <th className="px-5 py-3 font-black text-right">Carbon (kgCO₂e)</th>
              <th className="px-5 py-3 font-black text-right">Cost %</th>
              <th className="px-5 py-3 font-black text-right">Carbon %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {materials.map(m => (
              <tr key={m.material_id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-bold text-sm">{m.material_name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{m.category}</span>
                    {m.is_sustainable ? (
                      <span className="text-[9px] text-green-500 font-black flex items-center gap-0.5">
                        <Leaf size={9} /> ECO
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-500 font-black flex items-center gap-0.5">
                        <AlertCircle size={9} /> STD
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm">
                  {m.quantity.toLocaleString('en-IN')} <span className="text-[10px] text-gray-500">{m.unit}</span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm text-gray-400">
                  ₹{m.rate_per_unit.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm font-bold">
                  ₹{m.total_cost.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm text-gray-400">
                  {m.total_carbon.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.cost_share_pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 w-10 text-right">{m.cost_share_pct}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${m.carbon_share_pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 w-10 text-right">{m.carbon_share_pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-white/5 border-t border-white/10">
            <tr className="font-black text-sm">
              <td className="px-5 py-3.5">TOTAL</td>
              <td className="px-5 py-3.5" />
              <td className="px-5 py-3.5" />
              <td className="px-5 py-3.5 text-right font-mono">₹{totalCost.toLocaleString('en-IN')}</td>
              <td className="px-5 py-3.5 text-right font-mono">{totalCarbon.toLocaleString('en-IN')}</td>
              <td className="px-5 py-3.5" />
              <td className="px-5 py-3.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
