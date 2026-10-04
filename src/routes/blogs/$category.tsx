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
import { ArrowUpRight, Archive, Globe2, History } from 'lucide-react'

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

  React.useEffect(() => {
    Promise.all([categories(), posts()]).then(([all, ps]) => {
      const category = all.find((c: any) => c.slug === slug)
      if (!category) return
      const ids = descendantIds(all, category.id)
      setState({ category, all, posts: ps.filter((p: any) => ids.includes(p.category_id)) })
    })
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

      <section className="container-uco pt-12">
        {postList.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postList.map((p: any) => <PostCard key={p.id} post={p} />)}
          </div>
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


function UnpolishedBeginner({ category, chain, postList }: { category:any; chain:any[]; postList:any[] }) {
  const [history, setHistory] = React.useState<WebsiteAttempt[] | null>(null)

  React.useEffect(() => {
    getContent<WebsiteAttempt[]>('unpolished_beginner', fallbackHistory).then(setHistory).catch(() => setHistory(fallbackHistory))
  }, [])

  if (!history) return <section className="container-uco py-20">Loading the old versions of me…</section>

  return (
    <>
      <section className="container-uco pb-14 pt-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink/60">
          <Link to="/blogs" className="hover:text-terracotta">Blogs</Link>
          {chain.map((a:any) => (
            <span key={a.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5" />
              <Link to="/blogs/$category" params={{ category: a.slug }} className="hover:text-terracotta">{a.name}</Link>
            </span>
          ))}
        </nav>

        <div className="mt-7 max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-3 py-1.5 font-mono text-[.62rem] uppercase tracking-[.18em] text-ink/55">
            <History className="size-3.5 text-terracotta" />
            internet archaeology
          </div>
          <h1 className="text-5xl font-semibold leading-[.95] tracking-tight md:text-8xl">
            Unpolished Beginner<span className="text-terracotta">.</span>
          </h1>
          <p className="mt-7 max-w-3xl font-display text-2xl italic leading-relaxed md:text-4xl">
            Before Ucopedia became a laboratory, it was just me repeatedly trying to make a website.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/65">
            This is the archaeology of those attempts. Blogger, WordPress, Wix, half-finished experiments, redesigns, abandoned ideas — the versions that never became “the final website.”
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <span className="rounded-full border border-ink/15 bg-paper-deep px-3 py-1.5 font-mono text-xs uppercase tracking-widest">~10 years of attempts</span>
          <span className="rounded-full border border-ink/15 bg-paper-deep px-3 py-1.5 font-mono text-xs uppercase tracking-widest">{history.length} remembered versions</span>
          {postList.length > 0 && <span className="rounded-full border border-ink/15 bg-paper-deep px-3 py-1.5 font-mono text-xs uppercase tracking-widest">{postList.length} archived posts</span>}
        </div>
      </section>

      <section className="container-uco pb-24">
        <div className="relative ml-2 border-l-2 border-dashed border-ink/15 pl-7 md:ml-8 md:pl-12">
          {history.map((item, i) => (
            <article key={item.title + i} className="relative pb-12 last:pb-0">
              <div className="absolute -left-[2.05rem] top-1 grid size-5 place-items-center rounded-full border-2 border-ink bg-saffron md:-left-[3.05rem]">
                <span className="size-1.5 rounded-full bg-ink" />
              </div>

              <div className="grid gap-7 rounded-[2rem] border-2 border-ink bg-card p-6 shadow-[7px_7px_0_rgba(0,0,0,.08)] md:grid-cols-[.32fr_1fr] md:p-8">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[.63rem] uppercase tracking-[.18em] text-terracotta">
                    <Archive className="size-3.5" />
                    {item.era}
                  </div>
                  <p className="mt-3 font-mono text-[.62rem] uppercase tracking-[.18em] text-ink/40">{item.platform}</p>
                  <p className="mt-1 text-sm text-ink/45">attempt {String(i + 1).padStart(2,'0')}</p>
                </div>

                <div>
                  <h2 className="font-display text-3xl font-semibold md:text-4xl">{item.title}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-ink/70">{item.description}</p>

                  <div className="mt-6 rounded-2xl border border-ink/10 bg-paper p-5">
                    <p className="font-mono text-[.58rem] uppercase tracking-[.18em] text-ink/35">what it taught me</p>
                    <p className="mt-2 leading-relaxed text-ink/65">{item.lesson}</p>
                  </div>

                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-saffron">
                      <Globe2 className="size-4" />
                      Visit this version
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-uco pb-24">
        <div className="rounded-[2rem] border-2 border-ink bg-ink p-7 text-paper md:p-10">
          <p className="font-mono text-[.62rem] uppercase tracking-[.2em] text-saffron">the point</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl italic md:text-6xl">
            The unfinished versions are part of the story too.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper/60">
            I don’t want to hide the abandoned versions. They show what I was trying to become before I knew how to build the place I actually wanted.
          </p>
        </div>
      </section>
    </>
  )
}
