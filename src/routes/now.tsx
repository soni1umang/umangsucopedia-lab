import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Clock3, Radio, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { getContent, type NowItem } from '@/lib/content'
import { now as fallbackNow, site } from '@/config/site'

export const Route = createFileRoute('/now')({
  loader: () => getContent<NowItem[]>('now', fallbackNow),
  head: () => ({ meta: [{ title: `Now · ${site.title}` }] }),
  component: NowPage,
})

function NowPage() {
  const items = Route.useLoaderData()
  return <>
    <PageHeader eyebrow="Live notebook" title={<>What is occupying my <span className="italic text-terracotta">brain</span> right now?</>}>
      A small, deliberately unfinished snapshot of what I’m building, investigating, learning and thinking about.
    </PageHeader>
    <section className="container-uco">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-card px-5 py-4">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[.18em] text-ink/55"><span className="size-2 animate-pulse rounded-full bg-leaf"/>Live state</span>
        <span className="inline-flex items-center gap-2 font-mono text-[.65rem] uppercase tracking-[.16em] text-ink/40"><Clock3 className="size-3.5"/>Updated from my desk</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item,i)=><article key={item.title+i} className="group relative overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)]">
          <div className="absolute -right-10 -top-10 size-36 rounded-full bg-saffron/20 blur-3xl transition duration-700 group-hover:scale-150"/>
          <div className="relative">
            <div className="flex items-center justify-between"><span className="font-mono text-[.65rem] font-semibold tracking-[.2em] text-terracotta">{item.label}</span><span className="rounded-full border border-ink/10 px-2.5 py-1 text-[.65rem] font-semibold">{item.status}</span></div>
            <h2 className="mt-7 max-w-xl font-display text-3xl font-semibold leading-tight md:text-4xl">{item.title}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink/68">{item.detail}</p>
            {item.href && <a href={item.href} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-1 text-sm font-semibold hover:text-terracotta">Follow the thread <ArrowUpRight className="size-4"/></a>}
            <div className="mt-9 flex items-center gap-2 text-ink/30"><Radio className="size-4"/><span className="font-mono text-[.6rem] uppercase tracking-[.22em]">signal {String(i+1).padStart(2,'0')}</span></div>
          </div>
        </article>)}
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
        <p className="max-w-xl text-sm text-ink/50">This page is intentionally a moving target. Finished things graduate into Research, Make or Read.</p>
        <Link to="/about" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta"><Sparkles className="size-4"/> Meet the person behind the mess</Link>
      </div>
    </section>
  </>
}