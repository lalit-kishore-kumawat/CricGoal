'use client'
import Link from 'next/link'
import styles from './RecentResults.module.css'

function fmt(dateStr) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return '1d ago'
    return `${diff}d ago`
  } catch { return '' }
}

function ResultRow({ game, sport }) {
  const comp        = game?.competitions?.[0] || {}
  const competitors = comp?.competitors || []
  const home        = competitors.find(c => c?.homeAway === 'home') || competitors[0] || {}
  const away        = competitors.find(c => c?.homeAway === 'away') || competitors[1] || {}
  const status      = comp?.status?.type?.name
  const isFinal     = status === 'STATUS_FINAL'
  const isLive      = status === 'STATUS_IN_PROGRESS'

  // Skip TBD teams
  if (!home?.team?.displayName || home?.team?.displayName === 'TBD') return null
  if (!away?.team?.displayName || away?.team?.displayName === 'TBD') return null

  const homeWon = isFinal && home?.winner
  const awayWon = isFinal && away?.winner

  return (
    <Link href={`/match/${game?.id}?sport=${sport}`} className={styles.row}>

      {/* Away team */}
      <div className={styles.teamSide}>
        {away?.team?.logo
          ? <img src={away.team.logo} alt="" className={styles.logo} />
          : <div className={styles.logoPH} style={{ background: `#${away?.team?.color || '555'}` }}>
              {away?.team?.abbreviation?.[0] || '?'}
            </div>
        }
        <span className={`${styles.teamName} ${awayWon ? styles.winner : ''}`}>
          {away?.team?.abbreviation || away?.team?.displayName?.substring(0,3) || '?'}
        </span>
      </div>

      {/* Score / status */}
      <div className={styles.centre}>
        {isLive ? (
          <span className={styles.liveBadge}>LIVE</span>
        ) : isFinal ? (
          <div className={styles.scoreBox}>
            <span className={`${styles.score} ${awayWon ? styles.winner : ''}`}>
              {away?.score || '0'}
            </span>
            <span className={styles.dash}>-</span>
            <span className={`${styles.score} ${homeWon ? styles.winner : ''}`}>
              {home?.score || '0'}
            </span>
          </div>
        ) : (
          <span className={styles.upcoming}>VS</span>
        )}
        <span className={styles.time}>{fmt(game?.date)}</span>
      </div>

      {/* Home team */}
      <div className={`${styles.teamSide} ${styles.right}`}>
        <span className={`${styles.teamName} ${homeWon ? styles.winner : ''}`}>
          {home?.team?.abbreviation || home?.team?.displayName?.substring(0,3) || '?'}
        </span>
        {home?.team?.logo
          ? <img src={home.team.logo} alt="" className={styles.logo} />
          : <div className={styles.logoPH} style={{ background: `#${home?.team?.color || '555'}` }}>
              {home?.team?.abbreviation?.[0] || '?'}
            </div>
        }
      </div>

    </Link>
  )
}

export default function RecentResults({ games = [], sport = '' }) {
  if (!games || games.length === 0) return null

  // Show finals first, then live, then upcoming — max 6
  const sorted = [...games].sort((a, b) => {
    const order = { STATUS_FINAL: 0, STATUS_IN_PROGRESS: 1, STATUS_SCHEDULED: 2 }
    const sa = order[a?.competitions?.[0]?.status?.type?.name] ?? 3
    const sb = order[b?.competitions?.[0]?.status?.type?.name] ?? 3
    return sa - sb
  })

  const visible = sorted.slice(0, 6)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Results</h3>
        <span className={styles.subtitle}>{games.length} matches</span>
      </div>

      {visible.map((game, i) => (
        <ResultRow key={game?.id || i} game={game} sport={sport} />
      ))}
    </div>
  )
}