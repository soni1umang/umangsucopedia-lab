import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/PageHeader'
import { Gallery } from '@/components/Lightbox'
import { paintings as fallbackPaintings, site } from '@/config/site'
import { getContent, type Painting } from '@/lib/content'
import { img } from '@/lib/img'

export const Route = createFileRoute('/paints')({
  loader: () => getContent<Painting[]>('paintings', fallbackPaintings),
  head: () => ({ meta: [{ title: `Paints · ${site.title}` }] }),
  component: Paints,
})

function Paints() {
  const paintings = Route.useLoaderData()
  return (
    <>
      <PageHeader eyebrow="Paints" title={<>Colour, <span className="italic text-terracotta">unfiltered</span>.</>}>
        Acrylics, watercolours and gouache: paintings made for no reason other than the joy of it.
      </PageHeader>
      <Gallery items={paintings} className="container-uco grid gap-10 sm:grid-cols-2 lg:grid-cols-3" renderItem={(p, open) => (
        <figure key={p.src+p.title} className="group">
          <button type="button" onClick={open} className="block w-full rounded-sm border-[10px] border-card bg-card p-0 shadow-[0_12px_30px_-12px_rgb(28_33_70/0.45)] outline outline-1 outline-ink/10 transition group-hover:-rotate-1 group-hover:scale-[1.02]">
            <img src={img(p.src,720,720)} alt={p.title} loading="lazy" className="aspect-square w-full object-cover" />
          </button>
          <figcaption className="mt-4"><p className="font-display text-xl font-semibold">{p.title}</p><p className="font-mono text-xs uppercase tracking-widest text-terracotta">{p.medium} · {p.year}</p><p className="mt-1 text-sm text-ink/65">{p.caption}</p></figcaption>
        </figure>
      )} />
    </>
  )
}
