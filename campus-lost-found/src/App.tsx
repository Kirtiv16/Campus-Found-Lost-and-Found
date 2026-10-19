import { useMemo, useState, useCallback, useRef } from 'react'
import locationsData from './data/locations.json'
import type { Item, Location, Filters } from './types'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useFilters, initialFilters } from './hooks/useFilters'
import { useItems } from './hooks/useItems'
import { filterAndSortItems } from './utils/filterSort'
import Header from './components/layout/Header'
import HeroSection from './components/layout/HeroSection'
import FilterBar from './components/layout/FilterBar'
import ResultsHeader from './components/layout/ResultsHeader'
import Footer from './components/layout/Footer'
import ItemGrid from './components/items/ItemGrid'
import EmptyState from './components/common/EmptyState'
import ItemDetailModal from './components/items/ItemDetailModal'
import PostItemModal from './components/items/PostItemModal'
import MobileFilterSheet from './components/layout/MobileFilterSheet'
import ClaimConfirmModal from './components/items/ClaimConfirmModal'
import Toast from './components/common/Toast'
import { Heart } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-zinc-900 selection:bg-violet-500/30 selection:text-[#fff]">
      <Header onPost={() => setPostOpen(true)} />

      <main className="flex-1">
        <HeroSection />

        {/* Noticeboard Section */}
        <section id="noticeboard" ref={boardRef} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 text-center sm:text-left">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span>Good things happen when classmates look out for each other.</span>
              </span>
              <span className="text-zinc-500">Campus Found · Real-time lost &amp; found board</span>
            </div>
          )}
        </section>
      </main>

      <Footer />

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