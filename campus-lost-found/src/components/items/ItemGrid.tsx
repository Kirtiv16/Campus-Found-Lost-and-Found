import type { Item, Location, Filters } from '../types'
import ItemCard from './ItemCard'
import ItemCardSkeleton from './ItemCardSkeleton'

interface ItemGridProps {
  items: Item[]
  loading: boolean
  locations: Location[]
  filters: Filters
  onOpen: (item: Item) => void
  onClaim?: (item: Item) => void
  highlightedId: string
}

export default function ItemGrid({
  items,
  loading,
  locations,
  filters,
  onOpen,
  onClaim,
  highlightedId,
}: ItemGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6"
        aria-label="Loading items"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          location={locations.find((l) => l.id === item.locationId)}
          index={index}
          filters={filters}
          locations={locations}
          onOpen={onOpen}
          onClaim={onClaim}
          highlighted={item.id === highlightedId}
        />
      ))}
    </div>
  )
}