import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, Menu, PenLine, X } from 'lucide-react'
import { site } from '@/config/site'
import { useSiteSettings } from '@/lib/site-context'

import { SocialLinks } from './SocialIcons'
import { useIdentity } from '@/lib/identity-context'
import { cn } from '@/lib/utils'

export type Category = { id:number; slug:string; name:string; description?:string; cover_image?:string|null; parent_id?:number|null }

export type NavItem = {
  label: string
  to: string
  children?: NavItem[]
}

export function buildNav(categories: Category[], photoAlbums: { slug: string; title: string }[] = []): NavItem[] {
  const toItem = (c: Category): NavItem => ({
    label: c.name,
    to: `/blogs/${c.slug}`,
    children: categories.filter((k) => k.parent_id === c.id).map(toItem),
  })
  return [
    { label: 'Home', to: '/' },
    {
      label: 'Read',
      to: '/blogs',
      children: [
        { label: 'Essays', to: '/blogs', children: categories.filter((c) => !c.parent_id).map(toItem) },
        { label: 'Questions', to: '/questions' },
      ],
    },
    {
      label: 'Research',
      to: '/academia',
      children: [
        { label: 'Overview', to: '/academia' },
        { label: 'Publications', to: '/academia/publications' },
        { label: 'Academic work', to: '/academia/portfolio' },
      ],
    },
    {
      label: 'Make',
      to: '/workbench',
      children: [
        { label: 'Workbench', to: '/workbench' },
        { label: 'Photography', to: '/photography', children: photoAlbums.map((a) => ({ label: a.title, to: `/photography/${a.slug}` })) },
        { label: 'Paints', to: '/paints' },
      ],
    },
    { label: 'Now', to: '/now' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ]
}

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
}

function Flyout({ items, depth = 0 }: { items: NavItem[]; depth?: number }) {
  return (
    <ul
      className={cn(
        'min-w-56 rounded-xl border border-ink/10 bg-card p-1.5 shadow-[6px_6px_0_rgb(28_33_70/0.12)]',
        depth > 0 && 'max-h-[70vh] overflow-y-auto',
      )}
    >
      {items.map((item) => (
        <li key={item.to} className="group/sub relative">
          <Link
            to={item.to}
            className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-ink/80 transition hover:bg-paper-deep hover:text-ink"
            activeProps={{ className: 'bg-paper-deep text-ink font-medium' }}
          >
            {item.label}
            {item.children?.length ? <ChevronRight className="size-3.5 opacity-60" /> : null}
          </Link>
          {item.children?.length ? (
            <div className="invisible absolute left-full top-0 z-50 pl-2 opacity-0 transition group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
              <Flyout items={item.children} depth={depth + 1} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function MobileItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const hasChildren = !!item.children?.length
  return (
    <li>
      <div className="flex items-center">
        <Link
          to={item.to}
          onClick={onNavigate}
          className="flex-1 py-2.5 text-ink/85"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'font-semibold text-terracotta' }}
        >
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-full hover:bg-paper-deep"
          >
            <ChevronDown className={cn('size-4 transition', open && 'rotate-180')} />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="ml-3 border-l border-dashed border-ink/20 pl-4">
          {item.children!.map((c) => (
            <MobileItem key={c.to} item={c} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function Header({ nav }: { nav: NavItem[] }) {
  const settings = useSiteSettings()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useIdentity()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors',
        scrolled ? 'border-ink/10 bg-paper/90 backdrop-blur-md' : 'border-transparent bg-paper/60',
      )}
    >
      <div className="container-uco flex h-16 items-center gap-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Ucopedia home">
          <span className="relative grid size-9 place-items-center rounded-full bg-ink font-display text-lg font-bold text-saffron transition group-hover:rotate-[-8deg]">
            U<span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-terracotta"/>
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-tight text-ink">{settings.name}<span className="text-terracotta">.</span><span className="ml-1 font-mono text-[.62rem] font-semibold uppercase tracking-[.18em] text-terracotta">lab</span></span>
            <span className="mt-1 hidden font-mono text-[.48rem] uppercase tracking-[.24em] text-ink/35 sm:block">the curious laboratory</span>
          </span>
        </Link>    <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) => (
              <li key={item.to} className="group relative">
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-ink/75 transition hover:text-ink',
                    isActive(pathname, item.to) && 'bg-ink text-paper hover:text-paper',
                  )}
                >
                  {item.label}
                  {item.children?.length ? (
                    <ChevronDown className="size-3.5 opacity-70 transition group-hover:rotate-180" />
                  ) : null}
                </Link>
                {item.children?.length ? (
                  <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <Flyout items={item.children} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {user && (
            <Link to="/admin" className="btn-saffron !px-3.5 !py-1.5 text-xs" title="Write & manage posts">
              <PenLine className="size-3.5" /> Dashboard
            </Link>
          )}
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ink/15 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 animate-in fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper shadow-2xl animate-in slide-in-from-right">
            <div className="flex h-16 items-center justify-between border-b border-ink/10 px-5">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid size-10 place-items-center rounded-full hover:bg-paper-deep"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-5 py-3">
              {nav.map((item) => (
                <MobileItem key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </ul>
            <div className="border-t border-ink/10 px-4 py-4">
              <SocialLinks className="flex-wrap" links={settings.socials} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
