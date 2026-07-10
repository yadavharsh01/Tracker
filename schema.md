cat_track/
│
├── frontend/                    (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── lib/
│       │   └── api.js              Axios client + auth interceptor
│       ├── context/
│       │   ├── AuthContext.jsx     token/user state, login/signup/logout
│       │   ├── ThemeContext.jsx    dark/light mode, persisted
│       │   └── ToastContext.jsx    toast notifications (replaces alert())
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   └── AdmitCardStat.jsx   signature stat component
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   └── dashboard/
│       │       ├── SessionForm.jsx
│       │       ├── PomodoroTimer.jsx
│       │       ├── StudyChart.jsx
│       │       └── Heatmap.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx
│           └── NotFound.jsx
│
├── backend/
│   ├── server.js                 Express app, error/404 handlers
│   ├── config/
│   │   └── db.js                 Mongoose connection
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js               signup/login (validated, JWT w/ expiry)
│   │   ├── sessions.js           add session, get stats (validated)
│   │   └── user.js               profile
│   └── middleware/
│       └── authMiddleware.js     JWT verify, Bearer + legacy header support
│
├── package.json
├── README.md
└── .env                          (gitignored, not committed)

## Stage 4 additions

backend/
├── models/
│   ├── MockTest.js       sections: { VARC, DILR, QA } each with questionsAttempted,
│   │                     correct, timeTaken, score. Accuracy is derived, not stored.
│   └── Goal.js           one doc per userId+period (daily/weekly/monthly), upserted
├── routes/
│   ├── mockTests.js       CRUD + /analysis (trend, weakest/strongest section)
│   └── goals.js           set target, get progress (computed live from Session data)

frontend/src/
├── components/mocktests/  MockTestForm, MockTestList
├── components/dashboard/  ExamCountdown, GoalsWidget (added to Dashboard.jsx)
├── components/ui/         ConfirmDialog (used for mock test delete confirmation)
└── pages/MockTests.jsx    registered at /mock-tests in App.jsx

## Topic tracker / planner additions

backend/
├── models/Topic.js        userId, section (QA/VARC/DILR), name, mastery
└── routes/topics.js       seed (idempotent default topics), CRUD, mastery update

frontend/src/
├── components/planner/    MasteryChip, TopicSection, AddTopicForm
└── pages/Planner.jsx      registered at /planner, in Sidebar + MobileNav

## Round 3 additions — remaining engagement features

backend/
├── models/User.js          + targetPercentile
├── models/Topic.js         + lastRevisedAt
├── routes/user.js          + PUT /target-percentile
├── routes/sessions.js      + GET / (raw session list, ?range=week|month)
└── routes/topics.js        + GET /due, PUT /:id/revise; mastery update also stamps lastRevisedAt

frontend/src/
├── components/dashboard/
│   ├── StreakRiskBanner.jsx     shows when today's session hasn't been logged
│   ├── SessionHistory.jsx       week/month/all-time session list
│   └── ShareCard.jsx            Canvas-rendered downloadable PNG (no new deps)
├── components/mocktests/PercentileTarget.jsx   target vs latest mock percentile
└── components/planner/RevisionDue.jsx           topics overdue for revision (14-day interval)

Skipped this round (by user's choice): AI weak-area coach — needs an LLM API key,
can be added later.

## Round 4 — calendar planner view

frontend/src/components/planner/MonthCalendar.jsx
  Month grid calendar (7 cols, prev/next nav), color intensity per day based on
  minutes studied that day. Reuses the existing /api/sessions/stats endpoint
  (no new backend route needed) — same data source as the Dashboard's bar chart
  and heatmap, just re-rendered as a calendar-aligned grid.

Planner.jsx renamed from "Topic tracker" to "Planner" (nav labels updated in
Sidebar + MobileNav too) since it now covers: calendar, revision due, and topics.

## Round 5 — AI weak-area coach

backend/routes/insights.js
  GET / — gathers section accuracy (from MockTest), unmastered topics (from Topic),
  streak + exam countdown (from User), builds a prompt, calls Google AI Studio's
  Gemini API (model configurable via GEMINI_MODEL, default gemini-2.0-flash).
  Requires GEMINI_API_KEY in .env — returns a clear 503 message if unset rather
  than a generic error. Includes a 60s per-user in-memory cooldown to prevent
  accidental repeated billed calls.

frontend/src/components/dashboard/AICoach.jsx
  On-demand "Get advice" button on the dashboard. No auto-fetch on page load —
  this one costs money per call, so it only runs when the user explicitly asks.

## Round 6 — sectional scores (separate from full mock tests)

backend/
├── models/SectionalTest.js   userId, section (VARC/DILR/QA), testName, date,
│                              questionsAttempted, correct, timeTaken, score
└── routes/sectionalTests.js  CRUD (?section= filter on list) + /analysis
                               (per-section trend, best score, overall accuracy)

frontend/src/
├── components/sectionaltests/
│   ├── SectionalTestForm.jsx   single-section entry (not 3 sections like mock tests)
│   ├── SectionalTestList.jsx
│   └── SectionTrendChart.jsx   score + accuracy trend for the active section tab
└── pages/SectionalTests.jsx    registered at /sectional-tests, tabbed by section

Nav updated in Sidebar + MobileNav (mobile bar now holds 6 items — labels shortened
to fit: "Home" instead of "Dashboard", "Sections" instead of "Sectional scores").

## Round 7 — account gaps, WAT-PI tracker, quality-of-life (huge batch)

### Account / auth
backend/routes/auth.js    + forgot-password, reset-password, change-password
                           (crypto-based reset tokens, hashed before storage;
                           email optional via nodemailer, degrades to console
                           log + UI display in dev if SMTP unset)
backend/routes/user.js    + PUT /profile, DELETE /account (password-confirmed,
                           cascades to Session/MockTest/SectionalTest/Topic/
                           Goal/CollegeTarget), GET /export (full JSON dump)
backend/models/User.js    + resetPasswordTokenHash, resetPasswordExpires

frontend/src/pages/
  ForgotPassword.jsx, ResetPassword.jsx, Settings.jsx (profile/password/
  export/danger-zone sections)

### WAT-PI tracker / college shortlist
backend/models/CollegeTarget.js   collegeName, status (6-state), cutoffPercentile,
                                    watPiDate, notes
backend/routes/collegeTargets.js  CRUD
frontend/src/
  components/colleges/  CollegeForm, CollegeCard (status badges, WAT-PI countdown)
  pages/Colleges.jsx    registered at /colleges

### Quality of life
- MockTest.notes field (reflection/what-went-wrong), form + list updated
- Onboarding modal (components/dashboard/OnboardingModal.jsx) — shown once on
  first dashboard visit if examDate+targetPercentile both unset, dismissible,
  tracked via localStorage so it never nags twice

### Navigation restructure
MobileNav now has 4 primary tabs (Home/Mocks/Sections/Planner) + a "More" bottom
sheet (Colleges, Settings, theme, logout) instead of cramming 8 items into one bar.
Sidebar gained Colleges (main nav) and Settings (bottom, near theme/logout).

### Real bug found and fixed: silent error logging
Audited every route file — 34 catch blocks across 8 files (`user.js`, `badges.js`,
`collegeTargets.js`, `goals.js`, `mockTests.js`, `sectionalTests.js`, `sessions.js`,
`topics.js`) caught errors but never logged them, meaning production failures would
be completely silent server-side. Fixed with a scripted pass adding console.error(err)
to every catch block missing it.

## Round 8 — SMTP hardening + admin system

### SMTP (breaking change from Round 7)
backend/routes/auth.js
  - Removed devResetUrl from response entirely — reset link is emailed only,
    never returned to the client or shown in the UI.
  - SMTP config is checked BEFORE any DB lookup, so the response is identical
    (503) regardless of whether the requested email exists — the earlier
    dev-mode version would have leaked registration status once devResetUrl
    was removed naively (existing emails → different code path than
    nonexistent ones). Fixed by gating on SMTP config upfront.
frontend/src/pages/ForgotPassword.jsx — removed dev-link display UI entirely.

### Admin system
backend/models/User.js         + isAdmin (bool, default false)
backend/models/LoginEvent.js   userId, timestamp, ipAddress, userAgent
backend/middleware/adminMiddleware.js
  Chains after auth; re-checks isAdmin from DB on every request (not from JWT)
  so revoking access takes effect immediately, not after token expiry.
backend/routes/admin.js
  GET /users            — summary list (stats + last login per user, no N+1:
                           login lookup done via one aggregation)
  GET /users/:id        — full per-user detail: profile + session/mock/
                           sectional/topic/goal counts + dailyMinutes (same
                           shape as /sessions/stats, for charting) + last 20 logins
  GET /users/:id/logins — that user's login history (last 100)
  GET /logins           — global login feed across all users (last 200)

Bootstrap mechanism: ADMIN_EMAILS env var (comma-separated). On login, if the
user's email matches, isAdmin is set true automatically — no admin UI needed
to create the first admin account. Login route also now records every
successful login to LoginEvent (fire-and-forget, never blocks the login itself
if the write fails).

frontend/src/
  components/layout/AdminRoute.jsx   like ProtectedRoute, but also fetches
                                       profile and checks isAdmin, redirecting
                                       non-admins to /dashboard
  pages/AdminUsers.jsx                user list, click through to detail
  pages/AdminUserDetail.jsx           reuses AdmitCardStat + StudyChart (same
                                       components the user's own dashboard
                                       uses) for a genuinely "dashboard-style"
                                       read-only view, not a bare data table
Sidebar + MobileNav: both fetch isAdmin via getProfile() on mount and
conditionally show an "Admin" link (desktop: above Settings; mobile: inside
the "More" sheet, not the primary tab bar).

## Round 9 — OTP login (email or phone)

backend/models/User.js   + phone (unique, sparse), otpHash, otpExpires, otpRequestedAt
backend/routes/auth.js
  POST /otp/request  — accepts an email OR phone, auto-detects which (regex),
                        checks the relevant channel is configured BEFORE any DB
                        lookup (same leak-prevention pattern as forgot-password),
                        60s cooldown per user, 6-digit code hashed (sha256) before
                        storage, 10-min expiry. Code is only ever sent via the
                        channel — never returned in the response.
  POST /otp/verify   — consumes the code, issues the same JWT + records the same
                        LoginEvent as password login, including the ADMIN_EMAILS
                        auto-grant check.
  sendOtpEmail()     — via existing SMTP config (nodemailer)
  sendOtpSms()       — via Twilio's REST API using raw fetch (no SDK dependency,
                        consistent with how the Gemini integration was built)
backend/routes/user.js   PUT /profile now also accepts phone (validated,
                          uniqueness-checked, same pattern as email)

frontend/src/
  pages/OtpLogin.jsx   two-step form: identifier -> 6-digit code -> logged in
  context/AuthContext.jsx  + loginWithOtp()
  pages/Login.jsx      + "Log in with a code instead" button
  pages/Settings.jsx   ProfileSection now includes an optional phone field

Live-tested: both otp/request paths (email unconfigured, phone unconfigured)
correctly 503 before touching the DB; invalid/missing identifier correctly 400;
otp/verify correctly reaches the DB layer (confirmed via the same Mongo-buffering-
timeout signature seen throughout — sandbox has no Mongo connection, not a bug).

## Round 10 — push notifications + leaderboard (final two items from the original roadmap)

### Push notifications
backend/models/PushSubscription.js   userId, endpoint (unique), keys {p256dh, auth}
backend/lib/push.js                  sendPushToUser(), isPushConfigured() — lazy-
                                       requires web-push only inside functions, so
                                       the whole server still boots fine even if
                                       web-push isn't installed yet (verified: ran
                                       the scheduler start-up path directly, no crash)
