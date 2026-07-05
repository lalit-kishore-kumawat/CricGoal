const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_RANKINGS = 'https://hs-consumer-api.espncricinfo.com/v1/pages/rankings/team?formatId=3'

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
      const res = await fetch(CRICINFO_RANKINGS, { headers: CRICINFO_HEADERS, next: { revalidate: 86400 } })
      const data = await res.json()
      const ranks = (data?.content?.ranks || []).slice(0, 8).map(r => ({
        team: {
          id: r?.team?.objectId || '',
          displayName: r?.team?.name || 'TBD',
          shortDisplayName: r?.team?.abbreviation || r?.team?.name || 'TBD',
          logo: r?.team?.imageUrl || '',
          color: '1a6b3c',
        },
        stats: [
          { name: 'wins', displayValue: String(r?.points || 0) },
          { name: 'losses', displayValue: String(r?.rating || 0) },
        ],
      }))
      return Response.json([{ standings: { entries: ranks } }])
    } catch (e) {
      return Response.json([])
    }
  }

  try {
    const res = await fetch(`${ESPN}/${sport}/standings`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return Response.json(data.children || [])
  } catch (e) {
    return Response.json([])
  }
}