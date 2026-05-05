import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Building2, FolderOpen, Zap } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import QuickEstimatePage from './pages/QuickEstimatePage'
import ThemeToggle from './components/ThemeToggle'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--nothing-bg)] text-[var(--nothing-text)] p-10 font-mono">
          <div className="space-y-6 max-w-lg border border-[#00c853]/20 p-10 bg-[var(--nothing-dark)] relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00c853]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00c853]"></div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
              <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em]">FATAL_RENDER_EXCEPTION</p>
            </div>
            <h1 className="text-4xl font-black text-[#00c853] italic tracking-tighter">SYSTEM_HALT</h1>
            <p className="text-[10px] text-[var(--nothing-text-dim)] leading-relaxed uppercase tracking-widest">
              // A critical rendering error has occurred in the UI module.<br />
              // Execution has been suspended to prevent data corruption.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 border border-[#00c853] text-[#00c853] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#00c853] hover:text-black transition-colors"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Nav() {
  const loc = useLocation()
  const isActive = (path: string) =>
    loc.pathname === path || (path !== '/' && loc.pathname.startsWith(path))

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl glass border-[var(--nothing-border-strong)] rounded-full px-6 py-2">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-[var(--nothing-border-strong)] flex items-center justify-center group-hover:border-[var(--nothing-green)] transition-all bg-white/[0.02] relative">
            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-[var(--nothing-green)]"></div>
            <Building2 className="w-3.5 h-3.5 text-[var(--nothing-text)] group-hover:text-[var(--nothing-green)]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[10px] font-bold leading-tight uppercase tracking-[0.2em] text-[var(--nothing-text)]">ECO_ESTIMATOR</h1>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {[
            { path: '/projects', label: 'PROJECTS', icon: <FolderOpen size={12} /> },
            { path: '/quick', label: 'QUICK_EST', icon: <Zap size={12} /> },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                isActive(link.path)
                  ? 'text-[var(--nothing-green)] bg-[var(--nothing-green-dim)]'
                  : 'text-[var(--nothing-text-dim)] hover:text-[var(--nothing-text)] hover:bg-white/[0.03]'
              }`}
            >
              {link.icon} <span className="hidden xs:inline">{link.label}</span>
            </Link>
          ))}
          <div className="w-px h-4 bg-[var(--nothing-border-strong)] mx-2"></div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--nothing-bg)] text-[var(--nothing-text)] relative transition-colors duration-700 ease-in-out overflow-x-hidden">
        {/* Ambient Effects */}
        <div className="fixed inset-0 dot-matrix opacity-[0.04] pointer-events-none z-0"></div>
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[var(--nothing-green)] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

        <Nav />

        <main className="relative z-10">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/quick" element={<QuickEstimatePage />} />
              <Route path="/quick-estimate" element={<QuickEstimatePage />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Industrial Footer */}
        <footer className="border-t border-[var(--nothing-border)] bg-[var(--nothing-bg)] relative z-10 py-12 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--nothing-green)]"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--nothing-text)]">
                  ECO_ESTIMATOR_CORE
                </span>
              </div>
              <p className="text-[9px] text-[var(--nothing-text-dim)] uppercase tracking-widest max-w-xs leading-relaxed">
                Next-generation carbon-intelligent construction estimation platform.
              </p>
            </div>
            
            <div className="flex items-center gap-8 text-[9px] font-mono text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">
              <span>REV_4.0.2</span>
              <span>© 2026 // GREEN_BUILD_AI</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

