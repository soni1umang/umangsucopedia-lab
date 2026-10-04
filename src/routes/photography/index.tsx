import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/PageHeader'
import { albums as fallbackAlbums, site } from '@/config/site'
import { img } from '@/lib/img'
import { getContent, type Album } from '@/lib/content'

export const Route = createFileRoute('/photography/')({
  loader: () => getContent<Album[]>('photography', fallbackAlbums),
  head: () => ({ meta: [{ title: `Photography · ${site.title}` }] }),
  component: Photography,
})

function Photography() {
  const albums = Route.useLoaderData()
  return (
    <>
      <PageHeader eyebrow="Photography" title={<>Through the <span className="italic text-terracotta">lens</span>.</>}>
        Places I’ve wandered and moments I didn’t want to forget, collected into albums.
      </PageHeader>
      <section className="container-uco grid gap-8 md:grid-cols-2">
        {albums.map((a) => (
          <Link key={a.slug} to="/photography/$album" params={{ album: a.slug }} className="group overflow-hidden rounded-3xl border-2 border-ink bg-card transition hover:shadow-[8px_8px_0_var(--color-ink)]">
            <div className="aspect-[3/2] overflow-hidden"><img src={img(a.cover, 900, 600)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
            <div className="flex items-end justify-between gap-4 p-6">
              <div><h2 className="text-3xl font-semibold">{a.title}</h2><p className="mt-1 text-ink/65">{a.summary}</p></div>
              <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-terracotta">{a.photos.length} photos</span>
            </div>
          </Link>
        ))}
        {!albums.length && <div className="grid place-items-center rounded-3xl border-2 border-dashed border-ink/25 p-10 text-center"><p className="font-display text-2xl italic">No albums yet.</p></div>}
      </section>
    </>
  )
}
