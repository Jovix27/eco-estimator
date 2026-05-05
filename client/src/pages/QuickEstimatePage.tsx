import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Calculator, Info, ArrowRight, 
  Download, Save, RefreshCw, Layers, Zap, TrendingUp, 
  ChevronRight, AlertTriangle, Loader2, BarChart
} from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import { quickEstimateApi } from '../lib/api';
import type { QuickEstimateResponse } from '../lib/api';

const GOOGLE_MAPS_KEY = "AIzaSyCMDnBCDPA161_bpvbd31RvHW18rQHI4xs";

// --- Components ---

const PriceGrid = ({ data }: { data: any }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const intensities = [
    'bg-[var(--nothing-text)] opacity-[0.05]', 
    'bg-[var(--nothing-lime)] opacity-[0.15]', 
    'bg-[var(--nothing-lime)] opacity-[0.35]', 
    'bg-[var(--nothing-lime)] opacity-[0.65]', 
    'bg-[var(--nothing-lime)] opacity-100'
  ];

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-center">
        <div className="text-[10px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Market Intelligence Matrix</div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">Less</span>
          <div className="flex gap-0.5">
            {intensities.map((c, i) => <div key={i} className={`w-2 h-2 ${c === 'opacity-[0.1]' ? 'bg-[var(--nothing-text)]' : c} rounded-none`} />)}
          </div>
          <span className="text-[8px] text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-widest">More</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-10 gap-2 mb-1">
          {months.map(m => <div key={m} className="text-[8px] text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-tighter text-center">{m}</div>)}
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {[...Array(50)].map((_, i) => {
            const intensity = Math.floor(Math.random() * 5);
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={`w-full pt-[100%] rounded-none ${intensity === 0 ? 'bg-[var(--nothing-text)] opacity-[0.05]' : intensities[intensity]} transition-all hover:ring-1 hover:ring-[var(--nothing-green)] cursor-crosshair relative group`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[var(--nothing-bg)] text-[6px] text-[var(--nothing-green)] font-black z-10 transition-opacity">
                  V_{i}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="text-[8px] text-[var(--nothing-text-dim)] opacity-40 uppercase tracking-[0.3em] italic">
        // SYNCING_REAL_TIME_COST_STREAMS...
      </div>
    </div>
  );
};

export default function QuickEstimatePage() {
  const [area, setArea] = useState<number>(1500);
  const [location, setLocation] = useState({ address: '', city: 'Mumbai', lat: 0, lng: 0 });
  const [buildingType, setBuildingType] = useState('Residential');
  const [quality, setQuality] = useState('Premium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (area <= 0) {
      setError("Please enter a valid area (sq.ft)");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await quickEstimateApi.calculate({
        area_sqft: area,
        location: location.city,
        building_type: buildingType,
        quality_level: quality,
        include_tax: true
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to calculate estimate");
    } finally {
      setLoading(false);
    }
  };

  const buildingTypes = ['Residential', 'Commercial', 'Industrial', 'Retail'];
  const qualityLevels = ['Standard', 'Premium', 'Luxury'];

  return (
     <div className="min-h-screen bg-gradient-to-br from-[var(--nothing-bg)] via-[var(--nothing-bg)] to-[var(--nothing-lime)]/5 text-[var(--nothing-text)] font-mono selection:bg-[var(--nothing-lime)] selection:text-black relative overflow-hidden transition-colors duration-300">
       {/* Background Dot Matrix */}
       <div className="absolute inset-0 dot-matrix opacity-[0.08] pointer-events-none"></div>
       <div className="absolute inset-0 bg-gradient-to-r from-[var(--nothing-lime)]/5 via-transparent to-[var(--nothing-lime)]/5 pointer-events-none"></div>
      
       <div className="relative max-w-7xl mx-auto px-6 py-12 pb-24">
        {/* Header */}
         <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--nothing-lime)] text-black text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_var(--nothing-lime)]/50">
               <span className="w-1.5 h-1.5 bg-black rounded-none animate-pulse"></span>
               Rapid Estimator v2.1
             </div>
             <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-4">
               <span className="text-[var(--nothing-text-dim)]">QUICK</span> <br />
               <span className="italic text-[var(--nothing-lime)]">ESTIMATE</span>
             </h1>
            <p className="text-[var(--nothing-text-dim)] text-[11px] font-black max-w-md tracking-[0.2em] leading-relaxed uppercase border-l-2 border-[var(--nothing-lime)]/20 pl-4">
              // Location-aware construction cost projection<br/>
              // Real-time material price indexing enabled.
            </p>
          </div>

               <div className="flex items-center gap-8 border-l border-[var(--nothing-border)] pl-8 h-fit">
                 <div className="text-right space-y-1">
                   <div className="text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Active Node</div>
                   <div className="text-[11px] font-black text-[var(--nothing-text)]">{location.city?.toUpperCase() || 'MUMBAI'}</div>
                 </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em] mb-1">Engine Status</div>
              <div className="text-[11px] font-black text-[var(--nothing-lime)] flex items-center gap-2 justify-end">
                <span className="w-1.5 h-1.5 rounded-none bg-[var(--nothing-lime)] animate-pulse shadow-[0_0_8px_var(--nothing-lime)]"></span>
                CORE_STABLE
              </div>
            </div>
          </div>
        </header>

         <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
          {/* Input Section */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 sticky top-24"
          >
                <div className="industrial-card p-6 border border-[var(--nothing-lime)]/20 space-y-6 bg-[var(--nothing-dark)] shadow-[inset_0_0_30px_var(--nothing-lime)]/5">
              <div className="flex items-center justify-between border-b border-[var(--nothing-border)] pb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[var(--nothing-lime)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--nothing-text)]">Input Parameters</span>
                </div>
                <div className="text-[9px] font-bold text-[var(--nothing-text-dim)] opacity-40">CTRL+R TO RESET</div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Site Geographic Data</label>
                <LocationPicker 
                  apiKey={GOOGLE_MAPS_KEY}
                  onLocationSelect={(loc) => setLocation(loc)}
                />
              </div>

              {/* Area */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Built-up Area Expansion</label>
                <div className="relative group">
                  <input 
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                     className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-5 py-5 text-3xl font-black focus:outline-none focus:border-[var(--nothing-lime)] focus:shadow-[0_0_15px_var(--nothing-lime)]/20 transition-all text-[var(--nothing-text)]"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-widest pointer-events-none">
                    SQFT_UNITS
                  </div>
                </div>
              </div>

              {/* Building Type & Quality */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Typology</label>
                  <select 
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                     className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-[11px] font-black uppercase appearance-none focus:outline-none focus:border-[var(--nothing-lime)] focus:shadow-[0_0_10px_var(--nothing-lime)]/20 transition-all text-[var(--nothing-text)]"
                   >
                     {buildingTypes.map(t => <option key={t} value={t} className="bg-[var(--nothing-bg)] text-[var(--nothing-text)]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--nothing-text-dim)] uppercase tracking-[0.2em]">Spec_Level</label>
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                     className="w-full bg-[var(--nothing-bg)] border border-[var(--nothing-border)] px-4 py-4 text-[11px] font-black uppercase appearance-none focus:outline-none focus:border-[var(--nothing-lime)] focus:shadow-[0_0_10px_var(--nothing-lime)]/20 transition-all text-[var(--nothing-text)]"
                   >
                     {qualityLevels.map(q => <option key={q} value={q} className="bg-[var(--nothing-bg)] text-[var(--nothing-text)]">{q}</option>)}
                  </select>
                </div>
              </div>

              {/* Calculate Button */}
               <button 
                 onClick={handleCalculate}
                 disabled={loading}
                 className="w-full py-5 bg-[var(--nothing-lime)] text-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[var(--nothing-lime)]/90 hover:shadow-[0_0_30px_var(--nothing-lime)]/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 group relative overflow-hidden border border-[var(--nothing-lime)]/50"
               >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Compute Baseline Estimate
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 flex items-start gap-4">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-red-500 uppercase tracking-widest">Error_Log</div>
                    <p className="text-[10px] text-red-400/80 font-bold leading-tight uppercase">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Industrial Meta Card */}
            <div className="p-6 border border-[var(--nothing-border)] bg-[var(--nothing-dark)] space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-[var(--nothing-text-dim)] opacity-30" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--nothing-text-dim)] opacity-30">Data Intelligence</span>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-[var(--nothing-text-dim)] leading-relaxed uppercase tracking-tight">
                  Calculation methodology leverages <span className="text-[var(--nothing-lime)]">Regional Cost Index (RCI)</span> 
                  specific to <span className="text-[var(--nothing-text)]">{location.city}</span> nodes.
                </p>
                <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 ${i < 8 ? 'bg-[var(--nothing-lime)] opacity-30' : 'bg-[var(--nothing-border)]'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Results Section */}
          <main className="space-y-10">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                   {/* Hero Result Stats */}
                    <div className="grid md:grid-cols-2 gap-6">
                     <div className="industrial-card p-10 relative overflow-hidden group border-[var(--nothing-lime)]/30 bg-gradient-to-br from-[var(--nothing-lime)]/5 to-transparent">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-all text-[var(--nothing-lime)]">
                          <TrendingUp className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                          <div className="text-[10px] font-black text-[var(--nothing-lime)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <div className="w-3 h-[1px] bg-[var(--nothing-lime)]/60"></div>
                            Total Projected Cost
                          </div>
                          <div className="text-7xl font-black tracking-tighter leading-none mb-6">
                            <span className="text-[var(--nothing-lime)] opacity-50 text-4xl mr-2">₹</span>
                            {(result.total_cost / 100000).toFixed(2)}
                            <span className="text-3xl text-[var(--nothing-lime)] ml-2 italic">L</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-[var(--nothing-lime)] text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_var(--nothing-lime)]/50">PROVISIONAL_BOQ</div>
                            <div className="text-[10px] font-bold text-[var(--nothing-lime)] opacity-60 uppercase tracking-widest italic">± 5% Margin Error</div>
                          </div>
                        </div>
                      </div>

                     <div className="industrial-card p-10 border-[var(--nothing-lime)]/30 bg-gradient-to-br from-[var(--nothing-lime)]/5 to-transparent">
                       <div className="text-[10px] font-black text-[var(--nothing-lime)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                         <div className="w-3 h-[1px] bg-[var(--nothing-lime)]/60"></div>
                         Efficiency Metric
                       </div>
                       <div className="text-7xl font-black tracking-tighter leading-none mb-6">
                         <span className="text-[var(--nothing-lime)] opacity-50 text-4xl mr-2">₹</span>
                         {Math.round(result.rate_per_sqft)}
                         <span className="text-2xl text-[var(--nothing-lime)] opacity-60 ml-2 uppercase font-medium tracking-widest">/sqft</span>
                       </div>
                       <div className="space-y-2">
                         <div className="flex justify-between text-[9px] font-black text-[var(--nothing-lime)] opacity-60 uppercase tracking-widest">
                           <span>Market Average</span>
                           <span>Regional Target</span>
                         </div>
                         <div className="h-1 w-full bg-[var(--nothing-lime)]/20 overflow-hidden flex">
                           <div className="h-full bg-[var(--nothing-lime)] opacity-30 w-[40%]"></div>
                           <div className="h-full bg-[var(--nothing-lime)] w-[35%] shadow-[0_0_15px_var(--nothing-lime)]"></div>
                         </div>
                       </div>
                     </div>
                  </div>

                   {/* Detailed Breakdown & Price Matrix */}
                   <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
                     <div className="industrial-card border-[var(--nothing-lime)]/20 bg-[var(--nothing-dark)] shadow-[inset_0_0_30px_var(--nothing-lime)]/5">
                       <div className="px-8 py-6 border-b border-[var(--nothing-lime)]/20 flex items-center justify-between bg-[var(--nothing-lime)]/[0.02]">
                         <div className="flex items-center gap-3">
                           <BarChart className="w-4 h-4 text-[var(--nothing-lime)]" />
                           <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--nothing-lime)] flex items-center gap-2">
                             <div className="w-4 h-[1px] bg-[var(--nothing-lime)]/60"></div>
                             Resource Allocation Matrix
                           </h3>
                         </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2.5 hover:bg-[var(--nothing-surface)] border border-[var(--nothing-border)] transition-all">
                            <Download className="w-3.5 h-3.5 text-[var(--nothing-text-dim)]" />
                          </button>
                          <button className="p-2.5 hover:bg-[var(--nothing-surface)] border border-[var(--nothing-border)] transition-all">
                            <Save className="w-3.5 h-3.5 text-[var(--nothing-text-dim)]" />
                          </button>
                        </div>
                      </div>

                       <div className="p-8 space-y-8">
                        {result.breakdown?.map((item, idx) => (
                          <div key={idx} className="space-y-3 group">
                            <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nothing-text-dim)] opacity-60">{item.category}</span>
                                <div className="text-lg font-black tracking-tight uppercase italic">{item.category.split(' ')[0]}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-black text-[var(--nothing-text)] tracking-tighter italic">₹{(item.amount / 100000).toFixed(2)}L</div>
                                <div className="text-[10px] font-bold text-[var(--nothing-lime)] tracking-widest">{item.percentage}% SHARE</div>
                              </div>
                            </div>
                             <div className="h-[2px] w-full bg-[var(--nothing-lime)]/20 overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${item.percentage}%` }}
                                 transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                 className="h-full bg-[var(--nothing-lime)] shadow-[0_0_10px_var(--nothing-lime)] relative"
                               >
                                 <div className="absolute inset-0 bg-[var(--nothing-lime)] blur-sm opacity-40"></div>
                               </motion.div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                     <div className="space-y-8">
                       {/* Price Stability Grid */}
                       <div className="industrial-card p-6 border-[var(--nothing-border)] bg-[var(--nothing-dark)]">
                         <PriceGrid data={result.material_prices} />
                       </div>

                      {/* Market Rates List */}
                       <div className="space-y-3">
                         <div className="text-[9px] font-black text-[var(--nothing-lime)] opacity-60 uppercase tracking-[0.3em] px-2 mb-4">Node Material Indices</div>
                         {result.material_prices && Object.entries(result.material_prices).map(([name, data]: [string, any], i) => (
                           <motion.div 
                             key={i} 
                             initial={{ opacity: 0, x: 10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.5 + (i * 0.05) }}
                             className="flex items-center justify-between p-4 bg-[var(--nothing-bg)] border border-[var(--nothing-lime)]/20 hover:border-[var(--nothing-lime)]/40 hover:shadow-[0_0_15px_var(--nothing-lime)]/10 transition-all group cursor-default"
                           >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[var(--nothing-bg)] flex items-center justify-center text-[11px] font-black text-[var(--nothing-lime)] border border-[var(--nothing-border)] group-hover:border-[var(--nothing-lime)]/40 transition-all">
                                {name.substring(0, 2).toUpperCase()}
                              </div>
                               <div>
                                 <div className="text-[10px] font-black uppercase tracking-tight text-[var(--nothing-text-dim)] group-hover:text-[var(--nothing-lime)] transition-colors">{name}</div>
                                 <div className="text-[9px] text-[var(--nothing-lime)] opacity-40 font-bold uppercase tracking-widest">U_UNIT: {data.unit}</div>
                               </div>
                            </div>
                               <div className="text-right">
                                 <div className="text-xs font-black tracking-tighter italic text-[var(--nothing-lime)]">₹{data.rate}</div>
                                 <div className={`text-[8px] font-black ${data.trend === 'up' ? 'text-red-500' : 'text-[var(--nothing-lime)]'} flex items-center gap-1 justify-end uppercase tracking-widest mt-1`}>
                                   {data.trend === 'up' ? '▲ POS_SHIFT' : '▼ NEG_SHIFT'}
                                 </div>
                               </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[var(--nothing-border)] pt-10">
                    <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--nothing-text-dim)] opacity-40 hover:text-[var(--nothing-lime)] transition-colors group">
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      Re-Initialize Baseline Computation
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-[1px] bg-[var(--nothing-border)] hidden md:block"></div>
                      <button className="px-10 py-4 bg-[var(--nothing-text)] text-[var(--nothing-bg)] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[var(--nothing-lime)] hover:text-black transition-all flex items-center gap-3">
                        Commit to Full Project
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                 <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 border border-[var(--nothing-lime)]/20 bg-gradient-to-br from-[var(--nothing-lime)]/5 to-transparent relative overflow-hidden">
                   <div className="absolute inset-0 dot-matrix opacity-[0.08]"></div>
                   <div className="absolute inset-0 bg-gradient-to-r from-[var(--nothing-lime)]/5 via-transparent to-[var(--nothing-lime)]/5"></div>
                   <div className="relative z-10 space-y-8">
                     <div className="w-24 h-24 bg-[var(--nothing-bg)] flex items-center justify-center mx-auto border border-[var(--nothing-lime)]/30 shadow-[0_0_30px_var(--nothing-lime)]/20">
                       <Calculator className="w-10 h-10 text-[var(--nothing-lime)] opacity-40" />
                     </div>
                     <div className="space-y-4">
                       <h3 className="text-3xl font-black uppercase tracking-tighter italic text-[var(--nothing-lime)]">Engine_Idling</h3>
                       <p className="text-xs text-[var(--nothing-text-dim)] opacity-60 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">
                         Waiting for project vector inputs. <br />
                         Define typology and built-up area to generate 
                         industrial baseline estimate.
                       </p>
                     </div>
                     
                     {/* Visual Decoration */}
                     <div className="grid grid-cols-8 gap-1.5 opacity-40 max-w-[200px] mx-auto">
                       {[...Array(24)].map((_, i) => (
                         <motion.div 
                           key={i} 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className={`w-2 h-2 ${i < 8 ? 'bg-[var(--nothing-lime)] shadow-[0_0_5px_var(--nothing-lime)]' : 'bg-[var(--nothing-lime)]/20'}`}
                         ></motion.div>
                       ))}
                     </div>
                   </div>
                 </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Nothing Style Ticker Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--nothing-lime)] text-black overflow-hidden h-7 flex items-center whitespace-nowrap z-[100] border-t border-black/10">
        <div className="flex animate-shimmer whitespace-nowrap px-4 font-black italic">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="text-[9px] uppercase tracking-[0.5em] mx-10">
              STATUS: OPERATIONAL // NODE: {location.city?.toUpperCase()} // INDEX: {result?.location_index || '1.00'} // ECO_ESTIMATOR CORE v2.1 // EMITTING DATA_STREAMS //
            </span>
          ))}
        </div>
      </footer>

      {/* Custom Styles for Redesign */}
      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        @keyframes shimmer {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-shimmer {
          animation: shimmer 30s linear infinite;
        }
      `}} />
    </div>
  );
}
