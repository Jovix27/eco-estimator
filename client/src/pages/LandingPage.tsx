import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, FileSpreadsheet, Zap, BarChart3, 
  Shield, Globe, Database, Layers, Cpu, Activity
} from 'lucide-react'

const SystemVisualization = () => {
  return (
    <div className="relative w-full aspect-[4/3] glass border-[var(--nothing-border-strong)] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 dot-matrix opacity-[0.1] group-hover:opacity-[0.2] transition-opacity"></div>
      
      {/* Animated Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-[var(--nothing-lime)]/20 z-10 shadow-[0_0_15px_var(--nothing-lime)]"
      />

      {/* SVG Architectural Wireframe */}
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full p-8 opacity-40 group-hover:opacity-70 transition-opacity">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--nothing-lime)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--nothing-lime)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--nothing-lime)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Abstract Building Form */}
        <motion.path
          d="M 100,250 L 100,100 L 200,50 L 300,100 L 300,250 Z"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 100,150 L 300,150 M 100,200 L 300,200 M 200,50 L 200,250"
          stroke="var(--nothing-lime)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.3"
        />
        
        {/* Data Nodes */}
        {[
          { x: 100, y: 100 }, { x: 200, y: 50 }, { x: 300, y: 100 },
          { x: 100, y: 250 }, { x: 300, y: 250 }, { x: 200, y: 150 }
        ].map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3"
            fill="var(--nothing-lime)"
            animate={{ r: [2, 4, 2], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>

      {/* Interface Overlays */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[8px] font-mono text-[var(--nothing-lime)] tracking-widest uppercase">
              <Activity size={8} className="animate-pulse" />
              Real_Time_Scan
            </div>
            <div className="text-[10px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-tighter">
              BIM_MODEL_042 // ACTIVE
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[8px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-widest">
              LATTICE_COORD
            </div>
            <div className="text-[10px] font-mono text-[var(--nothing-lime)]">
              28.6139° N, 77.2090° E
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="glass px-3 py-1.5 rounded border-[var(--nothing-border-strong)] text-[8px] font-mono tracking-[0.2em] text-[var(--nothing-text-dim)] uppercase">
            ARCH_CORE // STACK_01
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 bg-[var(--nothing-lime)]/40 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen relative overflow-hidden bg-[var(--nothing-bg)] selection:bg-[var(--nothing-lime)] selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 dot-matrix opacity-[0.03] pointer-events-none"></div>
      <div className="fixed inset-0 grid-line opacity-[0.02] pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 space-y-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full border-[var(--nothing-border-strong)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--nothing-lime)] animate-pulse"></div>
              <span className="text-[10px] font-mono text-[var(--nothing-lime)] uppercase tracking-[0.2em]">Build_Revision_4.0</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase italic">
                BUILD <br />
                <span className="text-transparent outline-text opacity-40">INTELLIGENT</span> <br />
                <span className="text-[var(--nothing-lime)]">SUSTAINABLE</span>
              </h1>

              <p className="text-[var(--nothing-text-dim)] text-lg max-w-md leading-relaxed border-l-2 border-[var(--nothing-lime)]/20 pl-6">
                // Standardize your construction estimation with real-time carbon intelligence and industrial-grade trade analysis.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => nav('/projects')}
                className="btn-nothing group flex items-center gap-4 px-8"
              >
                Launch_Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => nav('/quick')}
                className="btn-nothing-outline px-8"
              >
                Quick_Estimate
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-[var(--nothing-lime)] opacity-10 blur-[150px] rounded-full"></div>
            <SystemVisualization />
          </motion.div>
        </div>
      </section>

      {/* Stats/Labels */}
      <div className="max-w-7xl mx-auto px-6 border-y border-[var(--nothing-border)] py-16 flex flex-wrap justify-between gap-12 bg-[var(--nothing-bg-muted)]/30">
        {[
          { label: 'CARBON_ACCURACY', val: '99.8%' },
          { label: 'TENDER_READY', val: 'BOQ_GEN' },
          { label: 'CALC_LATENCY', val: '12ms' },
          { label: 'SYSTEM_STATUS', val: 'STABLE' }
        ].map((s, i) => (
          <div key={i} className="space-y-2">
            <p className="text-[9px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-[var(--nothing-lime)]"></div>
              {s.label}
            </p>
            <p className="text-3xl font-black italic tracking-tighter uppercase">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[var(--nothing-border)]">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 0.99, backgroundColor: "rgba(255,255,255,0.02)" }}
              className="p-12 bg-[var(--nothing-bg)] group transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center border border-[var(--nothing-border-strong)] text-[var(--nothing-lime)] group-hover:bg-[var(--nothing-lime)] group-hover:text-black transition-all">
                  {f.icon}
                </div>
                <span className="text-[9px] font-mono text-[var(--nothing-text-dim)] tracking-widest uppercase">{f.tag}</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 tracking-tighter italic uppercase group-hover:text-[var(--nothing-lime)] transition-colors">{f.title}</h3>
                <p className="text-sm text-[var(--nothing-text-dim)] leading-relaxed font-medium">{f.desc}</p>
              </div>
              {/* Subtle number label */}
              <div className="absolute bottom-4 right-4 text-[40px] font-black text-white/[0.02] pointer-events-none group-hover:text-[var(--nothing-lime)]/5 transition-colors">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-48 text-center space-y-16">
        <div className="space-y-6">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            STOP <span className="text-transparent outline-text opacity-40">ESTIMATING.</span> <br />
            START <span className="text-[var(--nothing-lime)]">BUILDING.</span>
          </h2>
          <p className="text-[var(--nothing-text-dim)] text-xs uppercase tracking-[0.4em] font-black max-w-sm mx-auto">
            // JOIN THE CARBON-INTELLIGENT REVOLUTION
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => nav('/projects')}
          className="btn-nothing px-12 py-6 text-xl group"
        >
          GET_STARTED_NOW
          <ArrowRight className="ml-4 inline group-hover:translate-x-2 transition-transform" />
        </motion.button>
      </section>
    </div>
  )
}
