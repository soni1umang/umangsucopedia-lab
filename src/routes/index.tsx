import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Camera, GraduationCap, Palette, Rocket } from 'lucide-react'
import { posts, categories } from '@/data/blog'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { SocialLinks } from '@/components/SocialIcons'
import { about, albums, paintings, site } from '@/config/site'
import { getContent, type Album, type AboutContent, type Painting } from '@/lib/content'
import { useSiteSettings } from '@/lib/site-context'
import { img } from '@/lib/img'

export const Route = createFileRoute('/')({
  loader: async () => { const [latest, cs, aboutData, photoData, paintData] = await Promise.all([posts(), categories(), getContent<AboutContent>('about', about), getContent<Album[]>('photography', albums), getContent<Painting[]>('paintings', paintings)]); return { latest: latest.slice(0, 6), categories: cs, about: aboutData, albums: photoData, paintings: paintData } },
  component: Home,
})

const sections = [
  ['/academia', 'Academia', 'Studies, research and my portfolio of work.', GraduationCap],
  ['/photography', 'Photography', 'Places and faces, starting with Kerala.', Camera],
  ['/paints', 'Paints', 'Acrylics, watercolours and happy accidents.', Palette],
  ['/side-hustles', 'Side Hustles', 'Things I build and try on the side.', Rocket],
] as const

function Home() {
  const settings = useSiteSettings()
  const { latest, categories, about: aboutData, albums: albumData, paintings: paintingData } = Route.useLoaderData()
  const [featured, ...rest] = latest

  return (
    <>
      <section className="container-uco grid items-center gap-10 pb-16 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-16">
        <div>
          <p className="eyebrow">{settings.tagline}</p>
          <h1 className="mt-4 text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            {settings.owner}’s
            <br />
            <span className="italic text-terracotta">Ucopedia</span>
            <span className="text-saffron">.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/75">
            {settings.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/blogs" className="btn-saffron">
              <BookOpen className="size-4" /> Start reading
            </Link>
            <Link to="/about" className="btn-ghost">About me</Link>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-widest text-ink/50">Find me</span>
            <span className="h-px w-8 bg-ink/20" />
            <SocialLinks links={settings.socials} />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-saffron/60" aria-hidden />
          <img
            src={img('/img/hero.jpg', 900)}
            alt="Illustration of a mind opening into books, film, planets and a camera"
            className="relative w-full rounded-[1.75rem] border-2 border-ink object-cover"
          />
          <p className="absolute -bottom-4 left-6 rounded-full border-2 border-ink bg-paper px-4 py-1.5 font-mono text-xs uppercase tracking-widest">
            always under construction
          </p>
        </div>
      </section>

      <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-paper">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap font-display text-2xl italic">
          {[...aboutData.interests, ...aboutData.interests, ...aboutData.interests].map((t, i) => (
            <span key={i}>{t} <span className="text-saffron not-italic">✦</span></span>
          ))}
        </div>
      </div>

      <section className="container-uco pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Fresh from the notebook</p>
            <h2 className="mt-2 text-4xl font-semibold md:text-5xl">Latest writing</h2>
          </div>
          <Link to="/blogs" className="hidden text-sm font-semibold hover:text-terracotta sm:inline-flex">
            All posts <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>

        {featured ? (
          <div className="mt-10 grid gap-6">
            <PostCard post={featured as any} featured />
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => <PostCard key={p.id} post={p as any} />)}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-ink/25 p-10 text-center text-ink/60">
            The first posts are on their way.
          </p>
        )}
      </section>

      <section className="container-uco pt-24">
        <p className="eyebrow">Wander by topic</p>
        <h2 className="mt-2 text-4xl font-semibold md:text-5xl">The shelves of Ucopedia</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.filter((c: any) => !c.parent_id).map((c: any, i: number) => (
            <CategoryCard
              key={c.id}
              slug={c.slug}
              name={c.name}
              description={c.description}
              coverImage={c.cover_image}
              index={i}
            />
          ))}
        </div>
      </section>

      <section className="container-uco pt-24">
        <div className="grid gap-10 rounded-[2rem] border-2 border-ink bg-card p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <div>
            <p className="eyebrow">Beyond the blog</p>
            <h2 className="mt-2 text-4xl font-semibold">Things I make &amp; study</h2>
            <p className="mt-4 text-ink/70">
              The portfolio side of Ucopedia: coursework and research, photographs from the road,
              paintings from quiet afternoons, and experiments on the side.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[albumData[0]?.photos[1]?.src, paintingData[0]?.src, albumData[0]?.photos[3]?.src]
                .filter(Boolean)
                .map((src, i) => (
                  <img key={i} src={img(src as string, 240, 240)} alt="" className="aspect-square rounded-xl object-cover" />
                ))}
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {sections.map(([to, label, blurb, Icon]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-6 transition hover:border-ink hover:bg-saffron/30"
                >
                  <Icon className="size-6 text-terracotta" />
                  <span className="mt-6 font-display text-2xl font-semibold">{label}</span>
                  <span className="mt-1 text-sm text-ink/65">{blurb}</span>
                  <ArrowRight className="mt-auto size-5 transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}