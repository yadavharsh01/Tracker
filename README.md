# CAT Prep Tracker

A study tracker for CAT (Common Admission Test) aspirants — log study sessions, keep a
streak, run a focus timer, track mock tests and topic mastery, and see it all charted.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts, lucide-react

## Getting started

### 1. Backend

```bash
cd backend
npm install
# .env needs MONGO_URI and JWT_SECRET (yours already exists locally)
npm run dev
```

Runs on `http://localhost:5000` by default (override with `PORT` in `.env`).

**To enable the AI weak-area coach:** get a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to
`backend/.env` as `GEMINI_API_KEY=...`. Without it, the app works normally — the
coach card just returns a friendly "not configured" message instead of advice.

**Password reset now requires SMTP** — forgot-password returns a clear error until
`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are set in `backend/.env` (see the comments
there for a step-by-step Gmail App Password setup, the easiest free option). The
reset link is only ever emailed — it's never shown in the UI or API response.

**OTP login** ("log in with a code" on the login page) works the same way — the
code is only ever sent to the email/phone, never shown in the app. Email codes
reuse the SMTP config above. Phone codes need Twilio: set `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in `backend/.env` (free trial credits
at twilio.com/try-twilio). Users add their phone number from Settings before
phone-based OTP login will work for their account.

**Push notifications** need a VAPID key pair — generate one locally with
`npx web-push generate-vapid-keys` and add the two keys to `backend/.env` as
`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`. Once set, users can turn on
notifications from Settings and get a push if they haven't logged a study
session by 8 PM (server time) and have an active streak to protect. Without
VAPID keys, the Settings card just shows a clear "not configured" message —
nothing else in the app is affected.

**To make yourself an admin:** add your email to `ADMIN_EMAILS` in `backend/.env`
(comma-separated for multiple admins), then log out and back in — admin access is
granted automatically on your next login. Admins get an "Admin" link in the nav
showing every user's summary stats, a read-only view of any individual user's
dashboard (streak, level, charts, mock/sectional test counts), and login history
per-user or as a global feed.

> Getting `EADDRINUSE: address already in use :::5000`? Something (usually a previous
> run of this same server) is already holding the port.
> **Windows:** `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
> **Mac/Linux:** `lsof -i :5000` then `kill -9 <pid>`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev
```

Runs on `http://localhost:5173` by default.

## Project structure

```
cat_track/
├── backend/
│   ├── server.js               Express app, error/404 handlers
│   ├── config/db.js             Mongoose connection
│   ├── models/
│   │   ├── User.js               profile, streak, XP/level, examDate
│   │   ├── Session.js            study sessions (subject, duration, date)
│   │   ├── MockTest.js           sections: VARC/DILR/QA, each with attempted/correct/time/score
│   │   ├── Goal.js                daily/weekly/monthly minute targets
│   │   └── Topic.js               section, name, mastery (not_started/learning/mastered)
│   ├── routes/
│   │   ├── auth.js               signup/login (validated, JWT w/ 7-day expiry)
│   │   ├── sessions.js           add, stats (by day), by-subject (time utilization)
│   │   ├── user.js               profile, exam-date
│   │   ├── mockTests.js          CRUD + /analysis (trend, weakest/strongest section)
│   │   ├── goals.js              set target, get progress (computed from Session data)
│   │   └── topics.js             seed defaults (idempotent), CRUD, mastery update
│   └── middleware/authMiddleware.js   JWT verify, Bearer + legacy header support
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx, Login.jsx, Signup.jsx, NotFound.jsx
        │   ├── Dashboard.jsx        streak/level/countdown, charts, timer, goals
        │   ├── MockTests.jsx        add/edit/delete, weak/strong section, trend chart
        │   └── Planner.jsx          topic tracker with mastery cycling
        ├── components/
        │   ├── ui/                 Button, Card, Input, Skeleton, AdmitCardStat, ConfirmDialog
        │   ├── layout/             Sidebar, MobileNav, ProtectedRoute, PageTransition
        │   ├── dashboard/          SessionForm, PomodoroTimer, StudyChart, Heatmap,
        │   │                       ExamCountdown, GoalsWidget, TimeUtilizationChart
        │   ├── mocktests/          MockTestForm, MockTestList, ScoreTrendChart
        │   └── planner/            MasteryChip, TopicSection, AddTopicForm
        ├── context/                AuthContext, ThemeContext, ToastContext
        └── lib/api.js               Axios client + auth interceptor
```

## Design system

