'use client'
import Breadcrumb from '@/components/Breadcrumb'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>
}

function PlayerHeader({ athlete }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        {athlete?.headshot?.href ? (
          <img src={athlete.headshot.href} alt={athlete.displayName} className={styles.playerImg} />
        ) : (
          <div className={styles.imgBox}>
            {athlete?.jersey || '#'}
          </div>
        )}
        <div>
          <div className={styles.playerName}>{athlete?.displayName || 'Player'}</div>
          <div className={styles.playerMeta}>
            {athlete?.position?.displayName && <span>{athlete.position.displayName}</span>}
            {athlete?.jersey && <span> · #{athlete.jersey}</span>}
            {athlete?.team?.displayName && <span> · {athlete.team.displayName}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Bio({ athlete }) {
  const rows = [
    ['Full name', athlete?.fullName],
    ['Position', athlete?.position?.displayName],
    ['Jersey', athlete?.jersey],
    ['Height', athlete?.displayHeight],
    ['Weight', athlete?.displayWeight],
    ['Age', athlete?.age],
    ['Birthplace', athlete?.birthPlace?.city && athlete?.birthPlace?.country
      ? `${athlete.birthPlace.city}, ${athlete.birthPlace.country}`
      : athlete?.birthPlace?.country],
    ['Team', athlete?.team?.displayName],
  ].filter(([, val]) => Boolean(val))

  if (rows.length === 0) {
    return <Empty msg="No bio information available." />
  }

  return (
    <div className={styles.infoGrid}>
      {rows.map(([label, val]) => (
        <div key={label} className={styles.infoRow}>
          <span className={styles.infoLabel}>{label}</span>
          <span className={styles.infoVal}>{val}</span>
        </div>
      ))}
    </div>
  )
}

function StatsTab({ stats }) {
  const categories = stats?.splits?.categories || []

  if (!Array.isArray(categories) || categories.length === 0) {
    return <Empty msg="Stats not available for this player." />
  }

  return (
    <div>
      {categories.map((cat, i) => {
        const statList = cat?.stats || []
        if (statList.length === 0) return null

        return (
          <div key={i} className={styles.statCategory}>
            <div className={styles.statCategoryTitle}>{cat?.displayName || cat?.name || 'Stats'}</div>
            <div className={styles.statsGrid}>
              {statList.map((s, j) => (
                <div key={j} className={styles.statBox}>
                  <div className={styles.statValue}>{s?.displayValue ?? '-'}</div>
                  <div className={styles.statLabel}>{s?.shortDisplayName || s?.displayName || ''}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className={styles.tabBar}>
      {tabs.map((t) => (
        <button
          key={t}
          className={`${styles.tab} ${active === t ? styles.tabActive : ''}`}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export default function PlayerPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  const [athlete, setAthlete] = useState(null)
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('Bio')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const tabs = ['Bio', 'Stats']

  useEffect(() => {
    setLoading(true)
    setError('')

    const url = '/api/player?id=' + encodeURIComponent(id) + '&sport=' + encodeURIComponent(sport)

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setAthlete(d?.athlete || null)
        setStats(d?.stats || null)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load player data.')
        setLoading(false)
      })
  }, [id, sport])

  return (
       <div className={styles.backBar}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: sport?.startsWith('cricket') ? '🏏 Cricket' : '⚽ Football', href: '/' },
          { label: athlete?.displayName || 'Player' }
        ]} />
      </div>
  

      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading player data...</p>
        </div>
      )}

      {!loading && error && <div className={styles.error}>{error}</div>}

      {!loading && !error && athlete && (
        <>
          <PlayerHeader athlete={athlete} />
          <div className={styles.body}>
            <TabBar tabs={tabs} active={tab} onChange={setTab} />
            <div className={styles.tabContent}>
              {tab === 'Bio' && <Bio athlete={athlete} />}
              {tab === 'Stats' && <StatsTab stats={stats} />}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !athlete && <Empty msg="Player not found." />}
    </div>
  )
}