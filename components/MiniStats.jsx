'use client'
import styles from './MiniStats.module.css'

// Extract top performers from games data
function extractStats(games) {
  const batsmen = {}
  const bowlers = {}
  const scorers = {} // football goal scorers

  for (const game of games) {
    const comp = game?.competitions?.[0]
    if (!comp) continue
    const isFinal = comp?.status?.type?.name === 'STATUS_FINAL'
    if (!isFinal) continue

    // Cricket scorecard stats
    const innings = game?.innings || []
    for (const inn of innings) {
      for (const b of inn?.batsmen || []) {
        const name = b?.athlete?.displayName
        if (!name || name === '-') continue
        if (!batsmen[name]) batsmen[name] = { name, runs: 0, matches: 0, img: b?.athlete?.headshot?.href || '' }
        batsmen[name].runs += Number(b?.runs) || 0
        batsmen[name].matches++
      }
      for (const b of inn?.bowlers || []) {
        const name = b?.athlete?.displayName
        if (!name || name === '-') continue
        if (!bowlers[name]) bowlers[name] = { name, wickets: 0, matches: 0, img: b?.athlete?.headshot?.href || '' }
        bowlers[name].wickets += Number(b?.wickets) || 0
        bowlers[name].matches++
      }
    }

    // Football leaders from boxscore
    const leaders = game?.leaders || []
    for (const cat of leaders) {
      if (cat?.name === 'goals' || cat?.displayName?.toLowerCase().includes('goal')) {
        for (const l of cat?.leaders || []) {
          const name = l?.athlete?.displayName
          if (!name) continue
          if (!scorers[name]) scorers[name] = {
            name,
            goals: 0,
            team: l?.team?.abbreviation || '',
            img: l?.athlete?.headshot?.href || l?.athlete?.displayImage || '',
          }
          scorers[name].goals += Number(l?.value) || 1
        }
      }
    }
  }

  return {
    topBatsman: Object.values(batsmen).sort((a,b) => b.runs - a.runs)[0] || null,
    topBowler: Object.values(bowlers).sort((a,b) => b.wickets - a.wickets)[0] || null,
    topScorer: Object.values(scorers).sort((a,b) => b.goals - a.goals)[0] || null,
  }
}

function StatCard({ label, name, value, unit, img, color }) {
  if (!name) return null
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardInner}>
        {img ? (
          <img src={img} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPH} style={{ background: color || 'var(--brand-green)' }}>
            {name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
        )}
        <div className={styles.info}>
          <div className={styles.playerName}>{name}</div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{value}</span>
            <span className={styles.statUnit}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MiniStats({ games = [], sport = '' }) {
  if (!games || games.length === 0) return null

  const isCricket = sport.startsWith('cricket')
  const { topBatsman, topBowler, topScorer } = extractStats(games)

  // Nothing to show
  if (isCricket && !topBatsman && !topBowler) return null
  if (!isCricket && !topScorer) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isCricket ? '🏏 Match Leaders' : '⚽ Top Performers'}
        </h3>
      </div>

      <div className={styles.grid}>
        {isCricket ? (
          <>
            <StatCard
              label="Top Run Scorer"
              name={topBatsman?.name}
              value={topBatsman?.runs}
              unit="runs"
              img={topBatsman?.img}
              color="#1a6b3c"
            />
            <StatCard
              label="Top Wicket Taker"
              name={topBowler?.name}
              value={topBowler?.wickets}
              unit={topBowler?.wickets === 1 ? 'wicket' : 'wickets'}
              img={topBowler?.img}
              color="#dc2626"
            />
          </>
        ) : (
          <StatCard
            label="Top Goal Scorer"
            name={topScorer?.name}
            value={topScorer?.goals}
            unit={topScorer?.goals === 1 ? 'goal' : 'goals'}
            img={topScorer?.img}
            color="#1a6b3c"
          />
        )}
      </div>
    </div>
  )
}