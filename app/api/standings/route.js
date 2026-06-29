const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'cricket/ipl'
  const url = `${ESPN}/${sport}/standings`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    return Response.json(data.children || data.standings || [])
  } catch (e) {
    return Response.json([])
  }
}
