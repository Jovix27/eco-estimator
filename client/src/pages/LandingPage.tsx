import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, FileSpreadsheet, Zap, BarChart3, 
  Shield, Globe, Database, Layers, Cpu
} from 'lucide-react'

export default function LandingPage() {
  const nav = useNavigate()

  const features = [
    { icon: <FileSpreadsheet className="w-4 h-4" />, title: 'BOQ_ENGINE', desc: 'Industrial-grade bill of quantities with 25+ automated trades.', tag: 'CORE' },
    { icon: <Zap className="w-4 h-4" />, title: 'RAPID_COST', desc: 'Real-time rate analysis broken down by material and labour.', tag: 'SPEED' },
    { icon: <BarChart3 className="w-4 h-4" />, title: 'ECO_METRICS', desc: 'Embodied carbon tracking with automated eco-grade logic.', tag: 'SUSTAIN' },
    { icon: <Globe className="w-4 h-4" />, title: 'REGIONAL_DATA', desc: 'Pre-configured datasets for the Indian construction market.', tag: 'DATA' },
    { icon: <Database className="w-4 h-4" />, title: 'PERSISTENCE', desc: 'Cloud-synced project storage with version controlled estimates.', tag: 'STORAGE' },
    { icon: <Cpu className="w-4 h-4" />, title: 'AI_OPTIMIZER', desc: 'Suggests carbon-efficient material alternatives automatically.', tag: 'AI_CORE' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--nothing-bg)] selection:bg-[var(--nothing-green)] selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 dot-matrix opacity-[0.03] pointer-events-none"></div>
      <div className="fixed inset-0 grid-line opacity-[0.02] pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full border-[var(--nothing-border-strong)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--nothing-green)] animate-pulse"></div>
              <span className="text-[10px] font-mono text-[var(--nothing-green)] uppercase tracking-[0.2em]">Build_Revision_4.0</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]">
              BUILD <br />
              <span className="text-[var(--nothing-text-dim)]">INTELLIGENT</span> <br />
              <span className="italic">SUSTAINABLE</span>
            </h1>

            <p className="text-[var(--nothing-text-dim)] text-lg max-w-md leading-relaxed">
              Standardize your construction estimation with real-time carbon intelligence and industrial-grade trade analysis.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => nav('/projects')}
                className="btn-nothing group flex items-center gap-3"
              >
                Launch_Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => nav('/quick')}
                className="btn-nothing-outline"
              >
                Quick_Estimate
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[var(--nothing-green)] opacity-10 blur-[120px] rounded-full"></div>
            <div className="relative glass border-[var(--nothing-border-strong)] p-2 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/eco_estimator_hero_viz_1777961540145.png" 
                alt="System Visualization" 
                className="w-full aspect-[4/3] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="glass px-4 py-2 text-[9px] font-mono tracking-widest text-[var(--nothing-text-dim)] uppercase">
                  ARCH_CORE // STACK_01
                </div>
                <div className="glass px-4 py-2 text-[9px] font-mono tracking-widest text-[var(--nothing-green)] uppercase">
                  ACTIVE_LINK
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Labels */}
      <div className="max-w-6xl mx-auto px-6 border-y border-[var(--nothing-border)] py-12 flex flex-wrap justify-between gap-12">
        {[
          { label: 'CARBON_ACCURACY', val: '99.8%' },
          { label: 'TENDER_READY', val: 'BOQ_GEN' },
          { label: 'CALC_LATENCY', val: '12ms' },
          { label: 'SYSTEM_STATUS', val: 'STABLE' }
        ].map((s, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[9px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-bold italic tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01, zIndex: 10 }}
              className="p-8 glass border-[var(--nothing-border)] hover:border-[var(--nothing-green)]/30 group transition-all"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="w-10 h-10 flex items-center justify-center border border-[var(--nothing-border-strong)] text-[var(--nothing-green)] group-hover:bg-[var(--nothing-green)] group-hover:text-black transition-all">
                  {f.icon}
                </div>
                <span className="text-[8px] font-mono text-[var(--nothing-text-dim)] tracking-widest uppercase">{f.tag}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight italic uppercase">{f.title}</h3>
              <p className="text-sm text-[var(--nothing-text-dim)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-40 text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase italic leading-[0.9]">
            STOP <span className="text-[var(--nothing-text-dim)]">ESTIMATING.</span> <br />
            START <span className="text-[var(--nothing-green)]">BUILDING.</span>
          </h2>
          <p className="text-[var(--nothing-text-dim)] text-sm uppercase tracking-[0.2em] font-mono max-w-sm mx-auto">
            // JOIN THE CARBON-INTELLIGENT REVOLUTION
          </p>
        </div>
        <button 
          onClick={() => nav('/projects')}
          className="btn-nothing !px-16 !py-6 !text-sm"
        >
          Initialize_System
        </button>
      </section>
    </div>
  )
}

