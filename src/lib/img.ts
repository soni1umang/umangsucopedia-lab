export function img(src: string | null | undefined, _w?: number, _h?: number) {
  if (!src) return ''
  if (!src.startsWith('/')) return src
  return import.meta.env.BASE_URL.replace(/\/$/, '') + src
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
