import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Item, Location } from '../../types'
import PostItemForm from './PostItemForm'

interface PostItemModalProps {
  open: boolean
  locations: Location[]
  onClose: () => void
  onSubmit: (item: Item) => Promise<void>
}

export default function PostItemModal({
  open,
  locations,
  onClose,
  onSubmit,
}: PostItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()

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
      prevActive?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post a lost or found item"
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white sm:rounded-2xl border border-zinc-200/80 shadow-2xl overflow-y-auto relative animate-modalIn"
      >
        {/* Floating close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close post form"
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-sm text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <PostItemForm locations={locations} onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </section>
    </div>
  )
}