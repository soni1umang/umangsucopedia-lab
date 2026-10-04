import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Atom, BookOpen, Camera, FlaskConical, Github, Hammer, Map, Paintbrush, Radio, Sparkles } from 'lucide-react'
import { posts, categories } from '@/data/blog'
import { PostCard } from '@/components/PostCard'
import { SocialLinks } from '@/components/SocialIcons'
import { about, albums, paintings, site, now as fallbackNow, workbench as fallbackWorkbench } from '@/config/site'
import { getContent, type AboutContent, type Album, type Painting, type NowItem, type WorkbenchItem } from '@/lib/content'
import { useSiteSettings } from '@/lib/site-context'
import { img } from '@/lib/img'
import { ResearchConstellation } from '@/components/ResearchConstellation'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [latest, cs, aboutData, photoData, paintData, nowData, workbenchData] = await Promise.all([
      posts(), categories(),
      getContent<AboutContent>('about', about),
      getContent<Album[]>('photography', albums),
      getContent<Painting[]>('paintings', paintings),
      getContent<NowItem[]>('now', fallbackNow),
      getContent<WorkbenchItem[]>('workbench', fallbackWorkbench),
    ])
    return { latest: latest.slice(0, 5), categories: cs, about: aboutData, albums: photoData, paintings: paintData, now: nowData, workbench: workbenchData }
  },
  component: Home,
})

function SignalTrace() {
  return <svg viewBox="0 0 800 180" className="absolute inset-x-0 bottom-0 w-full opacity-30" preserveAspectRatio="none" aria-hidden>
    <path d="M0 105 H110 l24 -55 24 108 30 -70 20 25 25 -12 22 4 15 -1 18 0 18 -42 16 84 16 -48 18 22 18 -24 18 12 18 0 18 -12 18 0 18 0 18 -62 18 124 18 -58 18 22 20 -18 20 10 20 0 20 -8 20 0 20 0 20 -46 20 94 20 -42 20 16 20 -15 20 7 20 0 20 0 20 -25 20 55 20 -34 20 8 20 -7 20 5 20 0 20 0" fill="none" stroke="#eab53a" strokeWidth="3" strokeLinecap="round" />
    <path d="M0 105 H800" stroke="#f5ecd9" strokeOpacity=".12" strokeDasharray="4 12"/>
  </svg>
}

