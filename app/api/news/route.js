// ESPN's unified API — cricket and football both live here.
// For cricket the sport param sent by page.js is always just 'cricket'
// so the URL becomes: ESPN/cricket/news
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  // ── Cricket ───────────────────────────────────────────────────────────────
  if (sport.startsWith('cricket')) {
    try {
      const res  = await fetch(`${ESPN}/cricket/news`, { next: { revalidate: 300 } })
      const data = await res.json()
      return Response.json(data.articles?.slice(0, 8) || [])
    } catch (e) {
      return Response.json([])
    }
  }

  // ── Football ──────────────────────────────────────────────────────────────
  try {
    const res  = await fetch(`${ESPN}/${sport}/news`, { next: { revalidate: 300 } })
    const data = await res.json()
    return Response.json(data.articles?.slice(0, 8) || [])
  } catch (e) {
    return Response.json([])
  }
}