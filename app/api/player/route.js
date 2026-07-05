const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_PLAYER = 'https://hs-consumer-api.espncricinfo.com/v1/pages/player/home?playerId='

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing player id' }, { status: 400 })

  // 🏏 Cricket player — ESPNcricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_PLAYER + id, { next: { revalidate: 3600 } })
      const data = await res.json()
      const p = data?.content?.player || {}
      const stats = data?.content?.stats || []

      const athlete = {
        id: p?.objectId || id,
        displayName: p?.name || '',
        fullName: p?.longName || p?.name || '',
        headshot: { href: p?.image || '' },
        position: { displayName: p?.primaryRole || p?.playingRole || '' },
        jersey: '',
        age: p?.dateOfBirth
          ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
          : null,
        displayHeight: p?.height || '',
        displayWeight: p?.weight || '',
        birthPlace: {
          city: p?.birthPlace || '',
          country: p?.country?.name || '',
        },
        team: { displayName: p?.country?.name || '' },
      }

      const formattedStats = stats.length > 0 ? {
        splits: {
          categories: stats.map(cat => ({
            displayName: cat?.heading || 'Stats',
            stats: (cat?.values || []).map(v => ({
              displayName: v?.label || '',
              shortDisplayName: v?.label || '',
              displayValue: String(v?.value ?? '-'),
            })),
          })),
        },
      } : null

      return Response.json({ athlete, stats: formattedStats })
    } catch (e) {
      return Response.json({ error: 'Failed to fetch cricket player' }, { status: 500 })
    }
  }

  // ⚽ Football player — ESPN
  try {
    const [overviewRes, statsRes] = await Promise.all([
      fetch(`${ESPN}/${sport}/athletes/${id}`, { next: { revalidate: 3600 } }),
      fetch(`${ESPN}/${sport}/athletes/${id}/stats`, { next: { revalidate: 1800 } }).catch(() => null),
    ])
    const overviewData = await overviewRes.json()
    const statsData = statsRes ? await statsRes.json().catch(() => null) : null
    return Response.json({
      athlete: overviewData?.athlete || null,
      stats: statsData || null,
    })
  } catch (e) {
    return Response.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}