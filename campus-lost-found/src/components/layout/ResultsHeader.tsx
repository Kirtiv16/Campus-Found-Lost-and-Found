import { MapPin, X } from 'lucide-react'
import type { Filters, Location } from '../../types'
import { categoryLabel } from '../../data/categories'

interface ResultsHeaderProps {
  count: number
  filters: Filters
  locations: Location[]
  onRemove: (key: keyof Filters) => void
  onClear: () => void
  onUpdate: (key: keyof Filters, value: any) => void
}

export default function ResultsHeader({
  count,
  filters,
  locations,
  onRemove,
  onClear,
  onUpdate,
}: ResultsHeaderProps) {
  const chips: { key: keyof Filters; label: string }[] = []
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”` })
  if (filters.category) chips.push({ key: 'category', label: categoryLabel(filters.category) })
  if (filters.locationId)
    chips.push({
      key: 'locationId',
      label: locations.find((l) => l.id === filters.locationId)?.name ?? filters.locationId,
    })
  if (filters.status)
    chips.push({
      key: 'status',
      label:
        filters.status === 'open'
          ? 'Still looking'
          : filters.status[0].toUpperCase() + filters.status.slice(1),
    })
  if (filters.sort === 'nearest' && filters.userLocationId)
    chips.push({
      key: 'userLocationId',
      label: `Near ${locations.find((l) => l.id === filters.userLocationId)?.name ?? filters.userLocationId}`,
    })

  return (
    <div className="pt-6 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Recently posted
          </h2>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <p
            className="text-xs sm:text-sm text-zinc-600"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong className="text-base sm:text-lg font-semibold text-zinc-900 tabular-nums">
              {count}
            </strong>{' '}
            {count === 1 ? 'item' : 'items'} found
          </p>

          {filters.sort === 'nearest' && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-[#11111a] px-2.5 py-1 rounded-lg border border-white/10 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Near:</span>
              <select
                aria-label="Nearest sort starting location"
                value={filters.userLocationId}
                onChange={(e) => onUpdate('userLocationId', e.target.value)}
                className="bg-transparent font-medium text-violet-300 hover:text-violet-200 focus:outline-none focus:ring-1 focus:ring-violet-400 rounded px-1 py-0.5 text-xs cursor-pointer max-w-[160px] truncate"
              >
                <option value="">Choose campus location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-zinc-200/60">
          <span className="text-xs text-zinc-400 font-medium">Active filters:</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemove(chip.key)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-200 border border-violet-300/20 hover:bg-violet-500/20 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <span>{chip.label}</span>
              <X className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700 transition-colors" />
              <span className="sr-only">Remove {chip.label} filter</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 underline underline-offset-2 ml-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}