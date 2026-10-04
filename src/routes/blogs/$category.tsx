import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { categories, posts } from '@/data/blog'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { img } from '@/lib/img'
import { categoryArt } from '@/config/category-art'

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
