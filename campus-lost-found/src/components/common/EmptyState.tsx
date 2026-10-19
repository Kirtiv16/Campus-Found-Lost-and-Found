import { SearchX, PackageOpen, Plus, RotateCcw, AlertTriangle, X } from 'lucide-react'
import type { Filters, Location } from '../types'
import { categoryLabel } from '../data/categories'
import Button from './ui/Button'

interface EmptyStateProps {
  kind: 'fresh' | 'filtered' | 'error'
  onPost?: () => void
  onClear?: () => void
  onRetry?: () => void
  filters?: Filters
  locations?: Location[]
  onRemoveFilter?: (key: keyof Filters) => void
}

export default function EmptyState({
  kind,
  onPost,
  onClear,
  onRetry,
  filters,
  locations,
  onRemoveFilter,
}: EmptyStateProps) {
  // If filtered, build chips
  const chips: { key: keyof Filters; label: string }[] = []
  if (kind === 'filtered' && filters) {
    if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”` })
    if (filters.category) chips.push({ key: 'category', label: categoryLabel(filters.category) })
    if (filters.locationId && locations)
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
  }

  if (kind === 'error') {
    return (
      <div className="min-h-[380px] bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Couldn’t load the noticeboard</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-1.5 mb-6 leading-relaxed">
          We encountered an issue fetching items. Please check your connection and try again.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry ?? (() => window.location.reload())}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (kind === 'fresh') {
    return (
      <div className="min-h-[380px] bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Nothing posted yet</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-1.5 mb-6 leading-relaxed">
          Be the first to help a classmate find their missing item or report something found.
        </p>
        {onPost && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPost}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Post the first item
          </Button>
        )}
      </div>
    )
  }

  // Filtered empty state
  return (
    <div className="min-h-[380px] bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 tracking-tight">No matches found</h3>
      <p className="text-sm text-zinc-500 max-w-sm mt-1.5 mb-5 leading-relaxed">
        Try adjusting your search terms or clearing some filters to see more items.
      </p>

      {/* Active chip pills in empty state */}
      {chips.length > 0 && onRemoveFilter && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemoveFilter(chip.key)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer group"
            >
              <span>{chip.label}</span>
              <X className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700" />
            </button>
          ))}
        </div>
      )}

      {onClear && (
        <Button
          variant="primary"
          size="lg"
          onClick={onClear}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}