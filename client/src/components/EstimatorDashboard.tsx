import { useState, useCallback } from 'react'
import InputForm from './InputForm'
import SummaryCards from './SummaryCards'
import BOQTable from './BOQTable'
import EcoToggle from './EcoToggle'

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
    <div className="flex flex-col gap-6 animate-fade-in">
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
          ⚠ {error}
        </div>
      )}

      {estimate && (
        <>
          <SummaryCards
            totalCost={estimate.total_cost}
            totalCarbon={estimate.total_carbon}
            ecoGrade={estimate.eco_grade}
            sustainablePct={sustainablePct}
            costPerSqft={estimate.cost_per_sqft}
            carbonPerSqft={estimate.carbon_per_sqft}
          />

          <BOQTable materials={estimate.materials} />

          <EcoToggle
            suggestions={estimate.eco_suggestions}
            potentialSavings={estimate.potential_carbon_savings}
            potentialPct={estimate.potential_savings_pct}
            onSwap={handleSwap}
            activeOverrides={overrides}
          />

          {/* Eco Grade Detail */}
          <div className="glass rounded-2xl border border-white/10 p-6" style={{ borderColor: estimate.eco_grade.color + '33' }}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl"
                style={{ backgroundColor: estimate.eco_grade.color }}
              >
                {estimate.eco_grade.grade}
              </div>
              <div>
                <h3 className="font-bold text-lg">Eco-Grade: {estimate.eco_grade.label}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{estimate.eco_grade.description}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  Carbon Intensity: {estimate.eco_grade.ratio} kgCO₂e per ₹1 lakh spent
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
