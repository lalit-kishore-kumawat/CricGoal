'use client'
import Breadcrumb from '@/components/Breadcrumb'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFavouriteTeam } from '@/lib/useFavourites'
import AuthModal from '@/components/AuthModal'
import styles from './page.module.css'

function fmt(date) {
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>
}

function TeamHeader({ team, isFav, onFavToggle, favLoading }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        {team?.logos?.[0]?.href ? (
          <img src={team.logos[0].href} alt={team.displayName} className={styles.teamLogo} />
        ) : (
          <div className={styles.logoBox} style={{ background: `#${team?.color || '555'}` }}>
            {team?.abbreviation ? team.abbreviation[0] : '?'}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div className={styles.teamName}>{team?.displayName || 'Team'}</div>
          <div className={styles.teamMeta}>
            {team?.standingSummary && <span>{team.standingSummary}</span>}
            {team?.location && <span> · {team.location}</span>}
          </div>
        </div>
        <button
          className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`}
          onClick={onFavToggle}
          disabled={favLoading}
          title={isFav ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFav ? '⭐' : '☆'}
        </button>
      </div>
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

function Roster({ team }) {
const athletes = team?.athletes || []
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport') || 'soccer/eng.1';

  if (!Array.isArray(athletes) || !athletes.length) {
    return <Empty msg="Roster not available for this team." />
  }

  return (
    <div className={styles.rosterGrid}>
      {athletes.map((p, i) => (
        <Link key={p?.id || i} href={`/player/${p?.id}?sport=${sport}`} className={styles.playerCard}>
          {p?.headshot?.href ? (
            <img src={p.headshot.href} alt={p.displayName} className={styles.playerImg} />
          ) : (
            <div className={styles.playerImgPlaceholder}>{p?.jersey || '#'}</div>
          )}
          <div className={styles.playerCardName}>{p?.displayName || 'Player'}</div>
          <div className={styles.playerCardPos}>
            {p?.position?.abbreviation || ''} {p?.jersey ? `· #${p.jersey}` : ''}
          </div>
        </Link>
      ))}
    </div>
  )
}

function Schedule({ schedule }) {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return <Empty msg="No schedule data available." />
  }

  return (
    <div className={styles.scheduleList}>
      {schedule.map((event, i) => {
        const comp = event?.competitions?.[0]
        const home = comp?.competitors?.find((c) => c.homeAway === 'home')
        const away = comp?.competitors?.find((c) => c.homeAway === 'away')
        const isFinal = comp?.status?.type?.name === 'STATUS_FINAL'

        return (
          <div key={event?.id || i} className={styles.scheduleRow}>
            <span className={styles.scheduleDate}>{fmt(event?.date)}</span>
            <span className={styles.scheduleMatchup}>
              {away?.team?.abbreviation || '-'} vs {home?.team?.abbreviation || '-'}
            </span>
            <span className={styles.scheduleResult}>
              {isFinal ? `${away?.score ?? '-'} - ${home?.score ?? '-'}` : 'Upcoming'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Stats({ team }) {
  const record = team?.record?.items?.[0]?.stats || []

  if (!Array.isArray(record) || record.length === 0) {
    return <Empty msg="Stats not available for this team." />
  }

  return (
    <div className={styles.statsGrid}>
      {record.map((stat, i) => (
        <div key={i} className={styles.statBox}>
          <div className={styles.statValue}>{stat?.displayValue ?? stat?.value ?? '-'}</div>
          <div className={styles.statLabel}>{stat?.shortDisplayName || stat?.name || ''}</div>
        </div>
      ))}
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: `Team Profile | CricGoal`,
    description: `Team roster, schedule and stats on CricGoal.`,
  }
}

export default function TeamPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  const { isFav, toggle, loading: favLoading } = useFavouriteTeam(id)
  const [showAuth, setShowAuth] = useState(false)

  const [team, setTeam] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [tab, setTab] = useState('Roster')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const tabs = ['Roster', 'Schedule', 'Stats']

  async function handleFavToggle() {
    const result = await toggle({
      name: team?.displayName,
      logo: team?.logos?.[0]?.href || '',
      sport: sport,
      league: sport,
    })
    if (result?.needsAuth) setShowAuth(true)
  }

  useEffect(() => {
    setLoading(true)
    setError('')

    const url = '/api/team?id=' + encodeURIComponent(id) + '&sport=' + encodeURIComponent(sport)

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setTeam(d?.team || null)
        setSchedule(d?.schedule || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load team data.')
        setLoading(false)
      })
  }, [id, sport])

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Back
      </button>
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: sport?.startsWith('cricket') ? '🏏 Cricket' : '⚽ Football', href: '/' },
        { label: team?.displayName || 'Team' },
      ]} />

      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading team data...</p>
        </div>
      )}

      {!loading && error && <div className={styles.error}>{error}</div>}

      {!loading && !error && team && (
        <>
          <TeamHeader team={team} isFav={isFav} onFavToggle={handleFavToggle} favLoading={favLoading} />
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          <div className={styles.body}>
            <TabBar tabs={tabs} active={tab} onChange={setTab} />
            <div className={styles.tabContent}>
              {tab === 'Roster' && <Roster team={team} />}
              {tab === 'Schedule' && <Schedule schedule={schedule} />}
              {tab === 'Stats' && <Stats team={team} />}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !team && <Empty msg="Team not found." />}
    </div>
  )
}