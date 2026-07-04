const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_NEWS = 'https://hs-consumer-api.espncricinfo.com/v1/pages/home/feed?lang=en'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // Cricket news from Cricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_NEWS, { next: { revalidate: 300 } })
      const data = await res.json()
      const articles = (data?.content?.stories || []).slice(0, 8).map(s => ({
        headline: s?.headline || s?.title || '',
        description: s?.description || '',
        published: s?.publishedAt || '',
        images: s?.image ? [{ url: s.image }] : [],
        links: { web: { href: s?.url || '#' } },
        categories: [{ description: 'Cricket' }],
      }))
      return Response.json(articles)
    } catch (e) {
      return Response.json([])
    }
  }

  // Football news
  try {
    const res = await fetch(`${ESPN}/${sport}/news`, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}