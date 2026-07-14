'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getAllFavourites } from '@/lib/useFavourites'
import styles from './page.module.css'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [favourites, setFavourites] = useState({ teams: [], players: [], alerts: [] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Teams')

  const tabs = ['Teams', 'Players', 'Alerts']

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data?.user || null)
      if (data?.user) {
        const favs = await getAllFavourites()
        setFavourites(favs)
      }
      setLoading(false)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.notSignedIn}>
        <div className={styles.notSignedInInner}>
          <span className={styles.icon}>👤</span>
          <h2>Sign in to CricGoal</h2>
          <p>Save your favourite teams and players, and get match alerts.</p>
          <Link href="/" className={styles.homeBtn}>← Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.avatar}>
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{user.email}</div>
            <div className={styles.userMeta}>CricGoal member</div>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{favourites.teams.length}</span>
          <span className={styles.statLabel}>Fav Teams</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{favourites.players.length}</span>
          <span className={styles.statLabel}>Fav Players</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{favourites.alerts.length}</span>
          <span className={styles.statLabel}>Alerts</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.body}>
        <div className={styles.tabBar}>
          {tabs.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {/* Favourite Teams */}
          {tab === 'Teams' && (
            <div>
              {favourites.teams.length === 0 && (
                <div className={styles.empty}>
                  No favourite teams yet — go to a team page and tap ⭐
                </div>
              )}
              {favourites.teams.map((t, i) => (
                <Link key={i} href={`/team/${t.team_id}?sport=${t.sport}`} className={styles.favRow}>
                  {t.team_logo
                    ? <img src={t.team_logo} alt={t.team_name} className={styles.favLogo} />
                    : <div className={styles.favLogoPlaceholder}>🏟️</div>
                  }
                  <div className={styles.favInfo}>
                    <span className={styles.favName}>{t.team_name}</span>
                    <span className={styles.favMeta}>{t.league}</span>
                  </div>
                  <span className={styles.favArrow}>›</span>
                </Link>
              ))}
            </div>
          )}

          {/* Favourite Players */}
          {tab === 'Players' && (
            <div>
              {favourites.players.length === 0 && (
                <div className={styles.empty}>
                  No favourite players yet — go to a player page and tap ⭐
                </div>
              )}
              {favourites.players.map((p, i) => (
                <Link key={i} href={`/player/${p.player_id}?sport=${p.sport}`} className={styles.favRow}>
                  {p.player_img
                    ? <img src={p.player_img} alt={p.player_name} className={styles.favLogo} />
                    : <div className={styles.favLogoPlaceholder}>👤</div>
                  }
                  <div className={styles.favInfo}>
                    <span className={styles.favName}>{p.player_name}</span>
                    <span className={styles.favMeta}>{p.sport}</span>
                  </div>
                  <span className={styles.favArrow}>›</span>
                </Link>
              ))}
            </div>
          )}

          {/* Match Alerts */}
          {tab === 'Alerts' && (
            <div>
              {favourites.alerts.length === 0 && (
                <div className={styles.empty}>
                  No match alerts yet — go to a match page and tap 🔔
                </div>
              )}
              {favourites.alerts.map((a, i) => (
                <div key={i} className={styles.favRow}>
                  <div className={styles.favLogoPlaceholder}>🔔</div>
                  <div className={styles.favInfo}>
                    <span className={styles.favName}>{a.match_name}</span>
                    <span className={styles.favMeta}>{a.sport}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
