import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Link2, Plus, Save, Trash2, RotateCcw, Eye, Sparkles, ExternalLink, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/lib/identity-context'
import { getContent, saveContent, type AboutContent, type AcademiaContent, type Album, type Painting, type PortfolioItem, type PublicationItem, type SideHustleItem, type SiteSettings } from '@/lib/content'
import { about, academia, albums, paintings, portfolio, sideHustles, site, socials } from '@/config/site'

type Key = 'site_settings' | 'about' | 'academia' | 'portfolio' | 'publications' | 'side_hustles' | 'photography' | 'paintings'
const labels: Record<Key,string> = { site_settings:'Site settings', about:'About me', academia:'Academia', portfolio:'Academic work', publications:'Publications', side_hustles:'Other projects', photography:'Photography', paintings:'Paints' }
const defaultSiteSettings: SiteSettings = { ...site, socials: socials.map((s) => ({ ...s, enabled: s.key !== 'instagram2', icon: s.key === 'instagram2' ? 'instagram' : s.key as any })) }
const publications: PublicationItem[] = []
const defaults: Record<Key,unknown> = { site_settings:defaultSiteSettings, about, academia, portfolio, publications, side_hustles:sideHustles, photography:albums, paintings }
const DRAFT_STORAGE_PREFIX = 'ucopedia-content-draft-v1:'
function readBrowserDraft(userId:string): { updatedAt:number; drafts:Record<Key,unknown> } | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_PREFIX + userId)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || typeof parsed.updatedAt !== 'number' || !parsed.drafts) return null
    return parsed
  } catch { return null }
}
function writeBrowserDraft(userId:string, drafts:Record<Key,unknown>) {
  try {
    localStorage.setItem(DRAFT_STORAGE_PREFIX + userId, JSON.stringify({ updatedAt:Date.now(), drafts }))
  } catch { /* Storage may be unavailable or full. The cloud save still works. */ }
}
function normalizeSiteSettings(value: unknown): SiteSettings {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<SiteSettings>
  const list = Array.isArray(v.socials)
    ? v.socials.map((s:any) => ({ ...s, enabled: s.enabled !== false, icon: s.icon ?? (s.key === 'instagram2' ? 'instagram' : s.key) }))
    : [...defaultSiteSettings.socials]
  if (!list.some((s:any) => s.key === 'instagram2')) {
    list.push({ key: 'instagram2', label: 'Instagram · second account', href: '', enabled: false, icon: 'instagram' })
  }
  return { ...defaultSiteSettings, ...v, socials: list }
}

export const Route = createFileRoute('/admin/content')({ component: ContentStudio })

function Field({ label, children, hint }: { label:string; children:ReactNode; hint?:string }) {
  return <label className='block'><span className='label'>{label}</span>{hint && <span className='mb-2 block text-xs text-ink/45'>{hint}</span>}{children}</label>
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={['field w-full',props.className].filter(Boolean).join(' ')} /> }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={['field w-full',props.className].filter(Boolean).join(' ')} /> }

function ItemActions({ index, total, onUp, onDown, onDelete, label }:{index:number;total:number;onUp:()=>void;onDown:()=>void;onDelete:()=>void;label:string}) {
  return <div className='flex items-center gap-1'>
    <span className='mr-2 font-mono text-xs text-ink/35'>{String(index+1).padStart(2,'0')}</span>
    <button type='button' className='grid size-8 place-items-center rounded-lg border border-ink/10 hover:bg-paper-deep disabled:opacity-30' onClick={onUp} disabled={index===0} aria-label={'Move '+label+' up'}><ArrowUp className='size-3.5'/></button>
    <button type='button' className='grid size-8 place-items-center rounded-lg border border-ink/10 hover:bg-paper-deep disabled:opacity-30' onClick={onDown} disabled={index===total-1} aria-label={'Move '+label+' down'}><ArrowDown className='size-3.5'/></button>
    <button type='button' className='ml-1 grid size-8 place-items-center rounded-lg border border-ink/10 text-terracotta hover:bg-terracotta/10' onClick={onDelete} aria-label={'Delete '+label}><Trash2 className='size-3.5'/></button>
  </div>
}

async function uploadImage(file: File, userId: string) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > 15 * 1024 * 1024) throw new Error('Please keep images under 15 MB.')
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-80) || 'image'
  const path = userId + '/site/' + Date.now() + '-' + safe
  const result = await supabase.storage.from('blog-images').upload(path,file,{cacheControl:'3600',contentType:file.type,upsert:false})
  if (result.error) throw result.error
  return supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl
}

