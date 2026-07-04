const ESPN = 'https://espn.com'
const CRICINFO_RANKINGS = 'https://espncricinfo.com'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // 🏏 1. Handle Cricket Rankings from Cricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_RANKINGS, { next: { revalidate: 86400 } })
      const data = await res.json()
      
      // Extract the top international team ranks to mimic your sidebar schema
      const ranks = (data?.content?.ranks || []).map(r => ({
        id: r?.team?.id || '',
        name: r?.team?.name || 'TBD',
        position: r?.rank || '-',
        stats: [
          { name: 'points', value: r?.points || 0 },
          { name: 'rating', value: r?.rating || 0 }
        ]
      })).slice(0, 10)

      return Response.json({ standings: [{ name: 'ICC Rankings', rows: ranks }] })
    } catch (e) {
      return Response.json({ standings: [] })
    }
  }

  // ⚽ 2. Handle Football Standings from standard ESPN
  try {
    const res = await fetch(`${ESPN}/${sport}/standings`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ standings: [] })
  }
}

