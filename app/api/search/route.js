import { searchPlayers } from '../../../lib/cricapi'

const ESPN_SEARCH = 'https://site.api.espn.com/apis/common/v3/search'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const sport = searchParams.get('sport') || ''

  if (!query.trim()) return Response.json({ results: [] })

  const isCricket = sport === 'cricket'

  // ── Cricket search via CricAPI ────────────────────────────────────────────
  if (isCricket) {
    try {
      const players = await searchPlayers(query)
      const results = players.slice(0, 8).map(p => ({
        id:     p?.id         || '',
        name:   p?.name       || '',
        type:   'athlete',
        sport:  'cricket',
        league: 'cricket/ipl',
        logo:   p?.playerImg  || '',
      }))
      return Response.json({ results })
    } catch {
      return Response.json({ results: [] })
    }
  }

  // ── Football search via ESPN ──────────────────────────────────────────────
  try {
    const res = await fetch(
      `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=15&mode=prefix`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    const results = (data?.items || [])
      .filter(item => {
        const uid = (item?.uid || '').toLowerCase()
        return uid.includes('soccer') || uid.includes('football')
      })
      .slice(0, 8)
      .map(item => ({
        id:     item?.id     || '',
        name:   item?.displayName || item?.name || '',
        type:   item?.type   || 'team',
        sport:  'soccer',
        league: 'soccer/eng.1',
        logo:   item?.images?.[0]?.url || '',
      }))
    return Response.json({ results })
  } catch {
    return Response.json({ results: [] })
  }
}