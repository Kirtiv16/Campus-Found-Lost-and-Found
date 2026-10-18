import { useMemo, useState, useCallback, useRef } from 'react'
import locationsData from './data/locations.json'
import type { Item, Location, Filters } from './types'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useFilters, initialFilters } from './hooks/useFilters'
import { useItems } from './hooks/useItems'
import { filterAndSortItems } from './lib/filterSort'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ResultsHeader from './components/ResultsHeader'
import ItemGrid from './components/ItemGrid'
import EmptyState from './components/EmptyState'
import ItemDetailModal from './components/ItemDetailModal'
import PostItemModal from './components/PostItemModal'
import MobileFilterSheet from './components/MobileFilterSheet'
import ClaimConfirmModal from './components/ClaimConfirmModal'
import Toast from './components/Toast'
import Button from './components/ui/Button'
import { Plus, Heart, SearchCheck, CheckCircle2, ShieldCheck } from 'lucide-react'

const locations = locationsData as Location[]

export default function App() {
  const [toast, setToast] = useState('')
  const notify = useCallback((message: string) => setToast(message), [])
  const { items, loading, add, claim } = useItems(notify)
  const { filters, setFilters, update, reset } = useFilters()
  const debouncedQuery = useDebouncedValue(filters.q, 300)
  const effectiveFilters = useMemo(
    () => ({ ...filters, q: debouncedQuery }),
    [filters, debouncedQuery]
  )
  const visibleItems = useMemo(
    () => filterAndSortItems(items, effectiveFilters, locations),
    [items, effectiveFilters]
  )

  const [selected, setSelected] = useState<Item | null>(null)
  const [claimTarget, setClaimTarget] = useState<Item | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState('')

  const boardRef = useRef<HTMLDivElement>(null)
  const searching = filters.q !== debouncedQuery

  const removeFilter = (key: keyof Filters) =>
    setFilters(
      (current) =>
        ({
          ...current,
          [key]: key === 'sort' ? 'newest' : key === 'userLocationId' ? '' : '',
        } as Filters)
    )

  const clearFilters = () => setFilters(initialFilters)

  const submitItem = async (item: Item) => {
    const created = await add(item)
    setPostOpen(false)
    setFilters(initialFilters)
    setHighlightedId(created.id)
    notify('Your item is on the board. Thanks for helping out!')
    window.setTimeout(() => setHighlightedId(''), 3000)
  }

  const handleClaimRequest = (item: Item) => {
    setClaimTarget(item)
  }

  const confirmClaim = async () => {
    if (!claimTarget) return
    setIsClaiming(true)
    try {
      await claim(claimTarget)
      setSelected((current) =>
        current?.id === claimTarget.id ? { ...current, status: 'claimed' } : current
      )
      notify('Marked as claimed. Thanks for helping this item find its way home!')
      setClaimTarget(null)
    } catch {
      notify('We couldn’t update that item. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header onPost={() => setPostOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/70 to-zinc-50">
          {/* Subtle dot pattern background */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Hero copy */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-200/90 shadow-xs text-zinc-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tracking-wide uppercase text-[11px] text-zinc-600">
                    Your campus, looking out for you
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.15] text-balance">
                  Lost things.{' '}
                  <span className="text-indigo-600 block sm:inline">Found community.</span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                  That missing water bottle, your favourite hoodie, or the student ID you need for class. Let’s get it back into your hands.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setPostOpen(true)}
                    icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                    className="shadow-sm hover:shadow"
                  >
                    Post a lost or found item
                  </Button>

                  <div className="flex items-center gap-2.5 text-xs text-zinc-500 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-zinc-200/70 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Free &amp; open to all campus members</span>
                  </div>
                </div>
              </div>

              {/* Right Hero visual preview card */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end" aria-hidden="true">
                <div className="relative w-full max-w-md">
                  {/* Decorative backdrop glow */}
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500/10 via-sky-500/10 to-emerald-500/10 rounded-3xl blur-lg" />

                  {/* Clean preview card */}
                  <div className="relative bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-md space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100">
                      <img
                        src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80"
                        alt="Preview item"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-sky-50/95 text-sky-700 border border-sky-200/90 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs">
                        Found
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-emerald-50/95 text-emerald-700 border border-emerald-200/90 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
                        Still looking
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Hydro Flask Wide Mouth (Olive)
                        </p>
                        <p className="text-[11px] text-zinc-500">Found near Student Union Lounge</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                        Safe with security
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Noticeboard Section */}
        <section ref={boardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Sticky Filter Bar */}
          <FilterBar
            filters={filters}
            update={update}
            locations={locations}
            searching={searching}
            onMobileFilters={() => setFiltersOpen(true)}
            onReset={clearFilters}
          />

          {/* Results Summary & Chips */}
          <ResultsHeader
            count={loading ? 0 : visibleItems.length}
            filters={filters}
            locations={locations}
            onRemove={removeFilter}
            onClear={clearFilters}
            onUpdate={update}
          />

          {/* Grid or Empty States */}
          {!loading && visibleItems.length === 0 ? (
            <EmptyState
              kind={items.length === 0 ? 'fresh' : 'filtered'}
              filters={effectiveFilters}
              locations={locations}
              onPost={() => setPostOpen(true)}
              onClear={clearFilters}
              onRemoveFilter={removeFilter}
            />
          ) : (
            <ItemGrid
              items={visibleItems}
              loading={loading}
              locations={locations}
              filters={effectiveFilters}
              onOpen={setSelected}
              onClaim={handleClaimRequest}
              highlightedId={highlightedId}
            />
          )}

          {/* Board footer community reminder */}
          {!loading && visibleItems.length > 0 && (
            <div className="mt-12 pt-6 border-t border-zinc-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 text-center sm:text-left">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span>Good things happen when classmates look out for each other.</span>
              </span>
              <span className="text-zinc-400">Campus Found · Real-time lost &amp; found board</span>
            </div>
          )}
        </section>
      </main>

      {/* Site Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <SearchCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-zinc-800">campusfound</span>
          </div>
          <p className="text-center sm:text-left">
            Campus Lost &amp; Found · Designed for speed, privacy, and community care.
          </p>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Made with care</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ItemDetailModal
        item={selected}
        location={locations.find((l) => l.id === selected?.locationId)}
        onClose={() => setSelected(null)}
        onClaim={handleClaimRequest}
      />

      <ClaimConfirmModal
        item={claimTarget}
        open={Boolean(claimTarget)}
        onClose={() => setClaimTarget(null)}
        onConfirm={confirmClaim}
        isSubmitting={isClaiming}
      />

      <PostItemModal
        open={postOpen}
        locations={locations}
        onClose={() => setPostOpen(false)}
        onSubmit={submitItem}
      />

      <MobileFilterSheet
        open={filtersOpen}
        filters={filters}
        update={update}
        locations={locations}
        onClose={() => setFiltersOpen(false)}
        onReset={clearFilters}
      />

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}