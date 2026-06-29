'use client'
import { useState } from 'react'
import styles from './TopBar.module.css'

const NAV_ITEMS = ['Home', 'Scores', 'News', 'Standings']
const SPORT_TABS = [
  { label: '🏏 Cricket', key: 'cricket' },
  { label: '⚽ Football', key: 'football' },
]
const CRICKET_LEAGUES = ['IPL', 'ICC', 'Test', 'ODI', 'T20I']
const FOOTBALL_LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'MLS']

export default function TopBar({ activeSport, activeLeague, onSportChange, onLeagueChange }) {
  const [activeNav, setActiveNav] = useState('Home')
  const [searchOpen, setSearchOpen] = useState(false)

  const leagues = activeSport === 'cricket' ? CRICKET_LEAGUES : FOOTBALL_LEAGUES

  return (
    <header>
      <nav className={styles.topbar}>
        <div className={styles.logoWrap}>
          <span className={styles.logo}>CricGoal</span>
          <span className={styles.logoTag}>🏏 ⚽</span>
        </div>
        <div className={styles.navLinks}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              className={`${styles.navBtn} ${activeNav === item ? styles.active : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(s => !s)} aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className={styles.avatar} aria-label="Profile">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className={styles.searchBar}>
          <input autoFocus placeholder="Search cricket, football, teams, players..." className={styles.searchInput} />
        </div>
      )}

      {/* Sport toggle */}
      <div className={styles.sportToggle}>
        {SPORT_TABS.map(sport => (
          <button
            key={sport.key}
            className={`${styles.sportBtn} ${activeSport === sport.key ? styles.sportActive : ''}`}
            onClick={() => onSportChange?.(sport.key)}
          >
            {sport.label}
          </button>
        ))}
      </div>

      {/* League subnav */}
      <div className={styles.subnav}>
        {leagues.map(league => (
          <button
            key={league}
            className={`${styles.leagueTab} ${activeLeague === league ? styles.leagueActive : ''}`}
            onClick={() => onLeagueChange?.(league)}
          >
            {league}
          </button>
        ))}
      </div>
    </header>
  )
}
