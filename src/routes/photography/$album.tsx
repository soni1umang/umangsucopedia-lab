import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Gallery } from '@/components/Lightbox'
import { albums as fallbackAlbums, site } from '@/config/site'
import { img } from '@/lib/img'
import { getContent, type Album } from '@/lib/content'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/photography/$album')({
  loader: async ({ params }) => {
    const albums = await getContent<Album[]>('photography', fallbackAlbums)
    const album = albums.find((a) => a.slug === params.album)
    if (!album) throw notFound()
    return album
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.title} · Photography · ${site.title}` }] : [] }),
  component: AlbumPage,
})

function AlbumPage() {
  const album = Route.useLoaderData()
  return (
    <>
      <div className="container-uco pt-10"><nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-ink/60"><Link to="/photography" className="hover:text-terracotta">Photography</Link><ChevronRight className="size-3.5" /> {album.title}</nav></div>
      <PageHeader eyebrow={`${album.photos.length} photographs`} title={<>{album.title}<span className="text-terracotta">.</span></>}>{album.summary}</PageHeader>
      <Gallery items={album.photos} className="container-uco grid auto-rows-[16rem] gap-4 md:grid-cols-3" renderItem={(p, open) => {
        const i=album.photos.indexOf(p)
        return <button key={p.src+i} type="button" onClick={open} className={cn('group relative overflow-hidden rounded-2xl bg-paper-deep text-left',i%4===0&&'md:col-span-2 md:row-span-2')}><img src={img(p.src,1000)} alt={p.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-sm text-paper opacity-0 transition group-hover:opacity-100">{p.caption}</span></button>
      }} />
    </>
  )
}
