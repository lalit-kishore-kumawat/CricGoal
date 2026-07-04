const ESPN = 'https://espn.com'
const CRICINFO_SCORES = 'https://espncricinfo.com'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // 🏏 1. Handle Live Cricket Scores from Cricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_SCORES, { next: { revalidate: 60 } })
      const data = await res.json()
      
      // Map Cricinfo data structures to match your existing ScoreBar.jsx frontend layout
      const cricketMatches = (data?.content?.matches || []).map(m => {
        const team1Obj = m?.teams?.[0]
        const team2Obj = m?.teams?.[1]
        
        return {
          id: m?.id || '',
          status: m?.status || 'UPCOMING',
          statusText: m?.statusText || '',
          competitors: [
            {
              id: team1Obj?.team?.id || '1',
              homeAway: 'home',
              team: {
                displayName: team1Obj?.team?.name || 'TBD',
                abbreviation: team1Obj?.team?.abbreviation || team1Obj?.team?.name?.substring(0, 3).toUpperCase() || 'TBD',
                logo: team1Obj?.team?.logo || ''
              },
              score: team1Obj?.score || ''
            },
            {
              id: team2Obj?.team?.id || '2',
              homeAway: 'away',
              team: {
                displayName: team2Obj?.team?.name || 'TBD',
                abbreviation: team2Obj?.team?.abbreviation || team2Obj?.team?.name?.substring(0, 3).toUpperCase() || 'TBD',
                logo: team2Obj?.team?.logo || ''
              },
              score: team2Obj?.score || ''
            }
          ]
        }
      }).slice(0, 10)

      return Response.json({ events: cricketMatches })
    } catch (e) {
      return Response.json({ events: [] })
    }
  }

  // ⚽ 2. Handle Football Scores from standard ESPN
  try {
    const res = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 60 } })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ events: [] })
  }
}
