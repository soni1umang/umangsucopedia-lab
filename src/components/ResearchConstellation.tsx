import { useState } from 'react'
import { Atom, CircleDot, Radio, Sparkles } from 'lucide-react'

const icons = [Atom, Radio, CircleDot, Sparkles]
const positions = [
  { left: '7%', top: '7%' },
  { right: '7%', top: '12%' },
  { right: '3%', top: '43%' },
  { right: '11%', bottom: '6%' },
  { left: '11%', bottom: '6%' },
  { left: '3%', top: '43%' },
]
const anchors = [
  [300, 300, 118, 92],
  [300, 300, 482, 105],
  [300, 300, 520, 285],
  [300, 300, 430, 500],
  [300, 300, 170, 500],
  [300, 300, 80, 285],
] as const

export function ResearchConstellation({ interests }: { interests: string[] }) {
  const nodes = interests.slice(0, 6)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div
      className="research-map relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-4 text-paper shadow-[8px_8px_0_var(--color-saffron)] sm:p-6 md:p-8"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(245_236_217/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(245_236_217/0.07)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -left-20 top-1/3 size-48 rounded-full bg-saffron/10 blur-3xl" />
      <div className="relative mx-auto aspect-square w-full max-w-[38rem] min-w-0">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <linearGradient id="uco-signal-map" x1="0" x2="1">
              <stop offset="0" stopColor="#eab53a" stopOpacity=".05" />
              <stop offset=".45" stopColor="#eab53a" stopOpacity=".8" />
              <stop offset="1" stopColor="#b9502e" stopOpacity=".1" />
            </linearGradient>
            <filter id="uco-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {anchors.map(([x1, y1, x2, y2], i) => (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 28} ${x2} ${y2}`}
              fill="none"
              stroke={hovered === i ? '#eab53a' : 'url(#uco-signal-map)'}
              strokeWidth={hovered === i ? 3.5 : 1.75}
              strokeLinecap="round"
              strokeDasharray={hovered === i ? '2 0' : '5 10'}
              opacity={hovered !== null && hovered !== i ? .2 : hovered === i ? 1 : .7}
              filter={hovered === i ? 'url(#uco-glow)' : undefined}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-30" dur={`${3 + i * .35}s`} repeatCount="indefinite" />
            </path>
          ))}
          <circle cx="300" cy="300" r="92" fill="none" stroke="#eab53a" strokeOpacity=".18" />
          <circle cx="300" cy="300" r="67" fill="none" stroke="#f5ecd9" strokeOpacity=".16" strokeDasharray="2 10">
            <animate attributeName="r" values="62;72;62" dur="4.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="300" r="24" fill="#eab53a" fillOpacity=".92">
            <animate attributeName="r" values="21;26;21" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div
          className={`absolute left-1/2 top-1/2 z-10 flex size-[7.4rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-paper/20 bg-ink/95 text-center shadow-[0_0_0_10px_rgb(234_181_58/.05)] transition-all duration-500 sm:size-[8.8rem] ${hovered !== null ? 'scale-95 opacity-80' : ''}`}
        >
          <p className="font-mono text-[.5rem] uppercase tracking-[.26em] text-paper/40 sm:text-[.56rem]">the core</p>
          <p className="mt-1 font-display text-[1.45rem] font-semibold leading-none sm:text-[1.85rem]">Research</p>
          <p className="mt-2 font-mono text-[.5rem] uppercase tracking-[.18em] text-saffron sm:text-[.54rem]">always moving</p>
        </div>

        {nodes.map((node, i) => {
          const Icon = icons[i % icons.length]
          const p = positions[i]
          return (
            <button
              key={node + i}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={`absolute z-20 w-[36%] min-w-0 rounded-2xl border px-3 py-3 text-left backdrop-blur-md transition-all duration-400 focus:outline-none focus:ring-2 focus:ring-saffron/80 sm:w-[31%] sm:px-3.5 sm:py-3.5 ${hovered === i ? 'border-saffron bg-paper/15 shadow-[0_12px_30px_rgb(0_0_0/.24)] -translate-y-2 scale-[1.045]' : 'border-paper/15 bg-paper/[.07] hover:border-saffron/70'} ${hovered !== null && hovered !== i ? 'opacity-55' : 'opacity-100'}`}
              style={p}
            >
              <span className="flex items-start gap-2.5">
                <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full transition-colors sm:size-8 ${hovered === i ? 'bg-saffron text-ink' : 'bg-saffron/15 text-saffron'}`}>
                  <Icon className="size-3.5 sm:size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-sans text-[.76rem] font-semibold leading-[1.12] text-paper sm:text-[.9rem] md:text-base">{node}</span>
                  <span className="mt-1 block font-mono text-[.45rem] uppercase tracking-[.17em] text-paper/35 sm:text-[.5rem]">node {String(i + 1).padStart(2, '0')}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
