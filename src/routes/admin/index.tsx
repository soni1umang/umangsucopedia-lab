import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Activity, FolderPlus, FlaskConical, LogOut, PenLine, Plus, Radio, Sparkles, Trash2, FileText, Settings2, Wrench, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/lib/identity-context'

type Category = { id:number; slug:string; name:string; description:string; cover_image:string|null; parent_id:number|null; sort_order:number }

export const Route = createFileRoute('/admin/')({ component: Admin })

function tree(categories: Category[], parentId: number | null = null, depth = 0): { item: Category; depth: number }[] {
  return categories
    .filter(c => c.parent_id === parentId)
    .sort((a,b) => a.sort_order-b.sort_order || a.name.localeCompare(b.name))
    .flatMap(c => [{ item:c, depth }, ...tree(categories, c.id, depth+1)])
}

function Admin() {
  const { user, ready, logout } = useIdentity()
  const [posts, setPosts] = useState<any[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [newCat, setNewCat] = useState('')
  const [parentId, setParentId] = useState('')
  const [cover, setCover] = useState('')
  const [error, setError] = useState('')

  async function load() {
    if (!user) return
    const [p,c] = await Promise.all([
      supabase.from('posts').select('*,category:categories!posts_category_id_fkey(name)').order('updated_at',{ascending:false}),
      supabase.from('categories').select('*').order('sort_order').order('name'),
    ])
    setPosts(p.data ?? [])
    setCats((c.data ?? []) as Category[])
    if (p.error) setError(p.error.message)
    else if (c.error) setError(c.error.message)
  }

  useEffect(() => { if (user) void load() }, [user])

  const rows = useMemo(() => tree(cats), [cats])

  if (!ready) return <section className="container-uco py-20">Loading…</section>
  if (!user) return <section className="container-uco py-20"><h1 className="font-display text-4xl font-semibold">Owner login required<span className="text-terracotta">.</span></h1><Link to="/login" className="btn-ink mt-6">Login</Link></section>

  async function delPost(id:number) {
    if (!confirm('Delete this post?')) return
    const r = await supabase.from('posts').delete().eq('id', id)
    if (r.error) setError(r.error.message)
    await load()
  }

  async function addCategory() {
    const name = newCat.trim()
    if (!name) return
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    if (cats.some(c => c.slug === slug)) { setError('A category with that URL already exists.'); return }
    const r = await supabase.from('categories').insert({
      name,
      slug,
      parent_id: parentId ? Number(parentId) : null,
      cover_image: cover.trim() || null,
      sort_order: cats.length + 1,
      description: '',
    })
    if (r.error) { setError(r.error.message); return }
    setNewCat(''); setParentId(''); setCover(''); setError('')
    await load()
  }

  async function deleteCategory(id:number) {
    const children = cats.filter(c => c.parent_id === id)
    const message = children.length
      ? 'Delete this category? Its sub-categories will become top-level categories and posts will remain uncategorized.'
      : 'Delete this category?'
    if (!confirm(message)) return
    const r = await supabase.from('categories').delete().eq('id', id)
    if (r.error) setError(r.error.message)
    await load()
  }

  return (
    <section className="container-uco py-12 md:py-16">
      <div className="lab-panel lab-grid relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-7 text-paper shadow-[9px_9px_0_var(--color-saffron)] md:p-9">
        <div className="absolute right-0 top-0 size-64 rounded-full bg-saffron/10 blur-3xl"/>
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[.62rem] uppercase tracking-[.2em] text-saffron"><span className="size-2 animate-pulse rounded-full bg-leaf"/> Ucopedia laboratory / control room</div>
            <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Dashboard<span className="text-saffron">.</span></h1>
            <p className="mt-3 text-paper/60">{user.email} · instruments online</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/content" className="btn-saffron !shadow-none"><Settings2 className="size-4" /> Content Studio</Link>
            <Link to="/admin/posts/new" className="btn-ghost border-paper/20 text-paper hover:border-saffron hover:bg-paper/10"><Plus className="size-4" /> New post</Link>
            <button className="btn-ghost border-paper/20 text-paper hover:border-saffron hover:bg-paper/10" onClick={() => void logout().then(() => location.href = import.meta.env.BASE_URL)}><LogOut className="size-4" /> Sign out</button>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['LIVE NOTEBOOK','Now','/now',Radio],
          ['RESEARCH','Publications','/academia/publications',BookOpen],
          ['WORKBENCH','Build log','/workbench',Wrench],
          ['SITE EDITOR','Everything','/admin/content',FlaskConical],
        ].map(([eyebrow,label,to,Icon])=><Link key={String(to)} to={String(to)} className="group rounded-2xl border border-ink/10 bg-card p-5 transition hover:-translate-y-1 hover:border-ink hover:shadow-[6px_6px_0_var(--color-saffron)]"><Icon className="size-5 text-terracotta transition group-hover:rotate-[-8deg]"/><p className="mt-5 font-mono text-[.58rem] uppercase tracking-[.18em] text-ink/40">{String(eyebrow)}</p><p className="mt-1 font-display text-xl font-semibold">{String(label)}</p><Activity className="mt-4 size-3.5 text-leaf"/></Link>)}
      </div>

      {error && <p className="mt-6 rounded-lg bg-terracotta/10 px-4 py-3 text-sm text-terracotta">{error}</p>}

      <div className="mt-10 overflow-hidden rounded-2xl border border-ink/15 bg-card">
        <div className="border-b border-ink/10 bg-paper-deep/40 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-ink/55">Posts</div>
        {posts.map(p => (
          <article key={p.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 p-5 last:border-0">
            <div><h2 className="font-display text-xl font-semibold">{p.title}</h2><p className="text-sm text-ink/55">{p.category?.name ?? 'Uncategorized'} · {p.status}</p></div>
            <div className="flex gap-2">
              {p.status === 'published' && <Link to="/posts/$slug" params={{slug:p.slug}} className="btn-ghost !px-3">View</Link>}
              <Link to="/admin/posts/$id" params={{id:String(p.id)}} className="btn-ghost !px-3"><PenLine className="size-4" /> Edit</Link>
              <button className="btn-ghost !px-3 text-terracotta" onClick={() => void delPost(p.id)}><Trash2 className="size-4" /></button>
            </div>
          </article>
        ))}
        {!posts.length && <div className="p-10 text-center text-ink/55"><FileText className="mx-auto size-7 opacity-50" /><p className="mt-2">No posts yet.</p></div>}
      </div>

      <div className="mt-10 rounded-2xl border border-ink/15 bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Blog structure</p><h2 className="mt-2 text-3xl font-semibold">Categories</h2><p className="mt-1 text-sm text-ink/55">Sub-categories can sit under Books, Cinema, or any other category.</p></div>
        </div>
        <div className="mt-5 rounded-xl border border-ink/10 bg-paper p-3">
          {rows.map(({item,depth}) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-ink/10 py-2 last:border-0">
              <div className="flex items-center gap-2" style={{paddingLeft: depth * 22}}>
                {depth ? <span className="text-ink/35">↳</span> : null}
                <span className={depth ? 'text-sm' : 'font-medium'}>{item.name}</span>
                <span className="font-mono text-[0.65rem] text-ink/35">/{item.slug}</span>
              </div>
              <button className="text-ink/35 hover:text-terracotta" title="Delete category" onClick={() => void deleteCategory(item.id)}><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_13rem_1fr_auto]">
          <input className="field" placeholder="New category" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <select className="field" value={parentId} onChange={e => setParentId(e.target.value)}>
            <option value="">Top-level</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.parent_id ? '— ' : ''}{c.name}</option>)}
          </select>
          <input className="field" placeholder="Cover image URL (optional)" value={cover} onChange={e => setCover(e.target.value)} />
          <button className="btn-saffron" onClick={() => void addCategory()}><FolderPlus className="size-4" /> Add</button>
        </div>
      </div>
    </section>
  )
}
