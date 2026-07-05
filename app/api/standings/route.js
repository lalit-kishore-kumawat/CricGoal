const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_RANKINGS = 'https://hs-consumer-api.espncricinfo.com/v1/pages/rankings/team?formatId=3'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_RANKINGS, { next: { revalidate: 86400 } })
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