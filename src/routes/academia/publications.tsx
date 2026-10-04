import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, BookOpen, ChevronRight, ExternalLink, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { getContent, type PublicationItem } from '@/lib/content'
import { publications as fallbackPublications, site } from '@/config/site'
import { img } from '@/lib/img'

export const Route = createFileRoute('/academia/publications')({
  loader: () => getContent<PublicationItem[]>('publications', fallbackPublications),
  head: () => ({ meta: [{ title: `Publications · ${site.title}` }] }),
  component: Publications,
})

function DOI({ doi }: { doi: string }) {
  if (!doi) return null
  const clean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')
  return <a href={`https://doi.org/${clean}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-widest text-terracotta hover:underline">doi ↗</a>
}

function PublicationCard({ p, index }: { p: PublicationItem; index: number }) {
  const images = p.preview_image ? [p.preview_image] : []
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border-2 border-ink bg-card transition duration-500 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--color-ink)]">
      <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
        {p.featured && <span className="rounded-full bg-saffron px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em]">Featured</span>}
        <span className="grid size-9 place-items-center rounded-full border border-ink/15 bg-paper/90 font-mono text-xs">{String(index + 1).padStart(2,'0')}</span>
      </div>
      <div className="grid md:grid-cols-[18rem_1fr]">
        <div className="relative min-h-[16rem] overflow-hidden bg-paper-deep md:min-h-full">
          {images.length ? (
            <img src={img(images[0], 900, 1200)} alt={`First page of ${p.title}`} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.025]" />
          ) : (
            <div className="relative h-full min-h-[16rem] overflow-hidden p-6">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-saffron/40 blur-3xl transition duration-700 group-hover:scale-125" />
              <div className="relative mt-4 rounded-xl border border-ink/15 bg-card p-5 shadow-[5px_5px_0_var(--color-ink)]">
                <BookOpen className="size-7 text-terracotta" />
                <p className="mt-10 font-mono text-[0.65rem] uppercase tracking-widest text-ink/45">{p.journal || 'Research'}</p>
                <p className="mt-2 font-display text-xl font-semibold leading-tight">{p.title || 'Publication'}</p>
                <p className="mt-6 text-xs text-ink/50">{p.year}</p>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/50 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="flex flex-col p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-terracotta">{p.year}</span>
            {p.journal && <span className="text-xs font-semibold text-ink/45">· {p.journal}</span>}
            {p.citations !== undefined && p.citations > 0 && <span className="rounded-full border border-ink/10 bg-paper px-2.5 py-1 font-mono text-[0.65rem] text-ink/55">{p.citations} citations</span>}
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">{p.title || 'Untitled publication'}</h2>
          {p.authors && <p className="mt-3 text-sm text-ink/55">{p.authors}</p>}
          {(p.volume || p.issue || p.pages || p.publisher) && (
            <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-widest text-ink/40">
              {[p.volume && `Vol. ${p.volume}`, p.issue && `Issue ${p.issue}`, p.pages && `pp. ${p.pages}`, p.publisher].filter(Boolean).join(' · ')}
            </p>
          )}
          {p.description && <p className="mt-5 max-w-2xl leading-relaxed text-ink/70">{p.description}</p>}
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
            <DOI doi={p.doi} />
            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold hover:text-terracotta">Publisher <ArrowUpRight className="size-4"/></a>}
            {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold hover:text-terracotta">Open PDF <ExternalLink className="size-3.5"/></a>}
          </div>
        </div>
      </div>
    </article>
  )
}

function Publications() {
  const items = Route.useLoaderData()
  const featured = items.find(p => p.featured) ?? items[0]
  const rest = featured ? items.filter(p => p !== featured) : []
  return (
    <>
      <div className="container-uco pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-ink/60">
          <Link to="/academia" className="hover:text-terracotta">Academia</Link><ChevronRight className="size-3.5"/> Publications
        </nav>
      </div>
      <PageHeader eyebrow="Research record" title={<>Publications<span className="text-terracotta">.</span></>}>
        Papers and research outputs I’ve contributed to, with the details that matter at a glance.
      </PageHeader>
      <section className="container-uco">
        {featured ? (
          <div className="relative overflow-hidden rounded-[2.25rem] border-2 border-ink bg-ink p-2 shadow-[8px_8px_0_var(--color-saffron)]">
            <div className="absolute -left-16 -top-20 size-64 rounded-full bg-saffron/20 blur-3xl" />
            <div className="absolute -bottom-20 right-0 size-72 rounded-full bg-terracotta/20 blur-3xl" />
            <div className="relative rounded-[1.75rem] border border-paper/10 bg-paper p-2">
              <PublicationCard p={featured} index={0} />
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-ink/25 p-12 text-center">
            <Sparkles className="mx-auto size-8 text-terracotta" />
            <h2 className="mt-4 font-display text-3xl italic">Your publication shelf is waiting.</h2>
            <p className="mt-2 text-ink/55">Add your papers from Dashboard → Site content → Publications.</p>
          </div>
        )}
      </section>
      {rest.length > 0 && (
        <section className="container-uco pt-10">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="eyebrow">The rest of the record</p><h2 className="mt-2 text-3xl font-semibold">More publications</h2></div><span className="font-mono text-xs text-ink/40">{items.length} total</span></div>
          <div className="space-y-6">{rest.map((p,i)=><PublicationCard key={(p.doi||p.title)+i} p={p} index={i+1}/>)}</div>
        </section>
      )}
      <section className="container-uco pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink/10 pt-6 text-sm text-ink/50">
          <span>Metadata can be imported from a DOI in the owner dashboard.</span>
          <span className="font-mono text-[0.65rem] uppercase tracking-widest">Research · papers · ideas</span>
        </div>
      </section>
    </>
  )
}
