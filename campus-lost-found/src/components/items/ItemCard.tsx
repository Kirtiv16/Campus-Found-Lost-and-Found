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
import type { Item, Location, Filters, Category } from '../../types'
import { categoryLabel } from '../../data/categories'
import { distanceFor } from '../../utils/filterSort'
import { formatItemDate } from '../../utils/formatDate'
import TypeBadge from '../common/TypeBadge'
import StatusPill from '../common/StatusPill'

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

  const formattedDate = formatItemDate(item.dateOccurred)

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
      className={`group relative flex flex-col bg-[#11111a]/80 backdrop-blur-lg rounded-2xl border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-violet-400/40 hover:shadow-[0_14px_40px_rgba(0,0,0,0.28),0_0_24px_rgba(139,92,246,0.08)] overflow-hidden cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 animate-cardIn ${
        highlighted ? 'ring-2 ring-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.2)]' : ''
      }`}
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* Media container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#171720]">
        {!broken ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading={index > 5 ? 'lazy' : 'eager'}
            onError={() => setBroken(true)}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-400 bg-[#171720]/90">
            <CategoryIcon className="w-8 h-8 text-zinc-600 stroke-[1.6]" />
            <span className="text-[11px] font-medium text-zinc-700">{categoryLabel(item.category)}</span>
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
          <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 text-balance group-hover:text-violet-300 transition-colors mb-2">
            {item.title}
          </h3>

          {/* Meta row: category · location · date */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 font-medium text-zinc-700">
              <CategoryIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{categoryLabel(item.category)}</span>
            </span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{location?.name ?? item.locationId}</span>
            </span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Optional distance when nearest sort active */}
          {distance !== null && (
            <div className="mt-2 text-xs font-semibold text-violet-300 tabular-nums flex items-center gap-1">
              <span>{distance.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-white/10">
          {isClaimable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onClaim) onClaim(item)
                else onOpen(item)
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-zinc-900 bg-indigo-600 hover:bg-violet-500 active:bg-violet-600 border border-indigo-500/50 rounded-xl shadow-[0_0_18px_rgba(99,102,241,0.18)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <PackageCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Claim item</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(item)
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-zinc-900 bg-indigo-600 hover:bg-violet-500 active:bg-violet-600 border border-indigo-500/50 rounded-xl shadow-[0_0_18px_rgba(99,102,241,0.18)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
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