function ContentStudio() {
  const { user, ready } = useIdentity()
  const [admin,setAdmin] = useState(false)
  const [active,setActive] = useState<Key>('portfolio')
  const [saved,setSaved] = useState<Record<Key,unknown>>({})
  const [drafts,setDrafts] = useState<Record<Key,unknown>>(defaults as Record<Key,unknown>)
  const [loading,setLoading] = useState(true)
  const [busy,setBusy] = useState(false)
  const [uploading,setUploading] = useState<string|null>(null)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [browserDraftReady,setBrowserDraftReady] = useState(false)
  const [browserDraftTime,setBrowserDraftTime] = useState<number|null>(null)

  async function load() {
    if (!user) return
    setLoading(true); setError('')
    const a = await supabase.from('admins').select('user_id').eq('user_id',user.id).maybeSingle()
    if (a.error) { setError(a.error.message); setLoading(false); return }
    if (!a.data) { setError('Your account does not have owner/admin access.'); setLoading(false); return }
    setAdmin(true)
    const r = await supabase.from('site_content').select('key,content').order('key')
    if (r.error) { setError('Run supabase/migration_v2_content.sql first. '+r.error.message); setLoading(false); return }
    const map: Record<Key,unknown> = {} as Record<Key,unknown>
    for (const row of r.data ?? []) map[row.key as Key] = row.content
    const draftMap = {} as Record<Key, unknown>
    ;(Object.keys(labels) as Key[]).forEach((key) => { draftMap[key] = map[key] ?? defaults[key] })
    draftMap.site_settings = normalizeSiteSettings(draftMap.site_settings)
    const browserDraft = readBrowserDraft(user.id)
    if (browserDraft && browserDraft.updatedAt > 0) {
      const merged = { ...draftMap, ...browserDraft.drafts }
      merged.site_settings = normalizeSiteSettings(merged.site_settings)
      setDrafts(merged)
      setBrowserDraftTime(browserDraft.updatedAt)
    } else {
      setDrafts(draftMap)
      setBrowserDraftTime(null)
    }
    setSaved(map)
    setBrowserDraftReady(true)
    setLoading(false)
  }

  useEffect(()=>{ if (ready) void load() },[ready,user])
  const draft = drafts[active] ?? defaults[active]
  const setDraft: Dispatch<SetStateAction<unknown>> = (updater) => {
    setDrafts((current) => {
      const previous = current[active]
      const next = typeof updater === 'function' ? (updater as (value: unknown) => unknown)(previous) : updater
      return { ...current, [active]: next }
    })
  }
  useEffect(() => {
    if (!browserDraftReady || !user) return
    writeBrowserDraft(user.id, drafts)
  }, [browserDraftReady, user, drafts])

  useEffect(() => {
    if (!browserDraftReady || !user) return
    const persistNow = () => writeBrowserDraft(user.id, drafts)
    window.addEventListener('beforeunload', persistNow)
    document.addEventListener('visibilitychange', persistNow)
    return () => {
      window.removeEventListener('beforeunload', persistNow)
      document.removeEventListener('visibilitychange', persistNow)
    }
  }, [browserDraftReady, user, drafts])

  const dirty = useMemo(()=>JSON.stringify(draft)!==JSON.stringify(saved[active] ?? defaults[active]),[draft,saved,active])

  function reset() { setDrafts(cur => ({...cur,[active]:saved[active] ?? defaults[active]})); setError(''); setNotice('') }
  async function save() {
    setError(''); setNotice(''); setBusy(true)
    try {
      await saveContent(active,draft)
      const nextSaved = { ...saved, [active]: draft }
      setSaved(nextSaved)
      if (user) {
        writeBrowserDraft(user.id, drafts)
        setBrowserDraftTime(Date.now())
      }
      setNotice(labels[active]+' saved successfully.')
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save changes.') }
    finally { setBusy(false) }
  }
  async function imageChange(file:File,onDone:(url:string)=>void,id:string) {
    if (!user) return
    setUploading(id); setError('')
    try { onDone(await uploadImage(file,user.id)); setNotice('Image uploaded.') }
    catch (e) { setError(e instanceof Error ? e.message : 'Image upload failed.') }
    finally { setUploading(null) }
  }

  if (!ready || loading) return <section className='container-uco py-20'>Loading Content Studio…</section>
  if (!user || !admin) return <section className='container-uco py-20'><h1 className='font-display text-4xl font-semibold'>Owner access required<span className='text-terracotta'>.</span></h1><Link to='/login' className='btn-ink mt-6'>Login</Link></section>

  const tabs = (Object.keys(labels) as Key[])

  return <section className='container-uco py-10 md:py-14'>
    <div className='flex flex-wrap items-end justify-between gap-4'>
      <div><Link to='/admin' className='text-sm text-ink/55 hover:text-terracotta'>← Dashboard</Link><p className='eyebrow mt-5'>Visual site editor</p><h1 className='mt-2 font-display text-5xl font-semibold'>Content Studio<span className='text-terracotta'>.</span></h1><p className='mt-3 max-w-2xl text-ink/65'>Edit your website with forms and repeatable cards. No JSON, no code, and no GitHub edits required for normal content updates.</p></div>
      <div className='flex items-center gap-2'>
        {dirty && <span className='rounded-full bg-saffron/50 px-3 py-1.5 text-xs font-semibold'>Unsaved changes</span>}
        <button type='button' className='btn-ghost' onClick={reset} disabled={!dirty || busy}><RotateCcw className='size-4'/> Reset</button>
        <button type='button' className='btn-saffron' onClick={()=>void save()} disabled={!dirty || busy}><Save className='size-4'/> {busy?'Saving…':'Save changes'}</button>
      </div>
    </div>

    {browserDraftTime && <div className='mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-card px-4 py-3 text-sm'>
      <span><strong>Browser backup active.</strong> Your unsaved work is being kept on this device, so a refresh or switching browser tabs should not wipe it.</span>
      <button type='button' className='text-xs font-semibold text-terracotta hover:underline' onClick={() => { if (!user) return; if (!confirm('Clear the local browser backup? Unsaved changes will be lost.')) return; localStorage.removeItem(DRAFT_STORAGE_PREFIX + user.id); setBrowserDraftTime(null); setDrafts((Object.keys(labels) as Key[]).reduce((acc,k)=>({...acc,[k]:saved[k] ?? defaults[k]}),{} as Record<Key,unknown>)) }}>Clear backup</button>
    </div>}
    {(error||notice) && <p className={'mt-4 rounded-xl px-4 py-3 text-sm '+(error?'bg-terracotta/10 text-terracotta':'bg-saffron/40')}>{error||notice}</p>}

    <div className='mt-8 grid gap-6 lg:grid-cols-[15rem_1fr]'>
      <nav className='self-start rounded-2xl border border-ink/15 bg-card p-2 lg:sticky lg:top-24'>{tabs.map(k=><button type='button' key={k} onClick={()=>{if(dirty && !confirm('You have unsaved changes. Switch sections anyway?')) return; setActive(k)}} className={'mb-1 block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold last:mb-0 '+(active===k?'bg-ink text-paper':'hover:bg-paper-deep')}>{labels[k]}</button>)}</nav>
      <div className='min-w-0'>
        {active==='site_settings' && <SiteSettingsEditor value={draft as SiteSettings} setValue={setDraft}/>} 
        {active==='about' && <AboutEditor value={draft as AboutContent} setValue={setDraft}/>} 
        {active==='academia' && <AcademiaEditor value={draft as AcademiaContent} setValue={setDraft}/>} 
        {active==='portfolio' && <PortfolioEditor value={draft as PortfolioItem[]} setValue={setDraft} uploading={uploading} imageChange={imageChange}/>} 
        {active==='publications' && <PublicationsEditor value={draft as PublicationItem[]} setValue={setDraft} uploading={uploading} imageChange={imageChange}/>} 
        {active==='side_hustles' && <SideHustlesEditor value={draft as SideHustleItem[]} setValue={setDraft} uploading={uploading} imageChange={imageChange}/>} 
        {active==='photography' && <PhotographyEditor value={draft as Album[]} setValue={setDraft} uploading={uploading} imageChange={imageChange}/>} 
        {active==='paintings' && <PaintingsEditor value={draft as Painting[]} setValue={setDraft} uploading={uploading} imageChange={imageChange}/>} 
        <div className='mt-6 flex items-center justify-between rounded-2xl border border-ink/10 bg-card p-4'>
          <div><p className='text-sm font-semibold'>{dirty?'You have unsaved changes':'All changes saved'}</p><p className='text-xs text-ink/50'>Changes are saved to Supabase only when you press Save changes.</p></div>
          <button type='button' className='btn-saffron' onClick={()=>void save()} disabled={!dirty || busy}><Save className='size-4'/> {busy?'Saving…':'Save changes'}</button>
        </div>
      </div>
    </div>
  </section>
}

function Card({title,children,actions}:{title:string;children:ReactNode;actions?:ReactNode}) { return <div className='rounded-2xl border border-ink/15 bg-card p-5 md:p-6'><div className='mb-5 flex flex-wrap items-start justify-between gap-3'><h2 className='text-2xl font-semibold'>{title}</h2>{actions}</div>{children}</div> }

function SiteSettingsEditor({value,setValue}:{value:SiteSettings;setValue:Dispatch<SetStateAction<unknown>>}) {
  const set=(patch:Partial<SiteSettings>)=>setValue(v=>({...v as SiteSettings,...patch}))
  function updateSocial(i:number, patch:Partial<SiteSettings['socials'][number]>) { set({socials:value.socials.map((s,n)=>n===i?{...s,...patch}:s)}) }
  function addSocial() {
    const n = value.socials.length + 1
    set({ socials: [...value.socials, { key: 'custom-' + Date.now(), label: 'New profile ' + n, href: '', enabled: false, icon: 'instagram' }] })
  }
  function removeSocial(i:number) { set({ socials: value.socials.filter((_,n)=>n!==i) }) }
  return <div className='space-y-6'>
    <Card title='Identity'><div className='grid gap-5 md:grid-cols-2'><Field label='Site name'><TextInput value={value.name} onChange={e=>set({name:e.target.value})}/></Field><Field label='Owner name'><TextInput value={value.owner} onChange={e=>set({owner:e.target.value})}/></Field><Field label='Browser / page title'><TextInput value={value.title} onChange={e=>set({title:e.target.value})}/></Field><Field label='Tagline'><TextInput value={value.tagline} onChange={e=>set({tagline:e.target.value})}/></Field></div><div className='mt-5'><Field label='Site description'><TextArea rows={4} value={value.description} onChange={e=>set({description:e.target.value})}/></Field></div></Card>
    <Card title='Academic profile link'><div className='grid gap-5 md:grid-cols-2'><Field label='Button label'><TextInput value={value.academic_portfolio_label} onChange={e=>set({academic_portfolio_label:e.target.value})} placeholder='Full Academic Profile'/></Field><Field label='External profile URL'><TextInput value={value.academic_portfolio_url} onChange={e=>set({academic_portfolio_url:e.target.value})} placeholder='https://…'/></Field></div><p className='mt-3 text-xs text-ink/50'>This creates a prominent button in Academia that opens your external academic profile in a new tab.</p></Card>
    <Card title='Contact'><div className='grid gap-5 md:grid-cols-2'><Field label='Email'><TextInput type='email' value={value.email} onChange={e=>set({email:e.target.value})}/></Field><Field label='Location'><TextInput value={value.location} onChange={e=>set({location:e.target.value})}/></Field></div></Card>
    <Card title='Social profiles' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={addSocial}><Plus className='size-4'/> Add profile</button>}>
      <p className='mb-5 text-sm text-ink/55'>You can have more than one account on the same platform. For example, two Instagram accounts.</p>
      <div className='space-y-4'>{value.socials.map((s,i)=><div key={s.key} className='rounded-xl border border-ink/10 bg-paper p-4'>
        <div className='grid gap-4 md:grid-cols-[11rem_1.2fr_2fr_auto] md:items-end'>
          <Field label='Icon'><select className='field w-full' value={s.icon ?? 'instagram'} onChange={e=>updateSocial(i,{icon:e.target.value as SiteSettings['socials'][number]['icon']})}><option value='instagram'>Instagram</option><option value='youtube'>YouTube</option><option value='whatsapp'>WhatsApp</option><option value='linkedin'>LinkedIn</option><option value='github'>GitHub</option><option value='twitter'>X / Twitter</option></select></Field>
          <Field label='Label'><TextInput value={s.label} onChange={e=>updateSocial(i,{label:e.target.value})} placeholder='e.g. Instagram · Photography'/></Field>
          <Field label='Profile URL'><TextInput value={s.href} onChange={e=>updateSocial(i,{href:e.target.value})} placeholder='https://…'/></Field>
          <div className='flex items-center gap-2 pb-1'><label className='flex items-center gap-2 text-xs font-medium'><input type='checkbox' checked={s.enabled} onChange={e=>updateSocial(i,{enabled:e.target.checked})}/> Show</label><button type='button' className='text-xs font-semibold text-terracotta hover:underline' onClick={()=>removeSocial(i)}>Remove</button></div>
        </div>
      </div>)}</div>
    </Card>
  </div>
}

