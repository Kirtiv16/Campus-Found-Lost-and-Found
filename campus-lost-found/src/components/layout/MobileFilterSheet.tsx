import { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import type { Filters, Location } from '../../types'
import { categories } from '../../data/categories'
import Button from '../common/Button'

interface MobileFilterSheetProps {
  open: boolean
  filters: Filters
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  locations: Location[]
  onClose: () => void
  onReset: () => void
}

export default function MobileFilterSheet({
  open,
  filters,
  update,
  locations,
  onClose,
  onReset,
}: MobileFilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()

      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus first interactive element
    const timer = setTimeout(() => {
      sheetRef.current?.querySelector<HTMLElement>('select, button')?.focus()
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        className="w-full max-h-[88vh] bg-[#11111a] rounded-t-2xl shadow-xl flex flex-col animate-sheetIn overflow-hidden border border-white/10"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-10 h-1.5 bg-zinc-400/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 id="mobile-filter-title" className="text-base font-semibold text-zinc-900">
              Filter items
            </h2>
            <p className="text-xs text-zinc-500">Refine the campus noticeboard</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Category */}
          <div className="space-y-1.5">
            <label htmlFor="m-category" className="block text-xs font-medium text-zinc-700">
              Category
            </label>
            <select
              id="m-category"
              value={filters.category}
              onChange={(e) => update('category', e.target.value as Filters['category'])}
              className="w-full h-11 px-3 text-sm bg-[#171720] border border-white/10 rounded-lg text-zinc-800 focus:bg-[#1c1c28] focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label htmlFor="m-location" className="block text-xs font-medium text-zinc-700">
              Campus location
            </label>
            <select
              id="m-location"
              value={filters.locationId}
              onChange={(e) => update('locationId', e.target.value)}
              className="w-full h-11 px-3 text-sm bg-[#171720] border border-white/10 rounded-lg text-zinc-800 focus:bg-[#1c1c28] focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 cursor-pointer"
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="m-status" className="block text-xs font-medium text-zinc-700">
              Status
            </label>
            <select
              id="m-status"
              value={filters.status}
              onChange={(e) => update('status', e.target.value as Filters['status'])}
              className="w-full h-11 px-3 text-sm bg-[#171720] border border-white/10 rounded-lg text-zinc-800 focus:bg-[#1c1c28] focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 cursor-pointer"
            >
              <option value="">Any status</option>
              <option value="open">Still looking</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <label htmlFor="m-sort" className="block text-xs font-medium text-zinc-700">
              Sort by
            </label>
            <select
              id="m-sort"
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value as Filters['sort'])}
              className="w-full h-11 px-3 text-sm bg-[#171720] border border-white/10 rounded-lg text-zinc-800 focus:bg-[#1c1c28] focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="nearest">Nearest to…</option>
            </select>
          </div>

          {/* Nearest Starting Location (conditional) */}
          {filters.sort === 'nearest' && (
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label htmlFor="m-user-location" className="block text-xs font-medium text-indigo-700">
                Your campus starting point
              </label>
              <select
                id="m-user-location"
                value={filters.userLocationId}
                onChange={(e) => update('userLocationId', e.target.value)}
                className="w-full h-11 px-3 text-sm bg-violet-500/10 border border-violet-300/20 rounded-lg text-zinc-800 focus:bg-[#1c1c28] focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 cursor-pointer"
              >
                <option value="">Choose your location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions with Safe Area Bottom Padding */}
        <div
          className="p-4 border-t border-white/10 bg-[#0b0f17] flex items-center gap-3 shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={onReset}
            icon={<RotateCcw className="w-4 h-4" />}
            className="text-zinc-600 hover:text-zinc-900"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            Apply filters
          </Button>
        </div>
      </div>
    </div>
  )
}