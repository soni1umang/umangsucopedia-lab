import {supabase} from '@/lib/supabase'

export function slugifyTag(value:string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
}

export function tagIndex(posts:any[]) {
  const map = new Map<string,{slug:string;name:string;count:number}>()
  for (const post of posts) {
    const seen = new Set<string>()
    for (const raw of Array.isArray(post.tags) ? post.tags : []) {
      const name = String(raw).trim()
      const slug = slugifyTag(name)
      if (!name || !slug || seen.has(slug)) continue
      seen.add(slug)
      const current = map.get(slug)
      map.set(slug, current ? {...current,count:current.count+1} : {slug,name,count:1})
    }
  }
  return [...map.values()].sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name))
}

export function descendantCategoryIds(all:any[], rootId:any) {
  const root = String(rootId)
  const ids = [root]
  for (let i = 0; i < ids.length; i++) {
    const parent = ids[i]
    for (const c of all) {
      if (c.parent_id != null && String(c.parent_id) === parent) {
        const child = String(c.id)
        if (!ids.includes(child)) ids.push(child)
      }
    }
  }
  return ids
}

export function categoryPostCount(all:any[], posts:any[], categoryId:any) {
  const ids = new Set(descendantCategoryIds(all, categoryId))
  return posts.filter((p:any) => p.category_id != null && ids.has(String(p.category_id))).length
}

export async function categories(){const{data,error}=await supabase.from('categories').select('*').order('sort_order');if(error)throw error;return data??[]}
export async function posts(){const{data,error}=await supabase.from('posts').select('*,category:categories!posts_category_id_fkey(*)').eq('status','published').order('published_at',{ascending:false});if(error)throw error;return data??[]}
export async function post(slug:string){const{data,error}=await supabase.from('posts').select('*,category:categories!posts_category_id_fkey(*)').eq('slug',slug).maybeSingle();if(error)throw error;return data}
export async function adminPosts(){const{data,error}=await supabase.from('posts').select('*,category:categories!posts_category_id_fkey(*)').order('updated_at',{ascending:false});if(error)throw error;return data??[]}
