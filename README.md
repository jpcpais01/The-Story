# The Story

A lore-exploration atlas: a top-down 3D relief map of your world as the homepage, with a searchable Codex of civilizations and events, and a fully modular admin panel for editing it all.

- **Map**: React Three Fiber terrain with real elevation, hypsometric tinting, and contour lines. Your hand-drawn map overlays on top once you upload it.
- **Content**: civilizations, events, and locations, each with repeatable sections (heading + rich text + optional image) — no code changes needed to add or restructure content.
- **Data**: text in Firestore, images in Cloudinary. Runs with zero accounts against local placeholder data until you connect real ones (see [SETUP.md](SETUP.md)).
- **Editing**: gated by `EDITABLE` in [`config/site.config.ts`](config/site.config.ts) plus real Firebase Authentication + Firestore security rules — flip `EDITABLE` to `false` before pushing a public build.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Everything — including `/admin` — works immediately against in-memory placeholder data.

To connect a real Firebase project and Cloudinary account (so content persists and images actually upload), follow [SETUP.md](SETUP.md).

## Project structure

- `app/` — pages (App Router): the map (`/`), Codex (`/codex`), Timeline (`/timeline`), Admin (`/admin`).
- `components/map/` — the 3D terrain, pins, and map HUD.
- `components/codex/` / `components/admin/` — public content display and the admin CRUD forms.
- `lib/firestore/*.server.ts` / `*.client.ts` — cached public reads vs. authenticated admin writes.
- `lib/dev-store/` — the in-memory placeholder data used when no Firebase project is configured.
- `config/site.config.ts` — the `EDITABLE` switch and default world settings.

## Deploying

Deploys cleanly to [Vercel](https://vercel.com/new). See the last section of [SETUP.md](SETUP.md) for environment variables and the `EDITABLE` public/private build workflow.
