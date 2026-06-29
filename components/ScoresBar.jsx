import Link from 'next/link'
import { formatGame, formatTimeEST } from '../lib/espn'
import styles from './ScoresBar.module.css'

function ScoreCard({ game, sport }) {
  const g = formatGame(game)
  if (!g) return null

  return (
    <Link href={`/match/${g.id}?sport=${sport}`} className={styles.card}>
      <div className={styles.teams}>
        {[g.away, g.home].map((team, i) => (
          <div key={i} className={styles.teamRow}>
            {team.logo
              ? <img src={team.logo} alt={team.name} className={styles.logo} />
              : <div className={styles.logoPlaceholder} style={{ background: `#${team.color}` }}>{team.abbr[0]}</div>
            }
            <span className={`${styles.abbr} ${team.winner ? styles.winner : ''}`}>{team.abbr}</span>
            <span className={`${styles.score} ${team.winner ? styles.winner : ''}`}>
              {g.status.isScheduled ? '' : team.score || '0'}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.meta}>
        {g.status.isLive      && <span className={styles.live}>LIVE</span>}
        {g.status.isLive      && <span className={styles.clock}>{g.status.detail}</span>}
        {g.status.isFinal     && <span className={styles.final}>FINAL</span>}
        {g.status.isScheduled && <span className={styles.time}>{formatTimeEST(g.date)}</span>}
      </div>
    </Link>
  )
}

export default function ScoresBar({ games = [], sport = 'soccer/eng.1' }) {
  if (!games.length) {
    return (
      <div className={styles.bar}>
        <span className={styles.empty}>No matches scheduled today</span>
      </div>
    )
  }
  return (
    <div className={styles.bar}>
      {games.map(game => (
        <ScoreCard key={game.id} game={game} sport={sport} />
      ))}
    </div>
  )
}
