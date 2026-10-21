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
import { ArrowDown, Heart, PackageCheck, Plus, SearchCheck, Sparkles } from 'lucide-react'

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
        <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(ellipse_at_78%_12%,rgba(173,159,208,0.14),transparent_36%),linear-gradient(180deg,#11111a_0%,#0a0a10_100%)]">
          <div className="pointer-events-none absolute -right-24 -top-44 h-[26rem] w-[26rem] rounded-full border border-white/[0.06] sm:right-[8%] sm:top-[-19rem] sm:h-[38rem] sm:w-[38rem]" />
          <div className="pointer-events-none absolute -right-12 -top-32 h-[22rem] w-[22rem] rounded-full border border-white/[0.04] sm:right-[10%] sm:top-[-17rem] sm:h-[34rem] sm:w-[34rem]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.07] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                A little help goes a long way
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-900 text-balance sm:text-5xl lg:text-6xl">
                Lost something?
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-sky-200 bg-clip-text text-transparent">
                  Let’s get it back.
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-500 sm:text-lg">
                Your campus community is looking out for you. Browse recent posts or help reunite
                someone with an item you found.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#noticeboard"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#11111a]"
                >
                  Browse the board
                  <ArrowDown className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPostOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-zinc-700 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                >
                  <Plus className="h-4 w-4" />
                  Post an item
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2rem] bg-indigo-400/[0.08] blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151c]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.08] text-indigo-200">
                      <SearchCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Community board</p>
                      <p className="mt-0.5 text-xs text-zinc-500">A little closer to found</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-300/[0.06] px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <p className="text-xs font-medium text-zinc-500">Items shared</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                      {loading ? '—' : items.length}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">on your campus board</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300/[0.09] bg-emerald-300/[0.035] p-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                      <PackageCheck className="h-3.5 w-3.5" />
                      Still looking
                    </div>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                      {loading ? '—' : items.filter((item) => item.status === 'open').length}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">ready for a helping hand</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-300/[0.08] text-sky-300">
                    <Heart className="h-4 w-4" />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Every post brings a lost item one step closer to home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Noticeboard Section */}
        <section id="noticeboard" ref={boardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-32">
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