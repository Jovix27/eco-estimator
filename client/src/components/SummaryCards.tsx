import { DollarSign, Leaf, Zap, CheckCircle, Activity } from 'lucide-react'

interface SummaryCardsProps {
  totalCost: number
  totalCarbon: number
  ecoGrade: { grade: string; label: string; ratio: number; color: string; description: string } | null
  sustainablePct: number
  costPerSqft: number
  carbonPerSqft: number
}

export default function SummaryCards({ totalCost, totalCarbon, ecoGrade, sustainablePct, costPerSqft, carbonPerSqft }: SummaryCardsProps) {
  const cards = [
    {
      icon: <DollarSign size={16} />,
      label: 'TOTAL_VALUATION',
      value: `₹${totalCost.toLocaleString('en-IN')}`,
      sub: `₹${costPerSqft.toLocaleString('en-IN')}/SQFT_YIELD`,
      color: 'text-[var(--nothing-text)]',
    },
    {
      icon: <Leaf size={16} />,
      label: 'CARBON_FOOTPRINT_VECTOR',
      value: `${totalCarbon.toLocaleString('en-IN')}`,
      valueSuffix: 'KG_CO2E',
      sub: `${carbonPerSqft} KG_CO2E/SQFT_DENSITY`,
      color: 'text-[var(--nothing-text)]',
    },
    {
      icon: <Activity size={16} />,
      label: 'ECO_GRADE_INDEX',
      value: ecoGrade?.grade || '—',
      sub: ecoGrade ? `${ecoGrade.label} · ${ecoGrade.ratio} KG/LAKH` : 'N/A_NODE',
      color: 'text-[var(--nothing-lime)]',
    },
    {
      icon: <CheckCircle size={16} />,
      label: 'SUSTAINABILITY_COEFFICIENT',
      value: `${sustainablePct}%`,
      sub: sustainablePct >= 80 ? 'OPTIMIZED_SYSTEM' : 'CONVENTIONAL_MIX',
      color: 'text-[var(--nothing-lime)]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
      {cards.map((c, i) => (
        <div key={i} className="industrial-card p-6 border-[var(--nothing-border)] hover:bg-[var(--nothing-surface)] transition-all group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 bg-[var(--nothing-lime)]"></div>
            <span className="text-[8px] text-[var(--nothing-text-dim)] font-black uppercase tracking-[0.3em] italic">{c.label}</span>
          </div>
          <div className={`text-2xl font-black italic tracking-tighter mb-2 ${c.color}`}>
            {c.value}
            {c.valueSuffix && <span className="text-[10px] not-italic font-black text-[var(--nothing-text-dim)] opacity-30 ml-2 tracking-widest">{c.valueSuffix}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[var(--nothing-text-dim)] opacity-20 group-hover:text-[var(--nothing-lime)] transition-colors">{c.icon}</div>
            <p className="text-[8px] text-[var(--nothing-text-dim)] opacity-40 font-black uppercase tracking-widest italic group-hover:text-[var(--nothing-text-dim)] transition-colors">// {c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
