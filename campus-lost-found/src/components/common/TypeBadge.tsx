import type { ItemType } from '../../types'

interface TypeBadgeProps {
  type: ItemType
  className?: string
}

export default function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const isLost = type === 'lost'

  const styles = isLost
    ? 'bg-red-500/10 text-red-300 border-red-400/20'
    : 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide border shadow-sm backdrop-blur-sm select-none ${styles} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isLost ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]'}`} aria-hidden="true" />
      <span>{isLost ? 'Lost' : 'Found'}</span>
    </span>
  )
}