import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

type CatMode = 'walking' | 'sit' | 'look' | 'sleep'

type Room = { min: number; max: number }

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

const CAT_SRC =
  'https://images.rawpixel.com/image_png_social_square/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHUyMzMyMTEyLWltYWdlLWpvYjcwNi0wMi5wbmc.png'

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function HouseCat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const hidden = pathname.startsWith('/login') || pathname.startsWith('/admin')
  const room = useMemo(() => roomFor(pathname), [pathname])

  const [position, setPosition] = useState(50)
  const [mode, setMode] = useState<CatMode>('walking')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [duration, setDuration] = useState(19000)
  const [lookSide, setLookSide] = useState(0)
  const [message, setMessage] = useState('')
  const [arrived, setArrived] = useState(false)
  const pointerFrame = useRef<number | null>(null)
  const clickCooldown = useRef(0)

  useEffect(() => {
    const enterFrom = Math.random() > 0.5 ? -15 : 115
    const destination = randomBetween(room.min, room.max)
    setPosition(enterFrom)
    setDirection(destination > enterFrom ? 1 : -1)
    setDuration(18000 + Math.random() * 7000)
    setMode('walking')
    setArrived(false)
    setMessage('')

    const reveal = window.setTimeout(() => setArrived(true), 220)
    return () => window.clearTimeout(reveal)
  }, [room])

  useEffect(() => {
    if (hidden || !arrived) return

    const pause =
      mode === 'sleep'
        ? 11000 + Math.random() * 9000
        : mode === 'walking'
          ? duration + 1300
          : 5200 + Math.random() * 7500

    const timer = window.setTimeout(() => {
      const roll = Math.random()

      if (mode === 'walking') {
        if (roll < 0.13) setMode('sleep')
        else if (roll < 0.38) setMode('sit')
        else if (roll < 0.52) setMode('look')
        else {
          const destination = randomBetween(room.min, room.max)
          const delta = destination - position
          setDirection(delta >= 0 ? 1 : -1)
          setDuration(15500 + Math.abs(delta) * 125 + Math.random() * 5500)
          setMode('walking')
          setPosition(destination)
        }
      } else {
        const destination = randomBetween(room.min, room.max)
        const delta = destination - position
        setDirection(delta >= 0 ? 1 : -1)
        setDuration(15500 + Math.abs(delta) * 125 + Math.random() * 5500)
        setMode('walking')
        setPosition(destination)
        setMessage('')
      }
    }, pause)

    return () => window.clearTimeout(timer)
  }, [mode, arrived, hidden, room, position, duration])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (pointerFrame.current !== null) return
      pointerFrame.current = window.requestAnimationFrame(() => {
        pointerFrame.current = null
        const catX = (position / 100) * window.innerWidth
        const near = Math.abs(event.clientX - catX) < 180
        const lowEnough = event.clientY > window.innerHeight - 230
        setLookSide(lowEnough && near ? (event.clientX < catX ? -1 : 1) : 0)
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
    const id = window.setTimeout(() => setLookSide(0), 1200)
    return () => window.clearTimeout(id)
  }, [lookSide])

  function greet() {
    const now = Date.now()
    if (now < clickCooldown.current) return
    clickCooldown.current = now + 4500
    setMode('look')
    setMessage(Math.random() < 0.45 ? 'mrrp.' : Math.random() < 0.7 ? 'hm.' : '…')
    window.setTimeout(() => setMessage(''), 2100)
  }

  if (hidden) return null

  return (
    <div className="house-cat-layer" aria-label="A realistic tabby cat lives here.">
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
        <span className={`house-cat-photo-wrap cat-photo-${mode}${lookSide ? ' cat-photo-looking' : ''}`}>
          <img src={CAT_SRC} alt="" className="house-cat-photo" draggable={false} loading="eager" />
        </span>
        {message && <span className="cat-message">{message}</span>}
      </button>
    </div>
  )
}
