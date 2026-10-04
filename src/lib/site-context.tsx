import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { site as fallbackSite, socials as fallbackSocials } from '@/config/site'
import { getContent, type SiteSettings } from '@/lib/content'

const fallback: SiteSettings = {
  ...fallbackSite,
  socials: fallbackSocials.map((s) => ({ ...s, enabled: true, icon: s.key === 'instagram2' ? 'instagram' : s.key as any })),
}

const Ctx = createContext<SiteSettings>(fallback)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(fallback)

  useEffect(() => {
    let alive = true
    getContent<SiteSettings>('site_settings', fallback).then((data) => {
      if (!alive) return
      setSettings({
        ...fallback,
        ...data,
        socials: Array.isArray(data?.socials) ? (() => {
          const list = data.socials.map((s:any) => ({ ...s, icon: s.icon ?? (s.key === 'instagram2' ? 'instagram' : s.key) }))
          if (!list.some((s:any) => s.key === 'instagram2')) {
            list.push({ key: 'instagram2', label: 'Instagram · second account', href: '', enabled: false, icon: 'instagram' })
          }
          return list
        })() : fallback.socials,
      })
    })
    return () => { alive = false }
  }, [])

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>
}

export function useSiteSettings() {
  return useContext(Ctx)
}
