-- Ucopedia Pocket Journal v5: allow multiple entries per date and more than two photos.
-- Run once in the Supabase SQL Editor for the same project used by the website.

alter table public.journal_entries
  drop constraint if exists journal_entries_entry_date_key;

alter table public.journal_entries
  drop constraint if exists journal_photos_max_two;

create index if not exists journal_entries_date_id_idx
  on public.journal_entries(entry_date desc, id desc);

-- Existing entries, their privacy setting, and their photos are preserved.
