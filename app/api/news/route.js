const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'cricket'
  const url = `${ESPN}/${sport}/news`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}
