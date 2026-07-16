# Setup

The site runs out of the box with placeholder data (no accounts needed) — `npm install && npm run dev` and it's fully clickable, admin panel included. This guide is for connecting your real Firebase project and Cloudinary account so content persists for real and images upload properly.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (Google Analytics is optional, skip it).
2. **Firestore Database** → Create database → start in **production mode** → pick a region close to you.
3. **Authentication** → Get started → enable the **Email/Password** provider.
4. **Authentication → Users** → Add user → create the one account you'll sign in with as admin. Remember the email/password.
5. **Project settings (gear icon) → General → Your apps** → click the `</>` (web) icon → register an app (no hosting needed) → copy the `firebaseConfig` values.
6. **Project settings → Service accounts** → Generate new private key → downloads a JSON file. You'll need three fields from it: `project_id`, `client_email`, `private_key`.

## 2. Create a Cloudinary account

1. Sign up at [cloudinary.com](https://cloudinary.com) (the free tier is plenty to start).
2. On the dashboard home page, copy your **Cloud Name**, **API Key**, and **API Secret**.

## 3. Fill in your environment variables

Copy `.env.example` to `.env.local` and fill in the values from steps 1–2:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_FIREBASE_*` → from the web app config (step 1.5).
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` → from the service account JSON (step 1.6). Paste the private key exactly as it appears in the JSON file, including the `\n` characters and surrounding quotes.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` → from step 2.

Restart `npm run dev` after saving — the app automatically switches from local placeholder data to your real Firebase/Cloudinary project once these are set.

## 4. Deploy the Firestore security rules

In the Firebase console, go to **Firestore Database → Rules**, and paste the contents of [`firestore.rules`](firestore.rules) from this repo, then Publish. (If you'd rather use the CLI: `npx firebase-tools deploy --only firestore:rules`, after `npx firebase-tools login` and `npx firebase-tools init` pointed at this project.)

## 5. Grant yourself the admin claim

The rules only allow writes from the account carrying an `admin: true` custom claim. Run this once, locally, against your real project:

```bash
npm run set-admin-claim -- you@example.com
```

Use the same email you created in step 1.4. Sign out and back in on the site afterward if you were already signed in.

## 6. Seed some starter content (optional)

The same sample world/civilization/event/location used in local dev-store mode can be pushed to your real Firestore so the live site isn't empty on first deploy:

```bash
npm run seed
```

Everything it creates is editable/deletable from the admin panel afterward.

## 7. Try it locally

```bash
npm run dev
```

Visit `/login`, sign in with the account from step 1.4, and you'll land in `/admin`. Upload a heightmap and your hand-drawn map under **World Settings**, then add locations, civilizations, and events.

## 8. Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket) and import it into [Vercel](https://vercel.com/new).
2. In the Vercel project's **Settings → Environment Variables**, add every variable from `.env.local`.
3. Before you push a version the public should see, set `EDITABLE = false` in [`config/site.config.ts`](config/site.config.ts) and commit. Vercel will deploy a build where `/admin` and `/login` 404 and no edit UI ships to the client bundle.
4. For your own ongoing editing, either run `npm run dev` locally with `EDITABLE = true`, or keep a second, unlisted Vercel deployment (e.g. a `dev`/`admin` branch) with `EDITABLE = true` — either way, sign-in is still required to write data, since that's enforced by Firestore rules, not by the flag.

## Notes

- Reads are public; only the signed-in admin account can write, upload, or delete — enforced by `firestore.rules` and the signed-upload check in `app/api/cloudinary/sign`.
- `firebase-admin` (used for fast, cached public reads) is a completely separate credential from the browser's Firebase Auth sign-in — keep `FIREBASE_PRIVATE_KEY` out of version control (`.env.local` is already gitignored).
- If you ever want to roll back to local placeholder data, just remove the Firebase env vars — nothing else changes.