function AboutEditor({value,setValue}:{value:AboutContent;setValue:Dispatch<SetStateAction<unknown>>}) {
  const set=(patch:Partial<AboutContent>)=>setValue(v=>({...v as AboutContent,...patch}))
  return <div className='space-y-6'>
    <Card title='Introduction'><div className='grid gap-5'><Field label='Headline'><TextInput value={value.headline} onChange={e=>set({headline:e.target.value})}/></Field><Field label='Intro'><TextArea rows={4} value={value.intro} onChange={e=>set({intro:e.target.value})}/></Field></div></Card>
    <Card title='About paragraphs' actions={<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>set({paragraphs:[...value.paragraphs,'']})}><Plus className='size-4'/> Add paragraph</button>}>
      <div className='space-y-4'>{value.paragraphs.map((p,i)=><div key={i} className='rounded-xl border border-ink/10 bg-paper p-4'><div className='mb-2 flex justify-between'><span className='font-mono text-xs text-ink/40'>Paragraph {i+1}</span><button type='button' className='text-xs text-terracotta' onClick={()=>set({paragraphs:value.paragraphs.filter((_,n)=>n!==i)})}>Remove</button></div><TextArea rows={4} value={p} onChange={e=>set({paragraphs:value.paragraphs.map((x,n)=>n===i?e.target.value:x)})}/></div>)}</div>
    </Card>
    <Card title='Quick facts' actions={<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>set({facts:[...value.facts,{label:'',value:''}]})}><Plus className='size-4'/> Add fact</button>}>
      <div className='space-y-3'>{value.facts.map((f,i)=><div key={i} className='grid gap-3 rounded-xl border border-ink/10 bg-paper p-4 md:grid-cols-[1fr_1.5fr_auto]'><TextInput placeholder='Label' value={f.label} onChange={e=>set({facts:value.facts.map((x,n)=>n===i?{...x,label:e.target.value}:x)})}/><TextInput placeholder='Value' value={f.value} onChange={e=>set({facts:value.facts.map((x,n)=>n===i?{...x,value:e.target.value}:x)})}/><button type='button' className='text-sm text-terracotta' onClick={()=>set({facts:value.facts.filter((_,n)=>n!==i)})}>Remove</button></div>)}</div>
    </Card>
    <Card title='Things I think about' actions={<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>set({interests:[...value.interests,'']})}><Plus className='size-4'/> Add interest</button>}>
      <div className='grid gap-3 sm:grid-cols-2'>{value.interests.map((x,i)=><div key={i} className='flex gap-2'><TextInput value={x} onChange={e=>set({interests:value.interests.map((v,n)=>n===i?e.target.value:v)})}/><button type='button' className='grid size-11 shrink-0 place-items-center rounded-xl border border-ink/10 text-terracotta' onClick={()=>set({interests:value.interests.filter((_,n)=>n!==i)})}><Trash2 className='size-4'/></button></div>)}</div>
    </Card>
  </div>
}

