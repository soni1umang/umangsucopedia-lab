import { Link } from '@tanstack/react-router'
import { ArrowUpRight, ScanLine } from 'lucide-react'
import { img } from '@/lib/img'
import { categoryArt } from '@/config/category-art'

type Props = {
  slug: string
  name: string
  description?: string
  coverImage?: string | null
  postCount?: number
  index?: number
}

const EXTERNAL_CATEGORY_URLS: Record<string, string> = {
  'entangled-minds': 'https://entangledminds0.wordpress.com/',
}

function CardContent({ slug, name, description, coverImage, postCount, index }: Props) {
  const artwork = categoryArt[slug] ?? coverImage
  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
        {artwork ? (
          <>
            <img src={img(artwork, 720, 540)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-60"/>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 border-b border-paper/15 bg-paper/5 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              <span className="absolute left-3 top-2 font-mono text-[.55rem] uppercase tracking-[.22em] text-paper/75">category signal / {String(index !== undefined ? index + 1 : 0).padStart(2,'0')}</span>
              <ScanLine className="absolute right-3 top-2 size-3.5 text-saffron"/>
            </div>
          </>
        ) : <div className="grid h-full place-items-center bg-ink"><span className="font-display text-6xl italic text-saffron">{name.charAt(0)}</span></div>}
        {typeof postCount === 'number' && <span className="absolute right-3 top-3 rounded-full border border-paper/25 bg-ink/80 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-paper">{String(postCount).padStart(2,'0')} {postCount === 1 ? 'post' : 'posts'}</span>}
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 p-5">
        <div>
          <p className="font-mono text-[.58rem] uppercase tracking-[.18em] text-terracotta">Shelf / {index !== undefined ? String(index + 1).padStart(2,'0') : '—'}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink">{name}</h3>
          {description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{description}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 transition duration-500 group-hover:-rotate-12 group-hover:bg-saffron"><ArrowUpRight className="size-4"/></span>
      </div>
    </>
  )
}

export function CategoryCard(props: Props) {
  const external = EXTERNAL_CATEGORY_URLS[props.slug]
  const className = "group relative flex min-h-full flex-col overflow-hidden rounded-[1.35rem] border-2 border-ink bg-card transition duration-500 hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--color-saffron)]"
  return external
    ? <a href={external} target="_blank" rel="noreferrer" className={className} aria-label={`Open ${props.name} external site`}><CardContent {...props}/></a>
    : <Link to="/blogs/$category" params={{ category: props.slug }} className={className}><CardContent {...props}/></Link>
}
