// ESPN's unified API — cricket and football athlete endpoints follow identical patterns.
// cricket/ipl/athletes/{id}  or  soccer/eng.1/athletes/{id}
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id    = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing player id' }, { status: 400 })

  try {
    const [overviewRes, statsRes] = await Promise.all([
      fetch(`${ESPN}/${sport}/athletes/${id}`,        { next: { revalidate: 3600 } }),
      fetch(`${ESPN}/${sport}/athletes/${id}/stats`,  { next: { revalidate: 1800 } }).catch(() => null),
    ])

    const overviewData = await overviewRes.json()
    const statsData    = statsRes ? await statsRes.json().catch(() => null) : null

    return Response.json({
      athlete: overviewData?.athlete || null,
      stats:   statsData            || null,
    })
  } catch (e) {
    return Response.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}