function AcademiaEditor({value,setValue}:{value:AcademiaContent;setValue:React.Dispatch<React.SetStateAction<unknown>>}) {
  const set=(patch:Partial<AcademiaContent>)=>setValue(v=>({...v as AcademiaContent,...patch}))
  function move(i:number,d:number){const a=[...value.education];const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];set({education:a})}
  return <div className='space-y-6'><Card title='Academia introduction'><Field label='Intro'><TextArea rows={5} value={value.intro} onChange={e=>set({intro:e.target.value})}/></Field></Card>
    <Card title='Education timeline' actions={<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>set({education:[...value.education,{school:'',degree:'',period:'',note:''}]})}><Plus className='size-4'/> Add education</button>}>
      <div className='space-y-5'>{value.education.map((e,i)=><div key={i} className='rounded-2xl border border-ink/10 bg-paper p-5'><div className='mb-4 flex justify-between gap-3'><h3 className='font-semibold'>Education item</h3><ItemActions index={i} total={value.education.length} label='education item' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>set({education:value.education.filter((_,n)=>n!==i)})}/></div><div className='grid gap-4 md:grid-cols-2'><Field label='Institution'><TextInput value={e.school} onChange={x=>set({education:value.education.map((v,n)=>n===i?{...v,school:x.target.value}:v)})}/></Field><Field label='Degree / role'><TextInput value={e.degree} onChange={x=>set({education:value.education.map((v,n)=>n===i?{...v,degree:x.target.value}:v)})}/></Field><Field label='Period'><TextInput value={e.period} onChange={x=>set({education:value.education.map((v,n)=>n===i?{...v,period:x.target.value}:v)})}/></Field><Field label='Notes'><TextInput value={e.note} onChange={x=>set({education:value.education.map((v,n)=>n===i?{...v,note:x.target.value}:v)})}/></Field></div></div>)}</div>
    </Card>
    <Card title='Research interests' actions={<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>set({interests:[...value.interests,'']})}><Plus className='size-4'/> Add interest</button>}><div className='grid gap-3 sm:grid-cols-2'>{value.interests.map((x,i)=><div key={i} className='flex gap-2'><TextInput value={x} onChange={e=>set({interests:value.interests.map((v,n)=>n===i?e.target.value:v)})}/><button type='button' className='grid size-11 shrink-0 place-items-center rounded-xl border border-ink/10 text-terracotta' onClick={()=>set({interests:value.interests.filter((_,n)=>n!==i)})}><Trash2 className='size-4'/></button></div>)}</div></Card></div>
}

