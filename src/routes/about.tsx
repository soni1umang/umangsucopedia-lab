import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Brain, FlaskConical, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SocialLinks } from '@/components/SocialIcons'
import { about, site } from '@/config/site'
import { img } from '@/lib/img'
import { getContent, type AboutContent } from '@/lib/content'
import { useSiteSettings } from '@/lib/site-context'

export const Route = createFileRoute('/about')({
  loader: () => getContent<AboutContent>('about', about),
  head: () => ({ meta: [{ title: `About · ${site.title}` }] }),
  component: About,
})

function About() {
  const data = Route.useLoaderData()
  const settings = useSiteSettings()
  return <>
    <PageHeader eyebrow="About / the person behind the notebook" title={<>I get distracted by <span className="italic text-terracotta">interesting things</span>.</>}>
      The formal résumé lives elsewhere. This is the version with the rabbit holes left in.
    </PageHeader>
    <section className="container-uco grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <div className="lab-panel lab-grid relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-3 shadow-[9px_9px_0_var(--color-terracotta)]">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-paper">
            <img src={img('/img/cat-my-questions.jpg', 800, 800)} alt="About Umang" className="h-full w-full object-cover"/>
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-paper/20 bg-ink/75 p-4 text-paper backdrop-blur-sm"><p className="font-mono text-[.55rem] uppercase tracking-[.2em] text-saffron">observed state</p><p className="mt-1 font-display text-xl italic">curious / unfinished / making</p></div>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-card">
          {data.facts.map(f=><div key={f.label} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="text-ink/45">{f.label}</dt><dd className="text-right font-medium">{f.value}</dd></div>)}
        </dl>
        <SocialLinks className="mt-5 flex-wrap" links={settings.socials}/>
      </aside>

      <div>
        <div className="rounded-[2rem] border-2 border-ink bg-saffron p-7 md:p-9">
          <div className="flex items-start gap-4"><Brain className="mt-1 size-7 shrink-0 text-ink"/><p className="font-display text-2xl leading-snug text-ink md:text-4xl">{data.intro}</p></div>
        </div>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink/75">{data.paragraphs.map((p,i)=><p key={i} className={i===0?'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:text-terracotta':''}>{p}</p>)}</div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-card p-6"><FlaskConical className="size-6 text-terracotta"/><h2 className="mt-5 text-2xl font-semibold">The researcher</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">Quantum transport, RF measurement, quantum sensing and the stubborn little details between a device and a good measurement.</p></div>
          <div className="rounded-2xl border border-ink/10 bg-card p-6"><Sparkles className="size-6 text-terracotta"/><h2 className="mt-5 text-2xl font-semibold">The rest of me</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">Photography, painting, electronics, music and side quests that usually start with a question.</p></div>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Things I think about</h2>
        <ul className="mt-5 flex flex-wrap gap-2">{data.interests.map(t=><li key={t} className="rounded-full border border-ink/15 bg-card px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-ink hover:bg-saffron/35">{t}</li>)}</ul>
        <div className="mt-12 flex flex-wrap gap-3"><Link to="/now" className="btn-saffron">See what I’m doing now <ArrowRight className="size-4"/></Link><Link to="/workbench" className="btn-ghost">Visit the workbench</Link></div>
      </div>
    </section>
  </>
}
