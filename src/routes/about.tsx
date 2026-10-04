import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/PageHeader'
import { SocialLinks } from '@/components/SocialIcons'
import { about, site } from '@/config/site'
import { img } from '@/lib/img'
import { getContent, type AboutContent } from '@/lib/content'

export const Route = createFileRoute('/about')({
  loader: () => getContent<AboutContent>('about', about),
  head: () => ({ meta: [{ title: `About me · ${site.title}` }] }),
  component: About,
})

function About() {
  const data = Route.useLoaderData()
  return (
    <>
      <PageHeader eyebrow="About me" title={data.headline} />
      <section className="container-uco grid gap-12 md:grid-cols-[1fr_1.5fr]">
        <aside className="space-y-6">
          <div className="relative">
            <div className="absolute -inset-2 -rotate-2 rounded-3xl bg-terracotta/70" aria-hidden />
            <img
              src={img('/img/cat-my-questions.jpg', 640, 640)}
              alt="About Umang"
              className="relative aspect-square w-full rounded-3xl border-2 border-ink object-cover"
            />
          </div>
          <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-card">
            {data.facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-ink/55">{f.label}</dt>
                <dd className="text-right font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
          <SocialLinks className="flex-wrap" />
        </aside>
        <div>
          <p className="font-display text-2xl leading-snug text-ink md:text-3xl">{data.intro}</p>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/75">
            {data.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <h2 className="mt-12 text-2xl font-semibold">Things I think about</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {data.interests.map((t) => <li key={t} className="rounded-full border border-ink/20 bg-card px-4 py-1.5 text-sm">{t}</li>)}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link to="/blogs" className="btn-saffron">Read my blog</Link>
            <Link to="/contact" className="btn-ghost">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  )
}
