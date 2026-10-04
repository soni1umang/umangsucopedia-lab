import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { portfolio, site } from '@/config/site'
import { getContent, type PortfolioItem } from '@/lib/content'
import { img } from '@/lib/img'

export const Route = createFileRoute('/academia/portfolio')({
  loader: () => getContent<PortfolioItem[]>('portfolio', portfolio),
  head: () => ({ meta: [{ title: `Portfolio · ${site.title}` }] }),
  component: Portfolio,
})

function Portfolio() {
  const items = Route.useLoaderData()
  return (
    <>
      <div className="container-uco pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-ink/60">
          <Link to="/academia" className="hover:text-terracotta">Academia</Link>
          <ChevronRight className="size-3.5" /> Portfolio
        </nav>
      </div>
      <PageHeader eyebrow="Selected work" title={<>Portfolio<span className="text-terracotta">.</span></>}>
        A running record of projects, papers, presentations and recognitions.
      </PageHeader>
      <section className="container-uco">
        <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink">
          {items.map((p, i) => {
            const Tag = p.link ? 'a' : 'div'
            const images = (p.images ?? []).filter(Boolean)
            return (
              <li key={p.title + i} className="py-7">
                <Tag {...(p.link ? { href: p.link, target: '_blank', rel: 'noopener noreferrer' } : {})} className="group grid gap-5 transition hover:bg-card md:grid-cols-[4rem_1fr_10rem_4rem] md:items-start">
                  <span className="font-mono text-sm text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="block font-display text-2xl font-semibold md:text-3xl">{p.title}</span>
                      {p.featured && <span className="rounded-full bg-saffron px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest">Featured</span>}
                    </span>
                    <span className="mt-1 block font-mono text-xs uppercase tracking-widest text-terracotta">{p.kind} · {p.year}{p.venue ? ` · ${p.venue}` : ''}</span>
                    {p.authors && <span className="mt-2 block text-sm text-ink/50">{p.authors}</span>}
                    <span className="mt-2 block text-ink/65">{p.description}</span>
                    {images.length > 0 && (
                      <span className="mt-4 grid max-w-2xl grid-cols-3 gap-2">
                        {images.slice(0, 3).map((src, j) => <img key={src + j} src={img(src, 320, 220)} alt="" className="aspect-[3/2] w-full rounded-xl object-cover" />)}
                      </span>
                    )}
                  </span>
                  {p.link ? <ArrowUpRight className="size-6 justify-self-end transition group-hover:-translate-y-1 group-hover:translate-x-1" /> : <span />}
                </Tag>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
