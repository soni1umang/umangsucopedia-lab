import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookHeart, CalendarDays, ChevronLeft, ChevronRight, ImagePlus, LockKeyhole, Save, Trash2, Globe2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useIdentity } from '@/lib/identity-context'

type JournalEntry = { id?: number; entry_date: string; title: string; body: string; photos: string[]; published: boolean; updated_at?: string }
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const emptyEntry = (date:string):JournalEntry => ({ entry_date:date, title:'', body:'', photos:[], published:false })

export const Route = createFileRoute('/admin/journal')({ component: JournalStudio })

async function uploadJournalPhoto(file:File,userId:string) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 12*1024*1024) throw new Error('Keep each photo under 12 MB.')
  const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-70)||'journal-photo'
  const path=userId+'/journal/'+Date.now()+'-'+safe
  const result=await supabase.storage.from('blog-images').upload(path,file,{cacheControl:'3600',contentType:file.type,upsert:false})
  if(result.error) throw result.error
  return supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl
}

function JournalStudio() {
 const {user,ready}=useIdentity()
 const [admin,setAdmin]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [entries,setEntries]=useState<JournalEntry[]>([]),[date,setDate]=useState(today()),[draft,setDraft]=useState<JournalEntry>(emptyEntry(today())),[month,setMonth]=useState(today().slice(0,7)),[uploading,setUploading]=useState(false)
 async function load(){
  if(!user)return
  setLoading(true);setError('')
  const a=await supabase.from('admins').select('user_id').eq('user_id',user.id).maybeSingle()
  if(a.error||!a.data){setError(a.error?.message||'Your account does not have owner access.');setLoading(false);return}
  setAdmin(true)
  const r=await supabase.from('journal_entries').select('*').order('entry_date',{ascending:false})
  if(r.error){setError('Journal table is not ready. Run supabase/migration_v4_journal.sql in the Supabase SQL Editor. '+r.error.message);setLoading(false);return}
  const list=(r.data||[]) as JournalEntry[]
  setEntries(list);setDraft(list.find(e=>e.entry_date===date)||emptyEntry(date));setLoading(false)
 }
 useEffect(()=>{if(ready){if(user)void load();else setLoading(false)}},[ready,user])
 useEffect(()=>{setDraft(entries.find(e=>e.entry_date===date)||emptyEntry(date))},[date,entries])
 const sorted=useMemo(()=>[...entries].sort((a,b)=>a.entry_date.localeCompare(b.entry_date)),[entries])
 const calendarDays=useMemo(()=>{
  const [y,m]=month.split('-').map(Number),first=new Date(y,m-1,1),count=new Date(y,m,0).getDate()
  return {offset:(first.getDay()+6)%7,count}
 },[month])
 const saved=entries.find(e=>e.entry_date===date)
 const dirty=JSON.stringify({...draft,updated_at:undefined,id:undefined})!==JSON.stringify({...saved??emptyEntry(date),updated_at:undefined,id:undefined})
 async function save(){
  if(!user)return
  setBusy(true);setError('');setNotice('')
  const row={entry_date:date,title:draft.title.trim(),body:draft.body,photos:draft.photos.slice(0,2),published:draft.published,updated_at:new Date().toISOString()}
  if(!row.title&&!row.body.trim()&&!row.photos.length){setError('Write a few lines or add a photo before saving.');setBusy(false);return}
  const r=await supabase.from('journal_entries').upsert(row,{onConflict:'entry_date'}).select('*').single()
  if(r.error){setError(r.error.message);setBusy(false);return}
  setEntries(prev=>[...prev.filter(e=>e.entry_date!==date),r.data as JournalEntry].sort((a,b)=>b.entry_date.localeCompare(a.entry_date)))
  setNotice('The page is safely saved.');setBusy(false)
 }
 async function remove(){
  if(!saved||!confirm('Delete this journal page permanently?'))return
  const r=await supabase.from('journal_entries').delete().eq('entry_date',date)
  if(r.error){setError(r.error.message);return}
  setEntries(prev=>prev.filter(e=>e.entry_date!==date));setDraft(emptyEntry(date));setNotice('Page deleted.')
 }
 async function addPhoto(file?:File){
  if(!file||!user)return
  if(draft.photos.length>=2){setError('This notebook page supports up to two photos.');return}
  setUploading(true);setError('')
  try{const url=await uploadJournalPhoto(file,user.id);setDraft(v=>({...v,photos:[...v.photos,url].slice(0,2)}));setNotice('Photo uploaded — save the page to keep it in this entry.')}
  catch(e){setError(e instanceof Error?e.message:'Photo upload failed.')}
  finally{setUploading(false)}
 }
 const formatDate=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})
 const shiftDay=(n:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);setDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)}
 if(!ready||loading)return <section className="container-uco py-16">Opening the journal…</section>
 if(!user||!admin)return <section className="container-uco py-16"><h1 className="font-display text-4xl">Owner access required.</h1><Link to="/login" className="btn-ink mt-5">Login</Link></section>
 return <section className="container-uco py-10 md:py-14">
  <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-ink/55 hover:text-terracotta"><ArrowLeft className="size-4"/> Dashboard</Link>
  <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Personal archive · owner only</p><h1 className="mt-2 font-display text-5xl font-semibold md:text-6xl">Daily journal<span className="text-terracotta">.</span></h1><p className="mt-3 max-w-2xl text-ink/60">A little page each day. Private by default; publish only the pages you’re comfortable sharing.</p></div><div className="flex items-center gap-2 rounded-full border border-ink/10 bg-card px-3 py-2 text-xs text-ink/55"><LockKeyhole className="size-4 text-leaf"/> Owner-only editor</div></div>
  {(error||notice)&&<div className={'mt-5 rounded-xl px-4 py-3 text-sm '+(error?'bg-terracotta/10 text-terracotta':'bg-saffron/40')}>{error||notice}</div>}
  <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
   <div className="rounded-[1.6rem] border border-ink/15 bg-card p-4 shadow-[6px_7px_0_rgb(28_33_70/.08)] sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4"><div><p className="font-mono text-[.6rem] uppercase tracking-[.18em] text-terracotta">Selected page</p><h2 className="mt-1 font-display text-2xl font-semibold">{formatDate(date)}</h2></div><div className="flex gap-2"><button className="btn-ghost !px-3" onClick={()=>shiftDay(-1)} title="Previous day"><ChevronLeft className="size-4"/></button><button className="btn-ghost !px-3" onClick={()=>setDate(today())}>Today</button><button className="btn-ghost !px-3" onClick={()=>shiftDay(1)} title="Next day"><ChevronRight className="size-4"/></button></div></div>
    <div className="mt-5"><label className="label" htmlFor="journal-date">Journal date</label><input id="journal-date" className="field max-w-xs" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
    <div className="journal-paper mt-5 rounded-xl px-5 py-5 sm:px-8 sm:py-7">
     <div className="journal-paper-head"><span>FIELD NOTES</span><span>{date}</span></div>
     <label className="sr-only" htmlFor="journal-title">Page heading</label><input id="journal-title" className="journal-title-input" placeholder="A title for today…" value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/>
     <label className="sr-only" htmlFor="journal-body">Daily journal entries</label><textarea id="journal-body" className="journal-handwriting" placeholder={'• One thing that happened today…\n• Something I learnt or noticed…\n○ Something to remember…'} value={draft.body} onChange={e=>setDraft(v=>({...v,body:e.target.value}))} rows={9}/>
     <div className="mt-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[.6rem] uppercase tracking-[.16em] text-ink/45">Little moments · up to 2 photos</span><label className="btn-ghost !px-3 cursor-pointer"><ImagePlus className="size-4"/>{uploading?'Uploading…':'Add photo'}<input type="file" accept="image/*" className="sr-only" disabled={uploading||draft.photos.length>=2} onChange={e=>{void addPhoto(e.target.files?.[0]);e.currentTarget.value=''}}/></label></div>
      {draft.photos.length>0&&<div className="grid grid-cols-2 gap-4">{draft.photos.map((src,i)=><figure key={src} className={'journal-photo '+(i%2?'journal-photo-tilt':'')}><img src={src} alt={'Journal memory '+(i+1)}/><button type="button" aria-label="Remove photo" onClick={()=>setDraft(v=>({...v,photos:v.photos.filter(p=>p!==src)}))}><Trash2 className="size-3.5"/></button></figure>)}</div>}
     </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={e=>setDraft(v=>({...v,published:e.target.checked}))} className="accent-terracotta"/><Globe2 className="size-4"/><span>Show this page in the public notebook</span></label><div className="flex gap-2"><button type="button" className="btn-ghost text-terracotta" disabled={!saved} onClick={()=>void remove()}><Trash2 className="size-4"/> Delete</button><button type="button" className="btn-saffron" disabled={!dirty||busy||uploading} onClick={()=>void save()}><Save className="size-4"/>{busy?'Saving…':'Save page'}</button></div></div>
    <p className="mt-3 text-xs text-ink/45"><LockKeyhole className="mr-1 inline size-3"/> Unchecked means this page stays private. The public notebook will only display pages marked for sharing.</p>
   </div>
   <aside className="space-y-5">
    <div className="rounded-[1.6rem] border border-ink/15 bg-card p-5"><div className="flex items-center justify-between gap-2"><div><p className="eyebrow">Memory map</p><h2 className="mt-1 font-display text-2xl font-semibold">Your calendar</h2></div><CalendarDays className="size-5 text-terracotta"/></div>
     <div className="mt-5 flex items-center justify-between"><button className="grid size-9 place-items-center rounded-full border border-ink/10 hover:bg-paper-deep" onClick={()=>{const [y,m]=month.split('-').map(Number);setMonth(new Date(y,m-2,1).toLocaleDateString('en-CA').slice(0,7))}} aria-label="Previous month"><ChevronLeft className="size-4"/></button><span className="font-display text-lg font-semibold">{new Date(month+'-15T12:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'})}</span><button className="grid size-9 place-items-center rounded-full border border-ink/10 hover:bg-paper-deep" onClick={()=>{const [y,m]=month.split('-').map(Number);setMonth(new Date(y,m,1).toLocaleDateString('en-CA').slice(0,7))}} aria-label="Next month"><ChevronRight className="size-4"/></button></div>
     <div className="mt-3 grid grid-cols-7 gap-1 text-center">{['M','T','W','T','F','S','S'].map((d,i)=><span key={d+i} className="py-2 font-mono text-[.6rem] text-ink/35">{d}</span>)}{Array.from({length:calendarDays.offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:calendarDays.count},(_,i)=>{const d=String(i+1).padStart(2,'0'),key=month+'-'+d,entry=entries.find(e=>e.entry_date===key);return <button key={key} type="button" onClick={()=>setDate(key)} className={'relative grid aspect-square place-items-center rounded-full text-xs transition '+(key===date?'bg-ink text-paper ring-2 ring-saffron ring-offset-2':'hover:bg-paper-deep')+(entry?' journal-date-has-entry':'')} title={entry?(entry.published?'Published journal entry':'Saved journal entry'):key}>{i+1}{entry&&<span className={'absolute bottom-1 size-1 rounded-full '+(entry.published?'bg-leaf':'bg-terracotta')}/>}</button>})}</div>
     <div className="mt-4 flex flex-wrap gap-3 text-[.65rem] text-ink/50"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-terracotta"/> Private page</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-leaf"/> Published</span></div>
     <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/60">{entries.length} saved {entries.length===1?'day':'days'} · {entries.filter(e=>e.published).length} shared</p>
    </div>
    <div className="rounded-[1.6rem] border border-ink/15 bg-ink p-5 text-paper"><div className="flex items-center gap-2 text-saffron"><BookHeart className="size-5"/><h2 className="font-display text-xl">A small habit</h2></div><p className="mt-3 text-sm leading-relaxed text-paper/65">Three bullets are enough. Keep the ordinary days too. They’re often the ones you’ll be glad to remember.</p><button className="mt-4 inline-flex items-center gap-2 text-sm text-saffron hover:underline" onClick={()=>{setDate(today());setMonth(today().slice(0,7))}}><ArrowRight className="size-4"/> Write today’s page</button></div>
    <div className="rounded-[1.6rem] border border-ink/15 bg-card p-5"><p className="eyebrow">Recent pages</p><div className="mt-3 space-y-2">{sorted.slice(-5).reverse().map(e=><button type="button" key={e.entry_date} onClick={()=>setDate(e.entry_date)} className={'block w-full rounded-xl border p-3 text-left transition '+(e.entry_date===date?'border-ink bg-paper-deep':'border-ink/10 hover:bg-paper')}><span className="block font-mono text-[.6rem] text-ink/40">{e.entry_date}</span><span className="mt-1 block font-display text-lg">{e.title||'Untitled page'}</span><span className="mt-1 text-xs text-ink/45">{e.published?'Shared':'Private'}</span></button>)}</div></div>
   </aside>
  </div>
 </section>
}
