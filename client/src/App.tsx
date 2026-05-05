import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Building2, FolderOpen, Zap } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import QuickEstimatePage from './pages/QuickEstimatePage'

function Nav() {
  const loc = useLocation()
  const active = (path: string) =>
    loc.pathname === path || loc.pathname.startsWith(path + '/')
      ? 'text-primary-400 bg-white/5'
      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Eco Estimator</h1>
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Green Build AI</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/projects" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold ${active('/projects')}`}>
              <FolderOpen size={14} /> Projects
            </Link>
            <Link to="/quick" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold ${active('/quick')}`}>
              <Zap size={14} /> Quick Estimate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-scene text-gray-100">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/quick" element={<QuickEstimatePage />} />
          </Routes>
        </main>
        <footer className="py-6 border-t border-white/5 glass">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" />
              <span className="font-bold text-sm tracking-tighter">ECO ESTIMATOR</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              © 2026 Green Build AI
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
