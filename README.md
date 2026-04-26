# Fab 50s & 60s Nostalgia Car Club

Official website for the Fab 50s & 60s Nostalgia Car Club.

I am a member of the club and built this website to give the club a modern, easy-to-maintain online home. The goal is to make it simple for members, visitors, and prospective members to learn about the club, view upcoming events, browse photos, and get in touch.

The site includes a Supabase-powered admin portal, CMS, and privilege access management system so approved club administrators can update the website without needing to edit code.

## About The Club

The Fab 50s & 60s Nostalgia Car Club is a Long Island car club for people who enjoy classic cars, nostalgia, cruise nights, car shows, and the community that comes with the hobby.

This website helps share:

- Club information and history
- Upcoming shows, meetings, and cruise nights
- Gallery photos from club events
- Board member information
- Membership information
- In Memoriam tributes
- Contact information for the public

## Features

- Public-facing club website built with Next.js
- Events calendar with list and calendar views
- Gallery for club photos
- Board of Directors page
- Membership information
- In Memoriam page
- Contact and general club information
- Admin portal protected by Supabase Auth
- Google login for approved administrators
- CMS pages for managing gallery photos, events, board members, memorial entries, and site text
- Privilege access management with `super_admin`, `admin`, and `editor` roles

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Google OAuth

## Admin Roles

The admin portal uses three roles:

- `super_admin` — full access, including managing other admins
- `admin` — can create, edit, and delete CMS content
- `editor` — can edit content but cannot delete content or manage users

Admin roles are stored in Supabase and mirrored into auth metadata so the app can securely enforce access.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

3. Fill in the Supabase values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-supabase-service-role-key
```

The service role key must stay server-side only. Never commit `.env.local`.

4. Run the Supabase schema:

Open `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor and run it.

5. Enable Google OAuth in Supabase:

Supabase Dashboard -> Authentication -> Providers -> Google.

The Google OAuth redirect URI should be:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

6. Start the site:

```bash
npm run dev
```

## Admin Access

After a Google account signs in for the first time, grant the first admin account manually in Supabase:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'admin@example.com';

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
WHERE email = 'admin@example.com';
```

After that, sign out and sign back in. Future role changes can be handled in the Users & Access admin page.

## Git Safety

Real credentials are intentionally ignored by `.gitignore`.

Safe to commit:

- `.env.local.example`
- Supabase migration SQL
- Source code and public assets

Do not commit:

- `.env.local`
- `.next/`
- `node_modules/`
- `fb_content.json`

`fb_content.json` is a private source/import file from Facebook content and should not be shared publicly.

## Project Notes

This project was created for the Fab 50s & 60s Nostalgia Car Club by a club member. It is intended to help the club maintain a public website and give trusted admins a simple way to keep content up to date.
