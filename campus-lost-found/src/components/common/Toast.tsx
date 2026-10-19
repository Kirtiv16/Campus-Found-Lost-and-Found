import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  const [isPaused, setIsPaused] = useState(false)
  const remainingTimeRef = useRef(duration)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!message) return

    remainingTimeRef.current = duration
    startTimeRef.current = Date.now()

    const startTimer = () => {
      timerRef.current = window.setTimeout(() => {
        onClose()
      }, remainingTimeRef.current)
    }

    if (!isPaused) {
      startTimer()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [message, onClose, duration, isPaused])

  const handleMouseEnter = () => {
    setIsPaused(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    // calculate remaining time
    const elapsed = Date.now() - startTimeRef.current
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
  }

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now()
    setIsPaused(false)
  }

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed z-50 bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md bg-zinc-900 text-white rounded-2xl px-4 py-3.5 shadow-xl border border-zinc-800 flex items-center justify-between gap-3 animate-modalIn select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2]" />
        <p className="text-xs sm:text-sm font-medium leading-normal text-zinc-100 break-words">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}