import { Heart, SearchCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f17] py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-400 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <SearchCheck className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-zinc-800">campusfound</span>
        </div>
        <p className="text-center sm:text-left">
          Campus Lost &amp; Found · Designed for speed, privacy, and community care.
        </p>
        <div className="flex items-center gap-1.5">
          <span>Made with care</span>
          <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
        </div>
      </div>
    </footer>
  )
}
