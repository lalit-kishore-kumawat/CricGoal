const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

// Parse Google News RSS for cricket
async function getCricketNewsFromRSS() {
  try {
    const res = await fetch(
      'https://news.google.com/rss/search?q=cricket+T20+IPL&hl=en-IN&gl=IN&ceid=IN:en',
      { next: { revalidate: 300 } }
    )
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 8).map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || ''
      const link  = item.match(/<link>(.*?)<\/link>/)?.[1] || '#'
      const date  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Cricket News'
      return {
        headline: title,
        description: '',
        published: date ? new Date(date).toISOString() : '',
        images: [],
        links: { web: { href: link } },
        categories: [{ description: source }],
      }
    })
  } catch (e) {
    return []
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (sport.startsWith('cricket')) {
    const articles = await getCricketNewsFromRSS()
    return Response.json(articles)
  }

  try {
    const res  = await fetch(`${ESPN}/${sport}/news`, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}