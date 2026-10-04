import { Link } from '@tanstack/react-router'
import { useSiteSettings } from '@/lib/site-context'
import { SocialLinks } from './SocialIcons'
import type { NavItem } from './Header'

const loginUrl = `${import.meta.env.BASE_URL}login/`

export function Footer({ nav }: { nav: NavItem[] }) {
  const settings = useSiteSettings()
  const blogs = nav.find((n) => n.to === '/blogs')?.children ?? []
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="container-uco grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-end gap-2"><p className="font-display text-4xl font-semibold">{settings.name}<span className="text-saffron">.</span></p><span className="mb-1 font-mono text-[.58rem] uppercase tracking-[.22em] text-saffron">lab</span></div>
          <p className="mt-2 font-display text-lg italic text-paper/70">The curious laboratory.</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/60">Research, questions, experiments and side quests — documented as they happen.</p>
          <SocialLinks
            links={settings.socials}
            className="mt-6 flex-wrap gap-2"
            itemClassName="border border-paper/15 text-paper/80 hover:border-saffron"
          />
        </div>
        <div>
          <p className="eyebrow !text-saffron">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav
              .filter((n) => n.to !== '/')
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-paper/70 transition hover:text-saffron">
                    {n.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-saffron">Read by topic</p>
          <ul className="mt-4 space-y-2 text-sm">
            {blogs.map((b) => (
              <li key={b.to}>
                <Link to={b.to} className="text-paper/70 transition hover:text-saffron">
                  {b.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-uco flex flex-col items-center justify-between gap-2 py-5 text-xs text-paper/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.title}. All thoughts my own.
          </p>
          <a href={loginUrl} className="hover:text-saffron">
            Owner login
          </a>
        </div>
      </div>
    </footer>
  )
}
