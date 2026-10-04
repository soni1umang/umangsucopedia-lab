import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Brain, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { getContent, type QuestionItem } from '@/lib/content'
import { questions as fallbackQuestions, site } from '@/config/site'

export const Route = createFileRoute('/questions')({
  loader: () => getContent<QuestionItem[]>('questions', fallbackQuestions),
  head: () => ({ meta: [{ title: `Questions · ${site.title}` }] }),
  component: Questions,
})

function Questions() {
  const items = Route.useLoaderData()
  return <>
    <div className="container-uco pt-10"><Link to="/blogs" className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-terracotta">Read <ChevronRight className="size-3.5"/> Questions</Link></div>
    <PageHeader eyebrow="Unfinished thinking" title={<>Questions<span className="text-terracotta">.</span></>}>
      Some things I am not ready to turn into answers yet.
    </PageHeader>
    <section className="container-uco">
      <div className="space-y-5">
        {items.map((item,i)=><article key={item.question+i} className="group grid gap-5 rounded-[1.75rem] border-2 border-ink bg-card p-6 transition duration-500 hover:shadow-[8px_8px_0_var(--color-saffron)] md:grid-cols-[4rem_1fr_auto] md:items-center md:p-8">
          <div className="grid size-12 place-items-center rounded-full border-2 border-ink bg-saffron"><Brain className="size-5"/></div>
          <div><p className="font-mono text-[.6rem] uppercase tracking-[.2em] text-terracotta">Question {String(i+1).padStart(2,'0')}</p><h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">{item.question}</h2><p className="mt-2 max-w-3xl text-ink/60">{item.note}</p>{item.tags?.length?<div className="mt-3 flex flex-wrap gap-1.5">{item.tags.map(t=><span key={t} className="rounded-full border border-ink/10 px-2.5 py-1 font-mono text-[.58rem] uppercase tracking-widest text-ink/45">{t}</span>)}</div>:null}</div>
          {item.href ? <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold hover:text-terracotta">Explore <ArrowUpRight className="size-4"/></a> : <span className="hidden font-mono text-[.62rem] uppercase tracking-widest text-ink/25 md:block">still open</span>}
        </article>)}
      </div>
    </section>
  </>
}