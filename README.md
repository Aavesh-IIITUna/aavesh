# AAVESH // IIIT UNA — Minimalist Landing (MERN)

Stitch project `Aavesh IIITU Minimalist Landing Page` (`14909530980569592317`), screen
`Aavesh IIIT Una — Landing Page` (`89a07830e5134562afbd7a1781164c52`), re-implemented as a clean MERN stack.

- Raw Stitch export: `stitch/89a07830e5134562afbd7a1781164c52/screen.html` + `screenshot.png`
- Frontend: `client/` — React 18 + Vite + Tailwind (Stitch design tokens ported to `tailwind.config.js`)
- Backend: `server/` — Express 4 + Mongoose API powering society profile, tracks, projects, members, contact inbox

## Quickstart

```bash
npm install
cp server/.env.example server/.env   # adjust MONGO_URI if needed
cp client/.env.example client/.env   # VITE_API_URL=http://localhost:5000/api
npm run dev                          # runs API :5000 + Vite :5173 concurrently
```

Seed MongoDB with landing content:

```bash
npm run seed --workspace server
```

Build / production:

```bash
npm run build
npm start --workspace server
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | liveness probe |
| GET | `/api/society` | society profile (hero/footer content) |
| GET | `/api/society/tracks` | focus tracks |
| GET | `/api/projects` | initiatives (`?status=&track=`) |
| GET | `/api/members` | active registry |
| POST | `/api/contact` | contact uplink `{name,email,subject,message}` |
| GET | `/api/contact` | recent inbox (dev triage, capped at 50) |

The React app degrades gracefully: if `/api` is unreachable it renders the Stitch copy from
`client/src/data/content.js` and shows `[UPLINK: OFFLINE]`.

## Structure

```
client/src/
  App.jsx                 # page composition + live/offline banner
  components/Header.jsx   # sticky TopNavBar from Stitch
  components/Hero.jsx      # AAVESH display type, telemetry panel, CTAs, diagnostics
  components/Sections.jsx  # #research #hardware #registry #contact
  components/Footer.jsx    # dossier footer + live UTC/IST clocks
  hooks/useSociety.js      # API fetch with fallback
  hooks/useClocks.js       # 1s clock telemetry
  data/content.js          # Stitch-verbatim fallback copy
  lib/api.js               # fetch wrapper (VITE_API_URL)
server/src/
  app.js / index.js        # helmet, cors, morgan, rate-limit, routes
  config/                  # env + mongoose connect
  models/                  # Society, Project, Member, ContactMessage
  controllers/ + routes/   # /api/*
  scripts/seed.js           # landing content seed
```
