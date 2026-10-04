import { Atom, CircleDot, Radio, Sparkles } from 'lucide-react'

const icons = [Atom, Radio, CircleDot, Sparkles]

export function ResearchConstellation({ interests }: { interests: string[] }) {
  const nodes = interests.slice(0, 6)
  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-6 text-paper shadow-[8px_8px_0_var(--color-saffron)] md:p-8">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(245_236_217/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(245_236_217/0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative mx-auto aspect-square max-w-[34rem]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <linearGradient id="uco-signal" x1="0" x2="1">
              <stop offset="0" stopColor="#eab53a" stopOpacity=".1" />
              <stop offset=".5" stopColor="#eab53a" stopOpacity=".9" />
              <stop offset="1" stopColor="#b9502e" stopOpacity=".15" />
            </linearGradient>
          </defs>
          {[[300,300,105,90],[300,300,495,130],[300,300,505,300],[300,300,440,480],[300,300,160,470],[300,300,90,270]].map(([x1,y1,x2,y2],i)=><path key={i} d={`M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2-30} ${x2} ${y2}`} fill="none" stroke="url(#uco-signal)" strokeWidth="2" strokeDasharray="5 9"><animate attributeName="stroke-dashoffset" from="0" to="-28" dur={`${3+i/2}s`} repeatCount="indefinite"/></path>)}
          <circle cx="300" cy="300" r="78" fill="none" stroke="#eab53a" strokeOpacity=".35" strokeDasharray="2 9"/>
          <circle cx="300" cy="300" r="55" fill="none" stroke="#f5ecd9" strokeOpacity=".16"/>
          <circle cx="300" cy="300" r="18" fill="#eab53a" fillOpacity=".85"/>
        </svg>
        <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
          <p className="font-mono text-[.6rem] uppercase tracking-[.25em] text-paper/45">the core</p>
          <p className="mt-1 font-display text-3xl font-semibold">Research</p>
          <p className="mt-1 font-mono text-[.58rem] uppercase tracking-[.2em] text-saffron">always moving</p>
        </div>
        {nodes.map((node,i)=>{
          const positions = [
            'left-[2%] top-[14%]','right-[2%] top-[20%]','right-[0%] top-[47%]',
            'right-[14%] bottom-[2%]','left-[10%] bottom-[5%]','left-[0%] top-[46%]'
          ]
          const Icon = icons[i % icons.length]
          return <div key={node+i} className={`absolute ${positions[i]} max-w-[42%] rounded-2xl border border-paper/15 bg-paper/7 px-3 py-3 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-saffron/60 hover:bg-paper/10`}>
            <div className="flex items-start gap-2"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-saffron/15 text-saffron"><Icon className="size-3.5"/></span><span><span className="block font-display text-sm font-semibold leading-tight text-paper md:text-base">{node}</span><span className="mt-1 block font-mono text-[.52rem] uppercase tracking-[.16em] text-paper/40">node 0{i+1}</span></span></div>
          </div>
        })}
      </div>
    </div>
  )
}
