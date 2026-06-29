# CricGoal 🏏 ⚽

**Live Cricket & Football scores, news, and standings — 100% free.**

Built with Next.js 14 + free ESPN unofficial API. No API key needed.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy Free on Vercel

```bash
npm i -g vercel
vercel
```
Or push to GitHub → connect at vercel.com → auto-deploys on every push.

## Project Structure

```
cricgoal/
├── app/
│   ├── layout.js               # CricGoal metadata + SEO
│   ├── page.js                 # Home - cricket/football switcher
│   ├── globals.css             # Green brand theme
│   └── api/
│       ├── scores/route.js     # Live scores proxy
│       ├── news/route.js       # News proxy
│       └── standings/route.js  # Standings proxy
├── components/
│   ├── TopBar.jsx              # Logo + sport toggle + league tabs
│   ├── ScoresBar.jsx           # Live match scores strip
│   ├── NewsFeed.jsx            # Hero cards + article list
│   └── Sidebar.jsx             # Table + trending
└── lib/
    └── espn.js                 # ESPN API helpers
```

## Sports Covered

| Sport | Leagues |
|-------|---------|
| 🏏 Cricket | IPL, ICC, Test, ODI, T20I |
| ⚽ Football | Premier League, La Liga, Serie A, Bundesliga, MLS |

## Phase 2 Roadmap

- [ ] Match detail pages `/match/[id]`
- [ ] Team pages `/team/[id]`
- [ ] Player profiles `/player/[id]`
- [ ] User accounts (Supabase)
- [ ] Favourite teams & score alerts
- [ ] PWA + push notifications
