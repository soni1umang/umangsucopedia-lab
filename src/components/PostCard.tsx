import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { formatDate, img } from '@/lib/img'
import { cn } from '@/lib/utils'

type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  cover_image: string | null
  published_at: string | null
  category?: { name?: string | null } | null
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card transition hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]',
        featured && 'md:flex-row',
      )}
    >
      {post.cover_image ? (
        <div className={cn('overflow-hidden bg-paper-deep', featured ? 'md:w-1/2' : 'aspect-[16/10]')}>
          <img
            src={img(post.cover_image, featured ? 900 : 640, featured ? 640 : 400)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div
          className={cn(
            'relative grid place-items-center overflow-hidden bg-ink',
            featured ? 'min-h-56 md:w-1/2' : 'aspect-[16/10]',
          )}
        >
          <span className="font-display text-7xl font-semibold italic text-saffron/90">
            {post.title.charAt(0)}
          </span>
          <span className="absolute -right-6 -top-6 size-24 rounded-full bg-terracotta/70" />
        </div>
      )}
      <div className={cn('flex flex-1 flex-col p-6', featured && 'md:p-10')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {post.category?.name && (
            <span className="font-mono uppercase tracking-widest text-terracotta">
              {post.category.name}
            </span>
          )}
          <time className="text-ink/50">{formatDate(post.published_at)}</time>
        </div>
        <h3
          className={cn(
            'mt-3 font-semibold leading-tight text-ink',
            featured ? 'text-3xl md:text-4xl' : 'text-xl',
          )}
        >
          <Link to="/posts/$slug" params={{ slug: post.slug }} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className={cn('mt-3 text-ink/70', featured ? 'text-lg' : 'line-clamp-3 text-sm')}>
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-ink">
          Read
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  )
}
