import { Search, HandHeart } from 'lucide-react'
import type { ItemType } from '../types'

interface TypeBadgeProps {
  type: ItemType
  className?: string
}

export default function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const isLost = type === 'lost'

  const styles = isLost
    ? 'bg-rose-50/95 text-rose-700 border-rose-200/80'
    : 'bg-sky-50/95 text-sky-700 border-sky-200/80'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border shadow-xs backdrop-blur-xs select-none ${styles} ${className}`}
    >
      {isLost ? (
        <Search className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" aria-hidden="true" />
      ) : (
        <HandHeart className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" aria-hidden="true" />
      )}
      <span>{isLost ? 'Lost' : 'Found'}</span>
    </span>
  )
}