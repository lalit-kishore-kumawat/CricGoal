import Link from 'next/link'
import { formatGame, formatTimeEST } from '../lib/espn'
import styles from './ScoresBar.module.css'

function CricketScoreCard({ game, sport }) {
  const comp = game?.competitions?.[0]
  const home = comp?.competitors?.find(c => c.homeAway === 'home')
  const away = comp?.competitors?.find(c => c.homeAway === 'away')
  const status = comp?.status?.type
  const isLive = status?.name === 'STATUS_IN_PROGRESS'
  const isFinal = status?.name === 'STATUS_FINAL'
  const isScheduled = status?.name === 'STATUS_SCHEDULED'

  return (
    <Link href={`/match/${game.id}?sport=${sport}`} className={styles.cricketCard}>
      <div className={styles.cricketTeams}>
        <div className={styles.cricketRow}>
          {home?.team?.logo
            ? <img src={home.team.logo} alt="" className={styles.cricketLogo} />
            : <div className={styles.cricketLogoPH} style={{ background: `#${home?.team?.color || '1a6b3c'}` }}>{home?.team?.abbreviation?.[0] || '?'}</div>
          }
          <span className={`${styles.cricketAbbr} ${home?.winner ? styles.winner : ''}`}>
            {home?.team?.abbreviation || 'TBD'}
          </span>
          <span className={`${styles.cricketScore} ${home?.winner ? styles.winner : ''}`}>
            {isScheduled ? '' : home?.score || ''}
          </span>
        </div>
        <div className={styles.cricketRow}>
          {away?.team?.logo
            ? <img src={away.team.logo} alt="" className={styles.cricketLogo} />
            : <div className={styles.cricketLogoPH} style={{ background: `#${away?.team?.color || '2563eb'}` }}>{away?.team?.abbreviation?.[0] || '?'}</div>
          }
          <span className={`${styles.cricketAbbr} ${away?.winner ? styles.winner : ''}`}>
            {away?.team?.abbreviation || 'TBD'}
          </span>
          <span className={`${styles.cricketScore} ${away?.winner ? styles.winner : ''}`}>
            {isScheduled ? '' : away?.score || ''}
          </span>
        </div>
      </div>
      <div className={styles.cricketMeta}>
        {isLive && <span className={styles.live}>LIVE</span>}
        {isFinal && <span className={styles.final}>FINAL</span>}
        {isScheduled && <span className={styles.time}>{formatTimeEST(game.date)}</span>}
        {isLive && <span className={styles.cricketDetail}>{status?.detail || ''}</span>}
      </div>
    </Link>
  )
}

function FootballScoreCard({ game, sport }) {
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
  const isCricket = sport.startsWith('cricket')

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
        isCricket
          ? <CricketScoreCard key={game.id} game={game} sport={sport} />
          : <FootballScoreCard key={game.id} game={game} sport={sport} />
      ))}
    </div>
  )
}