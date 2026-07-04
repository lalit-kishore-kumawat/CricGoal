const ESPN = 'https://site.api.espn.com/apis/common/v3/search'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return Response.json({ results: [] })
  }

  try {
    const res = await fetch(
      `${ESPN}?query=${encodeURIComponent(query)}&limit=10&mode=prefix`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json()

    // Filter only cricket and football related results
   const results = (data?.items || [])
  .filter(item => {
    const uid = (item?.uid || '').toLowerCase()
    const lang = (item?.language || '').toLowerCase()
    const name = (item?.displayName || '').toLowerCase()
    const type = (item?.type || '').toLowerCase()
    return (
      uid.includes('cricket') ||
      uid.includes('soccer') ||
      uid.includes('football') ||
      lang.includes('cricket') ||
      type === 'athlete' ||
      type === 'team'
    )
  })
      .slice(0, 8)
      .map(item => ({
        id: item?.id,
        name: item?.displayName || item?.name || '',
        type: item?.type || '',        // 'athlete' or 'team'
        sport: item?.sport || '',
        league: item?.league || '',
        logo: item?.images?.[0]?.url || item?.logo || '',
        teamId: item?.teamId || item?.id,
      }))

    return Response.json({ results })
  } catch (e) {
    return Response.json({ results: [] })
  }
}