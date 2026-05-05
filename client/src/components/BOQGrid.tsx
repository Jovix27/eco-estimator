/**
 * Inline-editable BOQ grid, trade-grouped.
 * Cells become inputs on click. Changes are sent to the API on blur.
 */
import { useState, useRef, useCallback } from 'react'
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
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-xs border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0d1f1a]">
            {['No.', 'Trade', 'Description', 'Unit', 'Qty', 'Rate (₹)', 'Amount (₹)', 'Mat. (₹)', 'Lab. (₹)', 'Equip. (₹)'].map(h => (
              <th key={h} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 first:w-12 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map(tg => {
            const color = TRADE_COLORS[tg.trade] ?? '#10b981'
            return (
              <>
                {/* Trade header */}
                <tr key={`h-${tg.trade}`} style={{ backgroundColor: color + '18' }}>
                  <td colSpan={6} className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider" style={{ color }}>
                    {tg.trade}
                    <span className="ml-2 text-[10px] font-normal text-gray-500">{tg.items.length} items</span>
                  </td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color }}>
                    {INR(tg.subtotal)}
                  </td>
                  <td colSpan={3} />
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
                      className={`border-b border-white/5 transition-colors ${isOdd ? 'bg-white/[0.015]' : ''} hover:bg-primary-900/10`}
                    >
                      {/* No. */}
                      <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {item.item_no}
                          {item.is_manual && (
                            <span className="text-yellow-400" title="Manually edited">
                              <Pencil size={9} />
                            </span>
                          )}
                          {isSaving && <RefreshCw size={9} className="animate-spin text-primary-400" />}
                          {hasError && <AlertCircle size={9} className="text-red-400" title={errors[item.id]} />}
                          {!isSaving && !hasError && item.is_manual && <CheckCircle size={9} className="text-primary-500" />}
                        </div>
                      </td>

                      {/* Trade */}
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{item.trade}</td>

                      {/* Description */}
                      <td className="px-3 py-2 text-gray-300 leading-relaxed max-w-xs">
                        <span title={item.description}>{item.description}</span>
                      </td>

                      {/* Unit */}
                      <td className="px-3 py-2 text-gray-400 whitespace-nowrap font-mono">{item.unit}</td>

                      {/* Qty — editable */}
                      <td className="px-1 py-1 text-right whitespace-nowrap">
                        {isEditing && editing?.field === 'quantity' ? (
                          <input
                            ref={inputRef}
                            type="number"
                            step="any"
                            className="w-24 bg-primary-900/30 border border-primary-500 rounded px-2 py-1 text-right text-xs focus:outline-none font-mono"
                            value={editing.value}
                            onChange={e => setEditing(ed => ed ? { ...ed, value: e.target.value } : null)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                          />
                        ) : (
                          <button
                            className="px-2 py-1 rounded hover:bg-white/10 font-mono text-right w-full transition-colors"
                            onClick={() => startEdit(item, 'quantity')}
                            title="Click to edit quantity"
                          >
                            {num(item.quantity)}
                          </button>
                        )}
                      </td>

                      {/* Rate — editable */}
                      <td className="px-1 py-1 text-right whitespace-nowrap">
                        {isEditing && editing?.field === 'rate' ? (
                          <input
                            ref={inputRef}
                            type="number"
                            step="any"
                            className="w-28 bg-primary-900/30 border border-primary-500 rounded px-2 py-1 text-right text-xs focus:outline-none font-mono"
                            value={editing.value}
                            onChange={e => setEditing(ed => ed ? { ...ed, value: e.target.value } : null)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                          />
                        ) : (
                          <button
                            className="px-2 py-1 rounded hover:bg-white/10 font-mono text-right w-full transition-colors"
                            onClick={() => startEdit(item, 'rate')}
                            title="Click to edit rate"
                          >
                            {INR(item.rate)}
                          </button>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 text-right font-semibold text-white whitespace-nowrap">
                        {INR(item.amount)}
                      </td>

                      {/* Material */}
                      <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                        {INR(item.material_rate * item.quantity)}
                      </td>

                      {/* Labour */}
                      <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                        {INR(item.labor_rate * item.quantity)}
                      </td>

                      {/* Equipment */}
                      <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                        {INR(item.equipment_rate * item.quantity)}
                      </td>
                    </tr>
                  )
                })}
              </>
            )
          })}

          {/* Grand total */}
          <tr className="bg-[#0d1f1a] border-t-2 border-primary-900">
            <td colSpan={6} className="px-3 py-3 font-black text-sm text-primary-300 uppercase tracking-wider">
              Total Direct Cost
            </td>
            <td className="px-3 py-3 text-right font-black text-sm text-primary-300">
              {INR(totalDirectCost)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
      <p className="text-[10px] text-gray-600 text-right px-4 py-2">
        Click any <span className="text-gray-500">Qty</span> or <span className="text-gray-500">Rate</span> cell to edit inline. Changes save automatically.
      </p>
    </div>
  )
}
