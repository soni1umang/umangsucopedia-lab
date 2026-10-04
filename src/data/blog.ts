import {supabase} from '@/lib/supabase'

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
export async function posts(){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').eq('status','published').order('published_at',{ascending:false});if(error)throw error;return data??[]}
export async function post(slug:string){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').eq('slug',slug).maybeSingle();if(error)throw error;return data}
export async function adminPosts(){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').order('updated_at',{ascending:false});if(error)throw error;return data??[]}
