import { Link } from '@tanstack/react-router'
import { img } from '@/lib/img'

type Props = {
  slug: string
  name: string
  description?: string
  coverImage?: string | null
  postCount?: number
  index?: number
}

export function CategoryCard({ slug, name, description, coverImage, postCount, index }: Props) {
  return (
    <Link
      to="/blogs/$category"
      params={{ category: slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card transition hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-paper-deep">
        {coverImage ? (
          <img
            src={img(coverImage, 560, 420)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-ink">
            <span className="font-display text-6xl italic text-saffron">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 p-5">
        <div>
          <h3 className="text-xl font-semibold text-ink">{name}</h3>
          {description && <p className="mt-1 line-clamp-2 text-sm text-ink/65">{description}</p>}
        </div>
        {typeof index === 'number' && (
          <span className="font-mono text-xs text-ink/40">{String(index + 1).padStart(2, '0')}</span>
        )}
      </div>
      {typeof postCount === 'number' && (
        <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-ink">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>
      )}
    </Link>
  )
}
