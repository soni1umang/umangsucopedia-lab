import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { posts, slugifyTag } from '@/data/blog'
import { PostCard } from '@/components/PostCard'

export const Route = createFileRoute('/tags/$tag')({
  loader: async ({ params }) => {
    const all = await posts()
    const tag = params.tag
    const matching = all.filter((post) =>
      Array.isArray(post.tags) && post.tags.some((raw:string) => slugifyTag(raw) === tag),
    )
    const label = matching.flatMap((post) => Array.isArray(post.tags) ? post.tags : []).find((raw:string) => slugifyTag(raw) === tag)
    if (!matching.length || !label) throw notFound()
    return { posts: matching, label }
  },
  component: TagPage,
})

function TagPage() {
  const { posts, label } = Route.useLoaderData()
  return (
    <>
      <PageHeader eyebrow="Read / tag" title={<>{label}<span className="text-terracotta">.</span></>}>
        {posts.length} {posts.length === 1 ? 'post' : 'posts'} connected by this thread.
      </PageHeader>
      <section className="container-uco pb-24">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/tags" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-terracotta">
            <ArrowLeft className="size-4" /> All tags
          </Link>
          <span className="flex items-center gap-2 rounded-full border border-ink/10 bg-card px-3 py-1.5 font-mono text-[.62rem] uppercase tracking-widest text-ink/45">
            <Tag className="size-3.5 text-terracotta" /> {label}
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post:any) => <PostCard key={post.id} post={post} />)}
        </div>
        <Link to="/tags" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
          Browse another thread <ArrowRight className="size-4" />
        </Link>
      </section>
    </>
  )
}
