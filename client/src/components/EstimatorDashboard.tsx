import { useState, useCallback } from 'react'
import InputForm from './InputForm'
import SummaryCards from './SummaryCards'
import BOQTable from './BOQTable'
import EcoToggle from './EcoToggle'
import CarbonImpactMatrix from './CarbonImpactMatrix'
import { AlertTriangle } from 'lucide-react'

interface EstimateData {
  building_params: { built_up_area_sqft: number; building_type: string; num_floors: number }
  materials: any[]
  total_cost: number
  total_carbon: number
  cost_per_sqft: number
  carbon_per_sqft: number
  eco_grade: { grade: string; label: string; ratio: number; color: string; description: string }
  eco_suggestions: any[]
  potential_carbon_savings: number
  potential_savings_pct: number
}

export default function EstimatorDashboard() {
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [lastParams, setLastParams] = useState<{ area: number; type: string; floors: number } | null>(null)

  const fetchEstimate = useCallback(async (area: number, type: string, floors: number, materialOverrides?: Record<string, string>) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/estimate/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building_params: { built_up_area_sqft: area, building_type: type, num_floors: floors },
          material_overrides: materialOverrides || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Estimation failed')
      }
      const data: EstimateData = await res.json()
      setEstimate(data)
      setLastParams({ area, type, floors })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSubmit = (area: number, type: string, floors: number) => {
    setOverrides({})
    fetchEstimate(area, type, floors)
  }

  const handleSwap = (category: string, materialId: string) => {
    if (!lastParams) return
    const newOverrides = { ...overrides, [category]: materialId }
    setOverrides(newOverrides)
    fetchEstimate(lastParams.area, lastParams.type, lastParams.floors, newOverrides)
  }

  const sustainablePct = estimate
    ? Math.round((estimate.materials.filter((m: any) => m.is_sustainable).length / estimate.materials.length) * 100)
    : 0

  return (
    <div className="flex flex-col gap-1 animate-fade-in">
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="p-8 bg-red-900/10 border border-red-500/20 text-red-500 flex items-center gap-6">
          <AlertTriangle className="shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">SYSTEM_ERROR_DETECTION</p>
            <p className="text-xs font-black uppercase tracking-widest italic">// {error}</p>
          </div>
        </div>
      )}

      {estimate && (
        <div className="flex flex-col gap-1">
          <SummaryCards
            totalCost={estimate.total_cost}
            totalCarbon={estimate.total_carbon}
            ecoGrade={estimate.eco_grade}
            sustainablePct={sustainablePct}
            costPerSqft={estimate.cost_per_sqft}
            carbonPerSqft={estimate.carbon_per_sqft}
          />

          <CarbonImpactMatrix materials={estimate.materials} totalCarbon={estimate.total_carbon} />

          <BOQTable materials={estimate.materials} />

          <EcoToggle
            suggestions={estimate.eco_suggestions}
            potentialSavings={estimate.potential_carbon_savings}
            potentialPct={estimate.potential_savings_pct}
            onSwap={handleSwap}
            activeOverrides={overrides}
          />

          {/* Eco Grade Detail */}
          <div className="industrial-card p-10 border-[#00c853]/20 bg-black/40">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 border-2 border-[#00c853] flex items-center justify-center text-5xl font-black text-[#00c853] italic tracking-tighter shadow-[0_0_50px_rgba(0,200,83,0.15)] bg-black">
                {estimate.eco_grade.grade}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <div className="w-1.5 h-1.5 bg-[#00c853]"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">ECO_GRADE_INDEX_V1.0</h3>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-[0.1em] mb-3 italic">RESULT: {estimate.eco_grade.label}</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-relaxed italic mb-4 max-w-2xl">
                  // {estimate.eco_grade.description}
                </p>
                <div className="inline-block px-4 py-2 bg-white/[0.03] border border-white/5 text-[9px] font-black text-[#00c853] uppercase tracking-widest italic">
                  INTENSITY: {estimate.eco_grade.ratio} KG_CO2E / LAKH_VALUATION
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
