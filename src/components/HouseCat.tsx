import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

type CatMode = 'walking' | 'sit' | 'look' | 'sleep' | 'run'

type Room = {
  min: number
  max: number
  home: number
}

const ROOMS: Record<string, Room> = {
  home: { min: 10, max: 78, home: 62 },
  library: { min: 8, max: 78, home: 28 },
  lab: { min: 22, max: 88, home: 70 },
  workshop: { min: 10, max: 82, home: 38 },
  desk: { min: 25, max: 88, home: 72 },
  studio: { min: 16, max: 86, home: 57 },
  darkroom: { min: 18, max: 82, home: 68 },
  hallway: { min: 8, max: 90, home: 50 },
}

function roomFor(pathname: string): Room {
  if (pathname === '/') return ROOMS.home
  if (pathname.includes('/blogs') || pathname.includes('/posts') || pathname.includes('/tags')) return ROOMS.library
  if (pathname.includes('/academia')) return ROOMS.lab
  if (pathname.includes('/workbench')) return ROOMS.workshop
  if (pathname.includes('/now')) return ROOMS.desk
  if (pathname.includes('/photography')) return ROOMS.darkroom
  if (pathname.includes('/paints')) return ROOMS.studio
  if (pathname.includes('/questions')) return ROOMS.hallway
  return ROOMS.hallway
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function WalkCat({ lookSide }: { lookSide: number }) {
  return (
    <svg viewBox="0 0 150 92" className="house-cat-svg" aria-hidden="true">
      <g className="cat-line" style={{ transform: `rotate(${lookSide * 2.5}deg)`, transformOrigin: '92px 45px' }}>
        <path d="M25 56c-1-16 13-25 31-27 18-2 37 3 48 13 7 7 11 12 20 13 11 1 17 5 18 10-11 4-22 4-31-1-8-4-13-10-19-13-10-5-30-3-45 1-9 3-16 7-22 4z" fill="rgba(245,236,217,.98)" />
        <path d="M32 51c-8-14-6-27 3-37 1 8 7 12 13 15-1 6-4 14-4 22z" fill="rgba(245,236,217,.98)" />
        <path d="M42 28l4-16 10 13" fill="rgba(245,236,217,.98)" />
        <path d="M64 30l7-16 8 17" fill="rgba(245,236,217,.98)" />
        <path d="M53 37c2-2 5-3 7-2M56 38c-2 0-4 1-5 2" fill="none" />
        <circle cx="54" cy="35" r="2.2" fill="#1c2146" stroke="none" />
        <path d="M41 51c7 4 13 6 21 7" />
        <path d="M32 54c-7 3-13 2-20-3-5-4-7-8-5-11 5 5 11 8 19 7" fill="none" strokeWidth="4" />
        <g className="cat-leg cat-leg-a"><path d="M63 59c-2 8-1 15 3 19" /><path d="M84 57c1 8 4 14 9 17" /></g>
        <g className="cat-leg cat-leg-b"><path d="M73 59c3 9 4 14 2 19" /><path d="M96 59c-2 7-1 13 3 18" /></g>
        <path d="M64 77h5M91 75h5M73 78h5M99 77h5" strokeWidth="2.5" />
        <path d="M124 55c7-8 12-16 11-24" fill="none" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M50 53h5M51 57h4" className="cat-whisker" />
    </svg>
  )
}

function SitCat({ lookSide }: { lookSide: number }) {
  return (
    <svg viewBox="0 0 150 92" className="house-cat-svg" aria-hidden="true">
      <g className="cat-line" style={{ transform: `rotate(${lookSide * 2}deg)`, transformOrigin: '78px 50px' }}>
        <path d="M44 72c-8-13-8-30 4-40 10-8 25-8 36-1 10 6 13 17 11 29-1 9 4 12 12 14H50c-4 0-5-1-6-2z" fill="rgba(245,236,217,.98)" />
        <path d="M39 43c-1-13 5-24 16-29 1 7 6 11 13 13 2 8-1 15-4 21z" fill="rgba(245,236,217,.98)" />
        <path d="M47 28l3-14 10 11M61 27l8-15 7 18" fill="rgba(245,236,217,.98)" />
        <circle cx="52" cy="32" r="2.2" fill="#1c2146" stroke="none" />
        <path d="M48 39c3 2 6 2 9 0M77 40c-4 1-7 1-9 0" />
        <path d="M35 66c-8 1-17-2-23-8-5-4-6-9-2-11 6 7 14 10 24 8" fill="none" strokeWidth="4" />
        <path d="M63 57v24M83 57v24" />
        <path d="M57 81h11M78 81h11" strokeWidth="2.5" />
        <path d="M44 49c-5 5-7 11-5 17" fill="none" strokeWidth="4" />
      </g>
    </svg>
  )
}

function SleepCat() {
  return (
    <svg viewBox="0 0 150 92" className="house-cat-svg cat-sleep-svg" aria-hidden="true">
      <g className="cat-line">
        <path d="M27 68c4-15 17-24 36-25 20-1 37 4 45 15 5 7 11 9 20 10H29c-2 0-3 0-2 0z" fill="rgba(245,236,217,.98)" />
        <path d="M46 54c-1-12 5-22 15-26 1 7 5 11 11 13 1 6-1 11-4 16z" fill="rgba(245,236,217,.98)" />
        <path d="M50 34l3-12 8 10M63 34l7-11 6 14" fill="rgba(245,236,217,.98)" />
        <path d="M56 49c2 2 5 2 8 0M74 49c3 2 6 2 8 0" />
        <path d="M54 44h0M75 44h0" strokeWidth="3" strokeLinecap="round" />
        <path d="M27 68c-6-8-5-13-1-17 6 6 11 8 18 8" fill="none" strokeWidth="4" />
        <path d="M99 58c7-4 14-4 19-1" fill="none" strokeWidth="3" />
        <path d="M120 55c3 2 5 4 7 7" fill="none" strokeWidth="3" />
      </g>
      <text x="102" y="35" className="cat-z">z</text>
      <text x="116" y="24" className="cat-z cat-z-2">z</text>
    </svg>
  )
}

export function HouseCat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const room = useMemo(() => roomFor(pathname), [pathname])
  const [position, setPosition] = useState(room.home)
  const [mode, setMode] = useState<CatMode>('walking')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [duration, setDuration] = useState(5200)
  const [lookSide, setLookSide] = useState(0)
  const [message, setMessage] = useState('')
  const [trails, setTrails] = useState(false)
  const targetRef = useRef(room.home)
  const sequenceRef = useRef(0)
  const cursorFrame = useRef<number | null>(null)
  const cursorSideRef = useRef(0)
  const cooldownRef = useRef(0)

  if (pathname.startsWith('/login') || pathname.startsWith('/admin')) return null

  useEffect(() => {
    const seq = ++sequenceRef.current
    const enteringFrom = Math.random() > 0.5 ? -12 : 112
    const target = randomBetween(room.min, room.max)
    const dir = target > enteringFrom ? 1 : -1
    targetRef.current = target
    setPosition(enteringFrom)
    setDirection(dir)
    setDuration(3600 + Math.random() * 3400)
    setMode('walking')
    setTrails(true)
    window.setTimeout(() => {
      if (sequenceRef.current !== seq) return
      setTrails(false)
    }, 2600)
    return () => undefined
  }, [room])

  useEffect(() => {
    let cancelled = false
    const wait = mode === 'walking' || mode === 'run' ? duration + 120 : 2200 + Math.random() * 5200
    const timer = window.setTimeout(() => {
      if (cancelled) return
      if (mode === 'walking' || mode === 'run') {
        const nextMode: CatMode = Math.random() < 0.68 ? 'walking' : Math.random() < 0.72 ? 'sit' : Math.random() < 0.75 ? 'look' : 'sleep'
        if (nextMode === 'walking') {
          const target = randomBetween(room.min, room.max)
          targetRef.current = target
          setDirection(target >= position ? 1 : -1)
          setDuration(3400 + Math.abs(target - position) * 90)
          setPosition(target)
          setTrails(true)
          window.setTimeout(() => setTrails(false), 1800)
        } else {
          setMode(nextMode)
        }
      } else {
        const target = randomBetween(room.min, room.max)
        targetRef.current = target
        setDirection(target >= position ? 1 : -1)
        setDuration(2600 + Math.abs(target - position) * 65)
        setMode('walking')
        setPosition(target)
        setTrails(true)
        window.setTimeout(() => setTrails(false), 1800)
      }
    }, wait)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [mode, room, position, duration])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (cursorFrame.current !== null) return
      cursorFrame.current = window.requestAnimationFrame(() => {
        cursorFrame.current = null
        const catX = (position / 100) * window.innerWidth
        const near = Math.abs(event.clientX - catX) < 140 && event.clientY > window.innerHeight - 180
        const side = near ? (event.clientX < catX ? -1 : 1) : 0
        cursorSideRef.current = side
        setLookSide(side)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (cursorFrame.current !== null) window.cancelAnimationFrame(cursorFrame.current)
    }
  }, [position])

  useEffect(() => {
    if (!lookSide) return
    const id = window.setTimeout(() => setLookSide(0), 900)
    return () => window.clearTimeout(id)
  }, [lookSide])

  function greet() {
    const now = Date.now()
    if (now < cooldownRef.current) return
    cooldownRef.current = now + 4500
    if (Math.random() < 0.22) {
      const away = direction === 1 ? 112 : -12
      targetRef.current = away
      setDirection(direction)
      setDuration(1000 + Math.random() * 800)
      setMode('run')
      setPosition(away)
      setTrails(true)
      setMessage('')
    } else {
      setMessage(Math.random() < 0.5 ? 'mrrp.' : '...cat.' )
      setMode('look')
      window.setTimeout(() => setMessage(''), 1800)
    }
  }

  const Cat = mode === 'sleep' ? <SleepCat /> : mode === 'sit' || mode === 'look' ? <SitCat lookSide={lookSide} /> : <WalkCat lookSide={lookSide} />

  return (
    <div className="house-cat-layer" aria-hidden="false">
      {trails && <div className="cat-trails" aria-hidden="true"><span/><span/><span/><span/></div>}
      <button
        type="button"
        className={`house-cat house-cat-${mode}`}
        style={{
          left: `${position}%`,
          transitionDuration: `${duration}ms`,
          transform: `translateX(-50%) scaleX(${direction})`,
        }}
        onClick={greet}
        aria-label="There is a cat wandering around Ucopedia. Sometimes she notices you."
      >
        {Cat}
        {message && <span className="cat-message">{message}</span>}
      </button>
    </div>
  )
}
