import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, MapPin, Send } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SocialLinks } from '@/components/SocialIcons'
import { site } from '@/config/site'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: `Contact · ${site.title}` }] }),
  component: Contact,
})

function Contact() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  return (
    <>
      <PageHeader eyebrow="Contact" title={<>Say <span className="italic text-terracotta">hello</span>.</>}>
        A question, a book recommendation, a disagreement about a film: my inbox is open.
      </PageHeader>
      <section className="container-uco grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-card p-6">
            <p className="flex items-center gap-3 text-ink/80">
              <Mail className="size-5 text-terracotta" />
              <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
            </p>
            <p className="mt-3 flex items-center gap-3 text-ink/80">
              <MapPin className="size-5 text-terracotta" /> {site.location}
            </p>
          </div>
          <div>
            <p className="label">Elsewhere</p>
            <SocialLinks className="flex-wrap" />
          </div>
        </aside>

        {state === 'sent' ? (
          <div className="grid place-items-center rounded-2xl border-2 border-ink bg-card p-10 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-saffron">
                <Mail className="size-6" />
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Message sent!</h2>
              <p className="mt-2 text-ink/70">Thanks for writing. I’ll get back to you soon.</p>
              <button onClick={() => setState('idle')} className="btn-ghost mt-6">
                Send another
              </button>
            </div>
          </div>
        ) : (
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={async (e) => {
              e.preventDefault()
              setState('sending')
              const formData = new FormData(e.currentTarget)
              try {
                const res = await fetch('/contact.html', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
                })
                setState(res.ok ? 'sent' : 'error')
              } catch {
                setState('error')
              }
            }}
            className="space-y-5 rounded-2xl border-2 border-ink bg-card p-6 md:p-8"
          >
            <input type="hidden" name="form-name" value="contact" />
            <p hidden>
              <label>
                Don’t fill this out: <input name="bot-field" />
              </label>
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" name="name" required className="field" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" required className="field" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea id="message" name="message" required rows={6} className="field resize-y" placeholder="What’s on your mind?" />
            </div>
            {state === 'error' && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-2 text-sm text-terracotta">
                Something went wrong sending your message. Please try again.
              </p>
            )}
            <button type="submit" disabled={state === 'sending'} className="btn-saffron">
              <Send className="size-4" /> {state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}
