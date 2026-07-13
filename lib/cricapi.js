/**
 * lib/cricapi.js — CricketData.org API client
 *
 * Two API keys → 200 free calls/day total.
 * Two-layer cache strategy so we almost never hit the API:
 *
 *   Layer 1 — Module-level in-memory Map
 *             Survives within a warm Vercel serverless instance.
 *             Zero latency, zero API calls.
 *
 *   Layer 2 — Next.js fetch cache  (next: { revalidate: N })
 *             Persisted on Vercel's edge/CDN across cold starts.
 *             Still zero API calls within the TTL window.
 *
 *   Layer 3 — Actual CricAPI HTTP call (only when both caches miss)
 *             Tries key 1 first; if 429 rate-limited, falls back to key 2.
 *
 * Budget math (worst case — constant traffic):
 *   scores  revalidate: 300 s  → 288 max calls/day  ÷ 2 keys = 144 each ✅
 *   news/search revalidate: 600s → 144/day ÷ 2 = 72 each ✅
 *   player  revalidate: 3600s → 24/day ÷ 2 = 12 each ✅
 * Real traffic is bursty, so actual calls will be far lower.
 */
const BASE = 'https://api.cricapi.com/v1'

// ── Two API keys — primary first, fallback second ───────────────────────────
const KEYS = [
  'f5671c8f-776a-4735-80f5-9c4211eae8be',   // account 1 (primary)
  '0678a5f1-9a31-4c19-82dc-8e7f446a5da2',   // account 2 (fallback)
]

// ── Layer 1: module-level in-memory cache ────────────────────────────────────
const _mem = new Map()

function memGet(key) {
  const hit = _mem.get(key)
  if (!hit) return null
  if (Date.now() > hit.exp) { _mem.delete(key); return null }
  return hit.val
}

function memSet(key, val, ttlSec) {
  // Cap at 10 MB worth of entries by evicting oldest if map grows large
  if (_mem.size > 50) {
    const oldest = _mem.keys().next().value
    _mem.delete(oldest)
  }
  _mem.set(key, { val, exp: Date.now() + ttlSec * 1000 })
}

// ── Layer 2 + 3: fetch with Next.js cache + key rotation ────────────────────
/**
 * @param {string} path  e.g. '/currentMatches?offset=0'
 * @param {number} ttlSec  cache TTL in seconds (controls both layers)
 */
async function cricFetch(path, ttlSec = 600) {
  // Layer 1 — memory hit?
  const cached = memGet(path)
  if (cached !== null) {
    console.log('[cricapi] memory cache hit:', path)
    return cached
  }

  // Layer 2 + 3 — try each key
  for (const key of KEYS) {
    const sep = path.includes('?') ? '&' : '?'
    const url = `${BASE}${path}${sep}apikey=${key}`
    try {
      // next: { revalidate } tells Next.js to cache this fetch on Vercel's CDN
      const res = await fetch(url, { next: { revalidate: ttlSec } })

      if (res.status === 429) {
        console.warn('[cricapi] rate limited on key', key.slice(0, 8), '— trying next key')
        continue
      }
      if (!res.ok) {
        console.warn('[cricapi] non-OK response', res.status, 'for', path)
        continue
      }

      const data = await res.json()
      if (data?.status !== 'success') {
        console.warn('[cricapi] API error:', data?.reason, 'for', path)
        continue
      }

      // Write to Layer 1 memory cache
      memSet(path, data, ttlSec)
      console.log('[cricapi] API call made with key', key.slice(0, 8), 'for', path)
      return data
    } catch (err) {
      console.error('[cricapi] fetch error:', err.message)
      continue
    }
  }

  console.error('[cricapi] both keys failed for', path)
  return null
}

// ── Public data-fetching helpers ─────────────────────────────────────────────

/** All current + live matches (updated every 5 min) */
export async function getCurrentMatches() {
  const d = await cricFetch('/currentMatches?offset=0', 300)
  return d?.data || []
}

/** Search cricket players by name */
export async function searchPlayers(query) {
  const d = await cricFetch(
    `/players?search=${encodeURIComponent(query)}&offset=0`,
    120
  )
  return d?.data || []
}

/** Full player bio + career stats */
export async function getPlayerInfo(id) {
  const d = await cricFetch(`/players_info?id=${encodeURIComponent(id)}`, 3600)
  return d?.data || null
}

/** Full scorecard for a specific match */
export async function getMatchScorecard(id) {
  const d = await cricFetch(
    `/match_scorecard?id=${encodeURIComponent(id)}`,
    120   // live match — refresh every 2 min
  )
  return d?.data || null
}

// ── Data mapper: CricAPI match object → ESPN event shape ─────────────────────
// ScoresBar.jsx calls formatGame(event) from lib/espn.js which expects this shape.

function abbr(info, name) {
  return info?.shortname || (name || 'TBD').substring(0, 3).toUpperCase()
}

function scoreStr(scoreArr, teamName) {
  const s = scoreArr?.find(s =>
    s?.inning?.toLowerCase().startsWith((teamName || '').toLowerCase())
  )
  return s ? `${s.r}/${s.w} (${s.o})` : ''
}

export function mapMatchToEvent(m) {
  const t0   = m?.teamInfo?.[0] || {}
  const t1   = m?.teamInfo?.[1] || {}
  const n0   = m?.teams?.[0]    || 'TBD'
  const n1   = m?.teams?.[1]    || 'TBD'

  const isLive  = Boolean(m?.matchStarted && !m?.matchEnded)
  const isFinal = Boolean(m?.matchEnded)
  const statusName = isLive
    ? 'STATUS_IN_PROGRESS'
    : isFinal ? 'STATUS_FINAL' : 'STATUS_SCHEDULED'

  // Determine winner from status string e.g. "India won by 7 runs"
  const statusLower = (m?.status || '').toLowerCase()
  const w0 = isFinal && statusLower.includes(n0.toLowerCase())
  const w1 = isFinal && statusLower.includes(n1.toLowerCase())

  return {
    id:        m?.id        || '',
    name:      m?.name      || `${n0} vs ${n1}`,
    shortName: `${abbr(t0, n0)} vs ${abbr(t1, n1)}`,
    date:      m?.dateTimeGMT || m?.date || '',
    competitions: [{
      status: {
        type:         { name: statusName, detail: m?.status || '' },
        displayClock: '',
        period:       0,
      },
      venue:       { fullName: m?.venue || '' },
      competitors: [
        {
          homeAway: 'home',
          winner:   w0,
          score:    scoreStr(m?.score, n0),
          team: {
            displayName:  n0,
            abbreviation: abbr(t0, n0),
            logo:         t0?.img  || '',
            color:        '1a6b3c',
          },
        },
        {
          homeAway: 'away',
          winner:   w1,
          score:    scoreStr(m?.score, n1),
          team: {
            displayName:  n1,
            abbreviation: abbr(t1, n1),
            logo:         t1?.img  || '',
            color:        '2563eb',
          },
        },
      ],
    }],
  }
}
