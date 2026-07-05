const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO = 'https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current'

const CRICINFO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.espncricinfo.com/',
  'Origin': 'https://www.espncricinfo.com',
  'Accept': 'application/json',
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO, { headers: CRICINFO_HEADERS, next: { revalidate: 60 } })
      const data = await res.json()
      const matches = (data?.content?.matches || []).map(m => {
        const t1 = m?.teams?.[0]
        const t2 = m?.teams?.[1]
        return {
          id: m?.objectId || m?.id || '',
          name: `${t1?.team?.name || 'TBD'} vs ${t2?.team?.name || 'TBD'}`,
          date: m?.startDate || '',
          competitions: [{
            status: {
              type: {
                name: m?.isLive ? 'STATUS_IN_PROGRESS'
                  : m?.isComplete ? 'STATUS_FINAL'
                  : 'STATUS_SCHEDULED',
                detail: m?.statusText || '',
              },
            },
            venue: { fullName: m?.ground?.name || '' },
            competitors: [
              {
                homeAway: 'home',
                winner: m?.winnerTeamId === t1?.team?.objectId,
                score: t1?.innings?.[0]?.runs !== undefined
                  ? `${t1.innings[0].runs}/${t1.innings[0].wickets ?? 0}`
                  : '',
                team: {
                  displayName: t1?.team?.name || 'TBD',
                  abbreviation: t1?.team?.abbreviation || t1?.team?.name?.substring(0,3).toUpperCase() || 'TBD',
                  logo: t1?.team?.imageUrl || '',
                  color: '1a6b3c',
                },
              },
              {
                homeAway: 'away',
                winner: m?.winnerTeamId === t2?.team?.objectId,
                score: t2?.innings?.[0]?.runs !== undefined
                  ? `${t2.innings[0].runs}/${t2.innings[0].wickets ?? 0}`
                  : '',
                team: {
                  displayName: t2?.team?.name || 'TBD',
                  abbreviation: t2?.team?.abbreviation || t2?.team?.name?.substring(0,3).toUpperCase() || 'TBD',
                  logo: t2?.team?.imageUrl || '',
                  color: '555555',
                },
              },
            ],
          }],
        }
      }).slice(0, 10)
      return Response.json(matches)
    } catch (e) {
      return Response.json([])
    }
  }

  try {
    const res = await fetch(`${ESPN}/${sport}/scoreboard`, { next: { revalidate: 30 } })
    const data = await res.json()
    return Response.json(data.events || [])
  } catch (e) {
    return Response.json([])
  }
}