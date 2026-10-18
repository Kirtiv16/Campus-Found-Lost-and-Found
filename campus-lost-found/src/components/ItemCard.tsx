import { useState } from 'react'
import {
  CalendarDays,
  MapPin,
  ArrowUpRight,
  PackageCheck,
  Tag,
  Laptop,
  CreditCard,
  BookOpen,
  Shirt,
  Key,
  Watch,
  Package,
} from 'lucide-react'
import type { Item, Location, Filters, Category } from '../types'
import { categoryLabel } from '../data/categories'
import { distanceFor } from '../lib/filterSort'
import TypeBadge from './TypeBadge'
import StatusPill from './StatusPill'

interface ItemCardProps {
  item: Item
  location?: Location
  index: number
  filters: Filters
  locations: Location[]
  onOpen: (item: Item) => void
  onClaim?: (item: Item) => void
  highlighted?: boolean
}

const categoryIcons: Record<Category, React.ComponentType<{ className?: string }>> = {
  electronics: Laptop,
  'id-card': CreditCard,
  books: BookOpen,
  clothing: Shirt,
  keys: Key,
  accessories: Watch,
  other: Package,
}

export default function ItemCard({
  item,
  location,
  index,
  filters,
  locations,
  onOpen,
  onClaim,
  highlighted,
}: ItemCardProps) {
  const [broken, setBroken] = useState(!item.imageUrl)
  const distance =
    filters.sort === 'nearest' && filters.userLocationId
      ? distanceFor(item, filters, locations)
      : null

  const CategoryIcon = categoryIcons[item.category] || Tag
  const isClaimable = item.type === 'found' && item.status === 'open'

  const formattedDate = new Date(item.dateOccurred + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(item)
        }
      }}
      aria-label={`View ${item.title}, ${item.type} item`}
      className={`group relative flex flex-col bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 ease-out overflow-hidden cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 animate-cardIn ${
        highlighted ? 'ring-2 ring-indigo-500 shadow-md' : ''
      }`}
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* Media container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {!broken ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading={index > 5 ? 'lazy' : 'eager'}
            onError={() => setBroken(true)}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-400 bg-zinc-50/80">
            <CategoryIcon className="w-8 h-8 text-zinc-300 stroke-[1.6]" />
            <span className="text-[11px] font-medium text-zinc-500">{categoryLabel(item.category)}</span>
          </div>
        )}

        {/* Badges overlaid on image */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <TypeBadge type={item.type} />
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <StatusPill status={item.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title with 2-line clamp */}
          <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 text-balance group-hover:text-indigo-600 transition-colors mb-2.5">
            {item.title}
          </h3>

          {/* Meta row: category · location · date */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1 font-medium text-zinc-600">
              <CategoryIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{categoryLabel(item.category)}</span>
            </span>
            <span className="text-zinc-300 font-normal">·</span>
            <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{location?.name ?? item.locationId}</span>
            </span>
            <span className="text-zinc-300 font-normal">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Optional distance when nearest sort active */}
          {distance !== null && (
            <div className="mt-2 text-xs font-semibold text-indigo-600 tabular-nums flex items-center gap-1">
              <span>{distance.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          {isClaimable ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onClaim) onClaim(item)
                  else onOpen(item)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200/90 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <PackageCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Claim</span>
              </button>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-indigo-600 transition-colors inline-flex items-center gap-0.5">
                Details
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(item)
              }}
              className="w-full inline-flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-zinc-600 group-hover:text-indigo-600 group-hover:bg-indigo-50/50 bg-zinc-50 border border-zinc-200/70 rounded-lg transition-colors cursor-pointer"
            >
              <span>View details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}