import { getCurrentMatches, getMatchScorecard } from '../../../lib/cricapi'

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id    = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing event id' }, { status: 400 })

  // ── Cricket ──────────────────────────────────────────────────────────────
  if (sport.startsWith('cricket')) {
    try {
      // Get all current matches to find this specific one
      const allMatches = await getCurrentMatches()
      const m = allMatches.find(match => match?.id === id) || null

      if (!m) return Response.json({ error: 'Match not found' }, { status: 404 })

      const t0      = m?.teamInfo?.[0] || {}
      const t1      = m?.teamInfo?.[1] || {}
      const n0      = m?.teams?.[0]    || 'TBD'
      const n1      = m?.teams?.[1]    || 'TBD'
      const isLive  = Boolean(m?.matchStarted && !m?.matchEnded)
      const isFinal = Boolean(m?.matchEnded)

      // Try to get scorecard for live/finished matches
      let scorecard = []
      if (isLive || isFinal) {
        try {
          const sc = await getMatchScorecard(id)
          scorecard = sc?.scorecard || []
        } catch { scorecard = [] }
      }

      return Response.json({
        header: {
          competitions: [{
            date:   m?.dateTimeGMT || '',
            status: {
              type: {
                name:   isLive ? 'STATUS_IN_PROGRESS'
                       : isFinal ? 'STATUS_FINAL'
                       : 'STATUS_SCHEDULED',
                detail: m?.status || '',
              },
            },
            venue:       { fullName: m?.venue || '' },
            competitors: [
              {
                homeAway: 'home',
                score:    m?.score?.[0] ? `${m.score[0].r}/${m.score[0].w} (${m.score[0].o} ov)` : '-',
                winner:   isFinal && (m?.status || '').toLowerCase().includes(n0.toLowerCase()),
                team: {
                  id:           t0?.id || '',
                  displayName:  n0,
                  abbreviation: t0?.shortname || n0.substring(0, 3).toUpperCase(),
                  logo:         t0?.img || '',
                  color:        '1a6b3c',
                },
              },
              {
                homeAway: 'away',
                score:    m?.score?.[1] ? `${m.score[1].r}/${m.score[1].w} (${m.score[1].o} ov)` : '-',
                winner:   isFinal && (m?.status || '').toLowerCase().includes(n1.toLowerCase()),
                team: {
                  id:           t1?.id || '',
                  displayName:  n1,
                  abbreviation: t1?.shortname || n1.substring(0, 3).toUpperCase(),
                  logo:         t1?.img || '',
                  color:        '2563eb',
                },
              },
            ],
          }],
        },
        matchInfo: {
          matchType:   m?.matchType  || '',
          series:      m?.series     || '',
          venue:       m?.venue      || '',
          date:        m?.dateTimeGMT || m?.date || '',
          status:      m?.status     || '',
          tossWinner:  m?.tossWinner || '',
          tossChoice:  m?.tossChoice || '',
        },
        innings: scorecard.map(inn => ({
          team:    { displayName: (inn?.inning || '').split(' Inning')[0] },
          runs:    inn?.runs     ?? 0,
          wickets: inn?.wickets  ?? 0,
          overs:   inn?.overs    ?? 0,
          batsmen: (inn?.batting || []).map(b => ({
            athlete:    { displayName: b?.batsman || '' },
            dismissal:  b?.dismissal  || 'not out',
            runs:       b?.r          ?? 0,
            balls:      b?.b          ?? 0,
            fours:      b?.['4s']     ?? 0,
            sixes:      b?.['6s']     ?? 0,
            strikerate: b?.sr         ?? '-',
          })),
          bowlers: (inn?.bowling || []).map(b => ({
            athlete:  { displayName: b?.bowler || '' },
            overs:    b?.o   ?? 0,
            maidens:  b?.m   ?? 0,
            runs:     b?.r   ?? 0,
            wickets:  b?.w   ?? 0,
            economy:  b?.eco ?? '-',
          })),
        })),
        plays: [],
        news:  [],
      })
    } catch (e) {
      console.error('Cricket match error:', e)
      return Response.json({ error: 'Failed to fetch cricket match' }, { status: 500 })
    }
  }

  // ── Football via ESPN ─────────────────────────────────────────────────────
  try {
    const res  = await fetch(
      `${ESPN}/${sport}/summary?event=${id}`,
      { next: { revalidate: 30 } }
    )
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}