'use client'
import Link from 'next/link'
import styles from './TeamFormTracker.module.css'

// Extract form from a list of games for a specific team
function getTeamForm(games, teamName) {
  const results = []
  for (const game of games) {
    const comp = game?.competitions?.[0]
    if (!comp) continue
    const status = comp?.status?.type?.name
    if (status !== 'STATUS_FINAL') continue

    const competitors = comp?.competitors || []
    const myTeam = competitors.find(c =>
      c?.team?.displayName === teamName ||
      c?.team?.abbreviation === teamName
    )
    if (!myTeam) continue

    results.push({
      result: myTeam.winner ? 'W' : 'L',
      opponent: competitors.find(c => c !== myTeam)?.team?.abbreviation || '?',
      score: myTeam.score || '',
    })

    if (results.length >= 5) break
  }
  return results
}

// Get unique teams from games
function getTeamsFromGames(games) {
  const teams = new Map()
  for (const game of games) {
    const competitors = game?.competitions?.[0]?.competitors || []
    for (const c of competitors) {
      const name = c?.team?.displayName
      if (name && name !== 'TBD' && !teams.has(name)) {
        teams.set(name, {
          name,
          abbr: c?.team?.abbreviation || name.substring(0, 3).toUpperCase(),
          logo: c?.team?.logo || '',
          color: c?.team?.color || '1a6b3c',
          id: c?.team?.id || '',
        })
      }
    }
  }
  return Array.from(teams.values()).slice(0, 6)
}

function FormBadge({ result, opponent }) {
  return (
    <div className={`${styles.badge} ${result === 'W' ? styles.win : styles.loss}`} title={`${result} vs ${opponent}`}>
      {result}
    </div>
  )
}

function TeamRow({ team, form, sport, rank }) {
  const wins   = form.filter(f => f.result === 'W').length
  const losses = form.filter(f => f.result === 'L').length

  return (
    <Link href={`/team/${team.id}?sport=${sport}`} className={styles.row}>
      <span className={styles.rank}>{rank}</span>
      {team.logo
        ? <img src={team.logo} alt={team.name} className={styles.logo} />
        : <div className={styles.logoPH} style={{ background: `#${team.color}` }}>
            {team.abbr[0]}
          </div>
      }
      <span className={styles.teamName}>{team.abbr}</span>
      <div className={styles.form}>
        {form.length > 0
          ? form.map((f, i) => <FormBadge key={i} result={f.result} opponent={f.opponent} />)
          : <span className={styles.noForm}>No recent data</span>
        }
      </div>
      <div className={styles.record}>
        <span className={styles.wins}>{wins}W</span>
        <span className={styles.losses}>{losses}L</span>
      </div>
    </Link>
  )
}

export default function TeamFormTracker({ games = [], sport = '' }) {
  if (!games || games.length === 0) return null

  const teams = getTeamsFromGames(games)
  if (teams.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Team Form</h3>
        <span className={styles.subtitle}>Last 5 matches</span>
      </div>

      <div className={styles.tableHeader}>
        <span className={styles.rank}>#</span>
        <span style={{ width: 18 }} />
        <span className={styles.teamName}>Team</span>
        <span className={styles.formLabel}>Form</span>
        <span className={styles.recordLabel}>W/L</span>
      </div>

      {teams.map((team, i) => (
        <TeamRow
          key={team.name}
          team={team}
          form={getTeamForm(games, team.name)}
          sport={sport}
          rank={i + 1}
        />
      ))}
    </div>
  )
}