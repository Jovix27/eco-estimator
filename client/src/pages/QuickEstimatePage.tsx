import { Zap, Info } from 'lucide-react'
import EstimatorDashboard from '../components/EstimatorDashboard'

export default function QuickEstimatePage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-yellow-400 w-5 h-5" />
            <h1 className="text-2xl font-black">Quick Estimate</h1>
          </div>
          <p className="text-sm text-gray-500">Instant Thumb-Rule based estimation with Eco-Swaps</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-bold uppercase tracking-wider">
          <Info size={14} />
          Thumb-rule accuracy: ±15%
        </div>
      </div>

      {/* Info Card */}
      <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-primary-900/10 to-transparent">
        <h2 className="text-sm font-bold mb-2">How it works</h2>
        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
          The Quick Estimate tool uses statistical data from previous Green Build AI projects to provide an 
          instant cost and carbon footprint based on your building parameters. Use this for initial budgeting 
          and to explore sustainable material alternatives (Eco-Swaps) before creating a detailed BOQ.
        </p>
      </div>

      <EstimatorDashboard />
    </div>
  )
}
