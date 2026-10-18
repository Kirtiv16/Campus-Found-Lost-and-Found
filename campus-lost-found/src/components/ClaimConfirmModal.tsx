import { useEffect, useRef } from 'react'
import { PackageCheck, X } from 'lucide-react'
import type { Item } from '../types'
import Button from './ui/Button'

interface ClaimConfirmModalProps {
  item: Item | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export default function ClaimConfirmModal({
  item,
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ClaimConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

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
    const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
      prevActive?.focus()
    }
  }, [open, onClose])

  if (!open || !item) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-confirm-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 relative animate-modalIn"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel claim confirmation"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 id="claim-confirm-title" className="text-base font-bold text-zinc-900 tracking-tight">
              Mark item as claimed?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
              Mark <strong className="text-zinc-800">“{item.title}”</strong> as claimed. This lets classmates know that someone is arranging to collect it.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            ref={confirmBtnRef}
            variant="primary"
            size="md"
            onClick={onConfirm}
            isLoading={isSubmitting}
            icon={<PackageCheck className="w-4 h-4" />}
          >
            Yes, mark claimed
          </Button>
        </div>
      </div>
    </div>
  )
}

