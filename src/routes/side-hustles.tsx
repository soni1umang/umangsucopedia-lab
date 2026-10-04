import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { sideHustles as fallbackSideHustles, site } from '@/config/site'
import { getContent, type SideHustleItem } from '@/lib/content'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/side-hustles')({
  loader: () => getContent<SideHustleItem[]>('side_hustles', fallbackSideHustles),
  head: () => ({ meta: [{ title: `Side Hustles · ${site.title}` }] }),
  component: SideHustles,
})

const statusStyle: Record<string, string> = {
  Active: 'bg-leaf text-paper',
  Idea: 'bg-saffron text-ink',
  Paused: 'bg-paper-deep text-ink/70',
}

function SideHustles() {
  const items = Route.useLoaderData()
  return (
    <>
      <PageHeader eyebrow="Side Hustles" title={<>After hours<span className="text-terracotta">.</span></>}>
        Little ventures, experiments and projects I run alongside everything else.
      </PageHeader>
      <section className="container-uco grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((h, i) => (
          <article key={h.title + i} className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card">
            {h.images?.filter(Boolean).length ? (
              <div className="grid aspect-[16/9] grid-cols-3 gap-1 overflow-hidden bg-paper-deep">
                {h.images.filter(Boolean).slice(0, 3).map((src, j) => (
                  <img key={src + j} src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                ))}
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusStyle[h.status] ?? 'bg-paper-deep')}>
                  {h.status}
                </span>
              </div>
              <h2 className="mt-8 text-2xl font-semibold">{h.title}</h2>
              <p className="mt-2 flex-1 text-ink/70">{h.description}</p>
              {h.link && (
                <a href={h.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold hover:text-terracotta">
                  Visit <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
