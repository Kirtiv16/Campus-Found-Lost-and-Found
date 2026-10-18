import { useState, useEffect } from 'react'
import { Plus, SearchCheck, Sparkles } from 'lucide-react'
import Button from './ui/Button'

interface HeaderProps {
  onPost: () => void
}

export default function Header({ onPost }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-zinc-200/90 shadow-xs'
          : 'bg-white/75 backdrop-blur-sm border-zinc-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <a
          href="#"
          className="flex items-center gap-3 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg py-1 select-none"
          aria-label="Campus Found home"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <SearchCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-900">campus</span>
              <span className="font-bold text-base sm:text-lg tracking-tight text-indigo-600">found</span>
            </div>
            <p className="text-[11px] leading-tight text-zinc-500 font-medium hidden sm:block">
              Good things find their way back.
            </p>
          </div>
        </a>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Community-powered board</span>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onPost}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="shadow-sm"
          >
            <span className="hidden sm:inline">Post an item</span>
            <span className="sm:hidden">Post item</span>
          </Button>
        </div>
      </div>
    </header>
  )
}