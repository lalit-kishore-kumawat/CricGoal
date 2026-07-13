// ESPN's unified API — cricket and football both live here.
// cricket/ipl → ESPN/cricket/ipl/standings
// soccer/eng.1 → ESPN/soccer/eng.1/standings
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

const data = await res.json()
return Response.json(data.children || data.standings?.entries || [])

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  try {
    const res  = await fetch(`${ESPN}/${sport}/standings`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return Response.json(data.children || [])
  } catch (e) {
    return Response.json([])
  }
}