- **Colors:** ink (dark surfaces), paper (light surfaces), amber (primary accent),
  teal (secondary/data), danger (errors) — defined as CSS variables in `tailwind.config.js`
- **Type:** Space Grotesk (headings), Inter (body/UI), IBM Plex Mono (numerals — percentile,
  timer, XP — so data aligns like a scoreboard)
- **Signature element:** the "admit card" stub (`AdmitCardStat`) — a ticket-shaped component
  used for hero-level stats (streak, level, exam countdown), echoing the actual CAT admit
  card every aspirant is working toward
- **Dark/light mode**, toggle persisted in `localStorage`

## Feature checklist (from the original brief)

| Feature | Status |
|---|---|
| Dashboard (streak, days left, XP/level) | ✅ |
| Mock tests: add/edit/delete, sectional accuracy | ✅ |
| Sectional scores (single-section practice tests) | ✅ Separate tab, VARC/DILR/QA tracked independently with their own trend charts and best-score/accuracy summaries |
| Account settings (change password, update profile) | ✅ |
| Forgot/reset password | ✅ Email-only — SMTP is required (returns a clear error if unconfigured, never shows the link in-app) |
| OTP login (email or phone) | ✅ 6-digit code, 10-min expiry, 60s resend cooldown. Email reuses SMTP config; phone needs Twilio |
| Push notifications | ✅ Real browser push (not just in-app banner) — daily streak-risk reminder + test button in Settings. Needs VAPID keys |
| Friend/social leaderboard | ✅ Opt-in, ranked by streak then hours. Global (not friends-only) — a true friends system would be a bigger future addition |
| Admin panel | ✅ User list, per-user dashboard view (streak/level/charts/mock&sectional counts), login history — auto-granted via `ADMIN_EMAILS` env var |
| Login history tracking | ✅ Every login recorded (timestamp, IP, user agent), visible per-user and as a global feed to admins |
| Delete account | ✅ Password-confirmed, cascades to all owned data (sessions, mocks, sectionals, topics, goals, colleges) |
| Export your data | ✅ One-click JSON download of everything you've logged |
| WAT-PI tracker / college shortlist | ✅ Track target B-schools, status (targeting/shortlisted/WAT-PI scheduled/selected/etc.), WAT-PI countdown, notes |
| Mock test reflection notes | ✅ Free-text "what went wrong" field per mock test |
| Onboarding flow | ✅ First-login modal to set exam date + target percentile (skippable, never re-shown once dismissed) |
| Section tracking (QA/VARC/DILR) | ✅ |
| Topic tracker with mastery levels | ✅ |
| Daily/weekly/monthly study goals | ✅ |
| Analytics: study chart, heatmap, score trend, time-by-subject | ✅ |
| Focus/Pomodoro timer | ✅ |
| Dark/light mode | ✅ |
| Mobile/tablet/desktop responsive | ✅ (incl. dedicated mobile nav) |
| Toasts, loading skeletons, empty states, form validation | ✅ |
| Daily/weekly/monthly *planner calendar views* | ✅ Month calendar grid on the Planner page, color-coded by minutes studied, with prev/next navigation |
| Achievement badges / milestones | ✅ 10 badges, computed live from existing data (streak, hours, mocks, mastered topics, level) |
| Streak-risk reminder | ✅ Dashboard banner when today's session isn't logged yet |
| Shareable progress card | ✅ Canvas-rendered downloadable PNG, no external dependency |
| Percentile target tracker | ✅ Set a target, see live gap vs. latest mock percentile |
| Session history / planner view | ✅ Week/month/all-time session log on the dashboard |
| Revision planner | ✅ Topics flagged "due" after 14 days unrevised, one-tap "mark revised" |
| AI weak-area coach | ✅ Uses Google AI Studio (Gemini). Optional — needs `GEMINI_API_KEY` in `.env`; app works fine without it |

## Known limitations / honest notes

- This was built in a sandbox with **no network access**, so `npm install` for the
  frontend was never run here, and no dev server was ever opened in a browser. The
  backend *was* installable and was run + smoke-tested against every route (all
  respond correctly, all are auth-protected). Every frontend file was manually
  reviewed for syntax correctness and logical wiring, and every route mentioned above
  was verified as reachable from the UI. But please run it and tell me about anything
  that breaks — sandbox review is a good second-best, not a substitute for actually
  running the app.
- Chart.js was replaced with Recharts (matches everything else being a proper npm
  dependency instead of a CDN `<script>` tag).
