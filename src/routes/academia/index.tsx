import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, ExternalLink, GraduationCap, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { academia, publications as fallbackPublications, site } from '@/config/site'
import { getContent, type AcademiaContent, type PublicationItem, type LinkedInPost } from '@/lib/content'
import { useSiteSettings } from '@/lib/site-context'
import { ResearchConstellation } from '@/components/ResearchConstellation'
import { SocialIcon } from '@/components/SocialIcons'
import { linkedinPosts as fallbackLinkedInPosts } from '@/config/site'

export const Route = createFileRoute('/academia/')({
  loader: async () => {
    const [data, pubs, linkedIn] = await Promise.all([
      getContent<AcademiaContent>('academia', academia),
      getContent<PublicationItem[]>('publications', fallbackPublications),
      getContent<LinkedInPost[]>('linkedin_posts', fallbackLinkedInPosts),
    ])
    return { data, pubs, linkedIn }
  },
  head: () => ({ meta: [{ title: `Academia · ${site.title}` }] }),
  component: Academia,
})

function Academia() {
  const { data, pubs, linkedIn } = Route.useLoaderData()
  const settings = useSiteSettings()
  const featured = pubs.find((p) => p.featured) ?? pubs[0]
  return (
    <>
      <PageHeader eyebrow="Academia" title={<>Learning, <span className="italic text-terracotta">formally</span>.</>}>
        {data.intro}
      </PageHeader>
      <section className="container-uco grid gap-10 md:grid-cols-[1.35fr_.65fr]">
        <div>
          <h2 className="text-2xl font-semibold">Education</h2>
          <ol className="relative mt-6 space-y-8 border-l-2 border-dashed border-ink/20 pl-8">
            {data.education.map((e, i) => (
              <li key={e.school + i} className="relative">
                <span className="absolute -left-[2.6rem] grid size-8 place-items-center rounded-full border-2 border-ink bg-saffron"><GraduationCap className="size-4" /></span>
                <p className="font-mono text-xs uppercase tracking-widest text-terracotta">{e.period}</p>
                <h3 className="mt-1 text-2xl font-semibold">{e.school}</h3>
                <p className="font-medium text-ink/80">{e.degree}</p>
                <p className="mt-2 text-ink/65">{e.note}</p>
              </li>
            ))}
          </ol>
        </div>
        <aside className="space-y-6">
          <div>
            <p className="eyebrow">Signal map</p>
            <h2 className="mt-2 text-3xl font-semibold">Research is a network.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">The subjects change. The curiosity connecting them is the constant.</p>
          </div>
          <ResearchConstellation interests={data.interests}/>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
            <Link to="/academia/portfolio" className="group flex min-h-32 min-w-0 items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-saffron p-4 transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] sm:p-5">
              <span className="min-w-0"><span className="block font-sans text-[clamp(1rem,1.7vw,1.35rem)] font-semibold leading-tight">Academic work</span><span className="mt-1 block text-[clamp(.72rem,1vw,.85rem)] leading-snug text-ink/75">Projects, talks, awards &amp; more</span></span>
              <ArrowRight className="size-6 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/academia/publications" className="group flex min-h-32 min-w-0 items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-ink p-4 text-paper transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-saffron)] sm:p-5">
              <span className="min-w-0"><span className="flex items-center gap-2 font-sans text-[clamp(1rem,1.7vw,1.35rem)] font-semibold leading-tight"><BookOpen className="size-4 shrink-0 text-saffron"/>Publications</span><span className="mt-1 block text-[clamp(.72rem,1vw,.85rem)] leading-snug text-paper/65">{pubs.length ? pubs.length + ' ' + (pubs.length === 1 ? 'paper' : 'papers') + ' in the record' : 'Your papers, beautifully archived'}</span></span>
              <ArrowRight className="size-6 text-saffron transition group-hover:translate-x-1" />
            </Link>
            {settings.academic_portfolio_url && (
              <a href={settings.academic_portfolio_url} target="_blank" rel="noreferrer" className="group flex min-h-32 min-w-0 items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-card p-4 transition hover:-translate-y-0.5 hover:bg-paper-deep hover:shadow-[6px_6px_0_var(--color-ink)] sm:p-5">
                <span className="min-w-0"><span className="flex items-center gap-2 font-sans text-[clamp(1rem,1.7vw,1.35rem)] font-semibold leading-tight"><ExternalLink className="size-4 shrink-0 text-terracotta"/><span className="break-words">{settings.academic_portfolio_label || 'Full Academic Profile'}</span></span><span className="mt-1 block text-[clamp(.72rem,1vw,.85rem)] leading-snug text-ink/60">Open my complete academic profile ↗</span></span>
                <ExternalLink className="size-6 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            )}
          </div>
        </aside>
      </section>

      <LinkedInUpdates items={linkedIn} />

      {featured && (
        <section className="container-uco pt-16">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-card p-7 md:p-9">
            <div className="absolute right-0 top-0 size-48 rounded-full bg-saffron/20 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-[8rem_1fr_auto] md:items-center">
              <div className="grid size-28 place-items-center rounded-2xl border border-ink/10 bg-paper">
                <Sparkles className="size-8 text-terracotta" />
              </div>
              <div>
                <p className="eyebrow">Featured publication</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{featured.title}</h2>
                <p className="mt-2 text-sm text-ink/55">{featured.journal}{featured.year ? ' · ' + featured.year : ''}</p>
              </div>
              <Link to="/academia/publications" className="btn-ghost">Explore publications <ArrowRight className="size-4"/></Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}


function linkedinSrc(code: string): string | null {
  const value = code.trim()
  if (!value) return null
  const iframe = value.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const candidate = iframe || (value.startsWith('https://www.linkedin.com/embed/') || value.startsWith('https://linkedin.com/embed/') ? value : null)
  if (!candidate) return null
  try {
    const u = new URL(candidate)
    if (!/^(www\.)?linkedin\.com$/i.test(u.hostname) || !u.pathname.startsWith('/embed/')) return null
    return u.toString()
  } catch {
    return null
  }
}

function LinkedInUpdates({ items }: { items: LinkedInPost[] }) {
  const valid = items.filter((p) => p.enabled !== false).map((p) => ({ ...p, src: linkedinSrc(p.embed_code) })).filter((p): p is LinkedInPost & { src: string } => Boolean(p.src))
  if (!valid.length) return null

  return (
    <section className="container-uco pt-16 md:pt-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Academic notebook</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Recent on LinkedIn<span className="text-terracotta">.</span></h2>
        </div>
        <a href="https://www.linkedin.com/in/umang-soni420/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-sm font-semibold hover:text-terracotta sm:inline-flex">
          <SocialIcon name="linkedin" className="size-4" /> View profile <ExternalLink className="size-3.5" />
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {valid.slice(0, 4).map((p, i) => (
          <article key={p.embed_code + i} className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
            <iframe
              src={p.src}
              title={p.title || 'LinkedIn post'}
              loading="lazy"
              className="min-h-[520px] w-full"
              frameBorder="0"
              allowFullScreen
            />
          </article>
        ))}
      </div>
      <div className="mt-5 sm:hidden">
        <a href="https://www.linkedin.com/in/umang-soni420/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
          <Linkedin className="size-4" /> View profile <ExternalLink className="size-3.5" />
        </a>
      </div>
    </section>
  )
}
