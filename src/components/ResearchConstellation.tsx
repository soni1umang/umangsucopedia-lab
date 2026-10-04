import { useMemo, useState } from 'react'
import { Atom, CircleDot, Radio, Sparkles } from 'lucide-react'

const icons = [Atom, Radio, CircleDot, Sparkles]

const layouts: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 18 }],
  2: [{ x: 8, y: 16 }, { x: 63, y: 16 }],
  3: [{ x: 4, y: 12 }, { x: 64, y: 12 }, { x: 34, y: 72 }],
  4: [{ x: 3, y: 8 }, { x: 64, y: 8 }, { x: 64, y: 67 }, { x: 3, y: 67 }],
  5: [{ x: 2, y: 6 }, { x: 64, y: 6 }, { x: 69, y: 63 }, { x: 33, y: 74 }, { x: 2, y: 63 }],
  6: [{ x: 2, y: 6 }, { x: 64, y: 6 }, { x: 69, y: 42 }, { x: 64, y: 74 }, { x: 2, y: 74 }, { x: 0, y: 42 }],
}

const anchors: Record<number, [number, number][]> = {
  1: [[300, 300, 300, 108]],
  2: [[300, 300, 110, 112], [300, 300, 492, 112]],
  3: [[300, 300, 118, 118], [300, 300, 482, 118], [300, 300, 300, 486]],
  4: [[300, 300, 112, 110], [300, 300, 488, 110], [300, 300, 488, 482], [300, 300, 112, 482]],
  5: [[300, 300, 108, 105], [300, 300, 492, 105], [300, 300, 500, 450], [300, 300, 300, 505], [300, 300, 100, 450]],
  6: [[300, 300, 108, 105], [300, 300, 492, 105], [300, 300, 510, 300], [300, 300, 492, 495], [300, 300, 108, 495], [300, 300, 90, 300]],
}

export function ResearchConstellation({ interests }: { interests: string[] }) {
  const nodes = interests.filter(Boolean).slice(0, 6)
  const [hovered, setHovered] = useState<number | null>(null)
  const layout = useMemo(() => layouts[nodes.length] ?? layouts[6], [nodes.length])
  const paths = useMemo(() => anchors[nodes.length] ?? anchors[6], [nodes.length])

  return (
    <div
      className="research-map relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-4 text-paper shadow-[8px_8px_0_var(--color-saffron)] sm:p-6 md:p-7"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(245_236_217/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(245_236_217/0.07)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -left-20 top-1/3 size-48 rounded-full bg-saffron/10 blur-3xl" />

      <div className="relative mx-auto aspect-[1.18/1] w-full max-w-[38rem] min-w-0">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <linearGradient id="uco-signal-map" x1="0" x2="1">
              <stop offset="0" stopColor="#eab53a" stopOpacity=".08" />
              <stop offset=".5" stopColor="#eab53a" stopOpacity=".8" />
              <stop offset="1" stopColor="#b9502e" stopOpacity=".1" />
            </linearGradient>
            <filter id="uco-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {paths.map(([x1, y1, x2, y2], i) => (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 18} ${x2} ${y2}`}
              fill="none"
              stroke={hovered === i ? '#eab53a' : 'url(#uco-signal-map)'}
              strokeWidth={hovered === i ? 3.5 : 1.7}
              strokeLinecap="round"
              strokeDasharray={hovered === i ? '2 0' : '5 10'}
              opacity={hovered !== null && hovered !== i ? .18 : hovered === i ? 1 : .72}
              filter={hovered === i ? 'url(#uco-glow)' : undefined}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-30" dur={`${3 + i * .35}s`} repeatCount="indefinite" />
            </path>
          ))}

          <circle cx="300" cy="300" r="96" fill="none" stroke="#eab53a" strokeOpacity=".16" />
          <circle cx="300" cy="300" r="76" fill="none" stroke="#f5ecd9" strokeOpacity=".13" strokeDasharray="2 10">
            <animate attributeName="r" values="70;80;70" dur="4.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="300" r="25" fill="#eab53a" fillOpacity=".92">
            <animate attributeName="r" values="21;27;21" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div
          className={`absolute left-1/2 top-1/2 z-10 flex size-[6.9rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-paper/20 bg-ink/95 text-center shadow-[0_0_0_12px_rgb(234_181_58/.05)] transition-all duration-500 sm:size-[7.8rem] md:size-[8.3rem] ${hovered !== null ? 'scale-[.93] opacity-80' : ''}`}
        >
          <p className="font-mono text-[.47rem] uppercase tracking-[.26em] text-paper/40 sm:text-[.52rem]">the core</p>
          <p className="mt-1 font-display text-[1.3rem] font-semibold leading-none sm:text-[1.55rem] md:text-[1.8rem]">Research</p>
          <p className="mt-2 font-mono text-[.45rem] uppercase tracking-[.18em] text-saffron sm:text-[.5rem]">always moving</p>
        </div>

        {nodes.map((node, i) => {
          const Icon = icons[i % icons.length]
          const pos = layout[i]
          return (
            <button
              key={node + i}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={`absolute z-20 w-[29%] min-w-0 rounded-2xl border px-2.5 py-2.5 text-left backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-saffron/80 sm:w-[27%] sm:px-3 sm:py-3 ${hovered === i ? 'border-saffron bg-paper/15 shadow-[0_12px_30px_rgb(0_0_0/.24)] -translate-y-1.5 scale-[1.04]' : 'border-paper/15 bg-paper/[.07]'} ${hovered !== null && hovered !== i ? 'opacity-45' : 'opacity-100'}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="flex items-start gap-2">
                <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full transition-colors sm:size-7 ${hovered === i ? 'bg-saffron text-ink' : 'bg-saffron/15 text-saffron'}`}>
                  <Icon className="size-3.5 sm:size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-sans text-[.68rem] font-semibold leading-[1.15] text-paper sm:text-[.78rem] md:text-[.88rem]">{node}</span>
                  <span className="mt-1 block font-mono text-[.4rem] uppercase tracking-[.17em] text-paper/30 sm:text-[.46rem]">node {String(i + 1).padStart(2, '0')}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
