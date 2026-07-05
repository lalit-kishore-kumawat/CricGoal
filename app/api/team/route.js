const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'
const CRICINFO_TEAM = 'https://hs-consumer-api.espncricinfo.com/v1/pages/team/home?teamId='

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) return Response.json({ error: 'Missing team id' }, { status: 400 })

  // 🏏 Cricket team — ESPNcricinfo
  if (sport.startsWith('cricket')) {
    try {
      const res = await fetch(CRICINFO_TEAM + id, { next: { revalidate: 3600 } })
      const data = await res.json()
      const t = data?.content?.team || {}
      const players = data?.content?.players || []
      const matches = data?.content?.recentMatches || []

      const team = {
        id: t?.objectId || id,
        displayName: t?.name || '',
        logos: t?.imageUrl ? [{ href: t.imageUrl }] : [],
        color: '1a6b3c',
        standingSummary: '',
        location: t?.country?.name || '',
        athletes: players.map(p => ({
          id: p?.objectId || '',
          displayName: p?.name || '',
          headshot: { href: p?.imageUrl || '' },
          jersey: '',
          position: { abbreviation: p?.primaryRole || '' },
        })),
        record: { items: [] },
      }

      const schedule = matches.map(m => {
        const t1 = m?.teams?.[0]
        const t2 = m?.teams?.[1]
        return {
          id: m?.objectId || '',
          date: m?.startDate || '',
          competitions: [{
            competitors: [
              {
                homeAway: 'home',
                score: t1?.score || '',
                team: { abbreviation: t1?.team?.abbreviation || t1?.team?.name?.substring(0,3) || '' },
              },
              {
                homeAway: 'away',
                score: t2?.score || '',
                team: { abbreviation: t2?.team?.abbreviation || t2?.team?.name?.substring(0,3) || '' },
              },
            ],
            status: {
              type: {
                name: m?.isComplete ? 'STATUS_FINAL' : 'STATUS_SCHEDULED',
              },
            },
          }],
        }
      })

      return Response.json({ team, schedule })
    } catch (e) {
      return Response.json({ error: 'Failed to fetch cricket team' }, { status: 500 })
    }
  }

  // ⚽ Football team — ESPN
  try {
    const [teamRes, scheduleRes, rosterRes] = await Promise.all([
      fetch(`${ESPN}/${sport}/teams/${id}`, { next: { revalidate: 3600 } }),
      fetch(`${ESPN}/${sport}/teams/${id}/schedule`, { next: { revalidate: 1800 } }),
      fetch(`${ESPN}/${sport}/teams/${id}?enable=roster`, { next: { revalidate: 3600 } }),
    ])
    const teamData = await teamRes.json()
    const scheduleData = await scheduleRes.json().catch(() => ({}))
    const rosterData = await rosterRes.json().catch(() => ({}))
    const athletes = rosterData?.team?.athletes?.flatMap(g => g?.items || []) || []

    return Response.json({
      team: { ...(teamData?.team || {}), athletes },
      schedule: scheduleData?.events || scheduleData?.team?.events || [],
    })
  } catch (e) {
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}