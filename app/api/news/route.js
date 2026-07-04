const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'cricket'
  const url = `${ESPN}/${sport}/news`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
   const data = await res.json()
const articles = data.articles?.slice(0, 8) || []
if (articles.length === 0 && sport.includes('cricket')) {
  const fallback = await fetch(`${ESPN}/cricket/news`, { next: { revalidate: 300 } })
  const fallbackData = await fallback.json()
  return Response.json(fallbackData.articles?.slice(0, 8) || [])
}
return Response.json(articles)
  } catch (e) {
    return Response.json([])
  }
}
