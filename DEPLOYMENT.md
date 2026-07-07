# Deploying CAT Prep Tracker

Three pieces to deploy: database (MongoDB Atlas — you likely already have this),
backend (Render), frontend (Vercel). All have free tiers sufficient to launch.

## 0. Push to GitHub

**First, generate the frontend lockfile locally** (it doesn't exist yet since this was
built without network access): run `npm install` in `frontend/` once — this creates
`frontend/package-lock.json`, which should be committed. Locked versions mean Render
and Vercel install exactly what you tested, not whatever's newest on the day they build.

If this isn't already a GitHub repo:

```bash
cd cat_track
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

Double-check `.gitignore` excludes `node_modules/`, `.env`, and `dist/` before pushing —
this project's `.gitignore` already does, but confirm `backend/.env` never got committed
in an earlier commit. If it did: rotate your `JWT_SECRET` and Atlas password immediately,
then remove it from history (`git filter-repo` or BFG Repo-Cleaner) before making the
repo public.

## 1. Database — MongoDB Atlas

If you don't already have a cluster:
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → free M0 cluster
2. **Database Access** → create a user with a strong password
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) — Render's IPs aren't
   static on the free tier, so this is the practical option; Atlas auth still protects you
4. **Connect** → copy the connection string, this is your `MONGO_URI`

## 2. Backend — Render

1. [render.com](https://render.com) → New → Web Service → connect your GitHub repo
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. **Environment variables** (Render dashboard → Environment):
   - `MONGO_URI` — from step 1
   - `JWT_SECRET` — any long random string (e.g. generate with `openssl rand -hex 32`)
   - `FRONTEND_URL` — leave blank for now, you'll fill this in after step 3
6. Deploy. Note the URL Render gives you, e.g. `https://cat-tracker-api.onrender.com`

> Free tier spins down after ~15 minutes of inactivity — the first request after that
> takes a few extra seconds to wake up. Fine for early users; upgrade to a paid instance
> ($7/mo) once that matters.

## 3. Frontend — Vercel

1. [vercel.com](https://vercel.com) → New Project → import the same GitHub repo
2. **Root directory:** `frontend`
3. Framework preset: Vite (should auto-detect)
4. **Environment variables:**
   - `VITE_API_URL` — `https://cat-tracker-api.onrender.com/api` (your Render URL + `/api`)
5. Deploy. Note the URL Vercel gives you, e.g. `https://cat-tracker.vercel.app`

## 4. Close the loop — lock down CORS

Go back to Render → Environment → set:
- `FRONTEND_URL` = `https://cat-tracker.vercel.app` (your actual Vercel URL, no trailing slash)

Redeploy the backend (Render redeploys automatically on env var changes, or trigger
manually). This restricts the API to only accept requests from your deployed frontend
instead of any origin.

## 5. Verify

- Visit your Vercel URL, sign up, log in, log a session, add a mock test
- Check Render's logs if anything 500s — `console.error` in the error handler will show
  the real error there
- If login/signup calls fail with a CORS error in the browser console, double-check
  `FRONTEND_URL` on Render exactly matches your Vercel URL (protocol, no trailing slash)

## Ongoing

- Every `git push` to `main` auto-redeploys both Render and Vercel
- Custom domain: both Render and Vercel support adding one for free (you just pay for
  the domain itself, e.g. via Namecheap/Google Domains)
- Watch Atlas's free-tier storage limit (512MB) as your user base grows — that's plenty
  for thousands of users' session/mock-test/topic records given how small each document is
