const ESPN_SEARCH = 'https://site.api.espn.com/apis/common/v3/search'
const CRICINFO_SEARCH = 'https://hs-consumer-api.espncricinfo.com/v1/pages/search?query='

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const sport = searchParams.get('sport') || ''

  if (!query.trim()) return Response.json({ results: [] })

  // 🏏 Cricket search — ESPNcricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(
        CRICINFO_SEARCH + encodeURIComponent(query),
        { next: { revalidate: 60 } }
      )
      const data = await res.json()
      const items = data?.content?.results || data?.results || []
      const results = items.slice(0, 8).map(item => ({
        id: item?.objectId || item?.id || '',
        name: item?.title || item?.name || '',
        type: item?.type === 'player' ? 'athlete' : 'team',
        sport: 'cricket',
        league: 'cricket/ipl',
        logo: item?.imageUrl || item?.image || '',
      }))
      return Response.json({ results })
    } catch (e) {
      return Response.json({ results: [] })
    }
  }

  // ⚽ Football search — ESPN
  try {
    const res = await fetch(
      `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=10&mode=prefix`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    const results = (data?.items || [])
      .filter(item => {
        const uid = (item?.uid || '').toLowerCase()
        return uid.includes('soccer') || uid.includes('football')
      })
      .slice(0, 8)
      .map(item => ({
        id: item?.id || '',
        name: item?.displayName || item?.name || '',
        type: item?.type || 'team',
        sport: 'soccer',
        league: 'soccer/eng.1',
        logo: item?.images?.[0]?.url || '',
      }))
    return Response.json({ results })
  } catch (e) {
    return Response.json({ results: [] })
  }
}