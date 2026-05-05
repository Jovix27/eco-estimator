import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, FileSpreadsheet, TrendingUp, Shield,
  CheckCircle2, Zap, Upload, Calculator, BarChart3, Download
} from 'lucide-react'

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div className="space-y-20 animate-fade-in">
      {/* Hero */}
      <section className="pt-8 text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/20 text-primary-300 text-xs font-bold mb-6 border border-primary-800/50">
          <Zap className="w-4 h-4" />
          ITEM RATE BOQ · RATE ANALYSIS · COST + CARBON INTELLIGENCE
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-5 leading-tight tracking-tight">
          Professional BOQ &amp; Cost<br />
          <span className="text-transparent bg-clip-text gradient-primary">Estimation Platform</span>
        </h1>
        <p className="text-base text-gray-400 mb-8 max-w-2xl mx-auto">
          Generate trade-wise Bills of Quantity using the Item Rate Method, run full cost estimates
          with overhead &amp; profit, and export production-ready Excel sheets — all in one tool.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => nav('/projects')}
            className="px-8 py-4 text-sm font-bold text-white rounded-xl gradient-primary hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Start New Project
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => nav('/quick')}
            className="px-6 py-4 text-sm font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            Quick Estimate
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: <FileSpreadsheet className="w-6 h-6 text-primary-500" />,
            title: 'Item Rate BOQ',
            desc: '25 work items across 12 trades — Site Work, Foundation, Structural, Masonry, Finishing, MEP and more.',
            items: ['Trade-wise breakdown', 'IS-standard descriptions', 'Inline quantity editing', 'Manual rate override'],
          },
          {
            icon: <Calculator className="w-6 h-6 text-blue-500" />,
            title: 'Rate Analysis',
            desc: 'Every rate broken into Material + Labour + Equipment components for full transparency.',
            items: ['Per-item rate drill-down', 'Location cost index', 'Quality grade factors', 'Building type multipliers'],
          },
          {
            icon: <TrendingUp className="w-6 h-6 text-indigo-400" />,
            title: 'Full Estimation',
            desc: 'Overhead, profit, contingency and GST applied on top of direct BOQ cost.',
            items: ['Overhead & profit %', 'Contingency buffer', 'GST calculation', 'Cost per sqft metrics'],
          },
          {
            icon: <BarChart3 className="w-6 h-6 text-yellow-400" />,
            title: 'Cost Visualisation',
            desc: 'Interactive charts showing trade-wise cost distribution, M/L/E split and cash flow.',
            items: ['Trade pie chart', 'Material vs Labour vs Equipment', 'Cost waterfall', 'Summary dashboard'],
          },
          {
            icon: <Shield className="w-6 h-6 text-green-500" />,
            title: 'Eco Intelligence',
            desc: 'Embodied carbon tracking and eco-grade classification for sustainable construction.',
            items: ['Fly Ash, GGBS, AAC, M-Sand', 'Carbon reduction %', 'Eco-Grade A+ to D', 'One-click material swap'],
          },
          {
            icon: <Download className="w-6 h-6 text-rose-400" />,
            title: 'Export Ready',
            desc: 'Download fully formatted Excel workbooks with BOQ and estimate sheets.',
            items: ['Trade-grouped BOQ sheet', 'Cost estimate summary', 'Rate analysis detail', 'Professional formatting'],
          },
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl glass border border-white/5 hover:border-primary-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">{f.icon}</div>
            <h3 className="text-base font-bold mb-2">{f.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{f.desc}</p>
            <ul className="space-y-2">
              {f.items.map(item => (
                <li key={item} className="flex items-center gap-2 text-[11px] text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center glass rounded-2xl border border-white/5 p-12">
        <h2 className="text-3xl font-black mb-4">Ready to replace your Excel BOQ?</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Create a project, get an auto-generated BOQ in seconds, edit quantities, run the estimate and export.
        </p>
        <button
          onClick={() => nav('/projects')}
          className="px-8 py-3 text-sm font-bold text-white rounded-xl gradient-primary hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          Create Your First Project <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  )
}
