import { useEffect, useState } from 'react'

type GithubRepo = {
  pushed_at?: string | null
  default_branch?: string
  language?: string | null
  html_url?: string
}

type GithubCommit = {
  sha?: string
  commit?: {
    message?: string
    author?: { date?: string | null }
  }
}

const REPO = 'soni1umang/umangsucopedia-lab'
const API_BASE = 'https://api.github.com'
const REFRESH_MS = 60_000

function formatDate(value?: string | null) {
  if (!value) return 'checking…'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'checking…'
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatTime(value?: string | null) {
  if (!value) return 'checking…'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'checking…'
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function SiteStatus() {
  const [updated, setUpdated] = useState<string | null>(null)
  const [branch, setBranch] = useState('main')
  const [commit, setCommit] = useState<string | null>(null)
  const [language, setLanguage] = useState('React')
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const cacheBust = `?t=${Date.now()}`
        const headers = {
          Accept: 'application/vnd.github+json',
          'Cache-Control': 'no-cache',
        }

        const [repoResponse, commitsResponse] = await Promise.all([
          fetch(`${API_BASE}/repos/${REPO}${cacheBust}`, { headers }),
          fetch(`${API_BASE}/repos/${REPO}/commits?per_page=1&t=${Date.now()}`, { headers }),
        ])

        if (!repoResponse.ok || !commitsResponse.ok) throw new Error('GitHub API unavailable')

        const repo = (await repoResponse.json()) as GithubRepo
        const commits = (await commitsResponse.json()) as GithubCommit[]
        const latest = commits[0]

        if (cancelled) return

        setUpdated(latest?.commit?.author?.date ?? repo.pushed_at ?? null)
        setBranch(repo.default_branch ?? 'main')
        setLanguage(repo.language ?? 'React')
        setCommit(latest?.sha?.slice(0, 7) ?? null)
        setSyncedAt(new Date().toISOString())
        setLive(true)
      } catch {
        if (!cancelled) setLive(false)
      }
    }

    refresh()
    const interval = window.setInterval(refresh, REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return (
    <aside className="site-status" aria-label="Ucopedia live site status">
      <div className="site-status-head">
        <span className={`site-status-dot ${live ? 'is-live' : 'is-syncing'}`} />
        <span>site / status</span>
        <span className={`site-status-code ${live ? 'is-live' : 'is-syncing'}`}>
          {live ? 'LIVE' : 'SYNC'}
        </span>
      </div>

      <div className="site-status-title">
        <span>always</span> under construction<span className="site-status-punctuation">.</span>
      </div>

      <div className="site-status-grid">
        <div>
          <span>last update</span>
          <strong className="value-date">{formatDate(updated)}</strong>
        </div>
        <div>
          <span>branch</span>
          <strong className="value-branch">{branch}</strong>
        </div>
        <div>
          <span>latest commit</span>
          <strong className="value-commit">{commit ? `#${commit}` : 'checking…'}</strong>
        </div>
        <div>
          <span>runtime</span>
          <strong className="value-stack">React · Vite</strong>
        </div>
        <div>
          <span>source</span>
          <strong className="value-source">GitHub / public</strong>
        </div>
        <div>
          <span>language</span>
          <strong className="value-language">{language}</strong>
        </div>
      </div>

      <div className="site-status-footer">
        <span>github api</span>
        <span>•</span>
        <span>refresh 60s</span>
        <span>•</span>
        <span>sync {formatTime(syncedAt)}</span>
      </div>
    </aside>
  )
}