backend/lib/streakReminder.js        in-process hourly-check/once-daily-fire
                                       scheduler; sends a push at 8 PM server time
                                       to any user with streak > 0 who hasn't
                                       studied today. No-ops entirely if push isn't
                                       configured.
backend/routes/push.js               GET /public-key, POST /subscribe,
                                       POST /unsubscribe, POST /test
frontend/public/sw.js                service worker: push + notificationclick handlers
frontend/src/
  main.jsx                            registers the service worker on load
  components/settings/PushNotifications.jsx   enable/disable/test UI, handles the
                                       full browser Push API subscribe flow
                                       (permission request, VAPID key conversion,
                                       PushManager.subscribe)

### Leaderboard
backend/models/User.js         + leaderboardOptIn (bool, default false)
backend/routes/leaderboard.js  GET / — opted-in users only, ranked by streak then
                                 totalHours, explicitly excludes email/any PII
backend/routes/user.js         + PUT /leaderboard-opt-in
frontend/src/
  components/settings/LeaderboardOptIn.jsx   toggle
  pages/Leaderboard.jsx                       ranked list, medal icons top 3,
                                                current user's row highlighted

Scope note: this is a global opt-in leaderboard, not a friends-only system (no
friend requests/connections). A true friends graph would be a larger addition
if wanted later.

Both new npm dependencies (web-push) added to package.json but not installed
in this sandbox (no network) — confirmed the app degrades gracefully without
it via direct testing of the scheduler startup path.

Live-tested: every route in the entire application re-swept one more time with
correct HTTP methods per route (the first pass had a test bug — POSTing to
GET-only routes — which was caught and corrected, not a real bug). All 63
frontend files re-validated for structural correctness.
