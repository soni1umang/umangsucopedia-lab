import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ImagePlus, LoaderCircle, Save, Eye, Edit3 } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/lib/identity-context'

type Props = { id?: number }
type Category = { id: number; slug: string; name: string; parent_id: number | null; sort_order: number }
type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  category_id: number | null
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function flattenCategories(categories: Category[], parentId: number | null = null, depth = 0) {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .flatMap((category) => [
      { item: category, label: `${'— '.repeat(depth)}${category.name}` },
      ...flattenCategories(categories, category.id, depth + 1),
    ])
}

export function Editor({ id }: Props) {
  const nav = useNavigate()
  const { user, ready } = useIdentity()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!ready) return
    let alive = true

    async function load() {
      setLoading(true)
      setError('')

      if (!user) {
        if (alive) {
          setAllowed(false)
          setLoading(false)
        }
        return
      }

      const [adminResult, categoryResult, postResult] = await Promise.all([
        supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('categories').select('*').order('sort_order').order('name'),
        id
          ? supabase.from('posts').select('*').eq('id', id).single()
          : Promise.resolve({ data: null, error: null }),
      ])

      if (!alive) return

      if (adminResult.error) {
        setError(adminResult.error.message)
        setAllowed(false)
        setLoading(false)
        return
      }

      if (!adminResult.data) {
        setAllowed(false)
        setError('Your account does not have owner/admin access.')
        setLoading(false)
        return
      }

      if (categoryResult.error) {
        setError(categoryResult.error.message)
        setLoading(false)
        return
      }

      if (postResult.error && id) {
        setError(postResult.error.message)
        setLoading(false)
        return
      }

      const post = postResult.data as Post | null
      setAllowed(true)
      setCategories((categoryResult.data ?? []) as Category[])

      if (post) {
        setTitle(post.title ?? '')
        setSlug(post.slug ?? '')
        setExcerpt(post.excerpt ?? '')
        setContent(post.content ?? '')
        setCategoryId(post.category_id?.toString() ?? '')
        setTags((post.tags ?? []).join(', '))
        setCoverImage(post.cover_image ?? '')
        setStatus(post.status ?? 'draft')
        setPublishedAt(post.published_at ?? null)
      }

      setLoading(false)
    }

    void load()
    return () => {
      alive = false
    }
  }, [id, ready, user])

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])
  const previewHtml = useMemo(() => {
    if (!previewOpen) return ''
    const raw = marked.parse(content || '*Your markdown preview will appear here.*', { async: false })
    return DOMPurify.sanitize(String(raw))
  }, [content, previewOpen])

  function effectiveSlug() {
    return slugify(slug || title) || `post-${Date.now()}`
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
      setError('Please choose a JPG, PNG, WebP, GIF, or AVIF image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Please keep cover images under 10 MB.')
      return
    }

    setError('')
    setNotice('')
    setUploading(true)

    try {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .slice(-80)
      const path = `${user?.id}/${Date.now()}-${safeName || `cover.${extension}`}`

      const result = await supabase.storage.from('blog-images').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
      if (result.error) throw result.error

      const publicUrl = supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl
      setCoverImage(publicUrl)
      setNotice('Image uploaded.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function save(nextStatus: 'draft' | 'published', event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (!allowed || !user) return

    setError('')
    setNotice('')
    setBusy(true)

    try {
      const cleanTitle = title.trim()
      if (!cleanTitle) throw new Error('Title is required.')

      const nextSlug = effectiveSlug()
      const clashQuery = supabase.from('posts').select('id').eq('slug', nextSlug).limit(1)
      const { data: clash, error: clashError } = await clashQuery
      if (clashError) throw clashError
      if (clash?.[0] && clash[0].id !== id) {
        throw new Error(`Another post already uses the URL "${nextSlug}".`)
      }

      const nextPublishedAt =
        nextStatus === 'published'
          ? (publishedAt ?? new Date().toISOString())
          : null

      const row = {
        title: cleanTitle,
        slug: nextSlug,
        excerpt: excerpt.trim(),
        content,
        cover_image: coverImage.trim() || null,
        category_id: categoryId ? Number(categoryId) : null,
        tags: [...new Set(tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20),
        status: nextStatus,
        published_at: nextPublishedAt,
        updated_at: new Date().toISOString(),
      }

      if (id) {
        const result = await supabase.from('posts').update(row).eq('id', id).select().single()
        if (result.error) throw result.error
        setStatus(nextStatus)
        setPublishedAt(nextPublishedAt)
        setNotice(nextStatus === 'published' ? 'Post updated.' : 'Draft saved.')
      } else {
        const result = await supabase.from('posts').insert(row).select().single()
        if (result.error) throw result.error
        setNotice(nextStatus === 'published' ? 'Post published.' : 'Draft saved.')
        setStatus(nextStatus)
        setPublishedAt(nextPublishedAt)
        await nav({ to: '/admin/posts/$id', params: { id: String(result.data.id) }, replace: true })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this post.')
    } finally {
      setBusy(false)
    }
  }

  if (!ready || loading) {
    return <section className="container-uco py-20">Loading editor…</section>
  }

  if (!user) {
    return (
      <section className="container-uco py-20">
        <h1 className="font-display text-4xl font-semibold">Owner login required<span className="text-terracotta">.</span></h1>
        <Link to="/login" className="btn-ink mt-6">Login</Link>
      </section>
    )
  }

  if (!allowed) {
    return (
      <section className="container-uco py-20">
        <h1 className="font-display text-4xl font-semibold">Access denied<span className="text-terracotta">.</span></h1>
        <p className="mt-3 text-ink/65">{error || 'You do not have admin access.'}</p>
        <Link to="/admin" className="btn-ghost mt-6">Back to dashboard</Link>
      </section>
    )
  }

  return (
    <form className="container-uco py-10 md:py-14" onSubmit={(event) => void save(status, event)}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-ink/60 hover:text-terracotta">← Dashboard</Link>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {id ? 'Edit post' : 'New post'}<span className="text-terracotta">.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" disabled={busy || uploading} onClick={() => void save('draft')}>
            <Save className="size-4" /> Save draft
          </button>
          <button type="button" className="btn-saffron" disabled={busy || uploading} onClick={() => void save('published')}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {status === 'published' ? 'Update post' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="space-y-5">
          <label className="label block">
            Title
            <input
              className="field mt-2 w-full text-lg"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A clear, memorable title"
            />
          </label>

          <label className="label block">
            URL slug <span className="font-normal text-ink/50">(leave blank to make it from the title)</span>
            <input
              className="field mt-2 w-full"
              maxLength={80}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="my-post-title"
            />
          </label>

          <label className="label block">
            Short introduction
            <textarea
              className="field mt-2 min-h-24 w-full"
              maxLength={400}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="A short summary shown on the blog cards"
            />
          </label>

          <label className="label block">
            Post content <span className="font-normal text-ink/50">(Markdown supported)</span>
            <textarea
              className="field mt-2 min-h-[26rem] w-full resize-y font-mono text-sm leading-6"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={'## Start writing\n\nUse **bold**, *italics*, lists, and links in Markdown.'}
            />
          </label>

          <div className="rounded-2xl border border-ink/15 bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="label !mb-0">Post preview</p>
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5 text-xs"
                onClick={() => setPreviewOpen((open) => !open)}
              >
                {previewOpen ? <><Edit3 className="size-3.5" /> Edit</> : <><Eye className="size-3.5" /> Preview</>}
              </button>
            </div>
            {previewOpen ? (
              <div className="prose-uco mt-4 min-h-28" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="mt-3 text-sm text-ink/55">Preview is off while writing so the editor stays responsive.</p>
            )}
          </div>
        </div>

        <aside className="space-y-5 rounded-2xl border border-ink/15 bg-card p-5 md:p-6">
          <label className="label block">
            Category
            <select className="field mt-2 w-full" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Uncategorized</option>
              {categoryOptions.map(({ item, label }) => (
                <option key={item.id} value={item.id}>{label}</option>
              ))}
            </select>
          </label>

          <label className="label block">
            Tags <span className="font-normal text-ink/50">(separate with commas)</span>
            <input className="field mt-2 w-full" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="books, science, ideas" />
          </label>

          <div>
            <p className="label">Cover image</p>
            <label className={`btn-ghost mt-2 w-full cursor-pointer justify-center ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? 'Uploading…' : 'Upload image'}
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={uploadCover}
                disabled={uploading}
              />
            </label>
            <input
              className="field mt-3 w-full"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="Or paste an image URL"
            />
            {coverImage && (
              <img className="mt-3 aspect-video w-full rounded-xl border border-ink/15 object-cover" src={coverImage} alt="Cover preview" />
            )}
          </div>

          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="font-semibold">
              Status: <span className="capitalize">{status}</span>
            </p>
            <p className="mt-1 text-ink/60">
              Drafts stay private. Published posts appear on the public blog.
            </p>
          </div>

          {id && (
            <button type="submit" className="btn-ink w-full" disabled={busy || uploading}>
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Save current status
            </button>
          )}

          {id && status === 'published' && (
            <Link to="/posts/$slug" params={{ slug }} className="inline-flex items-center text-sm text-terracotta hover:underline">
              View published post ↗
            </Link>
          )}
        </aside>
      </div>

      <div className="sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/15 bg-card/95 p-3 shadow-xl backdrop-blur">
        <p className="text-sm text-ink/60">
          {status === 'published' ? 'Published post' : 'Draft'}{title.trim() ? ` · ${title.trim()}` : ''}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" disabled={busy || uploading} onClick={() => void save('draft')}>
            <Save className="size-4" /> Save draft
          </button>
          <button type="button" className="btn-saffron" disabled={busy || uploading} onClick={() => void save('published')}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {status === 'published' ? 'Update post' : 'Publish'}
          </button>
        </div>
      </div>

      {(error || notice) && (
        <p role={error ? 'alert' : 'status'} className={`mt-6 rounded-lg px-4 py-3 text-sm ${error ? 'bg-terracotta/10 text-terracotta' : 'bg-saffron/50'}`}>
          {error || notice}
        </p>
      )}
    </form>
  )
}
