'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IPL_TEAMS } from '@/lib/iplTeams'
import styles from './page.module.css'

export default function IPLTeamsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = IPL_TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      {/* Back bar */}
      <div className={styles.backBar}>
        <button className={styles.backBtn} onClick={() => router.back()}>← Back</button>
        <span className={styles.breadcrumb}>🏏 Cricket · IPL Teams</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 IPL 2025 Teams</h1>
        <p className={styles.subtitle}>Indian Premier League — All 10 teams</p>
        <input
          className={styles.search}
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Teams grid */}
      <div className={styles.body}>
        <div className={styles.grid}>
          {filtered.map(team => (
            <Link
              key={team.id}
              href={`/cricket/teams/${team.id}`}
              className={styles.teamCard}
              style={{ borderTop: `4px solid ${team.color}` }}
            >
              {/* Logo */}
              <div className={styles.logoWrap} style={{ background: team.color + '15' }}>
                <img
                  src={team.logo}
                  alt={team.name}
                  className={styles.logo}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div className={styles.logoFallback} style={{ background: team.color }}>
                  {team.shortName}
                </div>
              </div>

              {/* Info */}
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>{team.name}</div>
                <div className={styles.teamShort}>{team.shortName} · {team.city}</div>
                <div className={styles.teamGround}>🏟️ {team.ground}</div>
                {team.titles > 0 && (
                  <div className={styles.titles}>
                    🏆 {team.titles} {team.titles === 1 ? 'Title' : 'Titles'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
