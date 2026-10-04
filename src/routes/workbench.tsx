import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Hammer, Image, Radio, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { getContent, type WorkbenchItem } from '@/lib/content'
import { workbench as fallbackWorkbench, site } from '@/config/site'
import { img } from '@/lib/img'

export const Route = createFileRoute('/workbench')({
  loader: () => getContent<WorkbenchItem[]>('workbench', fallbackWorkbench),
  head: () => ({ meta: [{ title: `Workbench · ${site.title}` }] }),
  component: Workbench,
})

function isCurrent(item: WorkbenchItem) {
  const s = (item.status || '').toLowerCase()
  return s === 'active' || s === 'ongoing' || s === 'in progress' || s === 'experiment' || s === 'learning'
}

function Workbench() {
  const items = Route.useLoaderData()
  const current = items.filter(isCurrent)
  const archive = items.filter(item => !isCurrent(item))

  return <>
    <PageHeader eyebrow="Make / break / learn" title={<>The <span className="italic text-terracotta">Workbench</span>.</>}>
      The permanent project archive. Current work can surface on Now; completed and paused work stays here, so nothing gets lost.
    </PageHeader>
    <section className="container-uco">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-3 text-sm text-ink/55"><Wrench className="size-4"/> One project record, two views: <strong className="text-ink">Workbench remembers</strong>; <strong className="text-ink">Now reflects</strong>.</div>
        <Link to="/now" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta"><Radio className="size-4"/> See Now</Link>
      </div>

      <ProjectGroup title="Current work" eyebrow="Active bench" icon={<Radio className="size-4"/>} items={current} />
      <ProjectGroup title="Archive" eyebrow="What I’ve worked on" icon={<CheckCircle2 className="size-4"/>} items={archive} archived />
      
      {!items.length && <div className="rounded-[2rem] border-2 border-dashed border-ink/20 bg-card p-12 text-center"><Hammer className="mx-auto size-7 text-terracotta"/><p className="mt-4 font-display text-2xl italic">The bench is empty.</p></div>}
      <div className="mt-12 rounded-2xl border border-dashed border-ink/20 bg-card p-6 text-sm text-ink/55">Manage projects from Dashboard → Content Studio → Workbench. Use “Show this project in Now” to pin a current project to the live notebook.</div>
    </section>
  </>
}

function ProjectGroup({ title, eyebrow, icon, items, archived=false }: { title: string; eyebrow: string; icon: React.ReactNode; items: WorkbenchItem[]; archived?: boolean }) {
  if (!items.length) return null
  return <section className={archived ? 'mt-16' : ''}>
    <div className="mb-7 flex items-end justify-between gap-4 border-b-2 border-ink pb-4"><div><p className="eyebrow inline-flex items-center gap-2">{icon}{eyebrow}</p><h2 className="mt-2 text-4xl font-semibold">{title}</h2></div><span className="font-mono text-xs uppercase tracking-[.18em] text-ink/35">{items.length} {items.length===1?'project':'projects'}</span></div>
    <div className="grid gap-7 md:grid-cols-2">
      {items.map((item,i)=>{const pics=(item.images??[]).filter(Boolean);return <article key={item.title+i} className="group overflow-hidden rounded-[2rem] border-2 border-ink bg-card transition duration-500 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--color-ink)]">
        {pics.length>0 ? <div className="relative grid aspect-[16/9] grid-cols-3 gap-1 overflow-hidden bg-paper-deep">{pics.slice(0,3).map((src,j)=><img key={src+j} src={img(src,500,360)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"/>)}<span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-mono text-[.62rem] uppercase tracking-widest text-ink">{item.kind}</span></div> : <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-ink"><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgb(245_236_217/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(245_236_217/0.08)_1px,transparent_1px)] [background-size:28px_28px]"/><div className="relative grid place-items-center text-paper"><Hammer className="size-10 text-saffron"/><span className="mt-3 font-mono text-[.65rem] uppercase tracking-[.2em] text-paper/40">bench {String(i+1).padStart(2,'0')}</span></div></div>}
        <div className="p-7 md:p-8"><div className="flex items-center justify-between gap-4"><p className="font-mono text-[.65rem] uppercase tracking-[.2em] text-terracotta">{item.kind}</p><div className="flex items-center gap-2"><span className="rounded-full bg-paper-deep px-3 py-1 text-[.65rem] font-semibold">{item.status}</span>{item.show_on_now&&isCurrent(item)&&<span className="rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-1 font-mono text-[.55rem] uppercase tracking-widest text-leaf">Now</span>}</div></div><h3 className="mt-3 font-display text-3xl font-semibold">{item.title}</h3><p className="mt-4 text-lg font-medium">{item.goal}</p><p className="mt-2 text-ink/65">{item.description}</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-ink/10 bg-paper p-4"><p className="font-mono text-[.58rem] uppercase tracking-widest text-ink/40">What I learned</p><p className="mt-2 text-sm leading-relaxed text-ink/70">{item.learning}</p></div><div className="rounded-xl border border-ink/10 bg-paper p-4"><p className="font-mono text-[.58rem] uppercase tracking-widest text-ink/40">Next</p><p className="mt-2 text-sm leading-relaxed text-ink/70">{item.next}</p></div></div>{item.link&&<a href={item.link} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">Open project <ArrowRight className="size-4"/></a>}<div className="mt-8 flex items-center gap-2 text-ink/30"><Image className="size-4"/><span className="font-mono text-[.6rem] uppercase tracking-[.18em]">{pics.length ? pics.length+' field notes' : 'field notes welcome'}</span></div></div>
      </article>})}
    </div>
  </section>
}
