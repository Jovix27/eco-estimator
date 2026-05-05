import { DollarSign, Leaf, Zap, CheckCircle } from 'lucide-react'

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
      icon: <DollarSign className="text-blue-500" />,
      iconBg: 'bg-blue-500/20',
      borderHover: 'hover:border-blue-500/50',
      label: 'TOTAL COST',
      value: `₹${totalCost.toLocaleString('en-IN')}`,
      sub: `₹${costPerSqft.toLocaleString('en-IN')}/sqft`,
    },
    {
      icon: <Leaf className="text-green-500" />,
      iconBg: 'bg-green-500/20',
      borderHover: 'hover:border-green-500/50',
      label: 'CARBON FOOTPRINT',
      value: `${totalCarbon.toLocaleString('en-IN')}`,
      valueSuffix: 'kgCO₂e',
      sub: `${carbonPerSqft} kgCO₂e/sqft`,
    },
    {
      icon: <Zap className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      borderHover: 'hover:border-amber-500/50',
      label: 'ECO GRADE',
      value: ecoGrade?.grade || '—',
      sub: ecoGrade ? `${ecoGrade.label} · ${ecoGrade.ratio} kgCO₂e/lakh` : 'N/A',
      valueColor: ecoGrade?.color,
    },
    {
      icon: <CheckCircle className="text-primary-500" />,
      iconBg: 'bg-primary-500/20',
      borderHover: 'hover:border-primary-500/50',
      label: 'SUSTAINABLE %',
      value: `${sustainablePct}%`,
      sub: sustainablePct >= 80 ? 'Eco-Optimized' : 'Conventional Mix',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`glass p-5 rounded-2xl border border-white/10 shadow-xl transition-all ${c.borderHover}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center`}>
              {c.icon}
            </div>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{c.label}</span>
          </div>
          <div className="text-2xl font-black" style={c.valueColor ? { color: c.valueColor } : undefined}>
            {c.value}
            {c.valueSuffix && <span className="text-xs font-normal text-gray-400 ml-1">{c.valueSuffix}</span>}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
