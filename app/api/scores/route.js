import { getCurrentMatches, mapMatchToEvent } from '../../../lib/cricapi'

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

// Filter functions — which CricAPI matches belong to which league tab
const LEAGUE_FILTERS = {
  'cricket/ipl':                   m => m.matchType === 't20' && /ipl/i.test(m.name),
  'cricket/icc-cricket-world-cup': m => /world.?cup/i.test(m.name),
  'cricket/international-test':    m => m.matchType === 'test',
  'cricket/international-odi':     m => m.matchType === 'odi',
  'cricket/international-t20':     m => m.matchType === 't20',
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // ── Cricket via CricAPI ───────────────────────────────────────────────────
  if (sport.startsWith('cricket')) {
    try {
      const allMatches = await getCurrentMatches()
      const filter     = LEAGUE_FILTERS[sport]

      // Try the specific league filter first
      let matches = filter ? allMatches.filter(filter) : allMatches

      // If no matches for this specific league, fall back to ALL cricket matches
      // so the scores bar is never completely empty (e.g. IPL off-season)
      if (matches.length === 0) {
        matches = allMatches
      }

      return Response.json(matches.slice(0, 10).map(mapMatchToEvent))
    } catch {
      return Response.json([])
    }
  }

  // ── Football via ESPN ─────────────────────────────────────────────────────
  try {
    const res  = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data.events || [])
  } catch {
    return Response.json([])
  }
}