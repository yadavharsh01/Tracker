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
| Section tracking (QA/VARC/DILR) | ✅ |
| Topic tracker with mastery levels | ✅ |
| Daily/weekly/monthly study goals | ✅ |
| Analytics: study chart, heatmap, score trend, time-by-subject | ✅ |
| Focus/Pomodoro timer | ✅ |
| Dark/light mode | ✅ |
| Mobile/tablet/desktop responsive | ✅ (incl. dedicated mobile nav) |
| Toasts, loading skeletons, empty states, form validation | ✅ |
| Daily/weekly/monthly *planner calendar views* | Partial — session history gives a week/month log; a true calendar grid view is a reasonable future addition |
| Achievement badges / milestones | ✅ 10 badges, computed live from existing data (streak, hours, mocks, mastered topics, level) |
| Streak-risk reminder | ✅ Dashboard banner when today's session isn't logged yet |
| Shareable progress card | ✅ Canvas-rendered downloadable PNG, no external dependency |
| Percentile target tracker | ✅ Set a target, see live gap vs. latest mock percentile |
| Session history / planner view | ✅ Week/month/all-time session log on the dashboard |
| Revision planner | ✅ Topics flagged "due" after 14 days unrevised, one-tap "mark revised" |
| AI weak-area coach | Not built — needs your own LLM API key, skipped by choice; can be added anytime |

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
