# Giftland

Social gifting platform — landing page, mobile web app, vendor dashboard, and admin.

## Stack
- Next.js 14 (App Router)
- Supabase (auth + database)
- Vercel (hosting)

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key.
4. Install and run:

```bash
npm install
npm run dev
```

## Routes
- `/` — Landing page + sign up
- `/home` — Mobile app
- `/raffle` — Sign-up raffle
- `/wallet` — Host wallet
- `/vendor` — Vendor dashboard
- `/admin` — Admin dashboard

## Deploy
Push to GitHub and import the repo in Vercel. Add the same env vars in Vercel project settings.

## Theme
Red family (`#DC2626`) throughout.
