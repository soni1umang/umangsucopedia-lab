import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronDown,\n  BookHeart,\n  CalendarDays,
  ChevronRight,
  CircleHelp,
  Gamepad2,
  Home,
  Info,
  Mail,
  Menu,
  Microscope,
  PenLine,
  Sparkles,
  X,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/site-context'\nimport { supabase } from '@/lib/supabase'

import { SocialLinks } from './SocialIcons'
import { useIdentity } from '@/lib/identity-context'
import { cn } from '@/lib/utils'

export type Category = { id:number; slug:string; name:string; description?:string; cover_image?:string|null; parent_id?:number|null }

export type NavItem = {
  label: string
  to: string
  href?: string
  children?: NavItem[]
}

export function buildNav(categories: Category[], photoAlbums: { slug: string; title: string }[] = []): NavItem[] {
  const toItem = (c: Category): NavItem => ({
    label: c.name,
    to: `/blogs/${c.slug}`,
    ...(c.slug === 'entangled-minds' ? { href: 'https://entangledminds0.wordpress.com/' } : {}),
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
        { label: 'Read by tag', to: '/tags' },
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
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-ink/80 transition hover:bg-paper-deep hover:text-ink"
            >
              {item.label}
              <ChevronRight className="size-3.5 opacity-60" />
            </a>
          ) : (
            <Link
              to={item.to}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-ink/80 transition hover:bg-paper-deep hover:text-ink"
              activeProps={{ className: 'bg-paper-deep text-ink font-medium' }}
            >
              {item.label}
              {item.children?.length ? <ChevronRight className="size-3.5 opacity-60" /> : null}
            </Link>
          )}
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

const menuIcons = {
  Home,
  Read: Sparkles,
  Research: Microscope,
  Make: Gamepad2,
  Now: CircleHelp,
  About: Info,
  Contact: Mail,
} as const

function MobileRadialMenu({
  nav,
  open,
  onClose,
  pathname,
}: {
  nav: NavItem[]
  open: boolean
  onClose: () => void
  pathname: string
}) {
  const visible = nav.filter((item) => ['Home', 'Read', 'Research', 'Make', 'Now', 'About', 'Contact'].includes(item.label))
  const [activeChildren, setActiveChildren] = useState<NavItem | null>(null)
  const [viewportWidth, setViewportWidth] = useState(390)

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!open) setActiveChildren(null)
  }, [open])

  const handleNavigate = () => {
    setActiveChildren(null)
    onClose()
  }

  // Geometry is calculated from the actual viewport width.
  const radius = Math.min(320, Math.max(225, viewportWidth * 0.72))
  const startAngle = 95
  const endAngle = 175
  const angleStep = visible.length > 1 ? (endAngle - startAngle) / (visible.length - 1) : 0

  const submenu =
    open && activeChildren?.children?.length
      ? (
        <div
          className="mobile-radial-submenu-panel"
          role="dialog"
          aria-label={`${activeChildren.label} submenu`}
        >
          <div className="mobile-radial-submenu-rail">
            {activeChildren.children.map((child, index) => (
              <Link
                key={child.to}
                to={child.to}
                className="mobile-radial-sub-bubble"
                style={{ ['--sub-delay' as string]: `${index * 55}ms` }}
                onClick={handleNavigate}
              >
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )
      : null

  return (
    <>
      <div
        className={cn('mobile-radial-wrap lg:hidden', open ? 'is-open' : 'is-closed')}
        aria-hidden={!open}
      >
        <div className="mobile-radial-scrim" onClick={onClose} aria-hidden="true" />

        <div
          className="mobile-radial-orbit"
          aria-label="Quick navigation"
          style={{ ['--radial-radius' as string]: `${radius}px` }}
        >
          <div className="mobile-radial-ring mobile-radial-ring-a" />
          <div className="mobile-radial-ring mobile-radial-ring-b" />

          {visible.map((item, index) => {
            const Icon = menuIcons[item.label as keyof typeof menuIcons] ?? CircleHelp
            const active = isActive(pathname, item.to)
            const angle = startAngle + index * angleStep
            const radians = angle * Math.PI / 180
            const x = Math.cos(radians) * radius
            const y = Math.sin(radians) * radius
            const hasChildren = !!item.children?.length

            return (
              <div
                key={item.to}
                className={cn('mobile-radial-item', hasChildren && 'has-submenu')}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  ['--radial-delay' as string]: `${index * 42}ms`,
                }}
              >
                <Link
                  to={item.to}
                  className={cn('mobile-radial-bubble', active && 'is-active')}
                  onClick={handleNavigate}
                >
                  <Icon className="mobile-radial-icon" />
                  <span>{item.label}</span>
                </Link>

                {hasChildren && (
                  <button
                    type="button"
                    className="mobile-radial-child-toggle"
                    aria-label={`${activeChildren?.to === item.to ? 'Hide' : 'Show'} ${item.label} sub-menu`}
                    aria-expanded={activeChildren?.to === item.to}
                    onClick={(event) => {
                      event.stopPropagation()
                      setActiveChildren(activeChildren?.to === item.to ? null : item)
                    }}
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {submenu && typeof document !== 'undefined'
        ? createPortal(submenu, document.body)
        : null}
    </>
  )
}

function PocketJournal() {
  const [open,setOpen]=useState(false)
  const [calendarOpen,setCalendarOpen]=useState(false)
  const [loading,setLoading]=useState(false)
  const [entries,setEntries]=useState<any[]>([])
  const [selected,setSelected]=useState('')
  const [month,setMonth]=useState(new Date().toLocaleDateString('en-CA').slice(0,7))
  useEffect(()=>{
    if(!open)return
    let alive=true;setLoading(true)
    supabase.from('journal_entries').select('entry_date,title,body,photos,published').eq('published',true).order('entry_date',{ascending:true}).then(({data,error})=>{
      if(!alive)return
      setEntries(error?[]:(data||[]));setLoading(false)
    })
    return()=>{alive=false}
  },[open])
  const visible=entries.filter(e=>e.entry_date.slice(0,7)===month)
  const active=entries.find(e=>e.entry_date===selected)||entries[entries.length-1]
  const dateLabel=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'long',year:'numeric'})
  const calendar=useMemo(()=>{
    const [y,m]=month.split('-').map(Number)
    return {offset:(new Date(y,m-1,1).getDay()+6)%7,count:new Date(y,m,0).getDate()}
  },[month])
  useEffect(()=>{if(open&&!selected&&entries.length)setSelected(entries[entries.length-1].entry_date)},[open,entries,selected])
  const changeMonth=(n:number)=>{const [y,m]=month.split('-').map(Number);setMonth(new Date(y,m-1+n,1).toLocaleDateString('en-CA').slice(0,7))}
  return <>
    <div className="pocket-journal-actions" aria-label="Personal journal shortcuts">
      <button type="button" className="pocket-journal-fab" onClick={()=>{setOpen(true);setCalendarOpen(false)}} aria-label="Open pocket journal" title="Pocket journal"><BookHeart className="size-5"/><span>Journal</span></button>
      <button type="button" className="pocket-calendar-fab" onClick={()=>{setOpen(true);setCalendarOpen(v=>!v)}} aria-label="Open journal calendar" title="Journal calendar"><CalendarDays className="size-5"/></button>
    </div>
    {open&&typeof document!=='undefined'&&createPortal(
      <div className="pocket-journal-overlay" role="dialog" aria-modal="true" aria-label="Pocket journal">
        <button className="pocket-journal-backdrop" onClick={()=>setOpen(false)} aria-label="Close journal"/>
        <div className="pocket-journal-stage">
          <div className="pocket-journal-topbar"><span><BookHeart className="inline size-4 mr-2"/>A pocket of days</span><div><button onClick={()=>setCalendarOpen(v=>!v)} aria-label="Toggle calendar"><CalendarDays className="size-4"/></button><button onClick={()=>setOpen(false)} aria-label="Close"><X className="size-5"/></button></div></div>
          <div className={'pocket-book '+(calendarOpen?'calendar-open':'')}>
            <div className="pocket-book-cover"><div className="pocket-cover-label">little things<br/>worth remembering</div><div className="pocket-cover-mark">✳</div><span>FIELD NOTES · PRIVATE MOMENTS</span></div>
            <div className="pocket-book-pages">
              <div className="pocket-page">
                {loading?<p className="pocket-empty">Turning to a page…</p>:!active?<div className="pocket-empty"><BookHeart className="mx-auto size-8 mb-3 opacity-50"/><p>No shared pages yet.</p><span>Choose a day in your dashboard and publish a page to see it here.</span></div>:<>
                  <div className="pocket-page-meta"><span>FIELD NOTES</span><span>{dateLabel(active.entry_date)}</span></div>
                  <h2>{active.title||'An ordinary day'}</h2>
                  <div className="pocket-page-body">{(active.body||'').split('\n').map((line:string,i:number)=><p key={i}>{line||' '}</p>)}</div>
                  {Array.isArray(active.photos)&&active.photos.length>0&&<div className="pocket-page-photos">{active.photos.slice(0,2).map((src:string,i:number)=><figure key={src} className={i?'pocket-photo-alt':''}><img src={src} alt={'A memory from '+active.entry_date}/></figure>)}</div>}
                  <div className="pocket-page-number">{entries.findIndex(e=>e.entry_date===active.entry_date)+1} / {entries.length}</div>
                </>}
                {active&&<div className="pocket-page-turn"><button onClick={()=>{const i=entries.findIndex(e=>e.entry_date===active.entry_date);if(i>0)setSelected(entries[i-1].entry_date)}} disabled={entries.findIndex(e=>e.entry_date===active.entry_date)<=0} aria-label="Turn to earlier page"><ChevronLeft className="size-5"/></button><button onClick={()=>{const i=entries.findIndex(e=>e.entry_date===active.entry_date);if(i<entries.length-1)setSelected(entries[i+1].entry_date)}} disabled={entries.findIndex(e=>e.entry_date===active.entry_date)>=entries.length-1} aria-label="Turn to later page"><ChevronRight className="size-5"/></button></div>}
              </div>
            </div>
          </div>
          {calendarOpen&&<aside className="pocket-mini-calendar"><div className="flex items-center justify-between"><button onClick={()=>changeMonth(-1)} aria-label="Previous month"><ChevronLeft className="size-4"/></button><strong>{new Date(month+'-15T12:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'})}</strong><button onClick={()=>changeMonth(1)} aria-label="Next month"><ChevronRight className="size-4"/></button></div><div className="pocket-calendar-grid">{['M','T','W','T','F','S','S'].map((d,i)=><span key={d+i}>{d}</span>)}{Array.from({length:calendar.offset},(_,i)=><i key={'blank'+i}/>)}{Array.from({length:calendar.count},(_,i)=>{const day=String(i+1).padStart(2,'0'),key=month+'-'+day,exists=entries.some(e=>e.entry_date===key);return <button key={key} className={(exists?'has-page ':'')+(selected===key?'current-page':'')} disabled={!exists} onClick={()=>{setSelected(key);setCalendarOpen(false)}}>{i+1}</button>})}</div><p>{visible.length} {visible.length===1?'page':'pages'} this month</p></aside>}
          <p className="pocket-journal-hint">Use the arrows to turn pages · choose the calendar to jump to a day</p>
        </div>
      </div>,document.body)}
  </>
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
    return () => {
      document.body.style.overflow = ''
    }
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
        </Link>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
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
            className={cn('mobile-menu-button lg:hidden', mobileOpen && 'is-open')}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <MobileRadialMenu nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />\n      <PocketJournal />
    </header>
  )
}
