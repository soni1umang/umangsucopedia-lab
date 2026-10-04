import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { img } from '@/lib/img'

export type LightboxItem = { src: string; title?: string; caption?: string }

export function Gallery({
  items,
  className,
  renderItem,
}: {
  items: LightboxItem[]
  className?: string
  renderItem: (item: LightboxItem, open: () => void) => React.ReactNode
}) {
  const [index, setIndex] = useState<number | null>(null)
  const current = index === null ? null : items[index]

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') setIndex((i) => (i! + 1) % items.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i! - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, items.length])

  return (
    <>
      <div className={className}>{items.map((item, i) => renderItem(item, () => setIndex(i)))}</div>
      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 text-paper animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={current.title ?? current.caption}
        >
          <div className="flex justify-end">
            <button type="button" onClick={() => setIndex(null)} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-paper/10">
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIndex((index! - 1 + items.length) % items.length)}
              className="absolute left-0 grid size-12 place-items-center rounded-full bg-paper/10 hover:bg-paper/20"
            >
              <ChevronLeft className="size-6" />
            </button>
            <img src={img(current.src, 1800)} alt={current.caption ?? ''} className="max-h-[78vh] max-w-full rounded-lg object-contain" />
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIndex((index! + 1) % items.length)}
              className="absolute right-0 grid size-12 place-items-center rounded-full bg-paper/10 hover:bg-paper/20"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
          <div className="py-4 text-center">
            {current.title && <p className="font-display text-xl">{current.title}</p>}
            {current.caption && <p className="text-sm text-paper/70">{current.caption}</p>}
            <p className="mt-1 font-mono text-xs text-paper/40">{index! + 1} / {items.length}</p>
          </div>
        </div>
      )}
    </>
  )
}
