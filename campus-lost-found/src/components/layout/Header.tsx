import { useState, useEffect } from 'react'
import { Plus, SearchCheck } from 'lucide-react'
import Button from '../common/Button'

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
          ? 'bg-slate-950/90 backdrop-blur-xl border-white/10 shadow-lg shadow-black/10'
          : 'bg-slate-950/75 backdrop-blur-md border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <a
          href="#"
          className="flex items-center gap-3 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg py-1 select-none"
          aria-label="Campus Found home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
            <SearchCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-zinc-100">campus</span>
            <span className="font-semibold text-base sm:text-lg tracking-tight text-violet-400">found</span>
          </div>
        </a>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Button
            variant="primary"
            size="md"
            onClick={onPost}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            <span className="hidden sm:inline">Post an item</span>
            <span className="sm:hidden">Post item</span>
          </Button>
        </div>
      </div>
    </header>
  )
}