import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

type CatMode = 'walking' | 'sit' | 'look' | 'sleep' | 'run'

type Room = {
  min: number
  max: number
}

const ROOMS: Record<string, Room> = {
  home: { min: 8, max: 82 },
  library: { min: 7, max: 84 },
  lab: { min: 18, max: 88 },
  workshop: { min: 8, max: 82 },
  desk: { min: 20, max: 88 },
  studio: { min: 12, max: 86 },
  darkroom: { min: 16, max: 84 },
  hallway: { min: 8, max: 90 },
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

function CatFace({ sleeping = false }: { sleeping?: boolean }) {
  return <>
    {sleeping ? (
      <>
        <path d="M45 44c4 3 8 3 12 0M66 44c4 3 8 3 12 0" fill="none" />
        <path d="M57 51l3-2 3 2-3 2z" className="cat-nose" />
      </>
    ) : (
      <>
        <ellipse cx="50" cy="42" rx="4" ry="5.5" className="cat-eye" />
        <ellipse cx="73" cy="42" rx="4" ry="5.5" className="cat-eye" />
        <circle cx="51" cy="42" r="1.8" className="cat-pupil" />
        <circle cx="72" cy="42" r="1.8" className="cat-pupil" />
        <path d="M58 51l3-3 3 3-3 3z" className="cat-nose" />
        <path d="M61 54c-2 3-5 4-8 2M61 54c2 3 5 4 8 2" fill="none" />
      </>
    )}
    <path d="M43 51c-9-3-17-1-24 2M43 55c-9 0-17 3-23 7M80 51c8-3 16-1 23 2M80 55c8 0 16 3 22 7" className="cat-whisker" />
  </>
}

function TabbyBody({ sleeping = false, sitting = false }: { sleeping?: boolean; sitting?: boolean }) {
  if (sleeping) {
    return (
      <g className="cat-line">
        <path d="M24 72c2-17 17-27 39-27 20 0 39 8 46 22 3 6 10 8 19 9H27c-2 0-3-2-3-4z" className="cat-body" />
        <path d="M41 52c-2-13 4-25 16-30 6 5 10 12 10 21-3 8-9 11-17 13z" className="cat-body" />
        <path d="M43 36l2-17 12 12M60 34l10-15 7 18" className="cat-body" />
        <CatFace sleeping />
        <path d="M30 69c-7-4-13-8-16-16-2-5 1-9 5-7 4 6 10 10 19 12" className="cat-tail" />
        <path d="M42 54l-2 18M70 52v20" />
        <path d="M38 72h9M66 72h9" className="cat-paw" />
        <path d="M30 62c10 2 18 2 27 0M39 70c8 2 15 2 22 0" className="cat-stripe" />
      </g>
    )
  }

  return (
    <g className="cat-line">
      <path d={sitting
        ? "M50 73c-9-5-13-17-11-30 2-15 13-24 28-24 18 0 30 12 31 29 1 11 5 18 15 25H50z"
        : "M30 61c0-16 13-25 31-28 19-3 39 2 50 13 7 7 12 11 23 12 10 1 17 5 20 10-12 5-25 5-35-1-8-5-13-11-21-13-12-3-30 0-46 7-10 4-18 5-22 0z"
      } className="cat-body" />
      <path d="M34 52c-5-13-2-27 9-37 2 8 8 12 16 14 2 8-1 16-5 23z" className="cat-body" />
      <path d="M43 31l3-17 12 13M59 30l10-18 9 20" className="cat-body" />
      <CatFace />
      {!sitting && <g className="cat-legs-a"><path d="M64 60c-3 8-2 15 2 22M88 58c0 9 4 16 9 20" /></g>}
      {!sitting && <g className="cat-legs-b"><path d="M75 59c4 8 4 16 1 22M99 61c-2 8 0 14 5 19" /></g>}
      {sitting && <><path d="M58 59v21M80 59v21M42 53c-6 7-6 15-2 21" /><path d="M53 80h11M75 80h11" className="cat-paw" /></>}
      {!sitting && <><path d="M62 81h8M91 78h9M72 81h8M100 80h8" className="cat-paw" /></>}
      <path d="M32 54c-8 4-15 2-22-4-5-4-7-9-3-12 6 6 12 9 21 8" className="cat-tail" />
      <path d="M125 59c9-7 15-16 15-27" className="cat-tail" />
      <path d="M57 34l4 6M65 32l4 7M74 33l5 6M47 45l-1 7M81 44l1 7M93 45l2 7M106 50l2 7" className="cat-stripe" />
      <path d="M129 49l7 4M132 42l7 4M135 34l6 3" className="cat-stripe" />
      <path d="M40 21l6 3M69 18l7 4" className="cat-stripe" />
    </g>
  )
}

function CatArt({ mode, lookSide }: { mode: CatMode; lookSide: number }) {
  return (
    <svg viewBox="0 0 180 110" className="house-cat-svg" aria-hidden="true">
      <g style={{ transform: `rotate(${lookSide * 1.5}deg)`, transformOrigin: '70px 56px' }}>
        <TabbyBody sleeping={mode === 'sleep'} sitting={mode === 'sit' || mode === 'look'} />
      </g>
      {mode === 'sleep' && <>
        <text x="101" y="35" className="cat-z">z</text>
        <text x="117" y="25" className="cat-z cat-z-2">z</text>
      </>}
    </svg>
  )
}

export function HouseCat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const hidden = pathname.startsWith('/login') || pathname.startsWith('/admin')
  const room = useMemo(() => roomFor(pathname), [pathname])
  const [position, setPosition] = useState(50)
  const [mode, setMode] = useState<CatMode>('walking')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [duration, setDuration] = useState(12000)
  const [lookSide, setLookSide] = useState(0)
  const [message, setMessage] = useState('')
  const [arrived, setArrived] = useState(false)
  const pointerFrame = useRef<number | null>(null)
  const clickCooldown = useRef(0)

  useEffect(() => {
    const enterFrom = Math.random() > 0.5 ? -11 : 111
    const destination = randomBetween(room.min, room.max)
    const walkDuration = 8500 + Math.random() * 5000
    setPosition(enterFrom)
    setDirection(destination > enterFrom ? 1 : -1)
    setDuration(walkDuration)
    setMode('walking')
    setArrived(false)
    setMessage('')
    const reveal = window.setTimeout(() => setArrived(true), 180)
    return () => window.clearTimeout(reveal)
  }, [room])

  useEffect(() => {
    if (hidden || !arrived) return
    let timer: number
    if (mode === 'walking' || mode === 'run') {
      const wait = duration + 700
      timer = window.setTimeout(() => {
        const roll = Math.random()
        if (roll < 0.07) {
          setMode('sleep')
        } else if (roll < 0.22) {
          setMode('sit')
        } else if (roll < 0.29) {
          setMode('look')
        } else {
          const destination = randomBetween(room.min, room.max)
          const delta = destination - position
          setDirection(delta >= 0 ? 1 : -1)
          setDuration(9000 + Math.abs(delta) * 85 + Math.random() * 3500)
          setMode('walking')
          setPosition(destination)
        }
      }, wait)
    } else {
      const pause = mode === 'sleep' ? 8500 + Math.random() * 7000 : 4000 + Math.random() * 7000
      timer = window.setTimeout(() => {
        if (Math.random() < 0.025) {
          const edge = direction > 0 ? 112 : -12
          setDirection(direction)
          setDuration(1500 + Math.random() * 900)
          setMode('run')
          setPosition(edge)
        } else {
          const destination = randomBetween(room.min, room.max)
          const delta = destination - position
          setDirection(delta >= 0 ? 1 : -1)
          setDuration(9000 + Math.abs(delta) * 90 + Math.random() * 3500)
          setMode('walking')
          setPosition(destination)
        }
        setMessage('')
      }, pause)
    }
    return () => window.clearTimeout(timer)
  }, [mode, arrived, hidden, room, position, duration, direction])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (pointerFrame.current !== null) return
      pointerFrame.current = window.requestAnimationFrame(() => {
        pointerFrame.current = null
        const catX = (position / 100) * window.innerWidth
        if (event.clientY < window.innerHeight - 160) {
          setLookSide(0)
          return
        }
        const near = Math.abs(event.clientX - catX) < 150
        setLookSide(near ? (event.clientX < catX ? -1 : 1) : 0)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current)
    }
  }, [position])

  useEffect(() => {
    if (!lookSide) return
    const id = window.setTimeout(() => setLookSide(0), 900)
    return () => window.clearTimeout(id)
  }, [lookSide])

  function greet() {
    const now = Date.now()
    if (now < clickCooldown.current) return
    clickCooldown.current = now + 5000
    if (Math.random() < 0.12) {
      const edge = Math.random() > 0.5 ? -12 : 112
      setDirection(edge > position ? 1 : -1)
      setDuration(1500 + Math.random() * 1000)
      setMode('run')
      setPosition(edge)
      setMessage('')
    } else {
      setMode('look')
      setMessage(Math.random() < 0.45 ? 'mrrp.' : Math.random() < 0.7 ? 'hm.' : '…')
      window.setTimeout(() => setMessage(''), 1900)
    }
  }

  if (hidden) return null

  return (
    <div className="house-cat-layer" aria-label="A cat lives here.">
      <button
        type="button"
        className={`house-cat house-cat-${mode}${arrived ? '' : ' cat-entering'}`}
        style={{
          left: `${position}%`,
          transitionDuration: `${duration}ms`,
          transform: `translateX(-50%) scaleX(${direction})`,
        }}
        onClick={greet}
        aria-label="A cat is wandering around Ucopedia."
      >
        <CatArt mode={mode} lookSide={lookSide} />
        {message && <span className="cat-message">{message}</span>}
      </button>
    </div>
  )
}
