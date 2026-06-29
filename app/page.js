'use client'
import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar'
import ScoresBar from '../components/ScoresBar'
import NewsFeed from '../components/NewsFeed'
import Sidebar from '../components/Sidebar'
import styles from './page.module.css'

// Map sport + league to ESPN API slugs
const SPORT_MAP = {
  cricket: {
    IPL:  { scores: 'cricket/ipl', news: 'cricket' },
    ICC:  { scores: 'cricket/icc-mens-t20-world-cup', news: 'cricket' },
    Test: { scores: 'cricket/international-test', news: 'cricket' },
    ODI:  { scores: 'cricket/international-odi', news: 'cricket' },
    T20I: { scores: 'cricket/international-t20', news: 'cricket' },
  },
  football: {
    'Premier League': { scores: 'soccer/eng.1', news: 'soccer/eng.1' },
    'La Liga':        { scores: 'soccer/esp.1', news: 'soccer/esp.1' },
    'Serie A':        { scores: 'soccer/ita.1', news: 'soccer/ita.1' },
    'Bundesliga':     { scores: 'soccer/ger.1', news: 'soccer/ger.1' },
    'MLS':            { scores: 'soccer/usa.1', news: 'soccer/usa.1' },
  },
}

export default function Home() {
  const [activeSport, setActiveSport] = useState('cricket')
  const [activeLeague, setActiveLeague] = useState('IPL')
  const [games, setGames] = useState([])
  const [articles, setArticles] = useState([])
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const defaultLeague = activeSport === 'cricket' ? 'IPL' : 'Premier League'
    setActiveLeague(defaultLeague)
  }, [activeSport])

  useEffect(() => {
    setLoading(true)
    const map = SPORT_MAP[activeSport]?.[activeLeague]
    if (!map) return

    Promise.all([
      fetch(`/api/scores?sport=${map.scores}`).then(r => r.json()).catch(() => []),
      fetch(`/api/news?sport=${map.news}`).then(r => r.json()).catch(() => []),
      fetch(`/api/standings?sport=${map.scores}`).then(r => r.json()).catch(() => []),
    ]).then(([g, n, s]) => {
      setGames(g || [])
      setArticles(n || [])
      setStandings(s || [])
      setLoading(false)
    })
  }, [activeLeague])

  return (
    <div className={styles.page}>
      <TopBar
        activeSport={activeSport}
        activeLeague={activeLeague}
        onSportChange={setActiveSport}
        onLeagueChange={setActiveLeague}
      />
      <ScoresBar games={games} sport={activeSport} />
      <main className={styles.main}>
        <div className={styles.feed}>
          {loading ? (
            <div className={styles.skeleton}>
              {[1,2,3,4].map(i => <div key={i} className={styles.skeletonItem} />)}
            </div>
          ) : (
            <NewsFeed articles={articles} sport={activeSport} league={activeLeague} />
          )}
        </div>
        <Sidebar standings={standings} sport={activeSport} league={activeLeague} />
      </main>
    </div>
  )
}
