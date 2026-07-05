// ESPN's unified search API — works for both cricket and football.
// cricket results have uid like 's:64~...' (sport id 64 = cricket on ESPN)
const ESPN_SEARCH = 'https://site.api.espn.com/apis/common/v3/search'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const sport = searchParams.get('sport') || ''

  if (!query.trim()) return Response.json({ results: [] })

  const isCricket = sport === 'cricket'

  try {
    const res  = await fetch(
      `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=15&mode=prefix`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json()

    const results = (data?.items || [])
      .filter(item => {
        const uid  = (item?.uid  || '').toLowerCase()
        const type = (item?.type || '').toLowerCase()
        if (isCricket) {
          // ESPN cricket sport id = 64; also catch uid patterns
          return uid.includes('cricket') || uid.startsWith('s:64~')
        }
        return uid.includes('soccer') || uid.includes('football')
      })
      .slice(0, 8)
      .map(item => ({
        id:     item?.id     || '',
        name:   item?.displayName || item?.name || '',
        type:   item?.type   || 'team',
        sport:  isCricket ? 'cricket' : 'soccer',
        league: isCricket ? 'cricket/ipl' : 'soccer/eng.1',
        logo:   item?.images?.[0]?.url || item?.logo || '',
      }))

    return Response.json({ results })
  } catch (e) {
    return Response.json({ results: [] })
  }
}