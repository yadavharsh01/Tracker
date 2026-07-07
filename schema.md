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
