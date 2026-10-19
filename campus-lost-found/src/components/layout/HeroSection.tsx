import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5 bg-[#0b0f17]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-36 left-[10%] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -top-32 right-[8%] h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0b0f17_78%)]" />
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-violet-200">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            YOUR CAMPUS, CONNECTED
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
            Lost something?
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Let’s get it back.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-700 sm:text-lg">
            The right thing has a way of finding its way home. Browse campus finds or help a classmate
            by posting what you found.
          </p>
          <a
            href="#noticeboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:border-violet-300/30 hover:bg-violet-300/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Explore the board
            <ArrowDown className="h-4 w-4 text-violet-300" />
          </a>
        </div>
        <div aria-hidden="true" className="hidden shrink-0 items-center justify-center lg:flex">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025]">
            <div className="absolute inset-5 rounded-full border border-dashed border-violet-300/20" />
            <div className="absolute inset-10 rounded-full border border-cyan-300/15" />
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-200/20 bg-gradient-to-br from-indigo-500/25 to-violet-500/20 text-violet-200 shadow-[0_0_45px_rgba(139,92,246,0.2)]">
              <ArrowUpRight className="h-9 w-9" />
            </div>
            <span className="absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
            <span className="absolute bottom-10 left-7 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.8)]" />
          </div>
        </div>
      </div>
    </section>
  )
}
