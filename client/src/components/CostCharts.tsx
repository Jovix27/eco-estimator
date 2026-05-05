import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { TradeBreakdown, Estimate } from '../lib/api'

interface Props {
  estimate: Estimate
}

const COLORS = [
  'var(--nothing-lime)',
  'var(--nothing-text)',
  '#444444',
  '#777777',
  '#222222',
  'var(--nothing-lime)',
  'var(--nothing-text)',
  '#444444',
  '#777777',
]

const INR = (n: number) => `₹${(n / 100000).toFixed(1)}L`
const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="industrial-card px-4 py-3 border-nothing-lime/20 bg-nothing-bg shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <p className="text-[10px] font-black uppercase tracking-widest text-nothing-lime mb-2">{payload[0].name}</p>
      <p className="text-sm font-black italic tracking-tighter text-nothing-text">{fmt(payload[0].value)}</p>
      {payload[0].payload.share_pct !== undefined && (
        <p className="text-[8px] font-black uppercase tracking-widest text-nothing-text-muted/40 mt-1 italic">// Share: {payload[0].payload.share_pct}%</p>
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
    { name: 'Material', value: estimate.total_material_cost, fill: 'var(--nothing-lime)' },
    { name: 'Labour', value: estimate.total_labor_cost, fill: 'var(--nothing-text)' },
    { name: 'Equipment', value: estimate.total_equipment_cost, fill: '#444444' },
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {[
          { label: 'Grand_Terminal_Total', value: fmt(estimate.grand_total), sub: '', color: 'text-nothing-lime' },
          { label: 'Direct_Cost_Vector', value: fmt(estimate.direct_cost), sub: `${Math.round(estimate.direct_cost / estimate.grand_total * 100)}% coverage`, color: 'text-nothing-text' },
          { label: 'Direct_Yield / Sqft', value: `₹${estimate.cost_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Logic: Raw Direct', color: 'text-nothing-text-muted/60' },
          { label: 'All-In_Yield / Sqft', value: `₹${estimate.grand_total_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Logic: Comprehensive', color: 'text-nothing-text-muted/30' },
        ].map(k => (
          <div key={k.label} className="industrial-card p-6 border-nothing-border hover:bg-nothing-text/[0.02] transition-all">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-nothing-text-muted/40 mb-3">{k.label}</p>
            <p className={`text-2xl font-black italic tracking-tighter ${k.color}`}>{k.value}</p>
            {k.sub && <p className="text-[8px] text-nothing-text-muted/20 font-black uppercase tracking-widest mt-2 italic">// {k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trade distribution pie */}
        <div className="industrial-card p-8 border-nothing-border">
          <div className="flex items-center gap-3 mb-8 border-b border-nothing-border pb-4">
            <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-text-muted/40">Trade_Distribution_Vector</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={tradeData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {tradeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => <span className="text-[9px] font-black uppercase tracking-widest text-nothing-text-muted/40">{value}</span>}
                iconSize={6}
                iconType="rect"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* M/L/E breakdown */}
        <div className="industrial-card p-8 border-nothing-border">
          <div className="flex items-center gap-3 mb-8 border-b border-nothing-border pb-4">
            <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-text-muted/40">Resource_Allocation_Node</h3>
          </div>
          <div className="space-y-6 mb-8">
            {mleData.map(d => {
              const pct = Math.round((d.value / estimate.direct_cost) * 100)
              return (
                <div key={d.name}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-nothing-text-muted/30">{d.name}</span>
                    <span className="text-nothing-text-muted/60 italic">{fmt(d.value)} <span className="text-nothing-text-muted/10">// {pct}%</span></span>
                  </div>
                  <div className="h-1 bg-nothing-text/[0.03] overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: d.fill }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
 
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={mleData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={0}>
                {mleData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost waterfall */}
      <div className="industrial-card p-8 border-nothing-border">
        <div className="flex items-center gap-3 mb-8 border-b border-nothing-border pb-4">
          <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-text-muted/40">Cost_Build-Up_Waterfall</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={costBreakdown} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--nothing-text-muted)', fontWeight: 900 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={INR} tick={{ fontSize: 8, fill: 'var(--nothing-text-muted)', fontWeight: 900 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={0}>
              {costBreakdown.map((_, i) => (
                <Cell key={i} fill={i === costBreakdown.length - 1 ? 'var(--nothing-lime)' : i === 0 ? 'var(--nothing-text)' : '#444444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade table */}
      <div className="industrial-card p-8 border-nothing-border">
        <div className="flex items-center gap-3 mb-8 border-b border-nothing-border pb-4">
          <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-nothing-text-muted/40">Trade_Summary_Audit</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-black uppercase tracking-tighter">
            <thead>
              <tr className="border-b border-nothing-border">
                <th className="text-left py-4 pr-4 text-[9px] text-nothing-text-muted/20 uppercase tracking-[0.2em]">Trade_Node</th>
                <th className="text-right py-4 px-4 text-[9px] text-nothing-text-muted/20 uppercase tracking-[0.2em]">Direct_Production</th>
                <th className="text-right py-4 pl-4 text-[9px] text-nothing-text-muted/20 uppercase tracking-[0.2em]">Relative_Share</th>
              </tr>
            </thead>
            <tbody>
              {estimate.trade_breakdown.sort((a, b) => b.direct_cost - a.direct_cost).map((t, i) => (
                <tr key={t.trade} className="border-b border-nothing-border/20 hover:bg-nothing-text/[0.02] group transition-all">
                  <td className="py-4 pr-4 flex items-center gap-3">
                    <div className="w-1.5 h-1.5" style={{ backgroundColor: COLORS[estimate.trade_breakdown.findIndex(x => x.trade === t.trade) % COLORS.length] }} />
                    <span className="text-nothing-text-muted group-hover:text-nothing-text transition-colors">{t.trade}</span>
                  </td>
                  <td className="text-right py-4 px-4 text-nothing-text group-hover:text-nothing-lime transition-colors">{fmt(t.direct_cost)}</td>
                  <td className="text-right py-4 pl-4 text-nothing-text-muted/20 group-hover:text-nothing-text-muted/40 transition-colors italic">// {t.share_pct}%</td>
                </tr>
              ))}
              <tr className="border-t border-nothing-border bg-nothing-text/[0.01]">
                <td className="py-6 font-black text-nothing-text uppercase tracking-[0.2em]">Total_Direct_Vector</td>
                <td className="text-right py-6 px-4 font-black text-nothing-lime text-lg italic tracking-tighter">{fmt(estimate.direct_cost)}</td>
                <td className="text-right py-6 pl-4 font-black text-nothing-text-muted/20 italic tracking-widest">100.00%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
