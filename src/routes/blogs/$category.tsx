import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { categories, posts } from '@/data/blog'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { img } from '@/lib/img'
import { categoryArt } from '@/config/category-art'
import { getContent, type WebsiteAttempt } from '@/lib/content'
import { ucopediaHistory as fallbackHistory } from '@/config/site'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function descendantIds(all: any[], root: number) {
  const ids = [root]
  for (let i = 0; i < ids.length; i++) {
    for (const c of all) if (c.parent_id === ids[i]) ids.push(c.id)
  }
  return ids
}

function ancestors(all: any[], category: any) {
  const chain: any[] = []
  let current = category
  while (current?.parent_id) {
    current = all.find((c) => c.id === current.parent_id)
    if (current) chain.unshift(current)
  }
  return chain
}

export const Route = createFileRoute('/blogs/$category')({
  beforeLoad: ({ params }) => {
    if (params.category === 'entangled-minds') {
      throw redirect({ href: 'https://entangledminds0.wordpress.com/' })
    }
  },
  component: Category,
})

function Category() {
  const { category: slug } = Route.useParams()
  const [state, setState] = React.useState<{category:any; all:any[]; posts:any[]} | null>(null)
  const [pinnedIds, setPinnedIds] = React.useState<number[]>([])

  React.useEffect(() => {
    let cancelled = false
    setState(null)
    setPinnedIds([])
    Promise.all([categories(), posts()]).then(async ([all, ps]) => {
      const category = all.find((c: any) => c.slug === slug)
      if (!category) return
      const ids = descendantIds(all, category.id)
      const visiblePosts = ps.filter((p: any) => ids.includes(p.category_id))
      const pinResult = await supabase
        .from('category_post_pins')
        .select('post_id,position')
        .eq('category_id', category.id)
        .order('position', { ascending: true })

      if (cancelled) return
      const allowed = new Set(visiblePosts.map((p: any) => Number(p.id)))
      const pins = (pinResult.data ?? [])
        .map((row: any) => Number(row.post_id))
        .filter((id: number) => allowed.has(id))
      setPinnedIds(pins)
      setState({ category, all, posts: visiblePosts })
    }).catch(() => {
      if (!cancelled) setState(null)
    })
    return () => { cancelled = true }
  }, [slug])

  if (!state) return <section className="container-uco py-20">Loading…</section>

  const { category, all, posts: postList } = state
  const children = all.filter((c: any) => c.parent_id === category.id)
  const chain = ancestors(all, category)
  const cover = categoryArt[category.slug] || category.cover_image || chain.find((c: any) => c.cover_image)?.cover_image

  if (slug === 'unpolished-beginner') {
    return <UnpolishedBeginner category={category} chain={chain} postList={postList} />
  }

  return (
    <>
      <section className="container-uco grid items-end gap-10 pb-12 pt-10 md:grid-cols-[1.3fr_1fr] md:pt-14">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink/60">
            <Link to="/blogs" className="hover:text-terracotta">Blogs</Link>
            {chain.map((a: any) => (
              <span key={a.id} className="flex items-center gap-1">
                <ChevronRight className="size-3.5" />
                <Link to="/blogs/$category" params={{ category: a.slug }} className="hover:text-terracotta">{a.name}</Link>
              </span>
            ))}
          </nav>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">{category.name}<span className="text-terracotta">.</span></h1>
          {category.description && <p className="mt-5 max-w-xl text-lg text-ink/70">{category.description}</p>}
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/50">
            {postList.length} {postList.length === 1 ? 'post' : 'posts'}{children.length ? ` · ${children.length} sub-categories` : ''}
          </p>
        </div>
        {cover && <img src={img(cover, 720, 480)} alt="" className="hidden w-full rounded-2xl border-2 border-ink md:block" />}
      </section>

      {children.length > 0 && (
        <section className="container-uco pt-2">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c: any, i: number) => (
              <CategoryCard
                key={c.id}
                slug={c.slug}
                name={c.name}
                description={c.description}
                coverImage={c.cover_image || category.cover_image}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {pinnedIds.length > 0 && (
        <section className="container-uco pt-12">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
            <div>
              <p className="eyebrow">Pinned</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Worth keeping close<span className="text-terracotta">.</span></h2>
            </div>
            <span className="font-mono text-[.62rem] uppercase tracking-[.16em] text-ink/35">{pinnedIds.length} featured</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedIds.map((id: number) => {
              const post = postList.find((p: any) => Number(p.id) === id)
              return post ? <PostCard key={post.id} post={post} /> : null
            })}
          </div>
        </section>
      )}

      <section className="container-uco pt-12">
        {postList.length ? (
          <>
            {pinnedIds.length > 0 && (
              <div className="mb-6 flex items-center gap-3 border-b border-ink/10 pb-3">
                <p className="eyebrow">All posts</p>
                <span className="font-mono text-[.58rem] text-ink/30">excluding pinned</span>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {postList.filter((p: any) => !pinnedIds.includes(Number(p.id))).map((p: any) => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/25 p-12 text-center">
            <p className="font-display text-2xl italic">Blank pages, for now.</p>
            <p className="mt-2 text-ink/60">Posts in {category.name} will appear here soon.</p>
          </div>
        )}
      </section>
    </>
  )
}


function UnpolishedBeginner({ chain }: { category:any; chain:any[]; postList:any[] }) {
  const [history, setHistory] = React.useState<WebsiteAttempt[] | null>(null)

  React.useEffect(() => {
    getContent<WebsiteAttempt[]>('unpolished_beginner', fallbackHistory).then(setHistory).catch(() => setHistory(fallbackHistory))
  }, [])

  if (!history) return <section className="container-uco py-20">Loading…</section>

  return (
    <section className="container-uco pb-24 pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink/45">
        <Link to="/blogs" className="hover:text-terracotta">Blogs</Link>
        {chain.map((a:any) => (
          <span key={a.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            <Link to="/blogs/$category" params={{ category: a.slug }} className="hover:text-terracotta">{a.name}</Link>
          </span>
        ))}
      </nav>

      <div className="mt-14 max-w-3xl">
        <p className="font-mono text-[.62rem] uppercase tracking-[.22em] text-ink/35">since ~2016</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-8xl">
          Unpolished Beginner<span className="text-terracotta">.</span>
        </h1>
        <p className="mt-6 font-display text-xl italic text-ink/55 md:text-2xl">
          A decade of trying to make a place on the web.
        </p>
      </div>

      <div className="mt-20 max-w-4xl border-t border-ink/15">
        {history.map((item, i) => (
          <div key={item.title + i} className="group grid items-center gap-4 border-b border-ink/15 py-7 md:grid-cols-[7rem_1fr_auto]">
            <span className="font-mono text-[.65rem] uppercase tracking-[.18em] text-ink/35">{item.era}</span>

            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">{item.title}</h2>
              <p className="mt-1 font-mono text-[.62rem] uppercase tracking-[.16em] text-terracotta">{item.platform}</p>
            </div>

            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink/45 transition group-hover:text-ink"
              >
                visit <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <span className="font-mono text-[.58rem] uppercase tracking-widest text-ink/20">archived</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
