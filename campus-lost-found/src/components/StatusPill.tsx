import { CheckCircle2, Clock3, PackageCheck } from 'lucide-react'
import type { ItemStatus } from '../types'

const statusConfig: Record<
  ItemStatus,
  { label: string; Icon: React.ComponentType<{ className?: string }>; style: string }
> = {
  open: {
    label: 'Still looking',
    Icon: Clock3,
    style: 'bg-emerald-50/95 text-emerald-700 border-emerald-200/80',
  },
  claimed: {
    label: 'Claimed',
    Icon: PackageCheck,
    style: 'bg-amber-50/95 text-amber-800 border-amber-200/80',
  },
  returned: {
    label: 'Returned',
    Icon: CheckCircle2,
    style: 'bg-zinc-100 text-zinc-700 border-zinc-200/90',
  },
}

export default function StatusPill({
  status,
  className = '',
}: {
  status: ItemStatus
  className?: string
}) {
  const { label, Icon, style } = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border shadow-xs select-none ${style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}