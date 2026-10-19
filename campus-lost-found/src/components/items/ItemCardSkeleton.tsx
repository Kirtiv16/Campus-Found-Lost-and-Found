export default function ItemCardSkeleton() {
  return (
    <div
      className="flex flex-col bg-[#11111a]/80 rounded-2xl border border-white/10 shadow-xs overflow-hidden"
      aria-hidden="true"
    >
      {/* Media skeleton matching aspect-video */}
      <div className="relative aspect-[16/10] w-full bg-[#171720] overflow-hidden shimmer-bg">
        <div className="absolute top-2.5 left-2.5 w-16 h-5 rounded-full bg-zinc-200/80" />
        <div className="absolute top-2.5 right-2.5 w-20 h-5 rounded-full bg-zinc-200/80" />
      </div>

      {/* Content skeleton matching exact card geometry */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title lines */}
          <div className="space-y-1.5 mb-3">
            <div className="h-4 w-4/5 rounded bg-zinc-200/80 shimmer-bg" />
            <div className="h-4 w-3/5 rounded bg-zinc-200/70 shimmer-bg" />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-3 w-16 rounded bg-zinc-200/60 shimmer-bg" />
            <div className="w-1 h-1 rounded-full bg-zinc-300" />
            <div className="h-3 w-20 rounded bg-zinc-200/60 shimmer-bg" />
            <div className="w-1 h-1 rounded-full bg-zinc-300" />
            <div className="h-3 w-14 rounded bg-zinc-200/60 shimmer-bg" />
          </div>
        </div>

        {/* Card Footer matching exact border & button height */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="h-7 w-20 rounded-lg bg-zinc-200/70 shimmer-bg" />
          <div className="h-4 w-12 rounded bg-zinc-200/50 shimmer-bg" />
        </div>
      </div>
    </div>
  )
}