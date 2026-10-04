import { supabase } from './supabase'

export type AboutContent = {
  headline: string
  intro: string
  paragraphs: string[]
  facts: { label: string; value: string }[]
  interests: string[]
}

export type AcademiaContent = {
  intro: string
  education: { school: string; degree: string; period: string; note: string }[]
  interests: string[]
}

export type PortfolioItem = {
  title: string
  kind: string
  year: string
  description: string
  link: string
  venue?: string
  authors?: string
  images?: string[]
  featured?: boolean
}

export type SideHustleItem = {
  title: string
  status: string
  description: string
  link: string
  images?: string[]
}

export type NowItem = {
  label: string
  title: string
  detail: string
  status: string
  href?: string
}
 
export type WorkbenchItem = {
  title: string
  kind: string
  status: string
  goal: string
  description: string
  learning: string
  next: string
  link: string
  images?: string[]
  featured?: boolean
  show_on_now?: boolean
}

export type QuestionItem = {
  question: string
  note: string
  href?: string
  tags?: string[]
}

export type PublicationItem = {
  title: string
  doi: string
  year: string
  journal: string
  authors: string
  publisher: string
  volume: string
  issue: string
  pages: string
  description: string
  link: string
  pdf_url: string
  preview_image: string
  citations?: number
  featured?: boolean
}

export type SocialSetting = {
  key: string
  label: string
  href: string
  enabled: boolean
  icon?: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin' | 'github' | 'twitter'
}

export type SiteSettings = {
  name: string
  owner: string
  title: string
  tagline: string
  description: string
  email: string
  location: string
  academic_portfolio_url: string
  academic_portfolio_label: string
  socials: SocialSetting[]
}

export type Photo = { src: string; caption: string }

export type Album = {
  slug: string
  title: string
  summary: string
  cover: string
  photos: Photo[]
}

export type Painting = {
  src: string
  title: string
  medium: string
  year: string
  caption: string
}

export async function getContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('key', key)
    .maybeSingle()

  // Keep the public site usable even before the one-time content migration SQL
  // has been run.
  if (error || !data?.content) return fallback
  return data.content as T
}

export async function getContentRow(key: string) {
  const { data, error } = await supabase
    .from('site_content')
    .select('key,content,updated_at')
    .eq('key', key)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveContent(key: string, content: unknown) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert(
      { key, content, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}