function PortfolioEditor({value,setValue,uploading,imageChange}:{value:PortfolioItem[];setValue:Dispatch<SetStateAction<unknown>>;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>}) {
  function update(i:number,p:Partial<PortfolioItem>){setValue(v=>(v as PortfolioItem[]).map((x,n)=>n===i?{...x,...p}:x))}
  function move(i:number,d:number){const a=[...value],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setValue(a)}
  function addImage(i:number){update(i,{images:[...(value[i].images ?? []),'']})}
  return <Card title='Academic work' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={()=>setValue([...value,{title:'',kind:'Research',year:String(new Date().getFullYear()),description:'',link:'',venue:'',authors:'',images:[],featured:false}])}><Plus className='size-4'/> Add item</button>}>
    <p className='mb-5 text-sm text-ink/55'>One flexible collection for papers, research projects, talks, awards, certificates, thesis work and other academic milestones.</p>
    <div className='space-y-5'>{value.map((p,i)=><div key={i} className='rounded-2xl border border-ink/10 bg-paper p-5'>
      <div className='mb-4 flex items-center justify-between gap-3'><h3 className='font-display text-xl font-semibold'>{p.title||'Untitled item'}</h3><ItemActions index={i} total={value.length} label='academic item' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>setValue(value.filter((_,n)=>n!==i))}/></div>
      <div className='grid gap-4 md:grid-cols-[1fr_9rem_7rem]'>
        <Field label='Title'><TextInput value={p.title} onChange={e=>update(i,{title:e.target.value})}/></Field>
        <Field label='Type'><select className='field w-full' value={p.kind} onChange={e=>update(i,{kind:e.target.value})}>{['Research','Publication','Talk','Award','Certificate','Thesis','Teaching','Project','Other'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label='Year'><TextInput value={p.year} onChange={e=>update(i,{year:e.target.value})}/></Field>
      </div>
      <div className='mt-4 grid gap-4 md:grid-cols-2'><Field label='Venue / organisation'><TextInput value={p.venue ?? ''} onChange={e=>update(i,{venue:e.target.value})} placeholder='Journal, conference, institute…'/></Field><Field label='Authors / collaborators'><TextInput value={p.authors ?? ''} onChange={e=>update(i,{authors:e.target.value})} placeholder='Optional'/></Field></div>
      <div className='mt-4'><Field label='Description'><TextArea rows={4} value={p.description} onChange={e=>update(i,{description:e.target.value})}/></Field></div>
      <div className='mt-4'><Field label='External link'><div className='relative'><Link2 className='absolute left-3 top-3 size-4 text-ink/35'/><TextInput className='pl-9' value={p.link} onChange={e=>update(i,{link:e.target.value})} placeholder='https:// DOI, paper, slides…'/></div></Field></div>
      <div className='mt-4'><label className='flex items-center gap-2 text-sm font-medium'><input type='checkbox' checked={!!p.featured} onChange={e=>update(i,{featured:e.target.checked})}/> Highlight this item publicly</label></div>
      <div className='mt-5 rounded-xl border border-ink/10 bg-card p-4'><div className='mb-3 flex items-center justify-between'><div><h4 className='font-semibold'>Project images</h4><p className='text-xs text-ink/50'>Add lab photos, screenshots, posters, certificates or other visuals.</p></div><button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>addImage(i)}><Plus className='size-4'/> Add picture</button></div><div className='space-y-3'>{(p.images ?? []).map((src,j)=><div key={j} className='rounded-xl border border-ink/10 bg-paper p-3'><div className='mb-2 flex justify-end'><button type='button' className='text-xs text-terracotta' onClick={()=>update(i,{images:(p.images ?? []).filter((_,n)=>n!==j)})}>Remove</button></div><ImagePicker value={src} onChange={url=>update(i,{images:(p.images ?? []).map((x,n)=>n===j?url:x)})} uploading={uploading} imageChange={imageChange} id={'academic-'+i+'-image-'+j}/></div>)}</div></div>
    </div>)}</div>
  </Card>
}
function PublicationsEditor({value,setValue,uploading,imageChange}:{value:PublicationItem[];setValue:Dispatch<SetStateAction<unknown>>;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>}) {
  const [doiBusy,setDoiBusy]=useState<number|null>(null)
  const [doiMessage,setDoiMessage]=useState('')
  function update(i:number,p:Partial<PublicationItem>){setValue(v=>(v as PublicationItem[]).map((x,n)=>n===i?{...x,...p}:x))}
  function move(i:number,d:number){const a=[...value],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setValue(a)}
  const empty=():PublicationItem=>({title:'',doi:'',year:String(new Date().getFullYear()),journal:'',authors:'',publisher:'',volume:'',issue:'',pages:'',description:'',link:'',pdf_url:'',preview_image:'',citations:undefined,featured:false})
  async function fetchDoi(i:number){
    const doi=value[i].doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').replace(/^doi:\s*/i,'')
    if(!doi){setDoiMessage('Enter a DOI first.');return}
    setDoiBusy(i);setDoiMessage('')
    try{
      const res=await fetch('https://api.crossref.org/v1/works/'+encodeURIComponent(doi),{headers:{Accept:'application/json'}})
      if(!res.ok)throw new Error('Crossref could not find this DOI.')
      const json=await res.json()
      const w=json?.message
      if(!w)throw new Error('No publication metadata was returned.')
      const year=(w['published-print']?.['date-parts']?.[0]?.[0] ?? w['published-online']?.['date-parts']?.[0]?.[0] ?? w['published']?.['date-parts']?.[0]?.[0] ?? '')+''
      const authors=(w.author ?? []).map((a:any)=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean).join(', ')
      const link=w.URL || ('https://doi.org/'+doi)
      const pdf=(w.link ?? []).find((x:any)=>String(x['content-type']||'').includes('pdf'))?.URL ?? ''
      update(i,{doi,title:w.title?.[0]??'',year,journal:w['container-title']?.[0]??'',authors,publisher:w.publisher??'',volume:w.volume??'',issue:w.issue??'',pages:w.page??'',link,pdf_url:pdf,citations:typeof w['is-referenced-by-count']==='number'?w['is-referenced-by-count']:undefined})
      setDoiMessage('Metadata imported. Check the fields before saving.')
    }catch(e){setDoiMessage(e instanceof Error?e.message:'DOI lookup failed.')}
    finally{setDoiBusy(null)}
  }
  return <Card title='Publications' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={()=>setValue([...value,empty()])}><Plus className='size-4'/> Add publication</button>}>
    <div className='mb-6 rounded-2xl border-2 border-ink bg-ink p-5 text-paper md:p-6'>
      <div className='flex items-start gap-3'><Sparkles className='mt-0.5 size-5 text-saffron'/><div><p className='font-display text-xl font-semibold'>Your research shelf, with a little magic.</p><p className='mt-1 text-sm text-paper/65'>Paste a DOI and Ucopedia will pull the bibliographic metadata from Crossref. You can then add your own visual first-page preview.</p></div></div>
    </div>
    {doiMessage && <p className='mb-5 rounded-xl bg-saffron/40 px-4 py-3 text-sm'>{doiMessage}</p>}
    <div className='space-y-8'>{value.length===0 && <div className='rounded-2xl border border-dashed border-ink/20 p-10 text-center'><FileText className='mx-auto size-8 text-ink/35'/><p className='mt-3 font-display text-xl italic'>No publications yet.</p><p className='mt-1 text-sm text-ink/55'>Add your first paper and let the DOI do the repetitive work.</p></div>}
      {value.map((p,i)=><div key={i} className='rounded-2xl border-2 border-ink/10 bg-paper p-5 md:p-6'>
        <div className='mb-5 flex flex-wrap items-start justify-between gap-3'><div><p className='font-mono text-xs uppercase tracking-widest text-terracotta'>Publication {String(i+1).padStart(2,'0')}</p><h3 className='mt-1 font-display text-2xl font-semibold'>{p.title||'Untitled paper'}</h3></div><ItemActions index={i} total={value.length} label='publication' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>setValue(value.filter((_,n)=>n!==i))}/></div>
        <div className='flex flex-col gap-3 rounded-xl border border-ink/10 bg-card p-4 md:flex-row md:items-end'><div className='min-w-0 flex-1'><Field label='DOI'><TextInput value={p.doi} onChange={e=>update(i,{doi:e.target.value})} placeholder='10.xxxx/xxxxx'/></Field></div><button type='button' className='btn-ink' onClick={()=>void fetchDoi(i)} disabled={doiBusy!==null}>{doiBusy===i?<><Sparkles className='size-4 animate-pulse'/> Fetching…</>:<><Sparkles className='size-4'/> Fetch from DOI</>}</button></div>
        <div className='mt-5 grid gap-4 md:grid-cols-[1.6fr_1fr_7rem]'><Field label='Title'><TextInput value={p.title} onChange={e=>update(i,{title:e.target.value})}/></Field><Field label='Journal / venue'><TextInput value={p.journal} onChange={e=>update(i,{journal:e.target.value})}/></Field><Field label='Year'><TextInput value={p.year} onChange={e=>update(i,{year:e.target.value})}/></Field></div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'><Field label='Authors'><TextInput value={p.authors} onChange={e=>update(i,{authors:e.target.value})}/></Field><Field label='Publisher'><TextInput value={p.publisher} onChange={e=>update(i,{publisher:e.target.value})}/></Field></div>
        <div className='mt-4 grid gap-4 md:grid-cols-3'><Field label='Volume'><TextInput value={p.volume} onChange={e=>update(i,{volume:e.target.value})}/></Field><Field label='Issue'><TextInput value={p.issue} onChange={e=>update(i,{issue:e.target.value})}/></Field><Field label='Pages'><TextInput value={p.pages} onChange={e=>update(i,{pages:e.target.value})}/></Field></div>
        <div className='mt-4'><Field label='Your note / contribution'><TextArea rows={4} value={p.description} onChange={e=>update(i,{description:e.target.value})} placeholder='What did you do? What should a reader notice?' /></Field></div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'><Field label='Paper link'><TextInput value={p.link} onChange={e=>update(i,{link:e.target.value})} placeholder='DOI or publisher page'/></Field><Field label='Open-access PDF URL'><TextInput value={p.pdf_url} onChange={e=>update(i,{pdf_url:e.target.value})} placeholder='Optional'/></Field></div>
        <div className='mt-5 rounded-2xl border border-ink/10 bg-card p-4'><div className='flex flex-wrap items-center justify-between gap-3'><div><h4 className='font-semibold'>First-page preview</h4><p className='text-xs text-ink/50'>Upload a screenshot/image of page 1. This is the safest and most reliable way to get a crisp preview on the public site.</p></div><ImagePicker value={p.preview_image} onChange={url=>update(i,{preview_image:url})} uploading={uploading} imageChange={imageChange} id={'publication-preview-'+i}/></div>{p.preview_image && <img src={p.preview_image} alt='First page preview' className='mt-4 max-h-80 w-auto rounded-lg border border-ink/10 shadow-sm'/>}</div>
        <div className='mt-5 flex flex-wrap items-center justify-between gap-3'><label className='flex items-center gap-2 text-sm font-medium'><input type='checkbox' checked={!!p.featured} onChange={e=>update(i,{featured:e.target.checked})}/> Feature this publication</label>{p.doi && <a href={'https://doi.org/'+p.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').replace(/^doi:\s*/i,'')} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline'>Open DOI <ExternalLink className='size-3.5'/></a>}</div>
      </div>)}
    </div>
  </Card>
}

