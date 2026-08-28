# Lòng Vòng HP

Lòng Vòng HP is a Hai Phong travel and food discovery platform. The product is split into three surfaces:

- `apps/web`: public landing page and traveler-facing web demo.
- `apps/mobile-app`: Expo mobile app for food discovery, map, reels, quests and profile.
- `apps/admin-dashboard`: operations dashboard for shops, quests, reels, reviews and partner workflows.

The repo uses Turborepo, pnpm, TypeScript, Next.js, Expo and Supabase.

## Current Status

Every MVP flow in `instruction.md` is implemented end to end.

**Mobile app (Expo Router)**

- Email/password auth with a session persisted in AsyncStorage, plus OAuth helpers (Google, Kakao, Apple).
- Home, Map, Reels, Quests and Profile tabs, all translated.
- **Local Choice map** with diacritic-insensitive search, `local pick` / `open now` filters and GPS locate.
- **Food Reels**: a vertical pager playing HLS streams via `expo-video`; only the snapped-in reel plays, and view counts are recorded once per reel.
- **QR check-in** (`expo-camera`) with the 50m GPS anti-fraud rule enforced server-side, one check-in per shop per day, automatic points and badge awards.
- **Quests & badges** with per-quest progress bars and voucher reveal on completion.
- Shop detail screen with reviews and review submission.
- **Trilingual (vi / en / ko)** with a language switcher and device-locale detection.

**Landing page**

- Live Supabase shop data with a demo fallback, interactive map, and a vi/en/ko language switcher.

**Admin dashboard**

- Overview with live counts, plus full CRUD for Shops, Quests and Reels, and a Reviews moderation queue.

**Backend**

- Postgres schema, RLS policies, PostGIS proximity search, and RPCs for check-in, quest progress and reel views.
- Seed data for Hai Phong shops, the launch quest and sample reels.

## Project Structure

```txt
long-vong-hp/
  apps/
    admin-dashboard/   Next.js admin dashboard (shops, quests, reels, reviews)
    mobile-app/        Expo React Native app
    web/               Next.js landing page
    docs/              Existing docs/demo app
  packages/
    api-client/        Supabase client and typed API helpers
    i18n/              Shared vi/en/ko translations (i18next)
    types/             Shared domain types
    ui/                Shared web UI components
  supabase/
    migrations/        Database schema, RLS, seed data
```

## Local Development

```sh
pnpm install
pnpm dev
```

Run one app:

```sh
pnpm --filter web dev
pnpm --filter admin-dashboard dev
pnpm --filter mobile-app start
```

Repo-wide checks (the same ones CI runs):

```sh
pnpm turbo lint
pnpm turbo check-types
pnpm turbo build
pnpm --filter mobile-app exec expo export --platform android --output-dir .expo-export-check
```

> The mobile bundle step matters: `tsc` cannot see Metro resolution failures, so a
> broken `metro.config.js` type-checks cleanly while producing no bundle at all.

## Environment

Copy `.env.example` to `.env` (or `.env.local` for web/admin work):

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # admin dashboard writes only — never ship to a client
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Every surface degrades to bundled demo data when Supabase is unset, so the apps
still run and build without secrets.

Owner/contact account for deployment notes: `minhtamnghp03@gmail.com`.

## Database Setup

Apply the migrations in order from `supabase/migrations`, or paste
`supabase/RUN_IN_SQL_EDITOR.sql` into the Supabase SQL Editor once — it
concatenates 001 → 004.

| Migration | Contents |
| --- | --- |
| `001_initial_schema.sql` | Tables, enums, PostGIS geometry, rating triggers |
| `002_rls_and_functions.sql` | RLS policies, `get_nearby_shops`, `checkin_at_shop`, `increment_review_helpful` |
| `003_seed_haiphong_content.sql` | Hai Phong shops and the launch quest |
| `004_reels_and_media.sql` | `reels` table, `increment_reel_view`, `get_quest_progress`, seed reels |

## Shop QR Codes

Check-in QR codes are read by `apps/mobile-app/lib/qr.ts`, which accepts any of:

```txt
<shop-uuid>
longvonghp://checkin/<shop-uuid>
https://longvonghp.vn/checkin/<shop-uuid>
{"shop_id":"<shop-uuid>"}
```

The 50m proximity rule and the once-per-day limit are enforced by the
`checkin_at_shop` RPC, not the client, so a patched app cannot bypass them.

## Deployment

### Landing Page

- Platform: Vercel
- Root Directory: `apps/web`
- Build Command: `pnpm build`

### Admin Dashboard

- Platform: Vercel
- Root Directory: `apps/admin-dashboard`
- Build Command: `pnpm build`
- Requires `SUPABASE_SERVICE_ROLE_KEY` for write access.

### Mobile App

- Platform: Expo Application Services
- Working Directory: `apps/mobile-app`
- Preview build: `eas build --profile preview`
- Production build: `eas build --profile production`
- Android map tiles need `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` wired into
  `android.config.googleMaps.apiKey` in `app.json`.

### Backend and Database

- Platform: Supabase
- Apply migrations from `supabase/migrations`.
- Set the anon key in Vercel and Expo environments; keep the service-role key
  server-side only.

## Next Steps

1. Replace the placeholder HLS test streams with real Hai Phong footage in Supabase Storage.
2. Configure the Google, Kakao and Apple OAuth providers in the Supabase dashboard and add the native redirect (`longvonghp://auth/callback`).
3. Add favourites and a saved-shop list.
4. Partner-facing voucher redemption flow.
5. Beta test in Hai Phong, then ship v1.0 to the App Store and Google Play.
