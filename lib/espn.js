// Free ESPN unofficial API - no key required!
// Docs reference: https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

export async function getNBAScores() {
  try {
    const res = await fetch(`${ESPN_BASE}/basketball/nba/scoreboard`, {
      next: { revalidate: 30 }, // refresh every 30 seconds
    })
    const data = await res.json()
    return data.events || []
  } catch (e) {
    console.error('Failed to fetch NBA scores:', e)
    return []
  }
}

export async function getNFLScores() {
  try {
    const res = await fetch(`${ESPN_BASE}/football/nfl/scoreboard`, {
      next: { revalidate: 30 },
    })
    const data = await res.json()
    return data.events || []
  } catch (e) {
    console.error('Failed to fetch NFL scores:', e)
    return []
  }
}

export async function getSoccerScores(league = 'eng.1') {
  // eng.1 = Premier League, usa.1 = MLS, esp.1 = La Liga
  try {
    const res = await fetch(`${ESPN_BASE}/soccer/${league}/scoreboard`, {
      next: { revalidate: 30 },
    })
    const data = await res.json()
    return data.events || []
  } catch (e) {
    console.error('Failed to fetch soccer scores:', e)
    return []
  }
}

export async function getNBANews() {
  try {
    const res = await fetch(`${ESPN_BASE}/basketball/nba/news`, {
      next: { revalidate: 300 }, // refresh every 5 minutes
    })
    const data = await res.json()
    return data.articles?.slice(0, 8) || []
  } catch (e) {
    console.error('Failed to fetch NBA news:', e)
    return []
  }
}

export async function getTopNews() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/news', {
      next: { revalidate: 300 },
    })
    const data = await res.json()
    return data.articles?.slice(0, 8) || []
  } catch (e) {
    console.error('Failed to fetch top news:', e)
    return []
  }
}

export async function getNBAStandings() {
  try {
    const res = await fetch(`${ESPN_BASE}/basketball/nba/standings`, {
      next: { revalidate: 3600 }, // refresh every hour
    })
    const data = await res.json()
    return data.children || []
  } catch (e) {
    console.error('Failed to fetch NBA standings:', e)
    return []
  }
}

// Format a game event from ESPN API into a simpler shape
export function formatGame(event) {
  const competition = event.competitions?.[0]
  if (!competition) return null

  const home = competition.competitors?.find(c => c.homeAway === 'home')
  const away = competition.competitors?.find(c => c.homeAway === 'away')
  const status = competition.status

  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    home: {
      name: home?.team?.displayName || '',
      abbr: home?.team?.abbreviation || '',
      logo: home?.team?.logo || '',
      color: home?.team?.color || '000000',
      score: home?.score || '',
      winner: home?.winner || false,
    },
    away: {
      name: away?.team?.displayName || '',
      abbr: away?.team?.abbreviation || '',
      logo: away?.team?.logo || '',
      color: away?.team?.color || '000000',
      score: away?.score || '',
      winner: away?.winner || false,
    },
    status: {
      type: status?.type?.name || '',
      detail: status?.type?.detail || status?.displayClock || '',
      period: status?.period || 0,
      clock: status?.displayClock || '',
      isLive: status?.type?.name === 'STATUS_IN_PROGRESS',
      isFinal: status?.type?.name === 'STATUS_FINAL',
      isScheduled: status?.type?.name === 'STATUS_SCHEDULED',
    },
    date: event.date,
  }
}

export function formatTimeEST(dateStr) {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    })
  } catch {
    return ''
  }
}