function SideHustlesEditor({value,setValue,uploading,imageChange}:{value:SideHustleItem[];setValue:Dispatch<SetStateAction<unknown>>;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>}) {
  function update(i:number,p:Partial<SideHustleItem>){setValue(v=>(v as SideHustleItem[]).map((x,n)=>n===i?{...x,...p}:x))}
  function move(i:number,d:number){const a=[...value],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setValue(a)}
  return <Card title='Other projects / side hustles' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={()=>setValue([...value,{title:'',status:'Idea',description:'',link:''}])}><Plus className='size-4'/> Add project</button>}>
    <div className='grid gap-5 md:grid-cols-2'>{value.map((p,i)=><div key={i} className='rounded-2xl border border-ink/10 bg-paper p-5'><div className='mb-4 flex justify-between gap-3'><h3 className='font-semibold'>{p.title||'Untitled project'}</h3><ItemActions index={i} total={value.length} label='project' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>setValue(value.filter((_,n)=>n!==i))}/></div><div className='space-y-4'><Field label='Project name'><TextInput value={p.title} onChange={e=>update(i,{title:e.target.value})}/></Field><Field label='Status'><select className='field w-full' value={p.status} onChange={e=>update(i,{status:e.target.value})}><option>Active</option><option>Idea</option><option>Paused</option></select></Field><Field label='Description'><TextArea rows={4} value={p.description} onChange={e=>update(i,{description:e.target.value})}/></Field><Field label='Link'><TextInput value={p.link} onChange={e=>update(i,{link:e.target.value})} placeholder='https://…'/></Field><Field label='Photos' hint='Add multiple pictures showing what you are building, making or doing.'><div className='space-y-3'>{(p.images ?? []).map((src,j)=><div key={j} className='rounded-xl border border-ink/10 bg-card p-3'><div className='flex items-start justify-between gap-3'><ImagePicker value={src} onChange={url=>update(i,{images:(p.images ?? []).map((x,n)=>n===j?url:x)})} uploading={uploading} imageChange={imageChange} id={'side-'+i+'-image-'+j}/><button type='button' className='mt-1 text-xs text-terracotta' onClick={()=>update(i,{images:(p.images ?? []).filter((_,n)=>n!==j)})}>Remove</button></div></div>)}<button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>update(i,{images:[...(p.images ?? []),'']})}><Plus className='size-4'/> Add picture</button></div></Field></div></div>)}</div>
  </Card>
}

