const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'cricket/ipl'
  const url = `${ESPN}/${sport}/scoreboard`

  try {
    const res = await fetch(url, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data.events || [])
  } catch (e) {
    return Response.json([])
  }
}
