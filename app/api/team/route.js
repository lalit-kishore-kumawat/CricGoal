const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

// sport examples: soccer/eng.1, cricket/ipl
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  if (!id) {
    return Response.json({ error: 'Missing team id' }, { status: 400 })
  }

  try {
    const [teamRes, scheduleRes, rosterRes] = await Promise.all([
  fetch(`${ESPN}/${sport}/teams/${id}`, { next: { revalidate: 3600 } }),
  fetch(`${ESPN}/${sport}/teams/${id}/schedule`, { next: { revalidate: 1800 } }),
  fetch(`${ESPN}/${sport}/teams/${id}/roster`, { next: { revalidate: 3600 } }),
])
   const teamData = await teamRes.json()
const scheduleData = await scheduleRes.json().catch(() => ({}))
const rosterData = await rosterRes.json().catch(() => ({}))
const athletes = rosterData?.athletes || []


    return Response.json({
      team: { ...(teamData?.team || {}), athletes },
      schedule: scheduleData?.events || 
                scheduleData?.team?.events || 
                scheduleData?.requestedSeason?.events || 
                teamData?.team?.nextEvents || 
                []
    })

  } catch (e) {
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}