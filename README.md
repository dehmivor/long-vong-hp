# Long Vong HP

Long Vong HP is a Hai Phong travel and food discovery platform. The product is split into three surfaces:

- `apps/web`: public landing page and traveler-facing web demo.
- `apps/mobile-app`: Expo mobile app for food discovery, map, reels, quests and profile.
- `apps/admin-dashboard`: operations dashboard for shops, quests, content and partner workflows.

The repo uses Turborepo, pnpm, TypeScript, Next.js, Expo and Supabase-ready shared packages.

## Current Status

- Monorepo infrastructure is ready.
- Mobile app has the first MVP tabs: Home, Map, Reels, Explore and Profile.
- Landing page has a demo map and curated Hai Phong shop data.
- Admin dashboard has the first operational overview screen.
- Shared packages include API client scaffolding and cross-app TypeScript types.
- Supabase migrations are present under `supabase/migrations`.

## Project Structure

```txt
long-vong-hp/
  apps/
    admin-dashboard/   Next.js admin dashboard
    mobile-app/        Expo React Native app
    web/               Next.js landing page
    docs/              Existing docs/demo app
  packages/
    api-client/        Supabase client and typed API helpers
    types/             Shared domain types
    ui/                Shared web UI components
  supabase/
    migrations/        Database schema and RLS
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

## Environment

Copy `.env.example` to `.env.local` for web/admin work, and use the `EXPO_PUBLIC_*` values for Expo:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Owner/contact account for deployment notes: `minhtamnghp03@gmail.com`.

## Deployment Plan

### Landing Page

- Platform: Vercel
- Root Directory: `apps/web`
- Build Command: `pnpm build`

### Admin Dashboard

- Platform: Vercel
- Root Directory: `apps/admin-dashboard`
- Build Command: `pnpm build`

### Mobile App

- Platform: Expo Application Services
- Working Directory: `apps/mobile-app`
- Preview build: `eas build --profile preview`
- Production build: `eas build --profile production`

### Backend and Database

- Platform: Supabase
- Apply migrations from `supabase/migrations`.
- Set the public anon key in Vercel and Expo environments.
- Keep service-role secrets out of client apps.

## Next Sprint

1. Connect Supabase project and seed real Hai Phong shop data.
2. Replace mobile map placeholder with `react-native-maps`.
3. Add auth and saved profile state.
4. Add admin CRUD for shops and quest management.
5. Add media storage flow for food reels.
6. Add CI checks for lint, typecheck and build.