function ImagePicker({value,onChange,uploading,imageChange,id}:{value:string;onChange:(v:string)=>void;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>;id:string}) {
  return <div><div className='flex flex-wrap items-center gap-3'><label className='btn-ghost cursor-pointer'><ImagePlus className='size-4'/>{uploading===id?'Uploading…':'Upload image'}<input type='file' accept='image/*' className='sr-only' onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void imageChange(f,onChange,id)}} disabled={uploading!==null}/></label>{value && <a href={value} target='_blank' rel='noreferrer' className='text-xs text-terracotta hover:underline'>Open image ↗</a>}</div>{value && <img src={value} alt='' className='mt-3 aspect-[3/2] max-h-56 w-full rounded-xl border border-ink/10 bg-paper object-cover'/>}</div>
}

function PhotographyEditor({value,setValue,uploading,imageChange}:{value:Album[];setValue:React.Dispatch<React.SetStateAction<unknown>>;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>}) {
  function update(i:number,p:Partial<Album>){setValue(v=>(v as Album[]).map((x,n)=>n===i?{...x,...p}:x))}
  function move(i:number,d:number){const a=[...value],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setValue(a)}
  return <Card title='Photography albums' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={()=>setValue([...value,{slug:'new-album',title:'',summary:'',cover:'',photos:[]}])}><Plus className='size-4'/> Add album</button>}>
    <div className='space-y-6'>{value.map((a,i)=><div key={i} className='rounded-2xl border border-ink/10 bg-paper p-5'><div className='mb-5 flex justify-between gap-3'><h3 className='font-display text-2xl font-semibold'>{a.title||'Untitled album'}</h3><ItemActions index={i} total={value.length} label='album' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>setValue(value.filter((_,n)=>n!==i))}/></div><div className='grid gap-4 md:grid-cols-2'><Field label='Album title'><TextInput value={a.title} onChange={e=>update(i,{title:e.target.value})}/></Field><Field label='URL slug'><TextInput value={a.slug} onChange={e=>update(i,{slug:e.target.value})}/></Field></div><div className='mt-4'><Field label='Summary'><TextArea rows={3} value={a.summary} onChange={e=>update(i,{summary:e.target.value})}/></Field></div><div className='mt-4'><Field label='Cover image' hint='Upload a new image or keep the existing URL.'><ImagePicker value={a.cover} onChange={url=>update(i,{cover:url})} uploading={uploading} imageChange={imageChange} id={'album-cover-'+i}/></Field></div>
      <div className='mt-6 rounded-2xl border border-ink/10 bg-card p-4'><div className='mb-4 flex items-center justify-between'><div><h4 className='font-semibold'>Photos in this album</h4><p className='text-xs text-ink/50'>Add, remove and reorder photos.</p></div><button type='button' className='btn-ghost !px-3 !py-2 text-sm' onClick={()=>update(i,{photos:[...a.photos,{src:'',caption:''}]})}><Plus className='size-4'/> Add photo</button></div><div className='space-y-4'>{a.photos.map((p,j)=><div key={j} className='rounded-xl border border-ink/10 bg-paper p-4'><div className='mb-3 flex justify-end'><ItemActions index={j} total={a.photos.length} label='photo' onUp={()=>{const ps=[...a.photos];[ps[j-1],ps[j]]=[ps[j],ps[j-1]];update(i,{photos:ps})}} onDown={()=>{const ps=[...a.photos];[ps[j],ps[j+1]]=[ps[j+1],ps[j]];update(i,{photos:ps})}} onDelete={()=>update(i,{photos:a.photos.filter((_,n)=>n!==j)})}/></div><ImagePicker value={p.src} onChange={url=>update(i,{photos:a.photos.map((x,n)=>n===j?{...x,src:url}:x)})} uploading={uploading} imageChange={imageChange} id={'album-'+i+'-photo-'+j}/><Field label='Caption'><TextInput className='mt-2' value={p.caption} onChange={e=>update(i,{photos:a.photos.map((x,n)=>n===j?{...x,caption:e.target.value}:x)})} placeholder='What is happening in this photograph?'/></Field></div>)}</div></div>
    </div>)}</div>
  </Card>
}

