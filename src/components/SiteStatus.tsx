import { useEffect, useState } from 'react'

type GithubRepo = {
  pushed_at?: string | null
  default_branch?: string
}

type GithubCommit = {
  sha?: string
  commit?: { message?: string }
}

const REPO = 'soni1umang/umangsucopedia-lab'

function formatDate(value?: string | null) {
  if (!value) return 'recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'recently'
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function SiteStatus() {
  const [updated, setUpdated] = useState<string | null>(null)
  const [branch, setBranch] = useState('main')
  const [commit, setCommit] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      fetch(`https://api.github.com/repos/${REPO}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.github.com/repos/${REPO}/commits?per_page=1`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
      }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([repo, commits]) => {
        if (repo) {
          setUpdated(repo.pushed_at ?? null)
          setBranch(repo.default_branch ?? 'main')
        }
        const latest = Array.isArray(commits) ? (commits[0] as GithubCommit | undefined) : undefined
        if (latest?.sha) setCommit(latest.sha.slice(0, 7))
        if (latest?.commit?.message) setMessage(latest.commit.message.split('\\n')[0])
      })
      .catch(() => {
        // The banner has useful static information even when GitHub is unavailable.
      })

    return () => controller.abort()
  }, [])

  return (
    <aside className="site-status" aria-label="Ucopedia site status">
      <div className="site-status-head">
        <span className="site-status-dot" />
        <span>site / status</span>
        <span className="site-status-code">LIVE</span>
      </div>

      <div className="site-status-title">always under construction.</div>

      <div className="site-status-grid">
        <div>
          <span>last update</span>
          <strong>{formatDate(updated)}</strong>
        </div>
        <div>
          <span>branch</span>
          <strong>{branch}</strong>
        </div>
        <div>
          <span>latest commit</span>
          <strong>{commit ? `#${commit}` : 'checking…'}</strong>
        </div>
        <div>
          <span>stack</span>
          <strong>React · Vite</strong>
        </div>
      </div>

      {message && <p className="site-status-message" title={message}>{message}</p>}
    </aside>
  )
}
