import {createFileRoute,Link} from '@tanstack/react-router';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import {Clock} from 'lucide-react';
import {post} from '@/data/blog';
import {formatDate,img} from '@/lib/img';
import {site} from '@/config/site';
import {slugifyTag} from '@/data/blog';

function safeArticleHtml(content:string){
  const raw=String(marked.parse(content||'',{async:false}));
  return DOMPurify.sanitize(raw,{
    USE_PROFILES:{html:true},
    ADD_TAGS:['iframe'],
    ADD_ATTR:['allow','allowfullscreen','frameborder','scrolling','target','rel','class','style'],
  });
}

export const Route=createFileRoute('/posts/$slug')({loader:({params})=>post(params.slug),component:Post});

function Post(){
  const p=Route.useLoaderData();
  if(!p)return <section className="container-uco py-20"><h1 className="text-4xl">Post not found.</h1></section>;
  const html=safeArticleHtml(p.content||'');
  const tags=Array.isArray(p.tags)?p.tags.filter((t:string)=>String(t).trim()):[];
  return <article>
    <header className="container-uco max-w-4xl pb-10 pt-12">
      <Link to="/blogs" className="text-sm text-ink/60">← Blogs</Link>
      <h1 className="mt-5 text-4xl font-semibold md:text-6xl">{p.title}</h1>
      {p.excerpt&&<p className="mt-5 font-display text-xl italic text-ink/70">{p.excerpt}</p>}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink/60"><span>By {site.owner}</span><time>{formatDate(p.published_at)}</time><span><Clock className="inline size-3.5"/> {Math.max(1,Math.round((p.content||'').replace(/<[^>]+>/g,' ').split(/\s+/).length/220))} min read</span></div>
      {tags.length>0&&<div className="mt-6 flex flex-wrap gap-2">{tags.map((tag:string)=><Link key={tag} to="/tags/$tag" params={{tag:slugifyTag(tag)}} className="rounded-full border border-ink/10 bg-paper-deep px-3 py-1.5 text-xs font-medium text-ink/65 transition hover:border-ink/25 hover:bg-saffron hover:text-ink">#{tag}</Link>)}</div>}
    </header>
    {p.cover_image&&<div className="container-uco max-w-5xl"><img src={img(p.cover_image,1400)} className="w-full rounded-2xl border-2 border-ink" alt=""/></div>}
    <div className="container-uco max-w-3xl pt-12 pb-20"><div className="prose-uco" dangerouslySetInnerHTML={{__html:html}}/></div>
  </article>
}