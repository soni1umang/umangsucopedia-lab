import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Search, Tag } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { posts, tagIndex as buildTagIndex } from '@/data/blog'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/tags/')({
  loader: () => posts(),
  component: TagsIndex,
})

function TagsIndex() {
  const posts = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const tags = useMemo(() => buildTagIndex(posts), [posts])
  const filtered = tags.filter((tag) => !query || tag.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <PageHeader eyebrow="Read / index" title={<>Read by tag<span className="text-terracotta">.</span></>}>
        Categories are shelves. Tags are the threads running between them.
      </PageHeader>

      <section className="container-uco pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[.16em] text-ink/40">
            <Tag className="size-4 text-terracotta" />
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'} · {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </div>
          {tags.length > 8 && (
            <label className="flex w-full max-w-xs items-center gap-2 rounded-full border border-ink/15 bg-card px-4 py-2">
              <Search className="size-4 text-ink/35" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search tags…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className="mt-8 max-w-4xl">
          {filtered.length ? filtered.map((tag, i) => (
            <Link
              key={tag.slug}
              to="/tags/$tag"
              params={{ tag: tag.slug }}
              className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-ink/10 py-5 transition hover:px-2 hover:bg-paper-deep/40"
            >
              <span className="font-mono text-[.65rem] tracking-[.16em] text-ink/25">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-2xl font-semibold md:text-3xl">{tag.name}</span>
              <span className="flex items-center gap-3 font-mono text-[.62rem] uppercase tracking-widest text-ink/35">
                {String(tag.count).padStart(2, '0')} {tag.count === 1 ? 'post' : 'posts'}
                <ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-terracotta" />
              </span>
            </Link>
          )) : (
            <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-ink/50">
              No tags match “{query}”.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
