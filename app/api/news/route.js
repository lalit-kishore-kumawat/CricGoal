const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

// Try multiple cricket news endpoints and return first that has articles
async function getCricketNews() {
  const endpoints = [
    `${ESPN}/cricket/international-t20/news`,
    `${ESPN}/cricket/ipl/news`,
    `${ESPN}/cricket/international-test/news`,
    `${ESPN}/cricket/international-odi/news`,
    `${ESPN}/cricket/news`,
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const data = await res.json()
      const articles = data?.articles?.slice(0, 8) || []
      if (articles.length > 0) return articles
    } catch { continue }
  }
  return []
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (sport.startsWith('cricket')) {
    const articles = await getCricketNews()
    return Response.json(articles)
  }

  try {
    const res = await fetch(`${ESPN}/${sport}/news`, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}