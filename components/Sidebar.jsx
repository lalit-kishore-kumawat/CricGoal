import Link from 'next/link'
import styles from './Sidebar.module.css'

const CRICKET_TRENDING = [
  'Virat Kohli', 'Rohit Sharma', 'IPL 2025', 'MS Dhoni', 'Jasprit Bumrah', 'T20 World Cup',
]
const FOOTBALL_TRENDING = [
  'Erling Haaland', 'Vinicius Jr', 'Premier League', 'Kylian Mbappé', 'Mohamed Salah', 'Champions League',
]

export default function Sidebar({ standings = [], sport, league }) {
  const trending = sport === 'cricket' ? CRICKET_TRENDING : FOOTBALL_TRENDING
  const entries = standings[0]?.standings?.entries?.slice(0, 6) || []

  return (
    <aside>
      {/* Standings */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{league} Table</h3>
        {entries.length > 0 ? (
          <>
            <div className={styles.standHeader}>
              <span className={styles.rank}>#</span>
              <span style={{ flex: 1, marginLeft: 28, fontSize: 10 }}>Team</span>
              <span className={styles.wl}>W</span>
              <span className={styles.wlMuted}>L</span>
            </div>
            {entries.map((entry, i) => {
              const wins   = entry.stats?.find(s => s.name === 'wins')?.value || 0
              const losses = entry.stats?.find(s => s.name === 'losses')?.value || 0
              const team   = entry.team || {}
              return (
            <Link key={team.id || i} href={`/team/${team.id}?sport=${sport}`} className={styles.standRow}>
  <span className={styles.rank}>{i + 1}</span>
  {team.logo ? (
    <img src={team.logo} alt={team.name} className={styles.teamLogo} />
  ) : (
    <div className={styles.teamLogoPlaceholder} style={{ background: `#${team.color || '555'}` }}>
      {team.displayName?.slice(0, 1) || ''}
    </div>
  )}
  <span className={styles.teamName}>{team.shortDisplayName || team.displayName}</span>
  <span className={styles.wl}>{team.wins || 0}</span>
  <span className={styles.wlMuted}>{team.losses || 0}</span>
</Link>

              )
            })}
          </>
        ) : (
          <p className={styles.noData}>Standings will appear here when available.</p>
        )}
      </div>

      {/* Trending */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Trending in {sport === 'cricket' ? '🏏 Cricket' : '⚽ Football'}</h3>
        {trending.map((name, i) => (
          <div key={name} className={styles.trendRow}>
            <span className={styles.trendNum}>{i + 1}</span>
            <span className={styles.trendName}>{name}</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        ))}
      </div>

      {/* About CricGoal */}
      <div className={styles.card} style={{ background: 'var(--brand-green)', border: 'none' }}>
        <h3 className={styles.cardTitle} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>About CricGoal</h3>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
          Your one-stop destination for live cricket and football scores, news, and standings. 100% free, updated live.
        </p>
      </div>
    </aside>
  )
}
