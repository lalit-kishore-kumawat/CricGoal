'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './TopBar.module.css'

const NAV_ITEMS = ['Home', 'Scores', 'News', 'Standings']
const SPORT_TABS = [
  { label: '🏏 Cricket', key: 'cricket' },
  { label: '⚽ Football', key: 'football' },
]
const CRICKET_LEAGUES = ['IPL', 'ICC', 'Test', 'ODI', 'T20I']
const FOOTBALL_LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'MLS']

function SearchBar({ onClose }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Debounce — wait 400ms after user stops typing
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setLoading(true)
      fetch('/api/search?q=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(d => {
          setResults(d?.results || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 400)

    return () => clearTimeout(timerRef.current)
  }, [query])

  function handleSelect(result) {
    const sport = result.sport?.toLowerCase().includes('cricket')
      ? 'cricket/ipl'
      : 'soccer/eng.1'

    if (result.type === 'athlete') {
      router.push('/player/' + result.id + '?sport=' + sport)
    } else {
      router.push('/team/' + result.id + '?sport=' + sport)
    }
    onClose()
  }

  function getIcon(type) {
    if (type === 'athlete') return '👤'
    if (type === 'team') return '🏟️'
    return '🔍'
  }

  return (
    <div className={styles.searchWrap}>
      <div className={styles.searchBarInner}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, color: 'rgba(255,255,255,0.6)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search teams, players..."
          className={styles.searchInput}
        />
        {loading && <span className={styles.searchSpinner} />}
        <button className={styles.searchClose} onClick={onClose}>✕</button>
      </div>

      {(results.length > 0 || (query.length > 1 && !loading)) && (
        <div className={styles.dropdown}>
          {results.length === 0 && (
            <div className={styles.dropdownEmpty}>No results for "{query}"</div>
          )}
          {results.map((r, i) => (
            <button key={i} className={styles.dropdownItem} onClick={() => handleSelect(r)}>
              <span className={styles.dropdownIcon}>
                {r.logo
                  ? <img src={r.logo} alt="" className={styles.dropdownLogo} />
                  : getIcon(r.type)
                }
              </span>
              <span className={styles.dropdownName}>{r.name}</span>
              <span className={styles.dropdownType}>{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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

        {!searchOpen && (
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
        )}

        <div className={styles.actions}>
          {!searchOpen && (
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          )}
          <button className={styles.avatar} aria-label="Profile">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <SearchBar onClose={() => setSearchOpen(false)} />
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