function Home() {
  const settings = useSiteSettings()
  const { latest, categories, about: aboutData, albums, paintings: paintData, now: nowItems, workbench } = Route.useLoaderData()
  const [featured, ...rest] = latest
  const activeNow = nowItems.slice(0, 3)
  const featuredBench = workbench.filter(w => w.featured).slice(0, 2)

  return <>
    <section className="container-uco relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute -right-24 top-0 size-[30rem] rounded-full bg-saffron/20 blur-3xl drift"/>
      <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-3 py-1.5 font-mono text-[.62rem] uppercase tracking-[.18em] text-ink/55">
            <span className="size-2 animate-pulse rounded-full bg-leaf"/>
            curious laboratory · online
          </div>
          <p className="eyebrow">{settings.tagline}</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(3.6rem,9vw,7.4rem)] font-semibold leading-[.87] tracking-[-.045em]">
            {settings.owner}’s
            <br />
            <span className="italic text-terracotta">Ucopedia</span><span className="text-saffron">.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[clamp(1.05rem,2vw,1.35rem)] leading-relaxed text-ink/72">
            A living notebook for research, questions, experiments and the things I make when I am supposed to be doing something else.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/now" className="btn-saffron"><Radio className="size-4"/> What’s happening now</Link>
            <Link to="/workbench" className="btn-ghost"><Hammer className="size-4"/> Enter the workbench</Link>
          </div>
          <div className="mt-8 flex items-center gap-3"><span className="font-mono text-[.62rem] uppercase tracking-[.18em] text-ink/45">signals</span><span className="h-px w-7 bg-ink/15"/><SocialLinks links={settings.socials}/></div>
        </div>
        <div className="lab-panel lab-grid relative overflow-hidden rounded-[2.2rem] border-2 border-ink bg-ink shadow-[12px_12px_0_var(--color-saffron)]">
          <div className="relative aspect-[4/4.3] overflow-hidden">
            <img src={img('/img/hero.jpg', 1000)} alt="Illustration of a mind opening into books, film, planets and a camera" className="h-full w-full object-cover opacity-85 mix-blend-screen"/>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/15"/>
            <SignalTrace/>
            <div className="absolute left-5 top-5 rounded-xl border border-paper/15 bg-ink/60 px-4 py-3 font-mono text-[.62rem] text-paper/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-saffron"><Atom className="size-3.5"/> SYS / UCOPEDIA</div>
              <div className="mt-1">state = always_under_construction</div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div><p className="font-mono text-[.58rem] uppercase tracking-[.2em] text-paper/40">working principle</p><p className="mt-1 font-display text-2xl italic text-paper">follow the interesting thing.</p></div>
              <span className="rounded-full border border-paper/20 bg-paper/10 px-3 py-1.5 font-mono text-[.58rem] uppercase tracking-widest text-paper/60">001</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y-2 border-ink bg-ink text-paper">
      <div className="container-uco grid gap-6 py-7 md:grid-cols-4">
        {[
          ['READ','Ideas, essays, books','/blogs',BookOpen],
          ['RESEARCH','Devices, papers, questions','/academia',FlaskConical],
          ['MAKE','Workbench, photos, paints','/workbench',Hammer],
          ['NOW','Current obsessions','/now',Radio],
        ].map(([label,desc,to,Icon])=><Link key={String(to)} to={String(to)} className="group border-l border-paper/10 pl-5 transition hover:border-saffron">
          <div className="flex items-center justify-between"><span className="font-mono text-[.65rem] tracking-[.2em] text-saffron">{String(label)}</span><Icon className="size-4 text-paper/35 transition group-hover:translate-x-1 group-hover:text-saffron"/></div>
          <p className="mt-2 text-sm text-paper/60">{String(desc)}</p>
        </Link>)}
      </div>
    </section>

    <section className="container-uco pt-20 md:pt-28">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Now</p>
          <h2 className="mt-2 max-w-xl text-4xl font-semibold md:text-6xl">What is occupying my brain.</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">A deliberately temporary list. Finished things leave this room and become part of the archive.</p>
          <Link to="/now" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">See the live notebook <ArrowRight className="size-4"/></Link>
        </div>
        <div className="grid gap-3">
          {activeNow.map((item,i)=><div key={item.title+i} className="research-card group rounded-2xl border border-ink/10 bg-card p-5">
            <div className="flex items-center gap-3"><span className="font-mono text-[.6rem] tracking-[.18em] text-terracotta">{item.label}</span><span className="h-px flex-1 bg-ink/10"/><span className="font-mono text-[.55rem] uppercase tracking-widest text-ink/30">{item.status}</span></div>
            <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{item.detail}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="container-uco pt-24">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Research map</p><h2 className="mt-2 text-4xl font-semibold md:text-5xl">Ideas connected, not filed.</h2></div><Link to="/academia" className="hidden text-sm font-semibold hover:text-terracotta sm:inline-flex">Research overview <ArrowRight className="ml-1 size-4"/></Link></div>
      <ResearchConstellation interests={aboutData.interests}/>
    </section>

    <section className="container-uco pt-24">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Workbench</p><h2 className="mt-2 text-4xl font-semibold md:text-5xl">Make. Break. Learn.</h2></div><Link to="/workbench" className="hidden text-sm font-semibold hover:text-terracotta sm:inline-flex">Open workbench <ArrowRight className="ml-1 size-4"/></Link></div>
      <div className="grid gap-6 lg:grid-cols-2">
        {featuredBench.map((item,i)=><article key={item.title+i} className="research-card lab-panel lab-grid rounded-[2rem] border-2 border-ink bg-card p-7 md:p-8">
          <div className="flex items-center justify-between"><span className="font-mono text-[.62rem] uppercase tracking-[.2em] text-terracotta">{item.kind}</span><span className="rounded-full bg-paper-deep px-3 py-1 text-[.62rem] font-semibold uppercase tracking-wider">{item.status}</span></div>
          <h3 className="mt-5 font-display text-3xl font-semibold">{item.title}</h3>
          <p className="mt-3 text-lg font-medium">{item.goal}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/62">{item.description}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-ink/10 bg-paper p-4"><p className="font-mono text-[.56rem] uppercase tracking-widest text-ink/35">learning</p><p className="mt-2 text-sm text-ink/65">{item.learning}</p></div><div className="rounded-xl border border-ink/10 bg-paper p-4"><p className="font-mono text-[.56rem] uppercase tracking-widest text-ink/35">next</p><p className="mt-2 text-sm text-ink/65">{item.next}</p></div></div>
        </article>)}
      </div>
    </section>

    <section className="container-uco pt-24">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">From the notebook</p><h2 className="mt-2 text-4xl font-semibold md:text-5xl">Latest writing</h2></div><Link to="/blogs" className="text-sm font-semibold hover:text-terracotta">All writing <ArrowRight className="ml-1 inline size-4"/></Link></div>
          {featured ? <div className="mt-8"><PostCard post={featured as any} featured/></div> : <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/55">The first signal is still forming.</div>}
        </div>
        <div className="lab-panel lab-grid rounded-[2rem] border-2 border-ink bg-ink p-7 text-paper md:p-8">
          <p className="font-mono text-[.62rem] uppercase tracking-[.2em] text-saffron">field notes</p>
          <p className="mt-6 font-display text-3xl italic">“The interesting part is usually hiding between disciplines.”</p>
          <div className="mt-10 h-px bg-paper/10"/>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Link to="/questions" className="group rounded-xl border border-paper/10 bg-paper/5 p-4 transition hover:border-saffron/40"><Map className="size-5 text-saffron"/><span className="mt-5 block font-semibold">Questions</span><span className="mt-1 block text-xs text-paper/50">Things I haven’t solved yet.</span><ArrowRight className="mt-5 size-4 transition group-hover:translate-x-1"/></Link>
            <Link to="/about" className="group rounded-xl border border-paper/10 bg-paper/5 p-4 transition hover:border-saffron/40"><Github className="size-5 text-saffron"/><span className="mt-5 block font-semibold">About</span><span className="mt-1 block text-xs text-paper/50">The person behind the experiments.</span><ArrowRight className="mt-5 size-4 transition group-hover:translate-x-1"/></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="container-uco pt-24">
      <p className="eyebrow">Read by subject</p><h2 className="mt-2 text-4xl font-semibold md:text-5xl">The shelves.</h2>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{categories.filter((c:any)=>!c.parent_id).slice(0,8).map((c:any,i:number)=><Link key={c.id} to={`/blogs/${c.slug}`} className="group relative min-h-44 overflow-hidden rounded-2xl border-2 border-ink bg-card p-5 transition duration-500 hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--color-saffron)]"><div className="absolute inset-0 opacity-[.08] lab-grid"/><span className="relative font-mono text-[.6rem] text-terracotta">{String(i+1).padStart(2,'0')}</span><h3 className="relative mt-10 font-display text-2xl font-semibold">{c.name}</h3><p className="relative mt-2 text-xs leading-relaxed text-ink/55">{c.description}</p><ArrowRight className="absolute bottom-5 right-5 size-4 transition group-hover:translate-x-1"/></Link>)}</div>
    </section>

    <section className="container-uco pt-24">
      <div className="flex flex-col gap-6 rounded-[2rem] border-2 border-ink bg-saffron p-7 md:flex-row md:items-end md:justify-between md:p-10">
        <div><p className="font-mono text-[.62rem] uppercase tracking-[.2em] text-ink/55">Personal rule</p><h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold md:text-5xl">Follow the interesting thing.<br/><span className="italic font-normal">Document what happens next.</span></h2></div>
        <Link to="/now" className="btn-ink shrink-0">See what’s happening <ArrowRight className="size-4"/></Link>
      </div>
    </section>
  </>
}
