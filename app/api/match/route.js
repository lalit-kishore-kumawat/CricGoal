const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id    = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing event id' }, { status: 400 })

  try {
    const res  = await fetch(`${ESPN}/${sport}/summary?event=${id}`, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}