-- Ucopedia v2 migration: restore the complete category tree and move editable
-- non-blog content into Supabase. Run this once in the Supabase SQL Editor.

insert into public.categories(slug,name,description,cover_image,parent_id,sort_order)
select v.slug, v.name, v.description, v.cover_image, p.id, v.sort_order
from (
  values
    ('books-hindi','Hindi','','/img/cat-books.jpg',1),
    ('books-english','English','','/img/cat-books.jpg',2)
) as v(slug,name,description,cover_image,sort_order)
cross join lateral (select id from public.categories where slug='books' limit 1) p
on conflict (slug) do update set
  name=excluded.name,
  cover_image=coalesce(public.categories.cover_image, excluded.cover_image),
  parent_id=excluded.parent_id,
  sort_order=excluded.sort_order;

insert into public.categories(slug,name,description,cover_image,parent_id,sort_order)
select v.slug, v.name, v.description, v.cover_image, p.id, v.sort_order
from (
  values
    ('action-adventure','Action/Adventure','','/img/cat-cinema.jpg',1),
    ('comedy','Comedy','','/img/cat-cinema.jpg',2),
    ('drama','Drama','','/img/cat-cinema.jpg',3),
    ('science-fiction','Science Fiction (Sci-Fi)','','/img/cat-cinema.jpg',4),
    ('horror','Horror','','/img/cat-cinema.jpg',5),
    ('romance','Romance','','/img/cat-cinema.jpg',6),
    ('thriller','Thriller','','/img/cat-cinema.jpg',7),
    ('fantasy','Fantasy','','/img/cat-cinema.jpg',8),
    ('musical','Musical','','/img/cat-cinema.jpg',9),
    ('historical-non-fiction','Historical/Non-Fiction','','/img/cat-cinema.jpg',10),
    ('animation','Animation','','/img/cat-cinema.jpg',11),
    ('western','Western','','/img/cat-cinema.jpg',12),
    ('psychological-tragedy','Psychological/Tragedy','','/img/cat-cinema.jpg',13),
    ('cinema-as-whole','Cinema! As whole','','/img/cat-cinema.jpg',14),
    ('short-films','Short Films','','/img/cat-cinema.jpg',15)
) as v(slug,name,description,cover_image,sort_order)
cross join lateral (select id from public.categories where slug='cinema' limit 1) p
on conflict (slug) do update set
  name=excluded.name,
  cover_image=coalesce(public.categories.cover_image, excluded.cover_image),
  parent_id=excluded.parent_id,
  sort_order=excluded.sort_order;

create table if not exists public.site_content(
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content for select using(true);
drop policy if exists "admin write site content" on public.site_content;
create policy "admin write site content" on public.site_content for all using(public.is_admin()) with check(public.is_admin());

insert into public.site_content(key,content) values
('about', '{"headline":"Hi, I’m Umang. I collect questions.","intro":"This is placeholder text for your introduction.","paragraphs":["Write a few sentences about your background here.","Then talk about what you care about now.","Finish with what you’re working toward."],"facts":[{"label":"Based in","value":"Your city, India"},{"label":"Studying","value":"Your field of study"},{"label":"Currently reading","value":"A book title"},{"label":"Languages","value":"Hindi, English"}],"interests":["Politics","Science","Books","Cinema","Philosophy","Photography","Painting"]}'::jsonb),
('academia', '{"intro":"Your academic journey, research interests and what you’re learning right now.","education":[{"school":"Your University","degree":"Degree, Major","period":"2022 — Present","note":"Relevant coursework, honours, or a thesis topic."}],"interests":["Research interest one","Research interest two","Research interest three"]}'::jsonb),
('portfolio', '[{"title":"Project or paper title","kind":"Research","year":"2025","description":"One or two lines on what you did, what you found and why it matters.","link":""},{"title":"Another project","kind":"Coursework","year":"2024","description":"Describe the problem, your approach and the result.","link":""}]'::jsonb),
('side_hustles', '[{"title":"Side project one","status":"Active","description":"A small business, freelance gig, channel or maker project you run on the side.","link":""},{"title":"Side project two","status":"Idea","description":"Something you’re experimenting with.","link":""}]'::jsonb),
('photography', '[{"slug":"kerala","title":"Kerala","summary":"Backwaters, misty tea hills and the colour of Kathakali: God’s own country through my lens.","cover":"/img/kerala-1.jpg","photos":[{"src":"/img/kerala-1.jpg","caption":"Houseboat on the Alleppey backwaters at golden hour"},{"src":"/img/kerala-2.jpg","caption":"Morning mist over the tea estates of Munnar"},{"src":"/img/kerala-3.jpg","caption":"Chinese fishing nets at sunset, Fort Kochi"},{"src":"/img/kerala-4.jpg","caption":"A Kathakali performer before the show"}]}]'::jsonb),
('paintings', '[{"src":"/img/paint-1.jpg","title":"The Last Tree","medium":"Acrylic on canvas","year":"2025","caption":"A lone tree under a burning sky."},{"src":"/img/paint-2.jpg","title":"Village Lane","medium":"Watercolour on paper","year":"2024","caption":"Bicycles and bougainvillea on a quiet afternoon."},{"src":"/img/paint-3.jpg","title":"Tides of Thought","medium":"Gouache","year":"2024","caption":"An abstract study in circles and waves."}]'::jsonb)
on conflict(key) do nothing;
 
-- Site identity and social profiles are editable from the Content Studio.
insert into public.site_content(key,content) values
('site_settings', '{"name":"Ucopedia","owner":"Umang","title":"Umang''s Ucopedia","tagline":"Making new mindspace","description":"The personal encyclopedia of Umang: essays on politics, science, books, cinema and philosophy, plus academia, photography and paintings.","email":"soni1.umang333@gmail.com","location":"India","socials":[{"key":"instagram","label":"Instagram","href":"https://www.instagram.com/flowing._wind/","enabled":true},{"key":"youtube","label":"YouTube","href":"https://youtube.com/@your-channel","enabled":true},{"key":"whatsapp","label":"WhatsApp","href":"https://wa.me/917880847995","enabled":true},{"key":"linkedin","label":"LinkedIn","href":"https://www.linkedin.com/in/umang-soni420","enabled":true},{"key":"github","label":"GitHub","href":"https://github.com/soni1umang","enabled":true},{"key":"twitter","label":"X / Twitter","href":"https://x.com/SoniUmang333","enabled":true}]}'::jsonb)
on conflict(key) do nothing;
