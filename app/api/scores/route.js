// Uses ESPN's unified API for BOTH cricket and football.
// Cricket slugs: cricket/ipl, cricket/icc-cricket-world-cup, cricket/international-test, etc.
// Football slugs: soccer/eng.1, soccer/esp.1, etc.
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

// Fallback league if the primary one has no live matches (e.g. IPL off-season)
const CRICKET_FALLBACK = [
  'cricket/international-t20',
  'cricket/international-odi',
  'cricket/international-test',
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // ── Cricket ───────────────────────────────────────────────────────────────
  if (sport.startsWith('cricket')) {
    try {
      // Primary: requested league
      const res  = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 30 } })
      const data = await res.json()
      const events = data?.events || []

      // Fallback: if no matches in primary league, try international formats
      if (events.length === 0) {
        for (const fallback of CRICKET_FALLBACK) {
          if (fallback === sport) continue
          try {
            const fb   = await fetch(`${ESPN}/${fallback}/scoreboard`, { next: { revalidate: 30 } })
            const fbData = await fb.json()
            const fbEvents = fbData?.events || []
            if (fbEvents.length > 0) return Response.json(fbEvents.slice(0, 10))
          } catch { continue }
        }
      }

      return Response.json(events.slice(0, 10))
    } catch (e) {
      return Response.json([])
    }
  }

  // ── Football ──────────────────────────────────────────────────────────────
  try {
    const res  = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data.events || [])
  } catch (e) {
    return Response.json([])
  }
}