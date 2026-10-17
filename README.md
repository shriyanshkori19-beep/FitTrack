# FitTrack — Personal Fitness & Recovery Tracker

A full-stack **MERN** app for logging workouts, sleep and nutrition, then turning them into a daily **recovery score** that tells you whether to push or rest.

## Features

- **Workout logging** with exercises and sets; total volume is calculated automatically (sets × reps × weight)
- **Recovery-scoring algorithm** combining sleep hours, rest days and recent workout intensity into a 0–100 score with a daily status (Ready / Moderate / Rest)
- **Streaks and weekly goals** with a Mon–Sun tracker and a 28-day attendance grid
- **Progress dashboard** built with Recharts: training volume, sleep trends, attendance
- **Sleep and nutrition tracking** (calories, protein, carbs, fat with daily totals)
- **JWT authentication** with bcrypt password hashing; every record is scoped to its user
- MongoDB schemas designed for time-series style queries (compound `user + date` indexes)

## Tech stack

React 18 (Vite) · React Router · Recharts · Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs

## Getting started

**Prerequisites:** Node.js 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Install everything (root, server, client)
npm run install-all

# 2. Configure the server
cp server/.env.example server/.env
#    then edit server/.env: set MONGO_URI and a long random JWT_SECRET

# 3. Run API (http://localhost:5000) and client (http://localhost:5173) together
npm run dev
```

Open http://localhost:5173, create an account, and start logging.

## Project structure

```
fittrack/
├── server/
│   ├── server.js            # Express app entry
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/auth.js   # JWT guard
│   ├── models/              # User, Workout, Sleep, Nutrition
│   ├── routes/              # auth, workouts, sleep, nutrition, dashboard
│   └── utils/
│       ├── recovery.js      # recovery-scoring algorithm
│       └── dates.js         # timezone-safe date helpers
└── client/
    └── src/
        ├── pages/           # Login, Dashboard, Workouts, Sleep, Nutrition
        ├── components/      # Layout, RecoveryGauge
        ├── AuthContext.jsx  # auth state
        └── api.js           # fetch wrapper
```

## How the recovery score works

| Signal | Points | Rule |
| --- | --- | --- |
| Sleep | 50 | last night's hours ÷ your sleep goal (capped at 100%) |
| Rest days | 20 | days off in the previous 3 days |
| Recent load | 30 | lower average workout intensity (1–10) over the previous 3 days scores higher |

Score ≥ 75 → **Ready**, 50–74 → **Moderate**, below 50 → **Rest**. If sleep hasn't been logged yet, the sleep portion uses a neutral 25 points.

## API overview

All routes except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Sign up / log in |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/goals` | Update weekly and sleep goals |
| GET / POST / DELETE | `/api/workouts` | List, create, delete workouts |
| GET / POST / DELETE | `/api/sleep` | Sleep entries (one per day, upsert) |
| GET / POST / DELETE | `/api/nutrition` | Meals (`?date=YYYY-MM-DD`) |
| GET | `/api/dashboard?today=YYYY-MM-DD` | Recovery, streak, weekly progress, chart data |

## Deploying

- Build the client with `npm run build` (output in `client/dist`) and host it on Vercel or Netlify with `VITE_API_URL` set to your API URL + `/api`.
- Host the server on Render or Railway; set `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` as environment variables.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: FitTrack MERN app"
git branch -M main
git remote add origin https://github.com/<your-username>/fittrack.git
git push -u origin main
```

`.gitignore` already excludes `node_modules` and `.env`, so your secrets stay private.
