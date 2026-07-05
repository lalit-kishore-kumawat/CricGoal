const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_NEWS = 'https://hs-consumer-api.espncricinfo.com/v1/pages/home/feed?lang=en'

const CRICINFO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.espncricinfo.com/',
  'Origin': 'https://www.espncricinfo.com',
  'Accept': 'application/json',
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // 🏏 Cricket news from ESPNcricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_NEWS, { headers: CRICINFO_HEADERS, next: { revalidate: 300 } })
      const data = await res.json()
      const stories = data?.content?.stories || data?.stories || []
      const articles = stories.slice(0, 8).map(s => ({
        headline: s?.headline || s?.title || '',
        description: s?.description || s?.summary || '',
        published: s?.publishedAt || s?.publishAt || '',
        images: s?.image?.url
          ? [{ url: s.image.url }]
          : s?.imageUrl
          ? [{ url: s.imageUrl }]
          : [],
        links: { web: { href: s?.link || s?.url || '#' } },
        categories: [{ description: 'Cricket' }],
      }))
      return Response.json(articles)
    } catch (e) {
      return Response.json([])
    }
  }

  // ⚽ Football news from ESPN
  try {
    const res = await fetch(`${ESPN}/${sport}/news`, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}