const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

async function getSchedule(sport, id) {
  // Try current season first, then fall back to all seasons
  const urls = [
    `${ESPN}/${sport}/teams/${id}/schedule`,
    `${ESPN}/${sport}/teams/${id}/schedule?season=2025`,
    `${ESPN}/${sport}/teams/${id}/schedule?season=2024`,
  ]
  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate: 1800 } })
      if (!res.ok) continue
      const data = await res.json()
      const events = data?.events || data?.team?.events || []
      if (events.length > 0) return events
    } catch { continue }
  }
  return []
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id    = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing team id' }, { status: 400 })

  try {
    const [teamRes, rosterRes] = await Promise.all([
      fetch(`${ESPN}/${sport}/teams/${id}`,               { next: { revalidate: 3600 } }),
      fetch(`${ESPN}/${sport}/teams/${id}?enable=roster`, { next: { revalidate: 3600 } }),
    ])

    const teamData   = await teamRes.json()
    const rosterData = await rosterRes.json().catch(() => ({}))
    const schedule   = await getSchedule(sport, id)

    const athletes =
      rosterData?.team?.athletes?.flatMap(g => g?.items || []) ||
      rosterData?.team?.athletes ||
      []

    return Response.json({
      team:     { ...(teamData?.team || {}), athletes },
      schedule,
    })
  } catch (e) {
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}