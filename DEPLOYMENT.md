# Deploying CAT Prep Tracker

Three pieces to deploy: database (MongoDB Atlas), backend (Render), frontend (Vercel).
All have free tiers sufficient to launch.

## 0. Get dependencies current, then push to GitHub

**Backend:** two security dependencies (`helmet`, `express-rate-limit`) were added to
`backend/package.json` but not yet installed locally. Run `npm install` in `backend/`
once to pull them in before your next local run or push.

**Frontend:** if you haven't already, run `npm install` in `frontend/` — this creates
`frontend/package-lock.json`, which should be committed. Locked versions mean Render
and Vercel install exactly what you tested, not whatever's newest on the day they build.

If this isn't already a GitHub repo (check with `git status` inside `cat_track/` — it
likely already is, with a couple of commits):

```bash
cd cat_track
git add -A
git commit -m "Pre-deploy: security middleware, latest features"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

Double-check `.gitignore` excludes `node_modules/`, `.env`, and `dist/` before pushing —
this project's `.gitignore` already does, but confirm `backend/.env` never got committed
in an earlier commit (`git log --all --full-history -- backend/.env` should show nothing).
If it did: rotate your `JWT_SECRET` and Atlas password immediately, then remove it from
history (`git filter-repo` or BFG Repo-Cleaner) before making the repo public.

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
   - `NODE_ENV` — `production` (hides internal error details from API responses)
   - `FRONTEND_URL` — leave blank for now, you'll fill this in after step 3
   - `GEMINI_API_KEY` — optional, only if you want the AI coach live. Get one free at
     [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Skip it and the
     app works fine without that one feature.
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

## 5. Verify — full click-through checklist

- [ ] Visit your Vercel URL — landing page loads, dark/light toggle works
- [ ] Sign up with a new account
- [ ] Log in
- [ ] Log a study session — dashboard stats update
- [ ] Add a mock test — trend chart and weak/strong section cards populate
- [ ] Visit Planner — calendar shows today, add a topic, cycle its mastery
- [ ] Check a badge unlocks after logging your first session
- [ ] Try the AI coach button (if `GEMINI_API_KEY` is set) — or confirm it shows the
      "not configured" message cleanly (if not set)
- [ ] Open on your phone — bottom nav bar appears, everything's reachable
- [ ] Log out, confirm you're redirected and can't reach `/dashboard` directly

If anything 500s, check Render's logs — with `NODE_ENV=production` set, API responses
won't show the real error, but Render's log output still will.

## Ongoing

- Every `git push` to `main` auto-redeploys both Render and Vercel
- Custom domain: both Render and Vercel support adding one for free (you just pay for
  the domain itself, e.g. via Namecheap/Google Domains)
- Watch Atlas's free-tier storage limit (512MB) as your user base grows — that's plenty
  for thousands of users' session/mock-test/topic records given how small each document is
- Rate limiting is currently in-memory (resets on redeploy/restart) — fine at this
  scale; if you ever run multiple backend instances behind a load balancer, you'd want
  a shared store (e.g. Redis) instead
