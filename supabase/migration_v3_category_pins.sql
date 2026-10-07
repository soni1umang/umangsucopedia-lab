-- Ucopedia v3: per-category and per-subcategory pinned posts.
-- Run this once in the Supabase SQL Editor after migration_v2_content.sql.

create table if not exists public.category_post_pins(
  category_id bigint not null references public.categories(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now(),
  primary key(category_id, post_id)
);

create index if not exists category_post_pins_category_position_idx
  on public.category_post_pins(category_id, position);

alter table public.category_post_pins enable row level security;

drop policy if exists "public read category post pins" on public.category_post_pins;
create policy "public read category post pins"
  on public.category_post_pins for select using(true);

drop policy if exists "admin write category post pins" on public.category_post_pins;
create policy "admin write category post pins"
  on public.category_post_pins for all
  using(public.is_admin())
  with check(public.is_admin());
