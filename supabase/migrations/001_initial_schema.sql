-- ============================================================
-- Fab 50s & 60s Nostalgia Car Club — Initial Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------
-- Custom role type
-- ---------------------------------------------------------------
create type public.user_role as enum ('super_admin', 'admin', 'editor');

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

create table public.user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  role       public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.gallery_items (
  id           uuid primary key default uuid_generate_v4(),
  src          text not null,
  caption      text not null default '',
  category     text not null default 'Club Events',
  storage_path text,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

create table public.events (
  id                 uuid primary key default uuid_generate_v4(),
  title              text not null,
  description        text not null default '',
  event_date         timestamptz not null,
  rain_date          text,
  time_display       text not null default '',
  location           text not null default '',
  event_type         text not null default 'Meeting',
  recurring          text,
  flyer_url          text,
  flyer_storage_path text,
  contact            text,
  entry_fee          text,
  spectator_fee      text,
  highlights         text[] default '{}',
  created_by         uuid references auth.users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.board_members (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  title       text not null,
  member_role text not null default 'officer',
  bio         text,
  phone       text,
  email       text,
  photo_url   text,
  storage_path text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.memoriam_entries (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  passed_on    text not null,
  tribute      text,
  photo_url    text,
  storage_path text,
  created_at   timestamptz not null default now()
);

create table public.site_content (
  id         uuid primary key default uuid_generate_v4(),
  section    text not null,
  key        text not null,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(section, key)
);

-- ---------------------------------------------------------------
-- Enable Row Level Security
-- ---------------------------------------------------------------
alter table public.user_roles      enable row level security;
alter table public.gallery_items   enable row level security;
alter table public.events          enable row level security;
alter table public.board_members   enable row level security;
alter table public.memoriam_entries enable row level security;
alter table public.site_content    enable row level security;

-- ---------------------------------------------------------------
-- Helper: read current user's role from JWT app_metadata
-- ---------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select auth.jwt() -> 'app_metadata' ->> 'role';
$$;

-- ---------------------------------------------------------------
-- RLS Policies — user_roles
-- ---------------------------------------------------------------
create policy "Authenticated users can view user_roles"
  on public.user_roles for select to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Super admins can insert user_roles"
  on public.user_roles for insert to authenticated
  with check (public.get_my_role() = 'super_admin');

create policy "Super admins can update user_roles"
  on public.user_roles for update to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "Super admins can delete user_roles"
  on public.user_roles for delete to authenticated
  using (public.get_my_role() = 'super_admin');

-- ---------------------------------------------------------------
-- RLS Policies — gallery_items
-- ---------------------------------------------------------------
create policy "Anyone can view gallery items"
  on public.gallery_items for select using (true);

create policy "Admins can insert gallery items"
  on public.gallery_items for insert to authenticated
  with check (public.get_my_role() in ('super_admin', 'admin'));

create policy "Admins and editors can update gallery items"
  on public.gallery_items for update to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete gallery items"
  on public.gallery_items for delete to authenticated
  using (public.get_my_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------
-- RLS Policies — events
-- ---------------------------------------------------------------
create policy "Anyone can view events"
  on public.events for select using (true);

create policy "Admins can insert events"
  on public.events for insert to authenticated
  with check (public.get_my_role() in ('super_admin', 'admin'));

create policy "Admins and editors can update events"
  on public.events for update to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete events"
  on public.events for delete to authenticated
  using (public.get_my_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------
-- RLS Policies — board_members
-- ---------------------------------------------------------------
create policy "Anyone can view board members"
  on public.board_members for select using (true);

create policy "Admins can insert board members"
  on public.board_members for insert to authenticated
  with check (public.get_my_role() in ('super_admin', 'admin'));

create policy "Admins and editors can update board members"
  on public.board_members for update to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete board members"
  on public.board_members for delete to authenticated
  using (public.get_my_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------
-- RLS Policies — memoriam_entries
-- ---------------------------------------------------------------
create policy "Anyone can view memoriam entries"
  on public.memoriam_entries for select using (true);

create policy "Admins can insert memoriam entries"
  on public.memoriam_entries for insert to authenticated
  with check (public.get_my_role() in ('super_admin', 'admin'));

create policy "Admins and editors can update memoriam entries"
  on public.memoriam_entries for update to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete memoriam entries"
  on public.memoriam_entries for delete to authenticated
  using (public.get_my_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------
-- RLS Policies — site_content
-- ---------------------------------------------------------------
create policy "Anyone can view site content"
  on public.site_content for select using (true);

create policy "Admins can insert site content"
  on public.site_content for insert to authenticated
  with check (public.get_my_role() in ('super_admin', 'admin'));

create policy "Admins and editors can update site content"
  on public.site_content for update to authenticated
  using (public.get_my_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete site content"
  on public.site_content for delete to authenticated
  using (public.get_my_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------
-- Storage bucket: media (public)
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Anyone can view media files"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admins can upload media files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and public.get_my_role() in ('super_admin', 'admin')
  );

create policy "Admins and editors can update media files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and public.get_my_role() in ('super_admin', 'admin', 'editor')
  );

create policy "Admins can delete media files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and public.get_my_role() in ('super_admin', 'admin')
  );

-- ---------------------------------------------------------------
-- Custom Access Token Hook
-- Reads user_roles and injects role into app_metadata JWT claims.
-- After creating this function, go to:
--   Authentication > Hooks > Custom Access Token Hook
-- and set it to: public.custom_access_token_hook
-- ---------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  claims       jsonb;
  role_val     text;
begin
  select role::text into role_val
  from public.user_roles
  where user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if role_val is not null then
    claims := jsonb_set(
      claims,
      '{app_metadata}',
      jsonb_set(
        coalesce(claims->'app_metadata', '{}'),
        '{role}',
        to_jsonb(role_val)
      )
    );
  else
    -- Remove stale role claim if user was de-provisioned
    if (claims->'app_metadata') is not null then
      claims := jsonb_set(
        claims,
        '{app_metadata}',
        (claims->'app_metadata') - 'role'
      );
    end if;
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- Allow the auth system to call this hook
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from public, anon, authenticated;

-- ---------------------------------------------------------------
-- Default site content
-- ---------------------------------------------------------------
insert into public.site_content (section, key, value) values
  ('homepage', 'hero', '{
    "title": "Fabulous 50s & 60s Nostalgia Car Club",
    "subtitle": "Long Island''s Premier Classic Car Club",
    "description": "A friendly, welcoming community for car enthusiasts of all makes, models, and years. Join us for cruise nights, car shows, and monthly meetings."
  }'::jsonb),
  ('homepage', 'about', '{
    "title": "About Our Club",
    "description": "The Fabulous 50s & 60s Nostalgia Car Club has been bringing together car enthusiasts on Long Island for decades. We welcome all makes, models, and years — classics, modern, muscle, and imports. Come as you are, bring what you drive."
  }'::jsonb),
  ('membership', 'info', '{
    "title": "Join the Club",
    "dues": "$35 per year",
    "description": "Membership is open to all car enthusiasts. Annual dues include access to all club events, monthly meetings, and the club newsletter.",
    "benefits": [
      "Access to all club events",
      "Monthly meetings at Seaport Diner",
      "Car show judging participation",
      "Club newsletter",
      "Member discounts at local shops"
    ]
  }'::jsonb)
on conflict (section, key) do nothing;

-- ---------------------------------------------------------------
-- Seed existing board members from hardcoded data
-- ---------------------------------------------------------------
insert into public.board_members (name, title, member_role, bio, phone, photo_url, sort_order) values
  ('John Forlenza',   'President',      'officer', 'Leads the club and presides over all meetings and club activities.',                     '(516) 521-8965', '/images/john-forlenza.jpg',   0),
  ('Peter Pellicani', 'Vice President', 'officer', 'Assists the President and takes charge in their absence.',                              '(631) 921-1662', '/images/peter-pellacini.jpg', 1),
  ('Cathy Somma',     'Secretary',      'officer', 'Maintains club records, correspondence, and membership applications.',                  '(631) 926-2554', '/images/cathy-somma.jpg',     2),
  ('Arthur Rosen',    'Treasurer',      'officer', 'Manages club finances, dues collection, and financial reporting.',                      '(631) 463-4983', '/images/arthur-rosen.jpg',    3)
on conflict do nothing;

-- ---------------------------------------------------------------
-- Seed existing in memoriam entries
-- ---------------------------------------------------------------
insert into public.memoriam_entries (name, passed_on, tribute, photo_url) values
  ('Jim Cornwell', 'February 15, 2026',
   'A beloved member of the Fab 50s & 60s family. Jim''s warmth, enthusiasm for the hobby, and dedication to the club will be remembered by everyone who knew him. Rest in peace, Jim.',
   '/images/jim-cornwell-RIP.jpg')
on conflict do nothing;

-- ---------------------------------------------------------------
-- Seed existing events
-- ---------------------------------------------------------------
insert into public.events (title, description, event_date, rain_date, time_display, location, event_type, recurring, contact, entry_fee, spectator_fee, highlights) values
  ('Monthly Club Meeting', 'Join us for our monthly gathering. Discuss upcoming events, share car stories, and meet fellow enthusiasts.', '2026-04-14 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('Spring Dust Off Car Show', 'Kick off the season with our Spring Dust Off Car Show! 28 trophy classes, raffles, 50/50, vendors, music by DJ Steve, and All American BBQ by The Maples.', '2026-04-19 09:00:00+00', 'Sunday, April 26, 2026', '9:00 AM – 3:00 PM', 'The Maples, 10 Ryerson Avenue, Manorville, NY 11949', 'Show', null, 'For Info: Arthur @ 631-463-4983 | Vendors: Jackie @ 631-495-6825', '$20 per vehicle', '$5 per spectator', ARRAY['28 Trophy Classes', 'Best in Show judging at 10:00 AM', 'Raffles & 50/50', 'Vendors', 'Music by DJ Steve', 'All American BBQ']),
  ('Monthly Club Meeting', 'Monthly gathering — second Thursday of the month.', '2026-05-12 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('Paws of War 2026 Car Show', 'Join us to support our Veterans at the Paws of War 2026 Car Show, celebrating America''s 250th Anniversary. Judged by The Fabulous 50s & 60s Nostalgia Car Club.', '2026-05-31 09:00:00+00', 'Sunday, June 7, 2026', '9:00 AM – 3:00 PM', 'Paws of War, 127 Smithtown Blvd., Nesconset, NY', 'Show', null, 'Ray: 631-624-4126 | Arthur: 631-463-4983 | pawsofwar.org', '$25 at the gate', 'Free for spectators', ARRAY['18+ Trophy Classes', 'Vintage, Classic & Custom Cars', 'Great Live Music', 'Raffles & 50/50', 'Food Truck']),
  ('Monthly Club Meeting', 'Monthly gathering — second Thursday of the month.', '2026-06-09 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('Monthly Club Meeting', 'Monthly gathering — second Thursday of the month.', '2026-07-14 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('Monthly Club Meeting', 'Monthly gathering — second Thursday of the month.', '2026-08-11 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('15th Annual Rock-N-Roll Car Show', 'Celebrating our 15th Annual Rock-N-Roll Car Show for Stroke Awareness & Prevention. Judged by The Fabulous 50s & 60s Nostalgia Car Club. Hosted by Judy''s Run for Stroke Awareness & Prevention.', '2026-08-09 09:00:00+00', 'Sunday, August 16, 2026', '9:00 AM – 4:00 PM', 'Smithtown Historical Society, 239 E. Main St., Smithtown, NY', 'Show', null, 'Bob: (631) 255-2516 | www.judysrun.com', '$20 per show car', '$10 per car', ARRAY['28 Classes', 'Live Bands', 'Craft Tables', 'Food Vendors', 'Raffles & 50/50', 'Blood Pressure Screening', 'DJ Steve']),
  ('Monthly Club Meeting', 'Monthly gathering — second Thursday of the month.', '2026-09-08 19:00:00+00', null, '7:00 PM', 'Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY', 'Meeting', 'Second Thursday of every month', null, null, null, '{}'),
  ('Stony Brook Child Care Car Show & Craft Fair', 'The Stony Brook Child Care 2026 Car Show & Craft Fair, hosted by The Fabulous 50s & 60s Nostalgia Car Club. All years of classic cars, hot rods, muscle cars, custom cars — all makes and models welcome.', '2026-09-27 09:00:00+00', 'Sunday, October 4, 2026', '9:00 AM – 3:00 PM', 'The Maples, 10 Ryerson Ave, Manorville, NY 11949', 'Show', null, 'Jackie: 631-495-6825', '$20 per vehicle', '$5 per spectator (children under 5 free)', ARRAY['24 Car Classes', 'Craft Fair', 'Food & BBQ', '50/50', 'Raffle Baskets', 'Music', 'Vendors', 'Family Activities']),
  ('Cruise Night at SmithHaven Mall', 'Weekly Wednesday cruise night at SmithHaven Mall. All vehicles welcome. Runs every Wednesday from May through October.', '2026-05-06 17:00:00+00', null, '5:00 PM – 8:00 PM', 'SmithHaven Mall near Ford''s Garage, Lake Grove, NY', 'Cruise', 'Every Wednesday, May through October', null, null, null, '{}'),
  ('Cruise Night at SmithHaven Mall', 'Weekly Wednesday cruise night at SmithHaven Mall. All vehicles welcome.', '2026-05-13 17:00:00+00', null, '5:00 PM – 8:00 PM', 'SmithHaven Mall near Ford''s Garage, Lake Grove, NY', 'Cruise', 'Every Wednesday, May through October', null, null, null, '{}'),
  ('Cruise Night at SmithHaven Mall', 'Weekly Wednesday cruise night at SmithHaven Mall. All vehicles welcome.', '2026-05-20 17:00:00+00', null, '5:00 PM – 8:00 PM', 'SmithHaven Mall near Ford''s Garage, Lake Grove, NY', 'Cruise', 'Every Wednesday, May through October', null, null, null, '{}'),
  ('Cruise Night at SmithHaven Mall', 'Weekly Wednesday cruise night at SmithHaven Mall. All vehicles welcome.', '2026-05-27 17:00:00+00', null, '5:00 PM – 8:00 PM', 'SmithHaven Mall near Ford''s Garage, Lake Grove, NY', 'Cruise', 'Every Wednesday, May through October', null, null, null, '{}')
on conflict do nothing;

-- ---------------------------------------------------------------
-- HOW TO BOOTSTRAP YOUR FIRST SUPER ADMIN
-- After your first login via Facebook, run this in the SQL Editor,
-- replacing the email with your Facebook account email:
--
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'super_admin'
--   FROM auth.users
--   WHERE email = 'your-facebook-email@example.com';
--
-- Then sign out and sign back in for the role to take effect.
-- ---------------------------------------------------------------
