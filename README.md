# SlabPixel Quotes

**Design-first storytelling — words turned into visual artifacts.**

Live site: [slabpixel-quotes.vercel.app](https://slabpixel-quotes.vercel.app)

## About

SlabPixel Quotes is a curated gallery of quote cards: typography, palettes, moods, and backgrounds come together as shareable pieces. Visitors browse a published feed; signed-in users can submit quotes, manage their profile, and track submissions. Admins review the queue and publish approved work through a dashboard.

## Features

- **Feed & exploration** — Published quotes in an interactive, motion-heavy UI (smooth scrolling, view transitions, WebGL-backed presentation).
- **Submissions** — Users submit text, attribution, styling choices, and optional imagery; quotes move through statuses from pending to published.
- **Auth** — [Better Auth](https://www.better-auth.com/) with email/password and optional Google OAuth.
- **Media** — Profile and custom quote backgrounds via [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when configured.
- **Profiles** — Public profile pages and “your quotes” views for contributors.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router), React 19, TypeScript
- **Database:** [Prisma](https://www.prisma.io/) with MySQL/MariaDB (`@prisma/adapter-mariadb`)
- **Styling:** Tailwind CSS 4
- **Motion & graphics:** GSAP, Lenis, Three.js (WebGL scenes for quote presentation)

## Prerequisites

- Node.js compatible with Next.js 16
- A MySQL-compatible database (connection string for Prisma)

## Local development

```bash
npm install
```

Set environment variables (see below), then apply the schema and generate the client:

```bash
npm run db:push
# optional: seed sample data
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | **Required.** MySQL/MariaDB URL (the app normalizes `mysql://` to `mariadb://` for the driver). |
| `DATABASE_CONNECT_TIMEOUT_MS` | Optional. Pool connect timeout (defaults favor remote/cold-start reliability). |
| `DATABASE_ACQUIRE_TIMEOUT_MS` | Optional. Pool acquire timeout. |
| `NEXT_PUBLIC_APP_URL` | Public app origin (defaults to `http://localhost:3000` in dev). Used by the auth client. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional. Enables Google sign-in when both are set. |
| `BLOB_READ_WRITE_TOKEN` | Optional. [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) token for profile photo and background uploads. |

Configure any additional secrets your auth setup expects (e.g. session signing) per [Better Auth](https://www.better-auth.com/docs) deployment docs.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Run `prisma/seed.ts` |
