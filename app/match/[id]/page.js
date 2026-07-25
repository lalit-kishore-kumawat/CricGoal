'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { useMatchAlert } from '@/lib/useFavourites'
import AuthModal from '@/components/AuthModal'
import styles from './page.module.css'

function fmt(date) {
  try {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return '' }
}

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>
}

// ── Match Header ──────────────────────────────────────────────────────────────
function MatchHeader({ data }) {
  const comps  = data?.header?.competitions || []
  const comp   = comps[0] || {}
  const competitors = comp?.competitors || []
  const home   = competitors.find(c => c.homeAway === 'home') || {}
  const away   = competitors.find(c => c.homeAway === 'away') || {}
  const status = comp?.status
  const isLive  = status?.type?.name === 'STATUS_IN_PROGRESS'
  const isFinal = status?.type?.name === 'STATUS_FINAL'
  const searchParams = useSearchParams()
  const sport = searchParams.get('sport') || 'soccer/eng.1'

  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={`/team/${away?.team?.id}?sport=${sport}`} className={styles.teamBlock}>
          {away?.team?.logo
            ? <img src={away.team.logo} alt={away.team.displayName} className={styles.teamLogo} />
            : <div className={styles.logoBox} style={{ background: `#${away?.team?.color || '555'}` }}>
                {away?.team?.abbreviation?.slice(0,1) || '?'}
              </div>
          }
          <div className={styles.teamName}>{away?.team?.displayName || 'TBD'}</div>
          <div className={`${styles.teamScore} ${away?.winner ? styles.winner : ''}`}>
            {away?.score ?? '-'}
          </div>
        </Link>

        <div className={styles.centre}>
          {isLive  && <span className={styles.liveBadge}>● LIVE</span>}
          {isFinal && <span className={styles.finalBadge}>FINAL</span>}
          {!isLive && !isFinal && <span className={styles.scheduledBadge}>UPCOMING</span>}
          <div className={styles.statusDetail}>{status?.type?.detail || ''}</div>
          {comp?.venue?.fullName && <div className={styles.venue}>📍 {comp.venue.fullName}</div>}
        </div>

        <Link href={`/team/${home?.team?.id}?sport=${sport}`} className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          {home?.team?.logo
            ? <img src={home.team.logo} alt={home.team.displayName} className={styles.teamLogo} />
            : <div className={styles.logoBox} style={{ background: `#${home?.team?.color || '555'}` }}>
                {home?.team?.abbreviation?.slice(0,1) || '?'}
              </div>
          }
          <div className={styles.teamName}>{home?.team?.displayName || 'TBD'}</div>
          <div className={`${styles.teamScore} ${home?.winner ? styles.winner : ''}`}>
            {home?.score ?? '-'}
          </div>
        </Link>
      </div>
    </div>
  )
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className={styles.tabBar}>
      {tabs.map(t => (
        <button key={t}
          className={`${styles.tab} ${active === t ? styles.tabActive : ''}`}
          onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  )
}

// ── Cricket Scorecard ─────────────────────────────────────────────────────────
function CricketScorecard({ data }) {
  const innings = data?.innings || []
  const matchInfo = data?.matchInfo || {}
  const comp = data?.header?.competitions?.[0] || {}
  const status = comp?.status?.type?.name

  if (status === 'STATUS_SCHEDULED') {
    return (
      <div>
        <div className={styles.matchInfoGrid}>
          {matchInfo.date && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date</span>
              <span className={styles.infoVal}>{fmt(matchInfo.date)}</span>
            </div>
          )}
          {matchInfo.matchType && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Format</span>
              <span className={styles.infoVal}>{matchInfo.matchType.toUpperCase()}</span>
            </div>
          )}
          {matchInfo.series && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Series</span>
              <span className={styles.infoVal}>{matchInfo.series}</span>
            </div>
          )}
          {matchInfo.venue && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Venue</span>
              <span className={styles.infoVal}>{matchInfo.venue}</span>
            </div>
          )}
        </div>
        <div className={styles.upcomingMsg}>
          🏏 Scorecard will be available once the match starts
        </div>
      </div>
    )
  }

  if (!innings.length) {
    return (
      <div>
        {matchInfo.tossWinner && (
          <div className={styles.tossInfo}>
            🪙 {matchInfo.tossWinner} won the toss and elected to {matchInfo.tossChoice}
          </div>
        )}
        <Empty msg="Scorecard loading — check back shortly" />
      </div>
    )
  }

  return (
    <div>
      {matchInfo.tossWinner && (
        <div className={styles.tossInfo}>
          🪙 {matchInfo.tossWinner} won the toss and elected to {matchInfo.tossChoice}
        </div>
      )}
      {innings.map((inn, i) => (
        <div key={i} className={styles.innings}>
          <div className={styles.inningsTitle}>
            {inn?.team?.displayName} — {inn?.runs}/{inn?.wickets} ({inn?.overs} ov)
          </div>

          {inn?.batsmen?.length > 0 && (
            <table className={styles.scoreTable}>
              <thead>
                <tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
              </thead>
              <tbody>
                {inn.batsmen.map((b, j) => (
                  <tr key={j}>
                    <td>
                      <div className={styles.batsmanName}>{b?.athlete?.displayName || '-'}</div>
                      <div className={styles.dismissal}>{b?.dismissal || ''}</div>
                    </td>
                    <td className={styles.boldStat}>{b?.runs ?? 0}</td>
                    <td>{b?.balls ?? 0}</td>
                    <td>{b?.fours ?? 0}</td>
                    <td>{b?.sixes ?? 0}</td>
                    <td>{b?.strikerate ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {inn?.bowlers?.length > 0 && (
            <table className={styles.scoreTable} style={{ marginTop: 12 }}>
              <thead>
                <tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th></tr>
              </thead>
              <tbody>
                {inn.bowlers.map((b, j) => (
                  <tr key={j}>
                    <td className={styles.batsmanName}>{b?.athlete?.displayName || '-'}</td>
                    <td>{b?.overs ?? 0}</td>
                    <td>{b?.maidens ?? 0}</td>
                    <td>{b?.runs ?? 0}</td>
                    <td className={styles.boldStat}>{b?.wickets ?? 0}</td>
                    <td>{b?.economy ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Football Stats ────────────────────────────────────────────────────────────
function FootballStats({ data }) {
  const competitions = data?.header?.competitions || []
  const teams = competitions[0]?.competitors || []
  const boxscoreTeams = data?.boxscore?.teams || []
  const firstTeamStats = boxscoreTeams[0]?.statistics || []

  if (!boxscoreTeams.length || firstTeamStats.length === 0) {
    return <Empty msg="Stats will be available once the match starts." />
  }

  return (
    <div className={styles.statsWrap}>
      <div className={styles.statsTeamRow}>
        <span />
        {teams.map((t, i) => (
          <span key={i} className={styles.statsTeamName}>{t?.team?.abbreviation || '-'}</span>
        ))}
      </div>
      {firstTeamStats.map((stat, i) => (
        <div key={i} className={styles.statRow}>
          <span className={styles.statLabel}>{stat?.label || ''}</span>
          {boxscoreTeams.map((team, j) => (
            <span key={j} className={styles.statValue}>
              {team?.statistics?.[i]?.displayValue ?? '-'}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Football Lineups ──────────────────────────────────────────────────────────
function FootballLineup({ data }) {
  const rosters = data?.rosters || data?.roster || []
  if (!rosters.length) return <Empty msg="Lineups not available yet." />

  return (
    <div className={styles.lineupWrap}>
      {rosters.map((team, i) => {
        const roster = team?.roster || []
        const starters = roster.filter(p => p?.starter)
        const subs = roster.filter(p => !p?.starter)
        return (
          <div key={i} className={styles.lineupTeam}>
            <div className={styles.lineupTeamName}>{team?.team?.displayName || 'Team'}</div>
            <div className={styles.lineupHeader}><span>Player</span><span>#</span><span>Pos</span></div>
            {starters.map((p, j) => (
              <div key={j} className={styles.playerRow}>
                <span className={styles.playerName}>{p?.athlete?.displayName || '-'}</span>
                <span className={styles.playerNum}>{p?.jersey || ''}</span>
                <span className={styles.playerPos}>{p?.position?.abbreviation || ''}</span>
              </div>
            ))}
            {subs.length > 0 && <>
              <div className={styles.subLabel}>Substitutes</div>
              {subs.map((p, j) => (
                <div key={j} className={`${styles.playerRow} ${styles.sub}`}>
                  <span className={styles.playerName}>{p?.athlete?.displayName || '-'}</span>
                  <span className={styles.playerNum}>{p?.jersey || ''}</span>
                  <span className={styles.playerPos}>{p?.position?.abbreviation || ''}</span>
                </div>
              ))}
            </>}
          </div>
        )
      })}
    </div>
  )
}

// ── Play by Play ──────────────────────────────────────────────────────────────
function PlayByPlay({ data }) {
  const plays = data?.plays || []
  if (!plays.length) return <Empty msg="No play-by-play data available." />

  return (
    <div className={styles.pbp}>
      {plays.slice(0, 30).map((play, i) => (
        <div key={i} className={styles.pbpRow}>
          <span className={styles.pbpTime}>
            {play?.clock?.displayValue || play?.period?.displayValue || ''}
          </span>
          {play?.scoringPlay && <span className={styles.goalBadge}>⚽ GOAL</span>}
          <span className={styles.pbpText}>{play?.text || ''}</span>
        </div>
      ))}
    </div>
  )
}

// ── Info Tab ──────────────────────────────────────────────────────────────────
function InfoTab({ data, isCricket }) {
  const comp = data?.header?.competitions?.[0] || {}
  const matchInfo = data?.matchInfo || {}
  const broadcasts = comp?.broadcasts || []
  const officials = comp?.officials || []

  const rows = isCricket ? [
    ['Date',       fmt(matchInfo.date || comp?.date)],
    ['Format',     matchInfo.matchType?.toUpperCase()],
    ['Series',     matchInfo.series],
    ['Venue',      matchInfo.venue || comp?.venue?.fullName],
    ['Toss',       matchInfo.tossWinner ? `${matchInfo.tossWinner} (${matchInfo.tossChoice})` : null],
    ['Status',     matchInfo.status],
  ] : [
    ['Venue',      comp?.venue?.fullName],
    ['Date',       fmt(comp?.date)],
    ['Attendance', comp?.attendance?.toLocaleString()],
    ['Broadcast',  broadcasts[0]?.names?.[0]],
    ['Referee',    officials[0]?.fullName],
  ]

  const filtered = rows.filter(([, val]) => Boolean(val))
  if (!filtered.length) return <Empty msg="No match info available." />

  return (
    <div className={styles.infoGrid}>
      {filtered.map(([label, val]) => (
        <div key={label} className={styles.infoRow}>
          <span className={styles.infoLabel}>{label}</span>
          <span className={styles.infoVal}>{val}</span>
        </div>
      ))}
    </div>
  )
}

// ── News Aside ────────────────────────────────────────────────────────────────
function NewsAside({ data }) {
  const news = data?.news || []
  if (!news.length) {
    return (
      <div className={styles.newsCard}>
        <span className={styles.newsTag}>CricGoal</span>
        <p className={styles.newsTitle}>Live match coverage powered by ESPN & CricAPI data</p>
      </div>
    )
  }
  return (
    <>
      {news.map((article, i) => (
        <a key={i} href={article?.links?.web?.href || '#'}
          target="_blank" rel="noopener noreferrer" className={styles.newsCard}>
          <span className={styles.newsTag}>{article?.categories?.[0]?.description || 'News'}</span>
          <p className={styles.newsTitle}>{article?.headline || ''}</p>
        </a>
      ))}
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const { id }       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const sport        = searchParams.get('sport') || 'soccer/eng.1'
  const isCricket    = sport.startsWith('cricket')

  const [data, setData]       = useState(null)
  const [tab, setTab]         = useState(isCricket ? 'Scorecard' : 'Stats')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showAuth, setShowAuth] = useState(false)

  const { hasAlert, toggle: toggleAlert } = useMatchAlert(id)

  const tabs = isCricket
    ? ['Scorecard', 'Info']
    : ['Stats', 'Lineups', 'Play-by-Play', 'Info']

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/match?id=' + encodeURIComponent(id) + '&sport=' + encodeURIComponent(sport))
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Could not load match data.'); setLoading(false) })
  }, [id, sport])

  async function handleAlertToggle() {
    const comp = data?.header?.competitions?.[0]
    const result = await toggleAlert({
      name: comp?.competitors?.map(c => c?.team?.abbreviation).join(' vs ') || 'Match',
      sport,
      date: comp?.date || '',
    })
    if (result?.needsAuth) setShowAuth(true)
  }

  const comp = data?.header?.competitions?.[0]
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: isCricket ? '🏏 Cricket' : '⚽ Football', href: '/' },
    { label: comp?.competitors?.map(c => c?.team?.abbreviation).join(' vs ') || 'Match' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.backBar}>
        <button className={styles.backBtn} onClick={() => router.back()}>← Back</button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading match data...</p>
        </div>
      )}

      {!loading && error && <div className={styles.error}>{error}</div>}

      {!loading && !error && data && (
        <>
          <MatchHeader data={data} />

          <div className={styles.alertBar}>
            <button
              className={`${styles.alertBtn} ${hasAlert ? styles.alertActive : ''}`}
              onClick={handleAlertToggle}>
              {hasAlert ? '🔔 Alert set' : '🔕 Set alert'}
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.main}>
              <TabBar tabs={tabs} active={tab} onChange={setTab} />
              <div className={styles.tabContent}>
                {tab === 'Scorecard'    && <CricketScorecard data={data} />}
                {tab === 'Stats'        && <FootballStats data={data} />}
                {tab === 'Lineups'      && <FootballLineup data={data} />}
                {tab === 'Play-by-Play' && <PlayByPlay data={data} />}
                {tab === 'Info'         && <InfoTab data={data} isCricket={isCricket} />}
              </div>
            </div>
            <aside className={styles.aside}>
              <NewsAside data={data} />
            </aside>
          </div>
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}