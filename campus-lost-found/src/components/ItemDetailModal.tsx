import { useEffect, useRef, useState } from 'react'
import {
  X,
  MapPin,
  CalendarDays,
  Mail,
  UserRound,
  PackageCheck,
  ShieldCheck,
  Tag,
  Laptop,
  CreditCard,
  BookOpen,
  Shirt,
  Key,
  Watch,
  Package,
} from 'lucide-react'
import type { Item, Location, Category } from '../types'
import { categoryLabel } from '../data/categories'
import TypeBadge from './TypeBadge'
import StatusPill from './StatusPill'
import Button from './ui/Button'

interface ItemDetailModalProps {
  item: Item | null
  location?: Location
  onClose: () => void
  onClaim: (item: Item) => void
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

export default function ItemDetailModal({
  item,
  location,
  onClose,
  onClaim,
}: ItemDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    if (!item) return
    setBroken(!item.imageUrl)

    const prevActiveElement = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus close button initially
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
      prevActiveElement?.focus()
    }
  }, [item?.id, onClose])

  if (!item) return null

  const CategoryIcon = categoryIcons[item.category] || Tag
  const isClaimable = item.type === 'found' && item.status === 'open'
  const formattedDate = new Date(item.dateOccurred + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row relative animate-modalIn"
      >
        {/* Floating close button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close item details"
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media column (left on desktop, top on mobile) */}
        <div className="relative w-full md:w-5/12 h-64 sm:h-72 md:h-auto min-h-[240px] bg-zinc-100 shrink-0 overflow-hidden flex items-center justify-center">
          {!broken ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setBroken(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-zinc-400 bg-zinc-50">
              <CategoryIcon className="w-12 h-12 text-zinc-300 stroke-[1.5]" />
              <span className="text-xs font-medium text-zinc-500">{categoryLabel(item.category)}</span>
            </div>
          )}

          {/* Type Badge on image */}
          <div className="absolute top-3 left-3 z-10">
            <TypeBadge type={item.type} />
          </div>
        </div>

        {/* Content column (right on desktop, bottom on mobile) */}
        <div className="p-6 md:p-7 flex-1 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header row with category and status */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {categoryLabel(item.category)}
              </span>
              <StatusPill status={item.status} />
            </div>

            {/* Title */}
            <h2
              id="detail-title"
              className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 leading-snug text-balance"
            >
              {item.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-zinc-600 leading-relaxed mt-3 break-words">
              {item.description || 'No extra details were provided for this item.'}
            </p>

            {/* Semantic definition list */}
            <dl className="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-zinc-400 font-medium">Last seen / found at</dt>
                  <dd className="text-xs font-semibold text-zinc-800 mt-0.5">
                    {location?.name ?? item.locationId}
                  </dd>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-zinc-400 font-medium">Date reported</dt>
                  <dd className="text-xs font-semibold text-zinc-800 tabular-nums mt-0.5">
                    {formattedDate}
                  </dd>
                </div>
              </div>

              {/* Contact name */}
              <div className="flex items-start gap-2.5">
                <UserRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-zinc-400 font-medium">Posted by</dt>
                  <dd className="text-xs font-semibold text-zinc-800 mt-0.5">{item.contactName}</dd>
                </div>
              </div>

              {/* Contact email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-xs text-zinc-400 font-medium">Contact email</dt>
                  <dd className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline truncate mt-0.5">
                    <a href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {isClaimable ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => onClaim(item)}
                icon={<PackageCheck className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Mark as claimed
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200/70 mr-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {item.status === 'claimed'
                    ? 'Someone is arranging to collect this item.'
                    : item.status === 'returned'
                    ? 'This item was successfully returned.'
                    : 'Reach out to the poster directly via email.'}
                </span>
              </div>
            )}
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Done
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}