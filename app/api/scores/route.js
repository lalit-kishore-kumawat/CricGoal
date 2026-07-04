const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO = 'https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // Cricket uses a completely different ESPN API (Cricinfo)
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO, { next: { revalidate: 60 } })
      const data = await res.json()
      const matches = data?.content?.matches || []
      return Response.json(matches)
    } catch (e) {
      return Response.json([])
    }
  }

  // Football uses standard ESPN API
  try {
    const res = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data.events || [])
  } catch (e) {
    return Response.json([])
  }
}