function PaintingsEditor({value,setValue,uploading,imageChange}:{value:Painting[];setValue:React.Dispatch<React.SetStateAction<unknown>>;uploading:string|null;imageChange:(file:File,onDone:(url:string)=>void,id:string)=>Promise<void>}) {
  function update(i:number,p:Partial<Painting>){setValue(v=>(v as Painting[]).map((x,n)=>n===i?{...x,...p}:x))}
  function move(i:number,d:number){const a=[...value],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setValue(a)}
  return <Card title='Paints' actions={<button type='button' className='btn-saffron !px-3 !py-2 text-sm' onClick={()=>setValue([...value,{src:'',title:'',medium:'',year:String(new Date().getFullYear()),caption:''}])}><Plus className='size-4'/> Add painting</button>}>
    <div className='grid gap-5 md:grid-cols-2'>{value.map((p,i)=><div key={i} className='rounded-2xl border border-ink/10 bg-paper p-5'><div className='mb-4 flex items-center justify-between gap-3'><h3 className='font-semibold'>{p.title||'Untitled painting'}</h3><ItemActions index={i} total={value.length} label='painting' onUp={()=>move(i,-1)} onDown={()=>move(i,1)} onDelete={()=>setValue(value.filter((_,n)=>n!==i))}/></div><Field label='Image'><ImagePicker value={p.src} onChange={url=>update(i,{src:url})} uploading={uploading} imageChange={imageChange} id={'painting-'+i}/></Field><div className='mt-4 grid gap-4'><Field label='Title'><TextInput value={p.title} onChange={e=>update(i,{title:e.target.value})}/></Field><div className='grid gap-4 sm:grid-cols-2'><Field label='Medium'><TextInput value={p.medium} onChange={e=>update(i,{medium:e.target.value})}/></Field><Field label='Year'><TextInput value={p.year} onChange={e=>update(i,{year:e.target.value})}/></Field></div><Field label='Caption'><TextArea rows={3} value={p.caption} onChange={e=>update(i,{caption:e.target.value})}/></Field></div></div>)}</div>
  </Card>
}