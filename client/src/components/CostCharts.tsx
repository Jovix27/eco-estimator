import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { TradeBreakdown, Estimate } from '../lib/api'

interface Props {
  estimate: Estimate
}

const COLORS = [
  '#10b981','#3b82f6','#f59e0b','#8b5cf6','#ec4899',
  '#14b8a6','#f97316','#a78bfa','#06b6d4','#84cc16','#fbbf24','#38bdf8',
]

const INR = (n: number) => `₹${(n / 100000).toFixed(1)}L`
const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="font-bold text-white mb-1">{payload[0].name}</p>
      <p className="text-primary-300">{fmt(payload[0].value)}</p>
      {payload[0].payload.share_pct !== undefined && (
        <p className="text-gray-400">{payload[0].payload.share_pct}%</p>
      )}
    </div>
  )
}

export default function CostCharts({ estimate }: Props) {
  const tradeData = estimate.trade_breakdown.map((t, i) => ({
    name: t.trade,
    value: t.direct_cost,
    share_pct: t.share_pct,
    fill: COLORS[i % COLORS.length],
  }))

  const mleData = [
    { name: 'Material', value: estimate.total_material_cost, fill: '#10b981' },
    { name: 'Labour', value: estimate.total_labor_cost, fill: '#3b82f6' },
    { name: 'Equipment', value: estimate.total_equipment_cost, fill: '#f59e0b' },
  ]

  const costBreakdown = [
    { name: 'Direct\nCost', value: estimate.direct_cost },
    { name: 'Overhead', value: estimate.overhead_amount },
    { name: 'Profit', value: estimate.profit_amount },
    { name: 'Contingency', value: estimate.contingency_amount },
    { name: 'GST', value: estimate.gst_amount },
    { name: 'Grand\nTotal', value: estimate.grand_total },
  ]

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Grand Total', value: fmt(estimate.grand_total), sub: '', color: 'text-primary-300' },
          { label: 'Direct Cost', value: fmt(estimate.direct_cost), sub: `${Math.round(estimate.direct_cost / estimate.grand_total * 100)}% of total`, color: 'text-white' },
          { label: 'Cost / sqft (Direct)', value: `₹${estimate.cost_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'direct only', color: 'text-blue-300' },
          { label: 'Cost / sqft (All-in)', value: `₹${estimate.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'incl. overhead & GST', color: 'text-yellow-300' },
        ].map(k => (
          <div key={k.label} className="glass rounded-xl border border-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">{k.label}</p>
            <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
            {k.sub && <p className="text-[10px] text-gray-600 mt-0.5">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trade distribution pie */}
        <div className="glass rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-bold mb-4">Trade-wise Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={tradeData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {tradeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => <span className="text-[10px] text-gray-400">{value}</span>}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* M/L/E breakdown */}
        <div className="glass rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-bold mb-4">Material · Labour · Equipment Split</h3>
          <div className="space-y-3 mb-4">
            {mleData.map(d => {
              const pct = Math.round((d.value / estimate.direct_cost) * 100)
              return (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{d.name}</span>
                    <span className="font-semibold">{fmt(d.value)} <span className="text-gray-500">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: d.fill }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={mleData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={INR} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {mleData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost waterfall */}
      <div className="glass rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-bold mb-4">Cost Build-up (Direct → Grand Total)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={costBreakdown} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={INR} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} formatter={(v: number) => [fmt(v), 'Amount']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {costBreakdown.map((_, i) => (
                <Cell key={i} fill={i === costBreakdown.length - 1 ? '#10b981' : i % 2 === 0 ? '#3b82f6' : '#1e40af'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade table */}
      <div className="glass rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-bold mb-3">Trade Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 pr-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Trade</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Direct Cost</th>
                <th className="text-right py-2 pl-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Share %</th>
              </tr>
            </thead>
            <tbody>
              {estimate.trade_breakdown.sort((a, b) => b.direct_cost - a.direct_cost).map((t, i) => (
                <tr key={t.trade} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[estimate.trade_breakdown.findIndex(x => x.trade === t.trade) % COLORS.length] }} />
                    {t.trade}
                  </td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(t.direct_cost)}</td>
                  <td className="text-right py-2 pl-3 text-gray-400">{t.share_pct}%</td>
                </tr>
              ))}
              <tr className="border-t border-white/10">
                <td className="py-2 font-bold text-primary-300">Total Direct Cost</td>
                <td className="text-right py-2 px-3 font-bold text-primary-300">{fmt(estimate.direct_cost)}</td>
                <td className="text-right py-2 pl-3 font-bold text-primary-300">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
