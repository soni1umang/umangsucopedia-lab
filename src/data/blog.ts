import {supabase} from '@/lib/supabase';

export function descendantCategoryIds(all:any[], rootId:number) {
  const ids = [rootId]
  for (let i = 0; i < ids.length; i++) {
    for (const c of all) if (c.parent_id === ids[i] && !ids.includes(c.id)) ids.push(c.id)
  }
  return ids
}

export function categoryPostCount(all:any[], posts:any[], categoryId:number) {
  const ids = descendantCategoryIds(all, categoryId)
  return posts.filter((p:any) => ids.includes(p.category_id)).length
}

import {supabase} from '@/lib/supabase'; export async function categories(){const{data,error}=await supabase.from('categories').select('*').order('sort_order');if(error)throw error;return data??[]} export async function posts(){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').eq('status','published').order('published_at',{ascending:false});if(error)throw error;return data??[]} export async function post(slug:string){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').eq('slug',slug).maybeSingle();if(error)throw error;return data} export async function adminPosts(){const{data,error}=await supabase.from('posts').select('*,category:categories(*)').order('updated_at',{ascending:false});if(error)throw error;return data??[]}