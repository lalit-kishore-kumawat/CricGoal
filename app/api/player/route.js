import { getPlayerInfo } from '../../../lib/cricapi'

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id    = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing player id' }, { status: 400 })

  // ── Cricket player via CricAPI ────────────────────────────────────────────
  if (sport.startsWith('cricket')) {
    try {
      const p = await getPlayerInfo(id)
      if (!p) return Response.json({ athlete: null, stats: null })

      const athlete = {
        id:            p?.id           || id,
        displayName:   p?.name         || '',
        fullName:      p?.name         || '',
        headshot:      { href: p?.playerImg || '' },
        position:      { displayName: p?.role || '' },
        jersey:        '',
        age:           p?.dob
          ? new Date().getFullYear() - new Date(p.dob).getFullYear()
          : null,
        displayHeight: p?.height       || '',
        displayWeight: '',
        birthPlace:    {
          city:    p?.birthPlace || '',
          country: p?.country    || '',
        },
        team: { displayName: p?.country || '' },
      }

      // Map CricAPI stats array [{ fn: 'batting', values: { Mat, Runs, ... } }]
      // into the ESPN stats shape that PlayerPage.jsx renders
      const cats = (p?.stats || [])
        .map(cat => ({
          displayName: cat?.fn === 'batting' ? 'Batting'
            : cat?.fn === 'bowling' ? 'Bowling'
            : cat?.fn             || 'Stats',
          stats: Object.entries(cat?.values || {}).map(([k, v]) => ({
            displayName:      k,
            shortDisplayName: k,
            displayValue:     String(v ?? '-'),
          })),
        }))
        .filter(c => c.stats.length > 0)

      return Response.json({
        athlete,
        stats: cats.length ? { splits: { categories: cats } } : null,
      })
    } catch (e) {
      return Response.json({ error: 'Failed to fetch cricket player' }, { status: 500 })
    }
  }

  // ── Football player via ESPN ──────────────────────────────────────────────
  try {
    const [overviewRes, statsRes] = await Promise.all([
      fetch(`${ESPN}/${sport}/athletes/${id}`,       { next: { revalidate: 3600 } }),
      fetch(`${ESPN}/${sport}/athletes/${id}/stats`, { next: { revalidate: 1800 } }).catch(() => null),
    ])
    const overviewData = await overviewRes.json()
    const statsData    = statsRes ? await statsRes.json().catch(() => null) : null
    return Response.json({ athlete: overviewData?.athlete || null, stats: statsData || null })
  } catch {
    return Response.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}