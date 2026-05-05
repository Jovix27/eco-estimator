/**
 * Inline-editable BOQ grid, trade-grouped.
 * Cells become inputs on click. Changes are sent to the API on blur.
 */
import React, { useState, useRef, useCallback } from 'react'
import { RefreshCw, Pencil, CheckCircle, AlertCircle } from 'lucide-react'
import { boqApi, type TradeGroup, type BOQItem } from '../lib/api'

interface Props {
  projectId: string
  trades: TradeGroup[]
  totalDirectCost: number
  onUpdate: (trades: TradeGroup[], total: number) => void
}

interface CellState {
  itemId: string
  field: 'quantity' | 'rate'
  value: string
}

const INR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const num = (n: number, d = 3) => n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: d })

export default function BOQGrid({ projectId, trades, totalDirectCost, onUpdate }: Props) {
  const [editing, setEditing] = useState<CellState | null>(null)
  const [saving, setSaving] = useState<string | null>(null)   // item id
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (item: BOQItem, field: 'quantity' | 'rate') => {
    setEditing({ itemId: item.id, field, value: String(item[field]) })
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = useCallback(async () => {
    if (!editing) return
    const val = parseFloat(editing.value)
    if (isNaN(val) || val < 0) {
      setEditing(null)
      return
    }

    setSaving(editing.itemId)
    setErrors(e => { const n = { ...e }; delete n[editing.itemId]; return n })
    const prevEditing = editing
    setEditing(null)

    try {
      const patch = prevEditing.field === 'quantity' ? { quantity: val } : { rate: val }
      const { item } = await boqApi.updateItem(projectId, prevEditing.itemId, patch)

      // Update local state
      const newTrades = trades.map(tg => ({
        ...tg,
        items: tg.items.map(i => i.id === prevEditing.itemId ? { ...i, ...item } : i),
        subtotal: tg.items.reduce((s, i) => {
          const updated = i.id === prevEditing.itemId ? item : i
          return s + updated.amount
        }, 0),
      }))
      const newTotal = newTrades.reduce((s, tg) => s + tg.subtotal, 0)
      onUpdate(newTrades, Math.round(newTotal * 100) / 100)
    } catch (err: any) {
      setErrors(e => ({ ...e, [prevEditing.itemId]: err.message }))
    } finally {
      setSaving(null)
    }
  }, [editing, projectId, trades, onUpdate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(null)
  }

  const TRADE_COLORS: Record<string, string> = {
    'Site Work': '#10b981',
    'Foundation': '#f59e0b',
    'Plinth': '#8b5cf6',
    'Superstructure': '#3b82f6',
    'Masonry': '#ec4899',
    'Plastering': '#14b8a6',
    'Flooring': '#f97316',
    'Doors & Windows': '#a78bfa',
    'Waterproofing': '#06b6d4',
    'Painting': '#84cc16',
    'Electrical': '#fbbf24',
    'Plumbing': '#38bdf8',
  }

  return (
    <div className="industrial-card border-nothing-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-nothing-text/[0.03] border-b border-nothing-border">
              {['Index', 'Typology', 'Specification_Vector', 'Unit', 'Qty_Node', 'Rate_Inr', 'Total_Inr', 'Mat_Dist', 'Lab_Dist', 'Eqp_Dist'].map(h => (
                <th key={h} className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-nothing-text-muted/40 border-r border-nothing-border/50 last:border-r-0 first:w-16">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {trades.map(tg => {
            const color = TRADE_COLORS[tg.trade] ?? 'var(--nothing-lime)'
            return (
              <React.Fragment key={`trade-${tg.trade}`}>
                {/* Trade header */}
                <tr className="bg-nothing-text/[0.01] border-b border-nothing-border/50">
                  <td colSpan={6} className="px-4 py-3 font-black text-[10px] uppercase tracking-[0.3em] border-r border-nothing-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5" style={{ backgroundColor: color }}></div>
                      <span style={{ color }}>{tg.trade}</span>
                      <span className="text-nothing-text-muted/20 italic">// {tg.items.length}_NODES</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-nothing-lime italic border-r border-nothing-border/50 bg-nothing-lime/5">
                    {INR(tg.subtotal)}
                  </td>
                  <td colSpan={3} className="border-nothing-border/50" />
                </tr>

                {/* Items */}
                {tg.items.map((item, idx) => {
                  const isEditing = editing?.itemId === item.id
                  const isSaving = saving === item.id
                  const hasError = !!errors[item.id]
                  const isOdd = idx % 2 === 0

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-nothing-border/20 transition-colors group ${isOdd ? 'bg-nothing-text/[0.005]' : 'bg-transparent'} hover:bg-nothing-lime/5`}
                    >
                      {/* No. */}
                      <td className="px-4 py-3 font-black text-nothing-text-muted/30 whitespace-nowrap border-r border-nothing-border/50 group-hover:text-nothing-lime/60 transition-colors">
                        <div className="flex items-center gap-2">
                          {item.item_no}
                          {item.is_manual && (
                            <span className="text-nothing-lime" title="Override Active">
                              <Pencil size={8} />
                            </span>
                          )}
                          {isSaving && <RefreshCw size={8} className="animate-spin text-nothing-lime" />}
                          {hasError && <AlertCircle size={8} className="text-rose-500" title={errors[item.id]} />}
                        </div>
                      </td>

                      {/* Trade */}
                      <td className="px-4 py-3 text-nothing-text-muted/20 font-black uppercase tracking-tighter whitespace-nowrap border-r border-nothing-border/50">{item.trade}</td>

                      {/* Description */}
                      <td className="px-4 py-3 text-nothing-text-muted leading-relaxed max-w-sm border-r border-nothing-border/50 group-hover:text-nothing-text transition-colors">
                        <span title={item.description} className="line-clamp-2">{item.description}</span>
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3 text-nothing-text-muted/30 whitespace-nowrap font-black uppercase border-r border-nothing-border/50">{item.unit}</td>

                      {/* Qty — editable */}
                      <td className="px-1 py-1 text-right whitespace-nowrap border-r border-nothing-border/50">
                        {isEditing && editing?.field === 'quantity' ? (
                          <input
                            ref={inputRef}
                            type="number"
                            step="any"
                            className="w-24 bg-nothing-bg-muted border border-nothing-lime/40 px-2 py-2 text-right text-[10px] font-black focus:outline-none text-nothing-lime"
                            value={editing.value}
                            onChange={e => setEditing(ed => ed ? { ...ed, value: e.target.value } : null)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                          />
                        ) : (
                          <button
                            className="px-4 py-3 hover:bg-nothing-lime/10 font-black text-right w-full transition-all group-hover:text-nothing-lime"
                            onClick={() => startEdit(item, 'quantity')}
                          >
                            {num(item.quantity)}
                          </button>
                        )}
                      </td>

                      {/* Rate — editable */}
                      <td className="px-1 py-1 text-right whitespace-nowrap border-r border-nothing-border/50">
                        {isEditing && editing?.field === 'rate' ? (
                          <input
                            ref={inputRef}
                            type="number"
                            step="any"
                            className="w-28 bg-nothing-bg-muted border border-nothing-lime/40 px-2 py-2 text-right text-[10px] font-black focus:outline-none text-nothing-lime"
                            value={editing.value}
                            onChange={e => setEditing(ed => ed ? { ...ed, value: e.target.value } : null)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                          />
                        ) : (
                          <button
                            className="px-4 py-3 hover:bg-nothing-lime/10 font-black text-right w-full transition-all group-hover:text-nothing-lime"
                            onClick={() => startEdit(item, 'rate')}
                          >
                            {INR(item.rate)}
                          </button>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-black text-nothing-lime whitespace-nowrap border-r border-nothing-border/50 italic">
                        {INR(item.amount)}
                      </td>

                      {/* Material */}
                      <td className="px-4 py-3 text-right text-nothing-text-muted/30 font-black whitespace-nowrap border-r border-nothing-border/50">
                        {INR(item.material_rate * item.quantity)}
                      </td>

                      {/* Labour */}
                      <td className="px-4 py-3 text-right text-nothing-text-muted/30 font-black whitespace-nowrap border-r border-nothing-border/50">
                        {INR(item.labor_rate * item.quantity)}
                      </td>

                      {/* Equipment */}
                      <td className="px-4 py-3 text-right text-nothing-text-muted/30 font-black whitespace-nowrap">
                        {INR(item.equipment_rate * item.quantity)}
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            )
          })}

          {/* Grand total */}
          <tr className="bg-nothing-text/[0.03] border-t-2 border-nothing-border">
            <td colSpan={6} className="px-4 py-6 font-black text-xs text-nothing-text uppercase tracking-[0.4em]">
              Total_Direct_Production_Vector
            </td>
            <td className="px-4 py-6 text-right font-black text-2xl text-nothing-lime italic tracking-tighter">
              {INR(totalDirectCost)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-6 py-4 bg-nothing-text/[0.02] border-t border-nothing-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-nothing-lime"></div>
            <span className="text-[8px] font-black text-nothing-text-muted/30 uppercase tracking-widest italic">// Vector_Audit_System_Active</span>
          </div>
        </div>
        <p className="text-[9px] font-black text-nothing-text-muted/30 uppercase tracking-[0.2em] italic">
          Double_Tap <span className="text-nothing-text-muted/60 italic">[Qty/Rate]</span> nodes to trigger manual override.
        </p>
      </div>
    </div>
  )
}
