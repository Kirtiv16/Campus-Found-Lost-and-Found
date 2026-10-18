import { Loader2, Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import type { Filters, Location } from '../types'
import { categories } from '../data/categories'

interface FilterBarProps {
  filters: Filters
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  locations: Location[]
  searching: boolean
  onMobileFilters: () => void
  onReset?: () => void
}

export default function FilterBar({
  filters,
  update,
  locations,
  searching,
  onMobileFilters,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.category ||
      filters.locationId ||
      filters.status ||
      filters.sort !== 'newest' ||
      filters.userLocationId
  )

  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      update('q', '')
      update('category', '')
      update('locationId', '')
      update('status', '')
      update('sort', 'newest')
      update('userLocationId', '')
    }
  }

  return (
    <div className="sticky top-16 z-20 -mx-4 px-4 pt-3 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[#0a0a10]/85 backdrop-blur-md border-b border-zinc-200/60">
      <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap">
        {/* Search input with leading icon, spinner, and clear button */}
        <div className="relative flex-1 basis-[280px] min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <label htmlFor="search-input" className="sr-only">
            Search items, locations, or people
          </label>
          <input
            id="search-input"
            type="search"
            value={filters.q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Search items, places, people…"
            className="w-full h-10 pl-9 pr-9 text-sm bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white text-zinc-900 placeholder:text-zinc-400 border border-zinc-200/90 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {searching ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" aria-label="Searching…" />
            ) : filters.q ? (
              <button
                type="button"
                onClick={() => update('q', '')}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile filter trigger button */}
        <button
          type="button"
          onClick={onMobileFilters}
          className="lg:hidden relative inline-flex items-center gap-2 h-10 px-3 text-xs sm:text-sm font-medium bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-label="Open filter settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"
              aria-label="Filters active"
            />
          )}
        </button>

        {/* Desktop Filter Selects */}
        <div className="hidden lg:flex flex-wrap items-center gap-2.5 xl:flex-nowrap">
          {/* Category */}
          <div className="relative">
            <label htmlFor="category-select" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-select"
              value={filters.category}
              onChange={(e) => update('category', e.target.value as Filters['category'])}
              className="h-10 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/90 rounded-lg pl-3 pr-8 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer transition-colors"
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
          <div className="relative">
            <label htmlFor="location-select" className="sr-only">
              Filter by location
            </label>
            <select
              id="location-select"
              value={filters.locationId}
              onChange={(e) => update('locationId', e.target.value)}
              className="h-10 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/90 rounded-lg pl-3 pr-8 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer transition-colors max-w-[170px] truncate"
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
          <div className="relative">
            <label htmlFor="status-select" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-select"
              value={filters.status}
              onChange={(e) => update('status', e.target.value as Filters['status'])}
              className="h-10 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/90 rounded-lg pl-3 pr-8 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer transition-colors"
            >
              <option value="">Any status</option>
              <option value="open">Still looking</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">
              Sort items
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value as Filters['sort'])}
              className="h-10 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/90 rounded-lg pl-3 pr-8 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer transition-colors"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="nearest">Nearest to…</option>
            </select>
          </div>

          {/* Reset Ghost Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}